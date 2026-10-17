package dev.learningatlas.progress

import dev.learningatlas.catalog.CatalogService
import jakarta.transaction.Transactional
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

data class ProgressResponse(
    val resourceId: String,
    val status: LearningStatus,
    val percentage: Int,
    val note: String?,
    val updatedAt: Instant,
)

@Service
class ProgressService(
    private val repository: ProgressRepository,
    private val catalogService: CatalogService,
) {
    fun findAll(): List<ProgressResponse> = repository.findAll()
        .sortedByDescending { it.updatedAt }
        .map(LearningProgress::toResponse)

    @Transactional
    fun update(resourceId: String, command: UpdateProgressRequest): ProgressResponse {
        if (!catalogService.containsResource(resourceId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown resource '$resourceId'.")
        }

        val progress = repository.findByResourceId(resourceId) ?: LearningProgress(resourceId = resourceId)
        progress.status = command.status
        progress.percentage = if (command.status == LearningStatus.COMPLETED) 100 else command.percentage
        progress.note = command.note?.trim()?.takeIf(String::isNotEmpty)
        progress.updatedAt = Instant.now()

        return repository.save(progress).toResponse()
    }
}

private fun LearningProgress.toResponse() = ProgressResponse(
    resourceId = resourceId,
    status = status,
    percentage = percentage,
    note = note,
    updatedAt = updatedAt,
)

