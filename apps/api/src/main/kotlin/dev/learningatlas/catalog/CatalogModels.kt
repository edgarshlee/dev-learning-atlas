package dev.learningatlas.catalog

data class Catalog(
    val version: String,
    val topics: List<Topic>,
    val resources: List<LearningResource>,
    val paths: List<LearningPath>,
)

data class Topic(
    val id: String,
    val title: String,
    val description: String,
    val parentId: String? = null,
    val prerequisiteIds: List<String> = emptyList(),
    val position: Position,
)

data class Position(
    val x: Double,
    val y: Double,
)

data class LearningResource(
    val id: String,
    val title: String,
    val url: String,
    val type: ResourceType,
    val difficulty: Difficulty,
    val topicIds: List<String>,
    val summary: String,
    val estimatedMinutes: Int,
    val language: String? = null,
)

enum class ResourceType {
    BOOK,
    COURSE,
    ARTICLE,
    REPOSITORY,
    CODING_PROBLEM,
    LAB,
}

enum class Difficulty {
    FOUNDATION,
    INTERMEDIATE,
    ADVANCED,
}

data class LearningPath(
    val id: String,
    val title: String,
    val description: String,
    val resourceIds: List<String>,
)

