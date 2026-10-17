package dev.learningatlas.catalog

import org.springframework.core.io.ResourceLoader
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper

@Service
class CatalogService(
    resourceLoader: ResourceLoader,
    objectMapper: ObjectMapper,
) {
    val catalog: Catalog = resourceLoader
        .getResource("classpath:data/catalog.json")
        .inputStream
        .use { objectMapper.readValue(it, Catalog::class.java) }
        .also(CatalogValidator::validate)

    fun findResources(query: String?, topicId: String?, type: ResourceType?): List<LearningResource> {
        val normalizedQuery = query?.trim()?.lowercase().orEmpty()

        return catalog.resources.filter { resource ->
            val matchesQuery = normalizedQuery.isEmpty() ||
                resource.title.lowercase().contains(normalizedQuery) ||
                resource.summary.lowercase().contains(normalizedQuery)
            val matchesTopic = topicId.isNullOrBlank() || topicId in resource.topicIds
            val matchesType = type == null || resource.type == type
            matchesQuery && matchesTopic && matchesType
        }
    }

    fun containsResource(resourceId: String): Boolean = catalog.resources.any { it.id == resourceId }
}

