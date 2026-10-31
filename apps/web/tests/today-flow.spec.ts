import { expect, test } from '@playwright/test'

test('creates a plan, completes a problem, and clears the Today queue', async ({ page }) => {
  let planCreated = false
  let attemptActive = false
  let completed = false
  const plan = {
    id: 1,
    pathId: 'programmers-algorithm-practice-kit',
    targetDate: '2026-12-31',
    learningWeekdays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    timeZone: 'Asia/Seoul',
    dailyMinutes: 60,
    status: 'ACTIVE',
    resourceCount: 1,
  }
  const catalog = {
    version: 'test',
    topics: [],
    resources: [{ id: 'programmers-42576', title: '완주하지 못한 선수', url: 'about:blank', type: 'CODING_PROBLEM', difficulty: 'FOUNDATION', topicIds: [], summary: 'Hash practice', estimatedMinutes: 30 }],
    paths: [{ id: 'programmers-algorithm-practice-kit', title: '알고리즘 고득점 Kit', description: 'Practice path', resourceIds: ['programmers-42576'] }],
  }
  const attempt = { id: 1, planId: 1, resourceId: 'programmers-42576', startedAt: '2026-11-02T01:00:00Z', review: false }

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path === '/api/v1/catalog') return route.fulfill({ json: catalog })
    if (path === '/api/v1/progress') return route.fulfill({ json: [] })
    if (path === '/api/v1/today' && request.method() === 'GET') {
      if (!planCreated) return route.fulfill({ status: 404, body: '' })
      return route.fulfill({ json: { date: '2026-11-02', plan, entries: [{ id: 1, resourceId: 'programmers-42576', title: '완주하지 못한 선수', url: 'about:blank', reason: 'NEW_PROBLEM', estimatedMinutes: 30, postponed: false, completed }], overdueCount: 0, dueCount: 0, completedCount: completed ? 1 : 0, masteredCount: 0, masteredResourceIds: [] } })
    }
    if (path === '/api/v1/attempts/active') return attemptActive ? route.fulfill({ json: attempt }) : route.fulfill({ status: 204, body: '' })
    if (path === '/api/v1/study-plans' && request.method() === 'POST') {
      planCreated = true
      return route.fulfill({ status: 201, json: plan })
    }
    if (path === '/api/v1/attempts/start') {
      attemptActive = true
      return route.fulfill({ status: 201, json: attempt })
    }
    if (path === '/api/v1/attempts/1/complete') {
      attemptActive = false
      completed = true
      return route.fulfill({ json: { ...attempt, endedAt: '2026-11-02T01:20:00Z', elapsedMinutes: 20, outcome: 'SOLVED_INDEPENDENTLY', confidence: 3, nextReviewDate: '2026-11-09' } })
    }
    return route.fulfill({ status: 404, body: '' })
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: "Turn a path into today's work." })).toBeVisible()
  await page.getByRole('button', { name: 'Create study plan' }).click()
  await expect(page.getByRole('heading', { name: '완주하지 못한 선수' })).toBeVisible()
  await page.getByRole('button', { name: 'Start solving' }).click()
  await expect(page.getByText('ACTIVE ATTEMPT')).toBeVisible()
  await page.getByRole('button', { name: 'Save result' }).click()
  await expect(page.getByRole('heading', { name: "Today's queue is clear" })).toBeVisible()
})
