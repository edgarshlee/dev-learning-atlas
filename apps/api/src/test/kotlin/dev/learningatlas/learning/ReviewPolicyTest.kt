package dev.learningatlas.learning

import org.junit.jupiter.api.Test
import java.time.DayOfWeek
import java.time.LocalDate
import kotlin.test.assertEquals

class ReviewPolicyTest {
    private val weekdays = setOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)

    @Test
    fun `failed Friday attempt is reviewed on Monday`() {
        assertEquals(LocalDate.of(2026, 11, 2), ReviewPolicy.dueDate(AttemptOutcome.FAILED, null, false, LocalDate.of(2026, 10, 30), weekdays))
    }

    @Test
    fun `confident Saturday solution is reviewed on the next learning day after seven days`() {
        assertEquals(LocalDate.of(2026, 11, 9), ReviewPolicy.dueDate(AttemptOutcome.SOLVED_INDEPENDENTLY, 4, false, LocalDate.of(2026, 10, 31), weekdays))
    }

    @Test
    fun `low confidence solution is reviewed after three days`() {
        assertEquals(LocalDate.of(2026, 11, 3), ReviewPolicy.dueDate(AttemptOutcome.SOLVED_INDEPENDENTLY, 2, false, LocalDate.of(2026, 10, 31), weekdays))
    }

    @Test
    fun `successful review advances to thirty days`() {
        assertEquals(LocalDate.of(2026, 11, 30), ReviewPolicy.dueDate(AttemptOutcome.SOLVED_INDEPENDENTLY, 5, true, LocalDate.of(2026, 10, 31), weekdays))
    }
}
