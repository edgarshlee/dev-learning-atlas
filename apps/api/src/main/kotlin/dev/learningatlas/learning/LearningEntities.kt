package dev.learningatlas.learning

import jakarta.persistence.Column
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Convert
import jakarta.persistence.Converter
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.DayOfWeek
import java.time.LocalDate

enum class PlanStatus { ACTIVE, PAUSED, COMPLETED }
enum class QueueReason { OVERDUE_REVIEW, DUE_REVIEW, NEW_PROBLEM }
enum class AttemptOutcome { SOLVED_INDEPENDENTLY, SOLVED_WITH_HELP, FAILED, ABANDONED }

@Converter
class WeekdaySetConverter : AttributeConverter<Set<DayOfWeek>, String> {
    override fun convertToDatabaseColumn(value: Set<DayOfWeek>) = value.sorted().joinToString(",")
    override fun convertToEntityAttribute(value: String) = value.split(',').filter(String::isNotBlank).map(DayOfWeek::valueOf).toSet()
}

@Converter
class ResourceIdListConverter : AttributeConverter<List<String>, String> {
    override fun convertToDatabaseColumn(value: List<String>) = value.joinToString("|")
    override fun convertToEntityAttribute(value: String) = value.split('|').filter(String::isNotBlank)
}

@Entity
@Table(name = "study_plan")
class StudyPlan(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
    @Column(name = "path_id", nullable = false, length = 160) var pathId: String = "",
    @Column(name = "target_date", nullable = false) var targetDate: LocalDate = LocalDate.now(),
    @Convert(converter = WeekdaySetConverter::class)
    @Column(name = "learning_weekdays", nullable = false, length = 100) var learningWeekdays: Set<DayOfWeek> = emptySet(),
    @Column(name = "time_zone", nullable = false, length = 80) var timeZone: String = "UTC",
    @Column(name = "daily_minutes", nullable = false) var dailyMinutes: Int = 60,
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) var status: PlanStatus = PlanStatus.ACTIVE,
    @Convert(converter = ResourceIdListConverter::class)
    @Column(name = "resource_ids", nullable = false, columnDefinition = "TEXT") var resourceIds: List<String> = emptyList(),
    @Column(name = "created_at", nullable = false) var createdAt: Instant = Instant.now(),
)

@Entity
@Table(name = "daily_queue")
class DailyQueue(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
    @Column(name = "plan_id", nullable = false) var planId: Long = 0,
    @Column(name = "queue_date", nullable = false) var queueDate: LocalDate = LocalDate.now(),
    @Column(name = "created_at", nullable = false) var createdAt: Instant = Instant.now(),
)

@Entity
@Table(name = "daily_queue_entry")
class DailyQueueEntry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
    @Column(name = "queue_id", nullable = false) var queueId: Long = 0,
    @Column(name = "resource_id", nullable = false, length = 120) var resourceId: String = "",
    @Column(name = "sort_order", nullable = false) var sortOrder: Int = 0,
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) var reason: QueueReason = QueueReason.NEW_PROBLEM,
    @Column(name = "estimated_minutes", nullable = false) var estimatedMinutes: Int = 0,
    @Column(nullable = false) var postponed: Boolean = false,
    @Column(nullable = false) var completed: Boolean = false,
)

@Entity
@Table(name = "learning_attempt")
class LearningAttempt(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
    @Column(name = "plan_id", nullable = false) var planId: Long = 0,
    @Column(name = "resource_id", nullable = false, length = 120) var resourceId: String = "",
    @Column(name = "queue_entry_id") var queueEntryId: Long? = null,
    @Column(name = "started_at", nullable = false) var startedAt: Instant = Instant.now(),
    @Column(name = "ended_at") var endedAt: Instant? = null,
    @Column(name = "elapsed_minutes") var elapsedMinutes: Int? = null,
    @Enumerated(EnumType.STRING) @Column(length = 32) var outcome: AttemptOutcome? = null,
    var confidence: Int? = null,
    @Column(length = 1000) var reflection: String? = null,
    @Column(name = "is_review", nullable = false) var review: Boolean = false,
)

@Entity
@Table(name = "review_schedule")
class ReviewSchedule(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
    @Column(name = "plan_id", nullable = false) var planId: Long = 0,
    @Column(name = "resource_id", nullable = false, length = 120) var resourceId: String = "",
    @Column(name = "due_date", nullable = false) var dueDate: LocalDate = LocalDate.now(),
    @Column(nullable = false) var stage: Int = 0,
)
