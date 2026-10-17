import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import { loadCatalog, loadProgress, saveProgress } from './api'
import type {
  Catalog,
  LearningPath,
  LearningResource,
  LearningStatus,
  Progress,
  ResourceType,
  Topic,
} from './types'

type View = 'map' | 'library' | 'paths'

const typeLabels: Record<ResourceType, string> = {
  BOOK: 'Book',
  COURSE: 'Course',
  ARTICLE: 'Article',
  REPOSITORY: 'Repository',
  CODING_PROBLEM: 'Problem',
  LAB: 'Hands-on lab',
}

const statusLabels: Record<LearningStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
}

const topicColors = ['#e8f4ff', '#ebfbf4', '#fff3e8', '#f2edff', '#fff0f4', '#eef7df']

function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [view, setView] = useState<View>('map')
  const [query, setQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ResourceType | 'ALL'>('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([loadCatalog(), loadProgress()])
      .then(([nextCatalog, nextProgress]) => {
        setCatalog(nextCatalog)
        setProgress(Object.fromEntries(nextProgress.map((item) => [item.resourceId, item])))
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unknown error'))
  }, [])

  const filteredResources = useMemo(() => {
    if (!catalog) return []
    const normalizedQuery = query.trim().toLowerCase()
    return catalog.resources.filter((resource) => {
      const matchesQuery =
        !normalizedQuery ||
        resource.title.toLowerCase().includes(normalizedQuery) ||
        resource.summary.toLowerCase().includes(normalizedQuery)
      const matchesTopic = !selectedTopic || resource.topicIds.includes(selectedTopic)
      const matchesType = selectedType === 'ALL' || resource.type === selectedType
      return matchesQuery && matchesTopic && matchesType
    })
  }, [catalog, query, selectedTopic, selectedType])

  const completeCount = Object.values(progress).filter((item) => item.status === 'COMPLETED').length
  const inProgressCount = Object.values(progress).filter((item) => item.status === 'IN_PROGRESS').length

  async function updateProgress(resourceId: string, status: LearningStatus, percentage: number) {
    try {
      const updated = await saveProgress(resourceId, status, percentage, progress[resourceId]?.note)
      setProgress((current) => ({ ...current, [resourceId]: updated }))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save progress')
    }
  }

  if (error) {
    return (
      <main className="fatal-state">
        <span className="eyebrow">CONNECTION ERROR</span>
        <h1>The atlas could not be loaded.</h1>
        <p>{error}</p>
        <p>Start the API on port 8080, then refresh this page.</p>
      </main>
    )
  }

  if (!catalog) {
    return <main className="loading-state">Charting your learning landscape…</main>
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">DLA</div>
          <p className="eyebrow">DEV LEARNING ATLAS</p>
          <h1>Make the next thing to learn obvious.</h1>
        </div>

        <nav aria-label="Primary navigation">
          <NavButton active={view === 'map'} label="Learning map" number="01" onClick={() => setView('map')} />
          <NavButton active={view === 'library'} label="Resource library" number="02" onClick={() => setView('library')} />
          <NavButton active={view === 'paths'} label="Learning paths" number="03" onClick={() => setView('paths')} />
        </nav>

        <div className="sidebar-footer">
          <div className="metric-row"><span>Catalog</span><strong>{catalog.resources.length}</strong></div>
          <div className="metric-row"><span>In progress</span><strong>{inProgressCount}</strong></div>
          <div className="metric-row"><span>Completed</span><strong>{completeCount}</strong></div>
          <small>Catalog {catalog.version}</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">{view.toUpperCase()}</span>
            <h2>{view === 'map' ? 'Backend engineering landscape' : view === 'library' ? 'Curated resources' : 'Paths with an opinion'}</h2>
          </div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or idea" />
          </label>
        </header>

        {view !== 'paths' && (
          <FilterBar
            topics={catalog.topics}
            selectedTopic={selectedTopic}
            selectedType={selectedType}
            onTopic={setSelectedTopic}
            onType={setSelectedType}
          />
        )}

        {view === 'map' && (
          <MapView
            catalog={catalog}
            selectedTopic={selectedTopic}
            onTopic={setSelectedTopic}
            resources={filteredResources}
            progress={progress}
            onProgress={updateProgress}
          />
        )}

        {view === 'library' && (
          <section className="resource-grid" aria-label="Resource library">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} progress={progress[resource.id]} onProgress={updateProgress} />
            ))}
            {filteredResources.length === 0 && <EmptyState />}
          </section>
        )}

        {view === 'paths' && (
          <section className="path-grid">
            {catalog.paths.map((path, index) => (
              <PathCard key={path.id} path={path} index={index} catalog={catalog} progress={progress} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

function NavButton({ active, label, number, onClick }: { active: boolean; label: string; number: string; onClick: () => void }) {
  return (
    <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>
      <span>{number}</span>{label}
    </button>
  )
}

function FilterBar({
  topics,
  selectedTopic,
  selectedType,
  onTopic,
  onType,
}: {
  topics: Topic[]
  selectedTopic: string | null
  selectedType: ResourceType | 'ALL'
  onTopic: (topic: string | null) => void
  onType: (type: ResourceType | 'ALL') => void
}) {
  return (
    <div className="filter-bar">
      <select value={selectedTopic ?? ''} onChange={(event) => onTopic(event.target.value || null)} aria-label="Topic filter">
        <option value="">All topics</option>
        {topics.filter((topic) => topic.parentId).map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
      </select>
      <select value={selectedType} onChange={(event) => onType(event.target.value as ResourceType | 'ALL')} aria-label="Resource type filter">
        <option value="ALL">All formats</option>
        {(Object.keys(typeLabels) as ResourceType[]).map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}
      </select>
      {(selectedTopic || selectedType !== 'ALL') && <button className="text-button" onClick={() => { onTopic(null); onType('ALL') }}>Clear filters</button>}
    </div>
  )
}

function MapView({
  catalog,
  selectedTopic,
  onTopic,
  resources,
  progress,
  onProgress,
}: {
  catalog: Catalog
  selectedTopic: string | null
  onTopic: (topic: string | null) => void
  resources: LearningResource[]
  progress: Record<string, Progress>
  onProgress: (id: string, status: LearningStatus, percentage: number) => void
}) {
  const counts = useMemo(() => Object.fromEntries(catalog.topics.map((topic) => [topic.id, catalog.resources.filter((r) => r.topicIds.includes(topic.id)).length])), [catalog])
  const nodes: Node[] = catalog.topics.map((topic, index) => ({
    id: topic.id,
    position: topic.position,
    data: { label: `${topic.title}\n${counts[topic.id]} resources` },
    style: {
      width: topic.parentId ? 178 : 220,
      padding: topic.parentId ? 16 : 20,
      borderRadius: 16,
      border: selectedTopic === topic.id ? '2px solid #6c63ff' : '1px solid #d6e3f0',
      background: topic.parentId ? topicColors[index % topicColors.length] : 'linear-gradient(135deg, #6c63ff, #51b9e9)',
      color: topic.parentId ? '#20304a' : '#ffffff',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 700,
      whiteSpace: 'pre-line',
      lineHeight: 1.45,
      boxShadow: selectedTopic === topic.id ? '0 10px 28px rgba(108, 99, 255, .22)' : '0 7px 20px rgba(39, 70, 110, .09)',
    },
  }))

  const parentEdges: Edge[] = catalog.topics.filter((topic) => topic.parentId).map((topic) => ({
    id: `parent-${topic.parentId}-${topic.id}`,
    source: topic.parentId!,
    target: topic.id,
    type: 'smoothstep',
    style: { stroke: '#b9cce0', strokeWidth: 1.3 },
  }))
  const prerequisiteEdges: Edge[] = catalog.topics.flatMap((topic) => topic.prerequisiteIds.map((source) => ({
    id: `prerequisite-${source}-${topic.id}`,
    source,
    target: topic.id,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ff8b6a' },
    style: { stroke: '#ff8b6a', strokeWidth: 1.8 },
  })))

  return (
    <section className="map-layout">
      <div className="map-canvas">
        <ReactFlow
          nodes={nodes}
          edges={[...parentEdges, ...prerequisiteEdges]}
          onNodeClick={(_, node) => onTopic(node.id === selectedTopic ? null : node.id)}
          fitView
          minZoom={0.55}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#c9dbed" />
          <MiniMap nodeColor={(node) => node.id === selectedTopic ? '#6c63ff' : '#9bc9df'} maskColor="rgba(247,250,255,.76)" />
          <Controls showInteractive={false} />
        </ReactFlow>
        <div className="map-legend"><span className="line hierarchy" />Hierarchy <span className="line prerequisite" />Prerequisite</div>
      </div>
      <aside className="map-detail">
        <p className="eyebrow">{selectedTopic ? 'SELECTED TOPIC' : 'MAP GUIDE'}</p>
        <h3>{selectedTopic ? catalog.topics.find((topic) => topic.id === selectedTopic)?.title : 'Choose a node'}</h3>
        <p>{selectedTopic ? catalog.topics.find((topic) => topic.id === selectedTopic)?.description : 'Solid gray lines organize the field. Orange arrows show what should be understood first.'}</p>
        <div className="compact-list">
          {resources.slice(0, 5).map((resource) => (
            <ResourceCard key={resource.id} resource={resource} progress={progress[resource.id]} onProgress={onProgress} compact />
          ))}
        </div>
      </aside>
    </section>
  )
}

function ResourceCard({
  resource,
  progress,
  onProgress,
  compact = false,
}: {
  resource: LearningResource
  progress?: Progress
  onProgress: (id: string, status: LearningStatus, percentage: number) => void
  compact?: boolean
}) {
  const status = progress?.status ?? 'NOT_STARTED'
  const nextStatus: LearningStatus = status === 'NOT_STARTED' ? 'IN_PROGRESS' : status === 'IN_PROGRESS' ? 'COMPLETED' : 'NOT_STARTED'
  const nextPercentage = nextStatus === 'COMPLETED' ? 100 : nextStatus === 'IN_PROGRESS' ? 10 : 0

  return (
    <article className={`resource-card ${compact ? 'compact' : ''}`}>
      <div className="resource-meta">
        <span>{typeLabels[resource.type]}</span>
        <span>{resource.difficulty.toLowerCase()}</span>
        <span>{formatDuration(resource.estimatedMinutes)}</span>
      </div>
      <h3><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}<span aria-hidden="true"> ↗</span></a></h3>
      {!compact && <p>{resource.summary}</p>}
      <div className="resource-footer">
        <button className={`status-button ${status.toLowerCase()}`} onClick={() => onProgress(resource.id, nextStatus, nextPercentage)}>
          <span className="status-dot" />{statusLabels[status]}
        </button>
        {progress && <span>{progress.percentage}%</span>}
      </div>
    </article>
  )
}

function PathCard({ path, index, catalog, progress }: { path: LearningPath; index: number; catalog: Catalog; progress: Record<string, Progress> }) {
  const resources = path.resourceIds.map((id) => catalog.resources.find((resource) => resource.id === id)).filter(Boolean) as LearningResource[]
  const completed = resources.filter((resource) => progress[resource.id]?.status === 'COMPLETED').length

  return (
    <article className="path-card">
      <div className="path-number">0{index + 1}</div>
      <div>
        <p className="eyebrow">{completed}/{resources.length} COMPLETE</p>
        <h3>{path.title}</h3>
        <p>{path.description}</p>
      </div>
      <ol>
        {resources.map((resource) => <li key={resource.id} className={progress[resource.id]?.status === 'COMPLETED' ? 'done' : ''}><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a></li>)}
      </ol>
      <div className="progress-track"><span style={{ width: `${resources.length ? (completed / resources.length) * 100 : 0}%` }} /></div>
    </article>
  )
}

function EmptyState() {
  return <div className="empty-state"><span>∅</span><h3>No matching resources</h3><p>Try a broader query or clear the filters.</p></div>
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round((minutes / 60) * 10) / 10
  return `${hours} hr`
}

export default App

