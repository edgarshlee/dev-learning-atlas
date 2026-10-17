import type { Catalog, LearningStatus, Progress } from './types'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function expectJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with ${response.status}`)
  }
  return response.json() as Promise<T>
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

