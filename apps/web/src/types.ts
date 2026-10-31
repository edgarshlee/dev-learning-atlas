export type ResourceType = 'BOOK' | 'COURSE' | 'ARTICLE' | 'REPOSITORY' | 'CODING_PROBLEM' | 'LAB'
export type Difficulty = 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED'
export type LearningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface Position {
  x: number
  y: number
}

export interface Topic {
  id: string
  title: string
  description: string
  parentId?: string
  prerequisiteIds: string[]
  position: Position
}

export interface LearningResource {
  id: string
  title: string
  url: string
  type: ResourceType
  difficulty: Difficulty
  topicIds: string[]
  summary: string
  estimatedMinutes: number
  language?: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  resourceIds: string[]
}

export interface Catalog {
  version: string
  topics: Topic[]
  resources: LearningResource[]
  paths: LearningPath[]
}

export interface Progress {
  resourceId: string
  status: LearningStatus
  percentage: number
  note?: string
  updatedAt: string
}

export type PlanStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED'
export type QueueReason = 'OVERDUE_REVIEW' | 'DUE_REVIEW' | 'NEW_PROBLEM'
export type AttemptOutcome = 'SOLVED_INDEPENDENTLY' | 'SOLVED_WITH_HELP' | 'FAILED' | 'ABANDONED'

export interface StudyPlan {
  id: number
  pathId: string
  targetDate: string
  learningWeekdays: string[]
  timeZone: string
  dailyMinutes: number
  status: PlanStatus
  resourceCount: number
}

export interface TodayEntry {
  id: number
  resourceId: string
  title: string
  url: string
  reason: QueueReason
  estimatedMinutes: number
  postponed: boolean
  completed: boolean
}

export interface Today {
  date: string
  plan: StudyPlan
  entries: TodayEntry[]
  overdueCount: number
  dueCount: number
  completedCount: number
  masteredCount: number
  masteredResourceIds: string[]
}

export interface Attempt {
  id: number
  planId: number
  resourceId: string
  startedAt: string
  endedAt?: string
  elapsedMinutes?: number
  outcome?: AttemptOutcome
  confidence?: number
  reflection?: string
  review: boolean
  nextReviewDate?: string
}

