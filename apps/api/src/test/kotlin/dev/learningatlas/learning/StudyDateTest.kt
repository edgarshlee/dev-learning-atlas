package dev.learningatlas.learning

import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import kotlin.test.assertEquals

class StudyDateTest {
    @Test
    fun `study date follows plan time zone across UTC date boundary`() {
        val clock = Clock.fixed(Instant.parse("2026-11-01T23:30:00Z"), ZoneOffset.UTC)
        assertEquals(LocalDate.of(2026, 11, 1), StudyDate.today(clock, ZoneId.of("UTC")))
        assertEquals(LocalDate.of(2026, 11, 2), StudyDate.today(clock, ZoneId.of("Asia/Seoul")))
    }
}
