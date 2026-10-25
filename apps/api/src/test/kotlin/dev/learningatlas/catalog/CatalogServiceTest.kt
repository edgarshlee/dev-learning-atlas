package dev.learningatlas.catalog

import kotlin.test.Test
import kotlin.test.assertEquals

class CatalogServiceTest {
    private val resources = listOf(
        resource(
            id = "kotlin-basics",
            title = "Kotlin Basics",
            summary = "Learn Kotlin fundamentals",
            type = ResourceType.COURSE,
            difficulty = Difficulty.FOUNDATION,
            language = "en",
            topicIds = listOf("kotlin"),
        ),
        resource(
            id = "spring-transactions",
            title = "Spring Transactions",
            summary = "트랜잭션 경계와 전파 옵션",
            type = ResourceType.ARTICLE,
            difficulty = Difficulty.INTERMEDIATE,
            language = "ko",
            topicIds = listOf("spring"),
        ),
        resource(
            id = "advanced-kotlin",
            title = "Advanced Kotlin",
            summary = "Coroutines and performance",
            type = ResourceType.BOOK,
            difficulty = Difficulty.ADVANCED,
            language = "en",
            topicIds = listOf("kotlin"),
        ),
    )

    @Test
    fun `filters resources by difficulty`() {
        val result = resources.filterResources(
            query = null,
            topicId = null,
            type = null,
            difficulty = Difficulty.INTERMEDIATE,
            language = null,
        )

        assertEquals(listOf("spring-transactions"), result.map(LearningResource::id))
    }

    @Test
    fun `matches language case-insensitively and ignores surrounding whitespace`() {
        val result = resources.filterResources(
            query = null,
            topicId = null,
            type = null,
            difficulty = null,
            language = " EN ",
        )

        assertEquals(listOf("kotlin-basics", "advanced-kotlin"), result.map(LearningResource::id))
    }

    @Test
    fun `combines existing and new filters`() {
        val result = resources.filterResources(
            query = "transaction",
            topicId = "spring",
            type = ResourceType.ARTICLE,
            difficulty = Difficulty.INTERMEDIATE,
            language = "ko",
        )

        assertEquals(listOf("spring-transactions"), result.map(LearningResource::id))
    }

    private fun resource(
        id: String,
        title: String,
        summary: String,
        type: ResourceType,
        difficulty: Difficulty,
        language: String,
        topicIds: List<String>,
    ) = LearningResource(
        id = id,
        title = title,
        url = "https://example.com/$id",
        type = type,
        difficulty = difficulty,
        topicIds = topicIds,
        summary = summary,
        estimatedMinutes = 60,
        language = language,
    )
}
