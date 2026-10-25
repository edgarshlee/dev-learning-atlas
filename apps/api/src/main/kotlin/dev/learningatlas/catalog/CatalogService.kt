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

    fun findResources(
        query: String?,
        topicId: String?,
        type: ResourceType?,
        difficulty: Difficulty?,
        language: String?,
    ): List<LearningResource> = catalog.resources.filterResources(query, topicId, type, difficulty, language)

    fun containsResource(resourceId: String): Boolean = catalog.resources.any { it.id == resourceId }
}

internal fun List<LearningResource>.filterResources(
    query: String?,
    topicId: String?,
    type: ResourceType?,
    difficulty: Difficulty?,
    language: String?,
): List<LearningResource> {
    val normalizedQuery = query?.trim()?.lowercase().orEmpty()
    val normalizedLanguage = language?.trim()?.lowercase().orEmpty()

    return filter { resource ->
        val matchesQuery = normalizedQuery.isEmpty() ||
            resource.title.lowercase().contains(normalizedQuery) ||
            resource.summary.lowercase().contains(normalizedQuery)
        val matchesTopic = topicId.isNullOrBlank() || topicId in resource.topicIds
        val matchesType = type == null || resource.type == type
        val matchesDifficulty = difficulty == null || resource.difficulty == difficulty
        val matchesLanguage = normalizedLanguage.isEmpty() || resource.language?.lowercase() == normalizedLanguage

        matchesQuery && matchesTopic && matchesType && matchesDifficulty && matchesLanguage
    }
}

