package dev.learningatlas.learning

import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.DayOfWeek
import java.time.LocalDate

data class CreateStudyPlanRequest(
    @field:NotBlank val pathId: String,
    val targetDate: LocalDate,
    @field:NotEmpty val learningWeekdays: Set<DayOfWeek>,
    @field:NotBlank val timeZone: String,
    @field:Min(10) @field:Max(720) val dailyMinutes: Int,
)

data class StartAttemptRequest(val planId: Long, val entryId: Long)

data class CompleteAttemptRequest(
    val outcome: AttemptOutcome,
    @field:Min(1) @field:Max(1440) val elapsedMinutes: Int,
    @field:Min(1) @field:Max(5) val confidence: Int?,
    @field:Size(max = 1000) val reflection: String?,
)

data class ReflectionRequest(@field:Size(max = 1000) val reflection: String?)

@RestController
@RequestMapping("/api/v1")
class LearningController(private val service: LearningService) {
    @PostMapping("/study-plans")
    @ResponseStatus(HttpStatus.CREATED)
    fun createPlan(@Valid @RequestBody request: CreateStudyPlanRequest) = service.createPlan(request)

    @GetMapping("/study-plans/active")
    fun activePlan() = service.activePlan()

    @GetMapping("/study-plans")
    fun plans() = service.plans()

    @PostMapping("/study-plans/{id}/pause")
    fun pausePlan(@PathVariable id: Long) = service.pausePlan(id)

    @PostMapping("/study-plans/{id}/activate")
    fun activatePlan(@PathVariable id: Long) = service.activatePlan(id)

    @GetMapping("/today")
    fun today() = service.today()

    @PostMapping("/today/{entryId}/postpone")
    fun postpone(@PathVariable entryId: Long) = service.postpone(entryId)

    @GetMapping("/attempts/active")
    fun activeAttempt() = service.activeAttempt()

    @PostMapping("/attempts/start")
    @ResponseStatus(HttpStatus.CREATED)
    fun startAttempt(@Valid @RequestBody request: StartAttemptRequest) = service.startAttempt(request)

    @PostMapping("/attempts/{id}/complete")
    fun completeAttempt(@PathVariable id: Long, @Valid @RequestBody request: CompleteAttemptRequest) = service.completeAttempt(id, request)

    @PostMapping("/attempts/{id}/abandon")
    fun abandonAttempt(@PathVariable id: Long) = service.abandonAttempt(id)

    @PatchMapping("/attempts/{id}/reflection")
    fun updateReflection(@PathVariable id: Long, @Valid @RequestBody request: ReflectionRequest) = service.updateReflection(id, request)
}
