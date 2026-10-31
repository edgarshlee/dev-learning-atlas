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
import { abandonAttempt, activateStudyPlan, completeAttempt, createStudyPlan, loadActiveAttempt, loadCatalog, loadProgress, loadStudyPlans, loadToday, pauseStudyPlan, postponeTodayEntry, saveProgress, startAttempt } from './api'
import type {
  Catalog,
  LearningPath,
  LearningResource,
  LearningStatus,
  Progress,
  ResourceType,
  Topic,
  Today,
  Attempt,
  AttemptOutcome,
  StudyPlan,
} from './types'

type View = 'today' | 'map' | 'library' | 'paths'

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
  const [today, setToday] = useState<Today | null>(null)
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null)
  const [view, setView] = useState<View>('today')
  const [query, setQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ResourceType | 'ALL'>('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([loadCatalog(), loadProgress(), loadToday(), loadActiveAttempt()])
      .then(([nextCatalog, nextProgress, nextToday, nextAttempt]) => {
        setCatalog(nextCatalog)
        setProgress(Object.fromEntries(nextProgress.map((item) => [item.resourceId, item])))
        setToday(nextToday)
        setActiveAttempt(nextAttempt)
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

  async function refreshLearning() {
    const [nextToday, nextAttempt, nextProgress] = await Promise.all([loadToday(), loadActiveAttempt(), loadProgress()])
    setToday(nextToday)
    setActiveAttempt(nextAttempt)
    setProgress(Object.fromEntries(nextProgress.map((item) => [item.resourceId, item])))
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
          <NavButton active={view === 'today'} label="Today" number="01" onClick={() => setView('today')} badge={(today?.overdueCount ?? 0) + (today?.dueCount ?? 0)} />
          <NavButton active={view === 'map'} label="Learning map" number="02" onClick={() => setView('map')} />
          <NavButton active={view === 'library'} label="Resource library" number="03" onClick={() => setView('library')} />
          <NavButton active={view === 'paths'} label="Learning paths" number="04" onClick={() => setView('paths')} />
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
            <h2>{view === 'today' ? 'Your next useful hour' : view === 'map' ? 'Backend engineering landscape' : view === 'library' ? 'Curated resources' : 'Paths with an opinion'}</h2>
          </div>
          {view !== 'today' && <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or idea" />
          </label>}
        </header>

        {view !== 'paths' && view !== 'today' && (
          <FilterBar
            topics={catalog.topics}
            selectedTopic={selectedTopic}
            selectedType={selectedType}
            onTopic={setSelectedTopic}
            onType={setSelectedType}
          />
        )}

        {view === 'today' && (
          <TodayView
            catalog={catalog}
            today={today}
            activeAttempt={activeAttempt}
            onRefresh={refreshLearning}
            onToday={setToday}
            onAttempt={setActiveAttempt}
            onError={(message) => setError(message)}
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
              <PathCard key={path.id} path={path} index={index} catalog={catalog} progress={progress} masteredResourceIds={new Set(today?.masteredResourceIds ?? [])} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

function NavButton({ active, label, number, onClick, badge = 0 }: { active: boolean; label: string; number: string; onClick: () => void; badge?: number }) {
  return (
    <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>
      <span>{number}</span>{label}{badge > 0 && <b className="nav-badge">{badge}</b>}
    </button>
  )
}

function TodayView({ catalog, today, activeAttempt, onRefresh, onToday, onAttempt, onError }: {
  catalog: Catalog
  today: Today | null
  activeAttempt: Attempt | null
  onRefresh: () => Promise<void>
  onToday: (today: Today | null) => void
  onAttempt: (attempt: Attempt | null) => void
  onError: (message: string) => void
}) {
  const codingResourceIds = new Set(catalog.resources.filter((resource) => resource.type === 'CODING_PROBLEM').map((resource) => resource.id))
  const codingPaths = catalog.paths.filter((path) => path.resourceIds.some((id) => codingResourceIds.has(id)))
  const kit = codingPaths.find((path) => path.id === 'programmers-algorithm-practice-kit') ?? codingPaths[0]
  const [pathId, setPathId] = useState(kit?.id ?? '')
  const [targetDate, setTargetDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() + 60); return date.toISOString().slice(0, 10) })
  const [dailyMinutes, setDailyMinutes] = useState(60)
  const [weekdays, setWeekdays] = useState(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'])
  const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([])

  useEffect(() => {
    if (!today) loadStudyPlans().then(setSavedPlans).catch(() => setSavedPlans([]))
  }, [today])

  async function createPlan() {
    try {
      await createStudyPlan({ pathId, targetDate, learningWeekdays: weekdays, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, dailyMinutes })
      onToday(await loadToday())
    } catch (reason) { onError(reason instanceof Error ? reason.message : 'Could not create study plan') }
  }

  async function begin(entry: Today['entries'][number]) {
    try {
      const attempt = await startAttempt(today!.plan.id, entry.id)
      onAttempt(attempt)
      window.open(entry.url, '_blank', 'noopener,noreferrer')
    } catch (reason) { onError(reason instanceof Error ? reason.message : 'Could not start attempt') }
  }

  if (!today) {
    return <section className="plan-setup">
      <div><p className="eyebrow">START A STUDY PLAN</p><h3>Turn a path into today's work.</h3><p>Choose one coding path, a target date, and the time you can reliably protect each day.</p></div>
      <div className="setup-form">
        <label>Learning path<select value={pathId} onChange={(e) => setPathId(e.target.value)}>{codingPaths.map((path) => <option key={path.id} value={path.id}>{path.title}</option>)}</select></label>
        <label>Target date<input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></label>
        <label>Daily time (minutes)<input type="number" min="10" max="720" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} /><span className="quick-times">{[30, 60, 90].map((value) => <button type="button" key={value} onClick={() => setDailyMinutes(value)}>{value}</button>)}</span></label>
        <fieldset className="weekday-picker"><legend>Learning days</legend>{['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map((day) => <label key={day}><input type="checkbox" checked={weekdays.includes(day)} onChange={() => setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])} />{day.slice(0, 3)}</label>)}</fieldset>
        <p className="weekday-note">Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        <button className="primary-button" onClick={createPlan} disabled={!pathId || weekdays.length === 0}>Create study plan</button>
        {savedPlans.filter((plan) => plan.status === 'PAUSED').map((plan) => <button className="text-button" key={plan.id} onClick={async () => { await activateStudyPlan(plan.id); onToday(await loadToday()) }}>Resume {catalog.paths.find((path) => path.id === plan.pathId)?.title ?? plan.pathId}</button>)}
      </div>
    </section>
  }

  return <section className="today-layout">
    <div className="today-summary">
      <div><p className="eyebrow">{today.date}</p><h3>{catalog.paths.find((p) => p.id === today.plan.pathId)?.title}</h3><p>{today.plan.dailyMinutes} minute budget · target {today.plan.targetDate}</p><button className="text-button" onClick={async () => { await pauseStudyPlan(today.plan.id); onToday(null) }}>Pause plan</button></div>
      <div className="today-metrics"><strong>{today.completedCount}/{today.plan.resourceCount}<span>completed</span></strong><strong>{today.masteredCount}<span>mastered</span></strong><strong>{today.overdueCount + today.dueCount}<span>reviews due</span></strong></div>
    </div>
    {activeAttempt && <AttemptPanel attempt={activeAttempt} resource={catalog.resources.find((r) => r.id === activeAttempt.resourceId)!} onDone={onRefresh} onAttempt={onAttempt} onError={onError} />}
    <div className="today-list">
      {today.entries.filter((entry) => !entry.postponed && !entry.completed).map((entry, index) => <article className="today-card" key={entry.id}>
        <div className="today-order">{String(index + 1).padStart(2, '0')}</div>
        <div><p className={`queue-reason ${entry.reason.toLowerCase()}`}>{entry.reason.replaceAll('_', ' ')}</p><h3>{entry.title}</h3><p>{entry.estimatedMinutes} minute estimate</p></div>
        <div className="today-actions"><button className="primary-button" onClick={() => begin(entry)} disabled={Boolean(activeAttempt)}>Start solving</button><button className="text-button" onClick={async () => { await postponeTodayEntry(entry.id); await onRefresh() }}>Postpone today</button></div>
      </article>)}
      {today.entries.filter((entry) => !entry.postponed && !entry.completed).length === 0 && <div className="empty-state"><span>✓</span><h3>Today's queue is clear</h3><p>Come back on your next learning day.</p></div>}
    </div>
  </section>
}

function AttemptPanel({ attempt, resource, onDone, onAttempt, onError }: { attempt: Attempt; resource: LearningResource; onDone: () => Promise<void>; onAttempt: (attempt: Attempt | null) => void; onError: (message: string) => void }) {
  const initialMinutes = Math.max(1, Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 60000))
  const [outcome, setOutcome] = useState<AttemptOutcome>('SOLVED_INDEPENDENTLY')
  const [elapsedMinutes, setElapsedMinutes] = useState(initialMinutes)
  const [confidence, setConfidence] = useState(3)
  const [reflection, setReflection] = useState('')
  async function submit() {
    try { await completeAttempt(attempt.id, { outcome, elapsedMinutes, confidence: outcome === 'SOLVED_INDEPENDENTLY' ? confidence : undefined, reflection }); onAttempt(null); await onDone() }
    catch (reason) { onError(reason instanceof Error ? reason.message : 'Could not complete attempt') }
  }
  return <div className="attempt-panel"><div><p className="eyebrow">ACTIVE ATTEMPT</p><h3>{resource.title}</h3><p>Started {new Date(attempt.startedAt).toLocaleTimeString()}</p></div><div className="attempt-fields"><label>Result<select value={outcome} onChange={(e) => setOutcome(e.target.value as AttemptOutcome)}><option value="SOLVED_INDEPENDENTLY">Solved independently</option><option value="SOLVED_WITH_HELP">Solved with help</option><option value="FAILED">Failed</option></select></label><label>Minutes<input type="number" min="1" value={elapsedMinutes} onChange={(e) => setElapsedMinutes(Number(e.target.value))} /></label>{outcome === 'SOLVED_INDEPENDENTLY' && <label>Confidence<select value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>}<label className="reflection-field">Reflection<input value={reflection} maxLength={1000} onChange={(e) => setReflection(e.target.value)} placeholder="One useful insight or mistake" /></label></div><div className="attempt-actions"><button className="primary-button" onClick={submit}>Save result</button><button className="text-button" onClick={async () => { await abandonAttempt(attempt.id); onAttempt(null); await onDone() }}>Abandon</button></div></div>
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

function PathCard({ path, index, catalog, progress, masteredResourceIds }: { path: LearningPath; index: number; catalog: Catalog; progress: Record<string, Progress>; masteredResourceIds: Set<string> }) {
  const resources = path.resourceIds.map((id) => catalog.resources.find((resource) => resource.id === id)).filter(Boolean) as LearningResource[]
  const completed = resources.filter((resource) => progress[resource.id]?.status === 'COMPLETED').length
  const mastered = resources.filter((resource) => masteredResourceIds.has(resource.id)).length

  return (
    <article className="path-card">
      <div className="path-number">0{index + 1}</div>
      <div>
        <p className="eyebrow">{completed}/{resources.length} COMPLETE · {mastered} MASTERED</p>
        <h3>{path.title}</h3>
        <p>{path.description}</p>
      </div>
      <ol>
        {resources.map((resource) => <li key={resource.id} className={progress[resource.id]?.status === 'COMPLETED' ? 'done' : ''}><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a>{masteredResourceIds.has(resource.id) && <span> · mastered</span>}</li>)}
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

