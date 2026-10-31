package dev.learningatlas.learning

import java.time.Clock
import java.time.LocalDate
import java.time.ZoneId

object StudyDate {
    fun today(clock: Clock, zone: ZoneId): LocalDate = LocalDate.now(clock.withZone(zone))
}
