package dev.learningatlas.learning

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface StudyPlanRepository : JpaRepository<StudyPlan, Long> {
    fun findFirstByStatus(status: PlanStatus): StudyPlan?
    fun findAllByOrderByCreatedAtDesc(): List<StudyPlan>
}

interface DailyQueueRepository : JpaRepository<DailyQueue, Long> {
    fun findByPlanIdAndQueueDate(planId: Long, queueDate: LocalDate): DailyQueue?
}

interface DailyQueueEntryRepository : JpaRepository<DailyQueueEntry, Long> {
    fun findAllByQueueIdOrderBySortOrder(queueId: Long): List<DailyQueueEntry>
}

interface LearningAttemptRepository : JpaRepository<LearningAttempt, Long> {
    fun findFirstByEndedAtIsNullOrderByStartedAtDesc(): LearningAttempt?
    fun findAllByPlanIdOrderByStartedAt(planId: Long): List<LearningAttempt>
    fun findAllByPlanIdAndResourceIdOrderByStartedAt(planId: Long, resourceId: String): List<LearningAttempt>
}

interface ReviewScheduleRepository : JpaRepository<ReviewSchedule, Long> {
    fun findByPlanIdAndResourceId(planId: Long, resourceId: String): ReviewSchedule?
    fun findAllByPlanIdAndDueDateLessThanEqualOrderByDueDate(planId: Long, dueDate: LocalDate): List<ReviewSchedule>
}
