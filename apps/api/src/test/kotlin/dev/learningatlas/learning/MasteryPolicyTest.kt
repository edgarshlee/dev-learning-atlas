package dev.learningatlas.learning

import org.junit.jupiter.api.Test
import java.time.Instant
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MasteryPolicyTest {
    private val firstSuccess = LearningAttempt(
        resourceId = "problem",
        startedAt = Instant.parse("2026-11-01T00:00:00Z"),
        endedAt = Instant.parse("2026-11-01T00:20:00Z"),
        outcome = AttemptOutcome.SOLVED_WITH_HELP,
    )

    @Test
    fun `successful review before seven days is not mastery`() {
        val earlyReview = reviewAt("2026-11-07T23:59:59Z")
        assertFalse(MasteryPolicy.isMastered(listOf(firstSuccess, earlyReview)))
    }

    @Test
    fun `independent scheduled review after seven days is mastery`() {
        val spacedReview = reviewAt("2026-11-08T00:00:00Z")
        assertTrue(MasteryPolicy.isMastered(listOf(firstSuccess, spacedReview)))
    }

    @Test
    fun `ordinary solve cannot be forged into mastery`() {
        val ordinarySolve = reviewAt("2026-11-08T00:00:00Z").also { it.review = false }
        assertFalse(MasteryPolicy.isMastered(listOf(firstSuccess, ordinarySolve)))
    }

    private fun reviewAt(startedAt: String) = LearningAttempt(
        resourceId = "problem",
        startedAt = Instant.parse(startedAt),
        endedAt = Instant.parse(startedAt).plusSeconds(1200),
        outcome = AttemptOutcome.SOLVED_INDEPENDENTLY,
        review = true,
    )
}
