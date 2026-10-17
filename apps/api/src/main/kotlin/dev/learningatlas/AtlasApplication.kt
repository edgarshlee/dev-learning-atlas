package dev.learningatlas

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class AtlasApplication

fun main(args: Array<String>) {
    runApplication<AtlasApplication>(*args)
}

