package dev.learningatlas.learning

import java.time.DayOfWeek
import java.time.LocalDate
import kotlin.math.ceil

object QueuePolicy {
    fun newProblemTarget(
        unseenProblems: Int,
        today: LocalDate,
        targetDate: LocalDate,
        learningWeekdays: Set<DayOfWeek>,
    ): Int {
        if (unseenProblems == 0 || today.dayOfWeek !in learningWeekdays) return 0
        val remainingDays = remainingLearningDays(today, targetDate, learningWeekdays).coerceAtLeast(1)
        return ceil(unseenProblems.toDouble() / remainingDays).toInt().coerceAtLeast(1)
    }

    fun remainingLearningDays(
        fromDate: LocalDate,
        targetDate: LocalDate,
        learningWeekdays: Set<DayOfWeek>,
    ): Int {
        if (fromDate.isAfter(targetDate)) return 0
        return generateSequence(fromDate) { date ->
            date.plusDays(1).takeIf { !it.isAfter(targetDate) }
        }.count { it.dayOfWeek in learningWeekdays }
    }

    fun fillBudget(
        candidates: List<Pair<String, Int>>,
        availableMinutes: Int,
        targetCount: Int,
        guaranteeOne: Boolean,
    ): List<String> {
        val selected = mutableListOf<String>()
        var used = 0
        for ((id, estimate) in candidates) {
            if (selected.size >= targetCount) break
            if (used + estimate <= availableMinutes) {
                selected += id
                used += estimate
            }
        }
        if (selected.isEmpty() && guaranteeOne && candidates.isNotEmpty() && targetCount > 0) selected += candidates.first().first
        return selected
    }
}
