# High-throughput event pipeline capstone

Build a small but production-minded click-event platform with Kotlin and Spring Boot. The goal is not to imitate a full advertising platform. It is to demonstrate the engineering chain behind roles that mention millions of events, Kafka, Redis, low latency, cloud delivery, and operations.

## Target architecture

```text
Load generator
    |
    v
Kotlin/Spring ingestion API
    |
    v
Kafka topic (partitioned by campaignId)
    |
    +----> validation/enrichment consumer ----> PostgreSQL
    |
    +----> real-time counter consumer --------> Redis

OpenTelemetry ----> traces / metrics / logs
GitHub Actions ---> test / build / container scan / deploy
```

## Milestone 1 — Correctness before scale

- Accept an idempotency key and reject malformed events.
- Store raw events and expose campaign counters.
- Write unit, integration, and Testcontainers tests.
- Document at-least-once delivery and duplicate handling.

Evidence: API contract, schema, tests, and one architecture decision record.

## Milestone 2 — Kafka and Redis

- Partition events by `campaignId` and explain the ordering boundary.
- Add retry and dead-letter topics; preserve the original event metadata.
- Make consumers idempotent and demonstrate safe replay.
- Cache hot counters in Redis with an explicit consistency policy.

Evidence: replay demo, failure scenarios, consumer-lag dashboard, and trade-off notes.

## Milestone 3 — Performance

- Define a latency SLO and expected requests/events per second.
- Run k6 tests for steady traffic, spikes, and soak behavior.
- Measure p50/p95/p99 latency, throughput, errors, CPU, memory, and lag.
- Find one bottleneck with profiling, improve it, and retain before/after results.

Evidence: reproducible load script and a short performance report.

## Milestone 4 — Delivery and operations

- Build a container and create a GitHub Actions pipeline.
- Separate fast checks from integration and image stages.
- Add health/readiness checks and a safe rollout strategy.
- Simulate a failed deployment and document rollback.
- Instrument the service with OpenTelemetry and add one actionable alert.

Evidence: pipeline definition, dashboard screenshots, runbook, and rollback log.

## Interview-ready questions

1. Why was the Kafka partition key chosen, and what happens with a hot key?
2. What delivery guarantee does the system actually provide end to end?
3. Where is backpressure applied when consumers fall behind?
4. Which data can be stale, for how long, and why?
5. What breaks first at ten times the traffic?
6. How can a deployment be stopped or rolled back without losing events?

## Definition of done

The repository can be started locally with one command, tests and load tests are repeatable, failure recovery is demonstrated rather than asserted, and the README explains measurements and trade-offs instead of only listing technologies.
