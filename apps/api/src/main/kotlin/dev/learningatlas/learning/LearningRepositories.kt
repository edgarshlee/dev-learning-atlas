package dev.learningatlas.learning

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface StudyPlanRepository : JpaRepository<StudyPlan, Long> {
    fun findFirstByStatus(status: PlanStatus): StudyPlan?
    fun findAllByOrderByCreatedAtDesc(): List<StudyPlan>
}

interface DailyQueueRepository : JpaRepository<DailyQueue, Long> {
    fun findByPlanIdAndQueueDate(planId: Long, queueDate: LocalDate): DailyQueue?
    fun findAllByPlanId(planId: Long): List<DailyQueue>
    fun deleteAllByPlanId(planId: Long)
}

interface DailyQueueEntryRepository : JpaRepository<DailyQueueEntry, Long> {
    fun findAllByQueueIdOrderBySortOrder(queueId: Long): List<DailyQueueEntry>
    fun deleteAllByQueueIdIn(queueIds: Collection<Long>)
}

interface LearningAttemptRepository : JpaRepository<LearningAttempt, Long> {
    fun findFirstByEndedAtIsNullOrderByStartedAtDesc(): LearningAttempt?
    fun findAllByPlanIdOrderByStartedAt(planId: Long): List<LearningAttempt>
    fun findAllByPlanIdAndResourceIdOrderByStartedAt(planId: Long, resourceId: String): List<LearningAttempt>
    fun deleteAllByPlanId(planId: Long)
}

interface ReviewScheduleRepository : JpaRepository<ReviewSchedule, Long> {
    fun findByPlanIdAndResourceId(planId: Long, resourceId: String): ReviewSchedule?
    fun findAllByPlanIdAndDueDateLessThanEqualOrderByDueDate(planId: Long, dueDate: LocalDate): List<ReviewSchedule>
    fun deleteAllByPlanId(planId: Long)
}
