package dev.learningatlas.learning

import dev.learningatlas.catalog.CatalogService
import dev.learningatlas.progress.LearningProgress
import dev.learningatlas.progress.LearningStatus
import dev.learningatlas.progress.ProgressRepository
import jakarta.transaction.Transactional
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Clock
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

data class StudyPlanResponse(val id: Long, val pathId: String, val targetDate: LocalDate, val learningWeekdays: Set<DayOfWeek>, val timeZone: String, val dailyMinutes: Int, val status: PlanStatus, val resourceCount: Int)
data class TodayEntryResponse(val id: Long, val resourceId: String, val title: String, val url: String, val reason: QueueReason, val estimatedMinutes: Int, val postponed: Boolean, val completed: Boolean)
data class TodayResponse(val date: LocalDate, val plan: StudyPlanResponse, val entries: List<TodayEntryResponse>, val overdueCount: Int, val dueCount: Int, val completedCount: Int, val masteredCount: Int, val masteredResourceIds: Set<String>)
data class AttemptResponse(val id: Long, val planId: Long, val resourceId: String, val startedAt: Instant, val endedAt: Instant?, val elapsedMinutes: Int?, val outcome: AttemptOutcome?, val confidence: Int?, val reflection: String?, val review: Boolean, val nextReviewDate: LocalDate?)

