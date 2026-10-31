package dev.learningatlas.learning

object MasteryPolicy {
    fun isMastered(history: List<LearningAttempt>): Boolean = history.any { review ->
        review.review &&
            review.outcome == AttemptOutcome.SOLVED_INDEPENDENTLY &&
            history.any { prior ->
                prior.startedAt <= review.startedAt.minusSeconds(7 * 24 * 3600) &&
                    prior.outcome in successfulOutcomes
            }
    }

    private val successfulOutcomes = setOf(AttemptOutcome.SOLVED_INDEPENDENTLY, AttemptOutcome.SOLVED_WITH_HELP)
}
