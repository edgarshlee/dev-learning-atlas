package dev.learningatlas.learning

import org.junit.jupiter.api.Test
import java.time.DayOfWeek
import java.time.LocalDate
import kotlin.test.assertEquals

class QueuePolicyTest {
    private val weekdays = setOf(
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
    )

    @Test
    fun `non learning days do not receive new problems`() {
        assertEquals(0, QueuePolicy.newProblemTarget(20, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 30), weekdays))
    }

    @Test
    fun `pace divides unseen problems over remaining learning days`() {
        assertEquals(2, QueuePolicy.newProblemTarget(10, LocalDate.of(2026, 11, 2), LocalDate.of(2026, 11, 6), weekdays))
    }

    @Test
    fun `missing a day recalculates instead of carrying a fixed queue`() {
        assertEquals(3, QueuePolicy.newProblemTarget(10, LocalDate.of(2026, 11, 3), LocalDate.of(2026, 11, 6), weekdays))
    }

    @Test
    fun `budget filling skips oversized problems and preserves the target count`() {
        val candidates = listOf("large" to 90, "first" to 25, "second" to 30, "third" to 20)
        assertEquals(listOf("first", "second"), QueuePolicy.fillBudget(candidates, availableMinutes = 60, targetCount = 2, guaranteeOne = true))
    }

    @Test
    fun `an empty queue still recommends one oversized problem`() {
        assertEquals(listOf("large"), QueuePolicy.fillBudget(listOf("large" to 90), availableMinutes = 60, targetCount = 1, guaranteeOne = true))
    }
}
