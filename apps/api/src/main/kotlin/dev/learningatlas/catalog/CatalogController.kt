package dev.learningatlas.catalog

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class CatalogController(
    private val catalogService: CatalogService,
) {
    @GetMapping("/catalog")
    fun catalog(): Catalog = catalogService.catalog

    @GetMapping("/resources")
    fun resources(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) topicId: String?,
        @RequestParam(required = false) type: ResourceType?,
    ): List<LearningResource> = catalogService.findResources(query, topicId, type)
}

