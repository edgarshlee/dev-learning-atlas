package dev.learningatlas.catalog

import kotlin.test.Test
import kotlin.test.assertFailsWith

class CatalogValidatorTest {
    @Test
    fun `accepts an acyclic catalog`() {
        CatalogValidator.validate(catalog())
    }

    @Test
    fun `rejects a prerequisite cycle`() {
        val catalog = catalog(
            topics = listOf(
                topic("java", listOf("spring")),
                topic("spring", listOf("java")),
            ),
        )

        assertFailsWith<IllegalArgumentException> {
            CatalogValidator.validate(catalog)
        }
    }

    @Test
    fun `rejects an unknown resource topic`() {
        val invalid = catalog().copy(
            resources = listOf(resource().copy(topicIds = listOf("missing"))),
        )

        assertFailsWith<IllegalArgumentException> {
            CatalogValidator.validate(invalid)
        }
    }

    private fun catalog(topics: List<Topic> = listOf(topic("java"))): Catalog = Catalog(
        version = "test",
        topics = topics,
        resources = listOf(resource(topicId = topics.first().id)),
        paths = listOf(LearningPath("backend", "Backend", "Test path", listOf("effective-java"))),
    )

    private fun topic(id: String, prerequisites: List<String> = emptyList()) = Topic(
        id = id,
        title = id,
        description = id,
        prerequisiteIds = prerequisites,
        position = Position(0.0, 0.0),
    )

    private fun resource(topicId: String = "java") = LearningResource(
        id = "effective-java",
        title = "Effective Java",
        url = "https://example.com",
        type = ResourceType.BOOK,
        difficulty = Difficulty.INTERMEDIATE,
        topicIds = listOf(topicId),
        summary = "Test",
        estimatedMinutes = 60,
    )
}

