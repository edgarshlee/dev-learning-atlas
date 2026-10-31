import type { Attempt, AttemptOutcome, Catalog, LearningStatus, Progress, StudyPlan, Today } from './types'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function expectJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with ${response.status}`)
  }
  return response.json() as Promise<T>
}

async function optionalJson<T>(response: Response): Promise<T | null> {
  if (response.status === 404) return null
  return expectJson<T>(response)
}

export async function loadCatalog(): Promise<Catalog> {
  return expectJson(await fetch('/api/v1/catalog'))
}

export async function loadProgress(): Promise<Progress[]> {
  return expectJson(await fetch('/api/v1/progress'))
}

export async function saveProgress(
  resourceId: string,
  status: LearningStatus,
  percentage: number,
  note?: string,
): Promise<Progress> {
  return expectJson(
    await fetch(`/api/v1/progress/${resourceId}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ status, percentage, note }),
    }),
  )
}

export async function loadToday(): Promise<Today | null> {
  return optionalJson(await fetch('/api/v1/today'))
}

export async function createStudyPlan(input: {
  pathId: string
  targetDate: string
  learningWeekdays: string[]
  timeZone: string
  dailyMinutes: number
}): Promise<StudyPlan> {
  return expectJson(await fetch('/api/v1/study-plans', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(input) }))
}

export async function loadStudyPlans(): Promise<StudyPlan[]> {
  return expectJson(await fetch('/api/v1/study-plans'))
}

export async function pauseStudyPlan(id: number): Promise<StudyPlan> {
  return expectJson(await fetch(`/api/v1/study-plans/${id}/pause`, { method: 'POST' }))
}

export async function activateStudyPlan(id: number): Promise<StudyPlan> {
  return expectJson(await fetch(`/api/v1/study-plans/${id}/activate`, { method: 'POST' }))
}

export async function loadActiveAttempt(): Promise<Attempt | null> {
  const response = await fetch('/api/v1/attempts/active')
  if (response.status === 204 || response.status === 404) return null
  const text = await response.text()
  return text ? JSON.parse(text) as Attempt : null
}

export async function startAttempt(planId: number, entryId: number): Promise<Attempt> {
  return expectJson(await fetch('/api/v1/attempts/start', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ planId, entryId }) }))
}

export async function completeAttempt(id: number, input: { outcome: AttemptOutcome; elapsedMinutes: number; confidence?: number; reflection?: string }): Promise<Attempt> {
  return expectJson(await fetch(`/api/v1/attempts/${id}/complete`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(input) }))
}

export async function abandonAttempt(id: number): Promise<Attempt> {
  return expectJson(await fetch(`/api/v1/attempts/${id}/abandon`, { method: 'POST' }))
}

export async function postponeTodayEntry(id: number): Promise<void> {
  await expectJson(await fetch(`/api/v1/today/${id}/postpone`, { method: 'POST' }))
}

