package dev.learningatlas.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

@Configuration
class TimeConfig {
    @Bean
    fun clock(@Value("\${app.clock.fixed:}") fixed: String): Clock =
        if (fixed.isBlank()) Clock.systemUTC() else Clock.fixed(Instant.parse(fixed), ZoneOffset.UTC)
}
