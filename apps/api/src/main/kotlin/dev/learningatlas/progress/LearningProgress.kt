package dev.learningatlas.progress

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "learning_progress")
class LearningProgress(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "resource_id", nullable = false, unique = true, length = 120)
    var resourceId: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    var status: LearningStatus = LearningStatus.NOT_STARTED,

    @Column(nullable = false)
    var percentage: Int = 0,

    @Column(length = 2_000)
    var note: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)

enum class LearningStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
}

