package dev.learningatlas.progress

import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class UpdateProgressRequest(
    val status: LearningStatus,

    @field:Min(0)
    @field:Max(100)
    val percentage: Int,

    @field:Size(max = 2_000)
    val note: String? = null,
)

@RestController
@RequestMapping("/api/v1/progress")
class ProgressController(
    private val progressService: ProgressService,
) {
    @GetMapping
    fun findAll(): List<ProgressResponse> = progressService.findAll()

    @PutMapping("/{resourceId}")
    fun update(
        @PathVariable resourceId: String,
        @Valid @RequestBody request: UpdateProgressRequest,
    ): ProgressResponse = progressService.update(resourceId, request)
}

