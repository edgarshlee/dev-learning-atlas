package dev.learningatlas.catalog

object CatalogValidator {
    fun validate(catalog: Catalog) {
        requireUnique(catalog.topics.map { it.id }, "topic")
        requireUnique(catalog.resources.map { it.id }, "resource")
        requireUnique(catalog.paths.map { it.id }, "path")

        val topicIds = catalog.topics.map { it.id }.toSet()
        val resourceIds = catalog.resources.map { it.id }.toSet()

        catalog.topics.forEach { topic ->
            topic.parentId?.let {
                require(it in topicIds) { "Topic '${topic.id}' has unknown parent '$it'." }
            }
            topic.prerequisiteIds.forEach {
                require(it in topicIds) { "Topic '${topic.id}' has unknown prerequisite '$it'." }
                require(it != topic.id) { "Topic '${topic.id}' cannot require itself." }
            }
        }

        catalog.resources.forEach { resource ->
            require(resource.topicIds.isNotEmpty()) { "Resource '${resource.id}' must have a topic." }
            require(resource.estimatedMinutes > 0) { "Resource '${resource.id}' needs a positive duration." }
            resource.topicIds.forEach {
                require(it in topicIds) { "Resource '${resource.id}' references unknown topic '$it'." }
            }
        }

        catalog.paths.forEach { path ->
            require(path.resourceIds.isNotEmpty()) { "Path '${path.id}' cannot be empty." }
            path.resourceIds.forEach {
                require(it in resourceIds) { "Path '${path.id}' references unknown resource '$it'." }
            }
        }

        requireAcyclicPrerequisites(catalog.topics)
    }

    private fun requireUnique(ids: List<String>, kind: String) {
        val duplicates = ids.groupingBy { it }.eachCount().filterValues { it > 1 }.keys
        require(duplicates.isEmpty()) { "Duplicate $kind ids: ${duplicates.joinToString()}." }
    }

    private fun requireAcyclicPrerequisites(topics: List<Topic>) {
        val prerequisites = topics.associate { it.id to it.prerequisiteIds }
        val visiting = mutableSetOf<String>()
        val visited = mutableSetOf<String>()

        fun visit(id: String) {
            if (id in visited) return
            require(id !in visiting) { "Prerequisite cycle detected at topic '$id'." }

            visiting += id
            prerequisites.getValue(id).forEach(::visit)
            visiting -= id
            visited += id
        }

        prerequisites.keys.forEach(::visit)
    }
}

