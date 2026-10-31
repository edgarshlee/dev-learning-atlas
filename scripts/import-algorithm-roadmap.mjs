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

const programmersKitGroups = [
  {
    title: '해시',
    problems: [
      ['42576', '완주하지 못한 선수', 'FOUNDATION', 20],
      ['1845', '폰켓몬', 'FOUNDATION', 15],
      ['42577', '전화번호 목록', 'INTERMEDIATE', 30],
      ['42578', '의상', 'INTERMEDIATE', 30],
      ['42579', '베스트앨범', 'ADVANCED', 50],
    ],
  },
  {
    title: '스택/큐',
    problems: [
      ['12906', '같은 숫자는 싫어', 'FOUNDATION', 15],
      ['42586', '기능개발', 'INTERMEDIATE', 35],
      ['12909', '올바른 괄호', 'INTERMEDIATE', 20],
      ['42587', '프로세스', 'INTERMEDIATE', 35],
      ['42583', '다리를 지나는 트럭', 'INTERMEDIATE', 40],
      ['42584', '주식가격', 'INTERMEDIATE', 40],
    ],
  },
  {
    title: '힙(Heap)',
    problems: [
      ['42626', '더 맵게', 'INTERMEDIATE', 30],
      ['42627', '디스크 컨트롤러', 'ADVANCED', 60],
      ['42628', '이중우선순위큐', 'ADVANCED', 50],
    ],
  },
  {
    title: '정렬',
    problems: [
      ['42748', 'K번째수', 'FOUNDATION', 20],
      ['42746', '가장 큰 수', 'INTERMEDIATE', 35],
      ['42747', 'H-Index', 'INTERMEDIATE', 35],
    ],
  },
  {
    title: '완전탐색',
    problems: [
      ['86491', '최소직사각형', 'FOUNDATION', 20],
      ['42840', '모의고사', 'FOUNDATION', 20],
      ['42839', '소수 찾기', 'INTERMEDIATE', 40],
      ['42842', '카펫', 'INTERMEDIATE', 25],
      ['87946', '피로도', 'INTERMEDIATE', 35],
      ['86971', '전력망을 둘로 나누기', 'INTERMEDIATE', 40],
      ['84512', '모음사전', 'INTERMEDIATE', 35],
    ],
  },
  {
    title: '탐욕법(Greedy)',
    problems: [
      ['42862', '체육복', 'FOUNDATION', 25],
      ['42860', '조이스틱', 'INTERMEDIATE', 45],
      ['42883', '큰 수 만들기', 'INTERMEDIATE', 40],
      ['42885', '구명보트', 'INTERMEDIATE', 30],
      ['42861', '섬 연결하기', 'ADVANCED', 60],
      ['42884', '단속카메라', 'ADVANCED', 50],
    ],
  },
  {
    title: '동적계획법(Dynamic Programming)',
    problems: [
      ['42895', 'N으로 표현', 'ADVANCED', 60],
      ['43105', '정수 삼각형', 'ADVANCED', 40],
      ['42898', '등굣길', 'ADVANCED', 45],
      ['1843', '사칙연산', 'ADVANCED', 70],
      ['42897', '도둑질', 'ADVANCED', 60],
    ],
  },
  {
    title: '깊이/너비 우선 탐색(DFS/BFS)',
    problems: [
      ['43165', '타겟 넘버', 'INTERMEDIATE', 35],
      ['43162', '네트워크', 'ADVANCED', 40],
      ['1844', '게임 맵 최단거리', 'INTERMEDIATE', 40],
      ['43163', '단어 변환', 'ADVANCED', 45],
      ['87694', '아이템 줍기', 'ADVANCED', 60],
      ['43164', '여행경로', 'ADVANCED', 60],
      ['84021', '퍼즐 조각 채우기', 'ADVANCED', 70],
    ],
  },
  {
    title: '이분탐색',
    problems: [
      ['43238', '입국심사', 'ADVANCED', 50],
      ['43236', '징검다리', 'ADVANCED', 60],
    ],
  },
  {
    title: '그래프',
    problems: [
      ['49189', '가장 먼 노드', 'ADVANCED', 50],
      ['49191', '순위', 'ADVANCED', 60],
      ['49190', '방의 개수', 'ADVANCED', 70],
    ],
  },
]

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
const kitResources = []
const kitResourceIds = []

for (const group of programmersKitGroups) {
  for (const [lessonId, title, difficulty, estimatedMinutes] of group.problems) {
    const url = `https://school.programmers.co.kr/learn/courses/30/lessons/${lessonId}?language=java`
    const existing = existingByUrl.get(url)
    const resource = existing ?? {
      id: `programmers-${lessonId}`,
      title: `프로그래머스: ${title}`,
      url,
      type: 'CODING_PROBLEM',
      difficulty,
      topicIds: ['algorithms'],
      summary: `프로그래머스 알고리즘 고득점 Kit의 ${group.title} 연습 문제.`,
      estimatedMinutes,
      language: 'ko',
    }

    kitResources.push(resource)
    if (!existing) existingByUrl.set(url, resource)
    kitResourceIds.push(resource.id)
  }
}

const kitUrls = new Set(kitResources.map((resource) => resource.url))
catalog.resources = [
  ...catalog.resources.filter(
    (resource) => !importedUrls.has(resource.url) && !kitUrls.has(resource.url) && !resource.id.startsWith('coding-test-guide-'),
  ),
  ...importedResources,
  ...kitResources.filter((resource) => !importedUrls.has(resource.url)),
]

const generatedPathIds = new Set([
  ...Object.values(groups).map((group) => group.id),
  'algorithm-company-guides',
  'programmers-algorithm-practice-kit',
])
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
  {
    id: 'programmers-algorithm-practice-kit',
    title: '프로그래머스 알고리즘 고득점 Kit',
    description: '프로그래머스가 선정한 10개 알고리즘 유형의 47문제를 원본 Kit 순서로 연습합니다.',
    resourceIds: kitResourceIds,
  },
]
catalog.version = '2026.10.31.1'

const problemCount = importedResources.filter((resource) => resource.type === 'CODING_PROBLEM').length
if (problemCount !== 64 || guideIds.length !== 5) {
  throw new Error(`Expected 64 problems and 5 guides, found ${problemCount} and ${guideIds.length}`)
}

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`Imported ${problemCount} problems and ${guideIds.length} guides into ${catalogPath}`)
