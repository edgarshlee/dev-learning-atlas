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

