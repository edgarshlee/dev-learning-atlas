package dev.learningatlas.learning

import java.time.DayOfWeek
import java.time.LocalDate

object ReviewPolicy {
    fun dueDate(
        outcome: AttemptOutcome,
        confidence: Int?,
        review: Boolean,
        attemptDate: LocalDate,
        learningWeekdays: Set<DayOfWeek>,
    ): LocalDate {
        val candidate = when {
            outcome == AttemptOutcome.FAILED || outcome == AttemptOutcome.SOLVED_WITH_HELP -> attemptDate.plusDays(1)
            review -> attemptDate.plusDays(30)
            requireNotNull(confidence) <= 2 -> attemptDate.plusDays(3)
            else -> attemptDate.plusDays(7)
        }
        return nextLearningDay(candidate, learningWeekdays)
    }

    fun nextLearningDay(start: LocalDate, learningWeekdays: Set<DayOfWeek>): LocalDate {
        require(learningWeekdays.isNotEmpty()) { "At least one learning weekday is required." }
        var candidate = start
        repeat(8) {
            if (candidate.dayOfWeek in learningWeekdays) return candidate
            candidate = candidate.plusDays(1)
        }
        error("Could not find the next learning day.")
    }
}
