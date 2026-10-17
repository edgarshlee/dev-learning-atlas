import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.resolve(process.argv[2] ?? path.join(projectRoot, 'docs', 'algorithm-roadmap.ko.md'))
const catalogPath = path.join(projectRoot, 'apps', 'api', 'src', 'main', 'resources', 'data', 'catalog.json')

const groups = {
  level1: {
    id: 'algorithm-level-1',
    title: 'Algorithm Lv.1 — Java fundamentals',
    description: 'Java collections, strings, loops, and straightforward implementation.',
    difficulty: 'FOUNDATION',
  },
  level2a: {
    id: 'algorithm-level-2-a',
    title: 'Algorithm Lv.2-A — Data structures & sorting',
    description: 'Stacks, queues, heaps, hashing, comparators, and sorting.',
    difficulty: 'INTERMEDIATE',
  },
  level2b: {
    id: 'algorithm-level-2-b',
    title: 'Algorithm Lv.2-B — Search & greedy',
    description: 'Brute force, backtracking, graph traversal, greedy, and two pointers.',
    difficulty: 'INTERMEDIATE',
  },
  level2c: {
    id: 'algorithm-level-2-c',
    title: 'Algorithm Lv.2-C — Kakao implementation',
    description: 'Parsing, simulation, preprocessing, binary search, and combination patterns.',
    difficulty: 'INTERMEDIATE',
  },
  level3a: {
    id: 'algorithm-level-3-a',
    title: 'Algorithm Lv.3-A — Graphs, heaps & DP',
    description: 'Interview-level graph search, scheduling, dynamic programming, and parametric search.',
    difficulty: 'ADVANCED',
  },
  level3b: {
    id: 'algorithm-level-3-b',
    title: 'Algorithm Lv.3-B — Advanced Kakao',
    description: 'Sliding windows, shortest paths, state search, prefix sums, and advanced DP.',
    difficulty: 'ADVANCED',
  },
  level4: {
    id: 'algorithm-level-4',
    title: 'Algorithm Lv.4 — Optional depth',
    description: 'Optional advanced practice for algorithm-heavy hiring processes.',
    difficulty: 'ADVANCED',
  },
}

const headingToGroup = new Map([
  ['# Level 1 — Java 문법과 기본 구현', 'level1'],
  ['## Lv.2-A: 자료구조와 정렬', 'level2a'],
  ['## Lv.2-B: 탐색과 그리디', 'level2b'],
  ['## Lv.2-C: 카카오 구현 문제', 'level2c'],
  ['## Lv.3-A: 자료구조·그래프·DP', 'level3a'],
  ['## Lv.3-B: 카카오 고난도 대표 문제', 'level3b'],
  ['# Level 4 — 선택 심화', 'level4'],
])

const markdown = fs.readFileSync(sourcePath, 'utf8')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
const existingByUrl = new Map(catalog.resources.map((resource) => [resource.url, resource]))
const resourcesByGroup = new Map(Object.keys(groups).map((key) => [key, []]))
const importedResources = []
let currentGroup = null
let inCompanyGuides = false

for (const line of markdown.split(/\r?\n/)) {
  if (headingToGroup.has(line)) {
    currentGroup = headingToGroup.get(line)
    inCompanyGuides = false
    continue
  }
  if (line === '# 공개 출제 방향 참고 자료') {
    currentGroup = null
    inCompanyGuides = true
    continue
  }
  if (line.startsWith('#') && !headingToGroup.has(line)) {
    if (line !== '# 공개 출제 방향 참고 자료') inCompanyGuides = false
  }

  if (currentGroup) {
    const match = line.match(/^\|\s*\d+\s*\|\s*\[[^\]]*\]\s*\|\s*\[([^\]]+)\]\((https:\/\/school\.programmers\.co\.kr\/[^)]+)\)\s*\|\s*([^|]+)\|\s*([^|]+)\|/)
    if (!match) continue

    const [, rawTitle, url, rawPatterns, rawGoal] = match
    const title = rawTitle.replace(/\s+—\s+카카오$/, '')
    const patterns = rawPatterns.trim()
    const goal = rawGoal.trim()
    const lessonId = url.match(/\/lessons\/(\d+)/)?.[1]
    if (!lessonId) throw new Error(`Could not find lesson id in ${url}`)

    const existing = existingByUrl.get(url)
    const resource = {
      id: existing?.id ?? `programmers-${lessonId}`,
      title: `프로그래머스: ${title}${rawTitle.includes('카카오') ? ' — 카카오' : ''}`,
      url,
      type: 'CODING_PROBLEM',
      difficulty: groups[currentGroup].difficulty,
      topicIds: ['algorithms'],
      summary: `${patterns} 연습 문제. ${currentGroup === 'level4' ? goal : `목표 시간 ${goal}.`}`,
      estimatedMinutes: Number(goal.match(/\d+/)?.[0] ?? 90),
      language: 'ko',
    }
    importedResources.push(resource)
    resourcesByGroup.get(currentGroup).push(resource.id)
    existingByUrl.set(url, resource)
  }

  if (inCompanyGuides) {
    const match = line.match(/^- \[([^\]]+)\]\((https:\/\/[^)]+)\)$/)
    if (!match) continue
    const [, title, url] = match
    const resource = {
      id: `coding-test-guide-${importedResources.filter((item) => item.id.startsWith('coding-test-guide-')).length + 1}`,
      title,
      url,
      type: 'ARTICLE',
      difficulty: 'INTERMEDIATE',
      topicIds: ['algorithms'],
      summary: '기업이 공개한 코딩테스트 해설 또는 출제 방향 참고 자료.',
      estimatedMinutes: 20,
      language: 'ko',
    }
    importedResources.push(resource)
  }
}

const importedUrls = new Set(importedResources.map((resource) => resource.url))
catalog.resources = [
  ...catalog.resources.filter((resource) => !importedUrls.has(resource.url) && !resource.id.startsWith('coding-test-guide-')),
  ...importedResources,
]

const generatedPathIds = new Set([...Object.values(groups).map((group) => group.id), 'algorithm-company-guides'])
const guideIds = importedResources.filter((resource) => resource.id.startsWith('coding-test-guide-')).map((resource) => resource.id)
catalog.paths = [
  ...catalog.paths.filter((learningPath) => !generatedPathIds.has(learningPath.id)),
  ...Object.entries(groups).map(([key, group]) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    resourceIds: resourcesByGroup.get(key),
  })),
  {
    id: 'algorithm-company-guides',
    title: 'Company coding-test guides',
    description: 'Public explanations and hiring-test guidance from Kakao and LINE.',
    resourceIds: guideIds,
  },
]
catalog.version = '2026.10.17.1'

const problemCount = importedResources.filter((resource) => resource.type === 'CODING_PROBLEM').length
if (problemCount !== 64 || guideIds.length !== 5) {
  throw new Error(`Expected 64 problems and 5 guides, found ${problemCount} and ${guideIds.length}`)
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`Imported ${problemCount} problems and ${guideIds.length} guides into ${catalogPath}`)
