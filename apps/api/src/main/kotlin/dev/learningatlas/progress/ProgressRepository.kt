package dev.learningatlas.progress

import org.springframework.data.jpa.repository.JpaRepository

interface ProgressRepository : JpaRepository<LearningProgress, Long> {
    fun findByResourceId(resourceId: String): LearningProgress?
}

