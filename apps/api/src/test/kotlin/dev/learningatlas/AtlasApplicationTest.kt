package dev.learningatlas

import dev.learningatlas.catalog.CatalogService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import kotlin.test.assertEquals

@SpringBootTest(
    properties = [
        "spring.datasource.url=jdbc:h2:mem:atlas-test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.jpa.hibernate.ddl-auto=create-drop",
    ],
)
class AtlasApplicationTest(
    @Autowired private val catalogService: CatalogService,
) {
    @Test
    fun contextLoads() = Unit

    @Test
    fun `loads the complete algorithm interview roadmap and Programmers practice kit`() {
        val algorithmResources = catalogService.catalog.resources.filter { "algorithms" in it.topicIds }
        val algorithmPaths = catalogService.catalog.paths.filter { it.id.startsWith("algorithm-") }
        val programmersKit = catalogService.catalog.paths.single { it.id == "programmers-algorithm-practice-kit" }

        assertEquals(81, algorithmResources.size)
        assertEquals(76, algorithmResources.count { it.type.name == "CODING_PROBLEM" })
        assertEquals(8, algorithmPaths.size)
        assertEquals(47, programmersKit.resourceIds.size)
        assertEquals(47, programmersKit.resourceIds.distinct().size)
    }
}
