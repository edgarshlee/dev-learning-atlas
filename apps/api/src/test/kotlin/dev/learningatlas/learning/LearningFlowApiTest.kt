package dev.learningatlas.learning

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = [
        "spring.datasource.url=jdbc:h2:mem:learning-flow;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.jpa.hibernate.ddl-auto=validate",
        "app.clock.fixed=2026-11-02T01:00:00Z",
    ],
)
class LearningFlowApiTest(@LocalServerPort private val port: Int) {
    private val client = HttpClient.newHttpClient()

    @Test
    fun `user can create a plan complete today's problem and receive a review date`() {
        val plan = post(
            "/api/v1/study-plans",
            """{"pathId":"programmers-algorithm-practice-kit","targetDate":"2026-12-31","learningWeekdays":["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"],"timeZone":"Asia/Seoul","dailyMinutes":60}""",
        )
        assertEquals(201, plan.statusCode())

        val today = get("/api/v1/today")
        assertEquals(200, today.statusCode())
        assertTrue(today.body().contains("programmers-42576"))
        val stableToday = get("/api/v1/today")
        assertEquals(today.body(), stableToday.body())

        val attempt = post(
            "/api/v1/attempts/start",
            """{"planId":1,"entryId":1}""",
        )
        assertEquals(201, attempt.statusCode())

        val completed = post(
            "/api/v1/attempts/1/complete",
            """{"outcome":"SOLVED_INDEPENDENTLY","elapsedMinutes":18,"confidence":4,"reflection":"Hash frequencies made the invariant obvious."}""",
        )
        assertEquals(200, completed.statusCode())
        assertTrue(completed.body().contains("2026-11-09"))

        val refreshedToday = get("/api/v1/today")
        assertTrue(refreshedToday.body().contains("\"completed\":true"))
        val duplicate = post("/api/v1/attempts/start", """{"planId":1,"entryId":1}""")
        assertEquals(400, duplicate.statusCode())

        assertEquals(200, post("/api/v1/study-plans/1/pause", "").statusCode())
        assertEquals(404, get("/api/v1/study-plans/active").statusCode())
        assertEquals(200, post("/api/v1/study-plans/1/activate", "").statusCode())
        assertEquals(200, get("/api/v1/study-plans/active").statusCode())
    }

    private fun get(path: String) = client.send(
        HttpRequest.newBuilder(URI("http://localhost:$port$path")).GET().build(),
        HttpResponse.BodyHandlers.ofString(),
    )

    private fun post(path: String, body: String) = client.send(
        HttpRequest.newBuilder(URI("http://localhost:$port$path"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build(),
        HttpResponse.BodyHandlers.ofString(),
    )
}