@Service
class LearningService(
    private val plans: StudyPlanRepository,
    private val queues: DailyQueueRepository,
    private val queueEntries: DailyQueueEntryRepository,
    private val attempts: LearningAttemptRepository,
    private val reviews: ReviewScheduleRepository,
    private val progress: ProgressRepository,
    private val catalogService: CatalogService,
    private val clock: Clock,
) {
    @Transactional
    fun createPlan(request: CreateStudyPlanRequest): StudyPlanResponse {
        val zone = validZone(request.timeZone)
        val today = StudyDate.today(clock, zone)
        if (request.targetDate.isBefore(today)) badRequest("Target date cannot be in the past.")
        val path = catalogService.findPath(request.pathId) ?: notFound("Unknown path '${request.pathId}'.")
        val codingIds = catalogService.codingResourceIds(path)
        if (codingIds.isEmpty()) badRequest("The selected path has no coding problems.")
        plans.findFirstByStatus(PlanStatus.ACTIVE)?.let { it.status = PlanStatus.PAUSED; plans.save(it) }
        val plan = plans.save(StudyPlan(pathId = path.id, targetDate = request.targetDate, learningWeekdays = request.learningWeekdays, timeZone = zone.id, dailyMinutes = request.dailyMinutes, resourceIds = codingIds, createdAt = clock.instant()))

        val completedLegacy = progress.findAll().filter { it.status == LearningStatus.COMPLETED && it.resourceId in codingIds }
        completedLegacy.forEach { legacy ->
            reviews.save(ReviewSchedule(planId = plan.id!!, resourceId = legacy.resourceId, dueDate = ReviewPolicy.nextLearningDay(today.plusDays(1), plan.learningWeekdays), stage = 0))
        }
        return plan.response()
    }

    fun activePlan(): StudyPlanResponse = requireActivePlan().response()

    fun plans(): List<StudyPlanResponse> = plans.findAllByOrderByCreatedAtDesc().map { it.response() }

    @Transactional
    fun pausePlan(id: Long): StudyPlanResponse {
        val plan = plans.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown plan '$id'.") }
        plan.status = PlanStatus.PAUSED
        return plans.save(plan).response()
    }

    @Transactional
    fun activatePlan(id: Long): StudyPlanResponse {
        val selected = plans.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown plan '$id'.") }
        plans.findFirstByStatus(PlanStatus.ACTIVE)?.takeIf { it.id != id }?.let {
            it.status = PlanStatus.PAUSED
            plans.save(it)
        }
        selected.status = PlanStatus.ACTIVE
        return plans.save(selected).response()
    }

    @Transactional
    fun today(): TodayResponse {
        val plan = requireActivePlan()
        val date = StudyDate.today(clock, validZone(plan.timeZone))
        val queue = queues.findByPlanIdAndQueueDate(plan.id!!, date) ?: generateQueue(plan, date)
        val entries = queueEntries.findAllByQueueIdOrderBySortOrder(queue.id!!)
        val attemptHistory = attempts.findAllByPlanIdOrderByStartedAt(plan.id!!)
        val resources = catalogService.resourcesById()
        val completed = plan.resourceIds.count { id -> attemptHistory.any { it.resourceId == id && it.outcome in successfulOutcomes } || progress.findByResourceId(id)?.status == LearningStatus.COMPLETED }
        val masteredResourceIds = plan.resourceIds.filter { id -> MasteryPolicy.isMastered(attemptHistory.filter { it.resourceId == id }) }.toSet()
        return TodayResponse(date, plan.response(), entries.map { entry ->
            val resource = resources.getValue(entry.resourceId)
            TodayEntryResponse(entry.id!!, entry.resourceId, resource.title, resource.url, entry.reason, entry.estimatedMinutes, entry.postponed, entry.completed)
        }, entries.count { it.reason == QueueReason.OVERDUE_REVIEW && !it.postponed && !it.completed }, entries.count { it.reason == QueueReason.DUE_REVIEW && !it.postponed && !it.completed }, completed, masteredResourceIds.size, masteredResourceIds)
    }

    private fun generateQueue(plan: StudyPlan, date: LocalDate): DailyQueue {
        val queue = queues.save(DailyQueue(planId = plan.id!!, queueDate = date, createdAt = clock.instant()))
        val resources = catalogService.resourcesById()
        val history = attempts.findAllByPlanIdOrderByStartedAt(plan.id!!)
        val due = reviews.findAllByPlanIdAndDueDateLessThanEqualOrderByDueDate(plan.id!!, date)
        val selected = mutableListOf<DailyQueueEntry>()
        if (date.dayOfWeek !in plan.learningWeekdays) {
            return queue
        }
        due.forEach { review ->
            val estimate = history.lastOrNull { it.resourceId == review.resourceId && it.elapsedMinutes != null }?.elapsedMinutes
                ?.coerceAtMost(resources.getValue(review.resourceId).estimatedMinutes) ?: resources.getValue(review.resourceId).estimatedMinutes
            selected += DailyQueueEntry(queueId = queue.id!!, resourceId = review.resourceId, sortOrder = selected.size, reason = if (review.dueDate.isBefore(date)) QueueReason.OVERDUE_REVIEW else QueueReason.DUE_REVIEW, estimatedMinutes = estimate)
        }
        val used = selected.sumOf { it.estimatedMinutes }
        val successful = history.filter { it.outcome in successfulOutcomes }.map { it.resourceId }.toSet() + progress.findAll().filter { it.status == LearningStatus.COMPLETED }.map { it.resourceId }
        val unseen = plan.resourceIds.filterNot(successful::contains)
        val newProblemTarget = QueuePolicy.newProblemTarget(unseen.size, date, plan.targetDate, plan.learningWeekdays)
        val candidates = unseen.filterNot { id -> selected.any { it.resourceId == id } }.map { id -> id to resources.getValue(id).estimatedMinutes }
        val selectedNewIds = QueuePolicy.fillBudget(candidates, plan.dailyMinutes - used, newProblemTarget, guaranteeOne = selected.isEmpty())
        for (resourceId in selectedNewIds) {
            val estimate = resources.getValue(resourceId).estimatedMinutes
            selected += DailyQueueEntry(queueId = queue.id!!, resourceId = resourceId, sortOrder = selected.size, reason = QueueReason.NEW_PROBLEM, estimatedMinutes = estimate)
        }
        queueEntries.saveAll(selected)
        return queue
    }

    @Transactional
    fun postpone(entryId: Long): TodayEntryResponse {
        val entry = queueEntries.findById(entryId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown queue entry '$entryId'.") }
        entry.postponed = true
        queueEntries.save(entry)
        val resource = catalogService.findResource(entry.resourceId) ?: notFound("Unknown resource '${entry.resourceId}'.")
        return TodayEntryResponse(entry.id!!, entry.resourceId, resource.title, resource.url, entry.reason, entry.estimatedMinutes, true, entry.completed)
    }

    fun activeAttempt(): AttemptResponse? = attempts.findFirstByEndedAtIsNullOrderByStartedAtDesc()?.response(null)

    @Transactional
    fun startAttempt(request: StartAttemptRequest): AttemptResponse {
        if (attempts.findFirstByEndedAtIsNullOrderByStartedAtDesc() != null) badRequest("Finish or abandon the active attempt first.")
        val plan = plans.findById(request.planId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown plan '${request.planId}'.") }
        if (plan.status != PlanStatus.ACTIVE) badRequest("Study plan '${request.planId}' is not active.")
        val localDate = StudyDate.today(clock, validZone(plan.timeZone))
        val queue = queues.findByPlanIdAndQueueDate(plan.id!!, localDate) ?: badRequest("Generate today's queue before starting an attempt.")
        val entry = queueEntries.findById(request.entryId).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown queue entry '${request.entryId}'.") }
        if (entry.queueId != queue.id || entry.postponed || entry.completed) badRequest("Queue entry '${request.entryId}' is not available today.")
        val review = entry.reason != QueueReason.NEW_PROBLEM
        return attempts.save(LearningAttempt(planId = request.planId, resourceId = entry.resourceId, queueEntryId = entry.id, startedAt = clock.instant(), review = review)).response(null)
    }

    @Transactional
    fun completeAttempt(id: Long, request: CompleteAttemptRequest): AttemptResponse {
        if (request.outcome == AttemptOutcome.ABANDONED) badRequest("Use the abandon endpoint for abandoned attempts.")
        if (request.outcome == AttemptOutcome.SOLVED_INDEPENDENTLY && request.confidence == null) badRequest("Confidence is required for an independent solution.")
        val attempt = openAttempt(id)
        attempt.endedAt = clock.instant()
        attempt.elapsedMinutes = request.elapsedMinutes
        attempt.outcome = request.outcome
        attempt.confidence = request.confidence
        attempt.reflection = request.reflection?.trim()?.takeIf { it.isNotEmpty() }
        attempts.save(attempt)

        attempt.queueEntryId?.let { entryId ->
            val entry = queueEntries.findById(entryId).orElseThrow()
            entry.completed = true
            queueEntries.save(entry)
        }

        val plan = plans.findById(attempt.planId).orElseThrow()
        val localDate = StudyDate.today(clock, validZone(plan.timeZone))
        val due = ReviewPolicy.dueDate(request.outcome, request.confidence, attempt.review, localDate, plan.learningWeekdays)
        val schedule = reviews.findByPlanIdAndResourceId(attempt.planId, attempt.resourceId) ?: ReviewSchedule(planId = attempt.planId, resourceId = attempt.resourceId)
        schedule.dueDate = due
        schedule.stage = if (attempt.review && request.outcome == AttemptOutcome.SOLVED_INDEPENDENTLY) 2 else if (request.outcome == AttemptOutcome.SOLVED_INDEPENDENTLY) 1 else 0
        reviews.save(schedule)

        if (request.outcome in successfulOutcomes) {
            val summary = progress.findByResourceId(attempt.resourceId) ?: LearningProgress(resourceId = attempt.resourceId)
            summary.status = LearningStatus.COMPLETED
            summary.percentage = 100
            summary.updatedAt = clock.instant()
            progress.save(summary)
        }
        return attempt.response(due)
    }

    @Transactional
    fun abandonAttempt(id: Long): AttemptResponse {
        val attempt = openAttempt(id)
        attempt.endedAt = clock.instant()
        attempt.outcome = AttemptOutcome.ABANDONED
        return attempts.save(attempt).response(null)
    }

    @Transactional
    fun updateReflection(id: Long, request: ReflectionRequest): AttemptResponse {
        val attempt = attempts.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown attempt '$id'.") }
        attempt.reflection = request.reflection?.trim()?.takeIf { it.isNotEmpty() }
        return attempts.save(attempt).response(reviews.findByPlanIdAndResourceId(attempt.planId, attempt.resourceId)?.dueDate)
    }

    private fun openAttempt(id: Long): LearningAttempt {
        val attempt = attempts.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown attempt '$id'.") }
        if (attempt.endedAt != null) badRequest("Attempt '$id' is already finished.")
        return attempt
    }

    private fun requireActivePlan() = plans.findFirstByStatus(PlanStatus.ACTIVE) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No active study plan.")
    private fun validZone(value: String): ZoneId = try { ZoneId.of(value) } catch (_: Exception) { badRequest("Unknown time zone '$value'.") }
    private fun StudyPlan.response() = StudyPlanResponse(id!!, pathId, targetDate, learningWeekdays, timeZone, dailyMinutes, status, resourceIds.size)
    private fun LearningAttempt.response(nextReviewDate: LocalDate?) = AttemptResponse(id!!, planId, resourceId, startedAt, endedAt, elapsedMinutes, outcome, confidence, reflection, review, nextReviewDate)

    private fun badRequest(message: String): Nothing = throw ResponseStatusException(HttpStatus.BAD_REQUEST, message)
    private fun notFound(message: String): Nothing = throw ResponseStatusException(HttpStatus.NOT_FOUND, message)

    companion object {
        private val successfulOutcomes = setOf(AttemptOutcome.SOLVED_INDEPENDENTLY, AttemptOutcome.SOLVED_WITH_HELP)
    }
}
