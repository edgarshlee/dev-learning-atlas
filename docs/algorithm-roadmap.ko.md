# 프로그래머스 알고리즘 문제 목록

> 대상: Java 백엔드 경력직, 네이버·카카오·LINE·쿠팡·우아한형제들·당근·토스 등 국내 테크 기업 코딩테스트 준비
>
> 진행 방식: **Lv.1 → Lv.2 → Lv.3 → Lv.4** 순서로 천천히 난도를 높인다.

## 목록 사용법

- 카카오 표시는 프로그래머스에 공개된 카카오 채용·인턴십 문제다.
- 나머지는 특정 회사의 실제 기출이라고 단정하는 문제가 아니라, 대형 테크 기업 코딩테스트에서 반복되는 유형을 훈련하기 위한 대표 문제다.
- 각 레벨은 표의 위에서 아래로 풀면 된다. 같은 레벨 안에서도 상대적으로 쉬운 문제를 앞에 배치했다.
- 프로그래머스의 난이도 표기는 개편될 수 있으므로 사이트에서 현재 레벨이 달라졌다면 사이트 표기를 우선한다.
- 문제를 맞혔다는 이유만으로 바로 체크하지 말고, **며칠 뒤 해설 없이 다시 구현했을 때** 체크한다.

## 풀이 규칙

1. 문제를 읽고 입력 크기와 예상 시간복잡도를 먼저 적는다.
2. Lv.1은 20분, Lv.2는 40분, Lv.3 이상은 60분까지 직접 고민한다.
3. 풀이를 봤다면 다음 날 빈 화면에서 다시 구현한다.
4. 7일 뒤 한 번 더 풀어 통과하면 완료 처리한다.
5. 실패 원인을 `자료구조 선택`, `조건 누락`, `시간복잡도`, `구현 실수` 중 하나로 기록한다.

---

# Level 1 — Java 문법과 기본 구현

목표는 알고리즘보다 Java 컬렉션, 문자열 처리, 반복문과 조건문에 익숙해지는 것이다.

| 순서 | 완료 | 문제 | 핵심 유형 | 목표 시간 |
|---:|:---:|---|---|---:|
| 1 | [v] | [폰켓몬](https://school.programmers.co.kr/learn/courses/30/lessons/1845?language=java) | HashSet | 15분 |
| 2 | [v] | [완주하지 못한 선수](https://school.programmers.co.kr/learn/courses/30/lessons/42576?language=java) | HashMap, 빈도 계산 | 20분 |
| 3 | [v] | [K번째수](https://school.programmers.co.kr/learn/courses/30/lessons/42748?language=java) | 배열, 정렬 | 20분 |
| 4 | [v] | [모의고사](https://school.programmers.co.kr/learn/courses/30/lessons/42840?language=java) | 배열, 완전탐색 | 20분 |
| 5 | [v] | [최소직사각형](https://school.programmers.co.kr/learn/courses/30/lessons/86491?language=java) | 구현 | 20분 |
| 6 | [v] | [체육복](https://school.programmers.co.kr/learn/courses/30/lessons/42862?language=java) | 그리디 | 25분 |
| 7 | [v] | [크레인 인형뽑기 게임 — 카카오](https://school.programmers.co.kr/learn/courses/30/lessons/64061?language=java) | 스택, 시뮬레이션 | 25분 |
| 8 | [ ] | [신규 아이디 추천 — 카카오](https://school.programmers.co.kr/learn/courses/30/lessons/72410?language=java) | 문자열, 정규식 | 30분 |
| 9 | [ ] | [숫자 문자열과 영단어 — 카카오](https://school.programmers.co.kr/learn/courses/30/lessons/81301?language=java) | 문자열 치환 | 20분 |
| 10 | [ ] | [신고 결과 받기 — 카카오](https://school.programmers.co.kr/learn/courses/30/lessons/92334?language=java) | HashMap, HashSet | 35분 |
| 11 | [ ] | [개인정보 수집 유효기간 — 카카오](https://school.programmers.co.kr/learn/courses/30/lessons/150370?language=java) | 날짜 변환, 구현 | 30분 |
| 12 | [ ] | [가장 많이 받은 선물 — 카카오](https://school.programmers.co.kr/learn/courses/30/lessons/258712?language=java) | 해시, 2차원 배열 | 40분 |

## Lv.1에서 익힐 Java 문법

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

class CollectionBasics {
    void practice(String key, String value, int[] array) {
        Map<String, Integer> count = new HashMap<>();
        count.put(key, count.getOrDefault(key, 0) + 1);

        Set<String> set = new HashSet<>();
        set.add(value);
        set.contains(value);

        Arrays.sort(array);
        StringBuilder sb = new StringBuilder();
    }
}
```

## Lv.2로 넘어가는 기준

- 12문제 중 10문제 이상을 해설 없이 다시 풀 수 있다.
- `HashMap`, `HashSet`, 배열 정렬과 문자열 처리를 검색 없이 사용할 수 있다.
- 일반 Lv.1 문제를 20~25분 이내에 해결한다.

---

# Level 2 — 경력직 코테의 핵심 구간

가장 많은 시간을 투자할 구간이다. 해시, 스택·큐, 힙, 그리디, 완전탐색, DFS/BFS와 투 포인터를 익힌다.

## Lv.2-A: 자료구조와 정렬

| 순서 | 완료 | 문제 | 핵심 유형 | 목표 시간 |
|---:|:---:|---|---|---:|
| 1 | [ ] | [올바른 괄호](https://school.programmers.co.kr/learn/courses/30/lessons/12909?language=java) | 스택 | 20분 |
| 2 | [ ] | [전화번호 목록](https://school.programmers.co.kr/learn/courses/30/lessons/42577?language=java) | HashSet, 문자열 | 30분 |
| 3 | [ ] | [의상](https://school.programmers.co.kr/learn/courses/30/lessons/42578?language=java) | HashMap, 경우의 수 | 30분 |
| 4 | [ ] | [기능개발](https://school.programmers.co.kr/learn/courses/30/lessons/42586?language=java) | 큐 | 35분 |
| 5 | [ ] | [프로세스](https://school.programmers.co.kr/learn/courses/30/lessons/42587?language=java) | 큐, 우선순위 | 35분 |
| 6 | [ ] | [다리를 지나는 트럭](https://school.programmers.co.kr/learn/courses/30/lessons/42583?language=java) | 큐, 시뮬레이션 | 40분 |
| 7 | [ ] | [주식가격](https://school.programmers.co.kr/learn/courses/30/lessons/42584?language=java) | 단조 스택 | 40분 |
| 8 | [ ] | [더 맵게](https://school.programmers.co.kr/learn/courses/30/lessons/42626?language=java) | PriorityQueue | 30분 |
| 9 | [ ] | [가장 큰 수](https://school.programmers.co.kr/learn/courses/30/lessons/42746?language=java) | Comparator, 정렬 | 35분 |
| 10 | [ ] | [H-Index](https://school.programmers.co.kr/learn/courses/30/lessons/42747?language=java) | 정렬 | 35분 |

## Lv.2-B: 탐색과 그리디

| 순서 | 완료 | 문제 | 핵심 유형 | 목표 시간 |
|---:|:---:|---|---|---:|
| 11 | [ ] | [카펫](https://school.programmers.co.kr/learn/courses/30/lessons/42842?language=java) | 완전탐색, 수학 | 25분 |
| 12 | [ ] | [피로도](https://school.programmers.co.kr/learn/courses/30/lessons/87946?language=java) | 백트래킹 | 35분 |
| 13 | [ ] | [전력망을 둘로 나누기](https://school.programmers.co.kr/learn/courses/30/lessons/86971?language=java) | 그래프, 완전탐색 | 40분 |
| 14 | [ ] | [큰 수 만들기](https://school.programmers.co.kr/learn/courses/30/lessons/42883?language=java) | 그리디, 스택 | 40분 |
| 15 | [ ] | [구명보트](https://school.programmers.co.kr/learn/courses/30/lessons/42885?language=java) | 그리디, 투 포인터 | 30분 |
| 16 | [ ] | [타겟 넘버](https://school.programmers.co.kr/learn/courses/30/lessons/43165?language=java) | DFS | 35분 |
| 17 | [ ] | [게임 맵 최단거리](https://school.programmers.co.kr/learn/courses/30/lessons/1844?language=java) | BFS | 40분 |
| 18 | [ ] | [뒤에 있는 큰 수 찾기](https://school.programmers.co.kr/learn/courses/30/lessons/154539?language=java) | 단조 스택 | 40분 |
| 19 | [ ] | [무인도 여행](https://school.programmers.co.kr/learn/courses/30/lessons/154540?language=java) | BFS, 연결 요소 | 40분 |

## Lv.2-C: 카카오 구현 문제

| 순서 | 완료 | 문제 | 핵심 유형 | 목표 시간 |
|---:|:---:|---|---|---:|
| 20 | [ ] | [오픈채팅방](https://school.programmers.co.kr/learn/courses/30/lessons/42888?language=java) | 해시, 문자열 파싱 | 35분 |
| 21 | [ ] | [캐시](https://school.programmers.co.kr/learn/courses/30/lessons/17680?language=java) | LRU, 구현 | 35분 |
| 22 | [ ] | [파일명 정렬](https://school.programmers.co.kr/learn/courses/30/lessons/17686?language=java) | 파싱, 안정 정렬 | 45분 |
| 23 | [ ] | [문자열 압축](https://school.programmers.co.kr/learn/courses/30/lessons/60057?language=java) | 문자열, 완전탐색 | 45분 |
| 24 | [ ] | [메뉴 리뉴얼](https://school.programmers.co.kr/learn/courses/30/lessons/72411?language=java) | 조합, 해시 | 50분 |
| 25 | [ ] | [순위 검색](https://school.programmers.co.kr/learn/courses/30/lessons/72412?language=java) | 전처리, 이분탐색 | 60분 |
| 26 | [ ] | [주차 요금 계산](https://school.programmers.co.kr/learn/courses/30/lessons/92341?language=java) | 해시, 시간 파싱 | 45분 |
| 27 | [ ] | [두 큐 합 같게 만들기](https://school.programmers.co.kr/learn/courses/30/lessons/118667?language=java) | 큐, 투 포인터 | 50분 |
| 28 | [ ] | [이모티콘 할인행사](https://school.programmers.co.kr/learn/courses/30/lessons/150368?language=java) | 완전탐색 | 50분 |

## Lv.3로 넘어가는 기준

- Lv.2 문제 중 최소 22문제를 완료한다.
- 처음 보는 일반 Lv.2 세 문제 중 두 문제 이상을 120분 안에 통과한다.
- BFS, DFS, 투 포인터, 단조 스택, 우선순위 큐의 기본 틀을 검색 없이 구현한다.
- 풀이 전에 `O(N²)`이 가능한 입력인지 판단하는 습관이 생겼다.

---

# Level 3 — 네카라쿠배당토 실전 대비

Lv.3부터는 문제 수보다 깊이가 중요하다. 한 문제를 풀고 나서 다른 풀이와 시간복잡도까지 비교한다.

## Lv.3-A: 자료구조·그래프·DP

| 순서 | 완료 | 문제 | 핵심 유형 | 목표 시간 |
|---:|:---:|---|---|---:|
| 1 | [ ] | [베스트앨범](https://school.programmers.co.kr/learn/courses/30/lessons/42579?language=java) | 해시, 다중 정렬 | 50분 |
| 2 | [ ] | [디스크 컨트롤러](https://school.programmers.co.kr/learn/courses/30/lessons/42627?language=java) | 힙, 스케줄링 | 60분 |
| 3 | [ ] | [이중우선순위큐](https://school.programmers.co.kr/learn/courses/30/lessons/42628?language=java) | 힙, TreeMap | 50분 |
| 4 | [ ] | [네트워크](https://school.programmers.co.kr/learn/courses/30/lessons/43162?language=java) | DFS/BFS, 연결 요소 | 40분 |
| 5 | [ ] | [단어 변환](https://school.programmers.co.kr/learn/courses/30/lessons/43163?language=java) | BFS | 45분 |
| 6 | [ ] | [여행경로](https://school.programmers.co.kr/learn/courses/30/lessons/43164?language=java) | DFS, 백트래킹 | 60분 |
| 7 | [ ] | [정수 삼각형](https://school.programmers.co.kr/learn/courses/30/lessons/43105?language=java) | DP | 40분 |
| 8 | [ ] | [N으로 표현](https://school.programmers.co.kr/learn/courses/30/lessons/42895?language=java) | DP, Set | 60분 |
| 9 | [ ] | [등굣길](https://school.programmers.co.kr/learn/courses/30/lessons/42898?language=java) | DP | 45분 |
| 10 | [ ] | [입국심사](https://school.programmers.co.kr/learn/courses/30/lessons/43238?language=java) | 매개변수 탐색 | 50분 |

## Lv.3-B: 카카오 고난도 대표 문제

| 순서 | 완료 | 문제 | 핵심 유형 | 목표 시간 |
|---:|:---:|---|---|---:|
| 11 | [ ] | [보석 쇼핑](https://school.programmers.co.kr/learn/courses/30/lessons/67258?language=java) | 투 포인터, 해시 | 60분 |
| 12 | [ ] | [합승 택시 요금](https://school.programmers.co.kr/learn/courses/30/lessons/72413?language=java) | 최단거리 | 70분 |
| 13 | [ ] | [표 편집](https://school.programmers.co.kr/learn/courses/30/lessons/81303?language=java) | 연결 리스트, 스택 | 70분 |
| 14 | [ ] | [양과 늑대](https://school.programmers.co.kr/learn/courses/30/lessons/92343?language=java) | 상태 탐색 | 70분 |
| 15 | [ ] | [파괴되지 않은 건물](https://school.programmers.co.kr/learn/courses/30/lessons/92344?language=java) | 2차원 누적합 | 70분 |
| 16 | [ ] | [코딩 테스트 공부](https://school.programmers.co.kr/learn/courses/30/lessons/118668?language=java) | DP | 70분 |
| 17 | [ ] | [등산코스 정하기](https://school.programmers.co.kr/learn/courses/30/lessons/118669?language=java) | 변형 Dijkstra | 70분 |
| 18 | [ ] | [광고 삽입](https://school.programmers.co.kr/learn/courses/30/lessons/72414?language=java) | 누적합, 시간 파싱 | 70분 |

## Lv.4로 넘어가는 기준

- Lv.3 문제 중 최소 12문제를 완료한다.
- 처음 보는 Lv.3 문제에서 20분 내에 완전탐색 풀이와 최적화 방향을 구분한다.
- Dijkstra, DP, 누적합, 백트래킹의 상태 정의를 설명할 수 있다.
- Lv.3를 전부 끝낼 필요는 없다. 실제 지원을 시작하면서 취약 유형을 보완해도 된다.

---

# Level 4 — 선택 심화

Lv.4는 모든 지원자에게 필수는 아니다. 고난도 문제 해결력을 높이고 싶거나 코딩테스트 비중이 큰 포지션을 목표로 할 때 진행한다.

| 순서 | 완료 | 문제 | 핵심 유형 | 권장 접근 |
|---:|:---:|---|---|---|
| 1 | [ ] | [도둑질](https://school.programmers.co.kr/learn/courses/30/lessons/42897?language=java) | 원형 DP | 첫 집 포함·제외를 분리한다. |
| 2 | [ ] | [징검다리](https://school.programmers.co.kr/learn/courses/30/lessons/43236?language=java) | 매개변수 탐색 | 최소 거리의 가능 여부를 검사한다. |
| 3 | [ ] | [자동완성](https://school.programmers.co.kr/learn/courses/30/lessons/17685?language=java) | Trie, 정렬 | 접두어가 구분되는 최소 길이를 찾는다. |
| 4 | [ ] | [가사 검색](https://school.programmers.co.kr/learn/courses/30/lessons/60060?language=java) | Trie, 이분탐색 | 길이별·방향별로 전처리한다. |
| 5 | [ ] | [호텔 방 배정](https://school.programmers.co.kr/learn/courses/30/lessons/64063?language=java) | Union-Find 응용 | 다음 빈 방을 경로 압축으로 찾는다. |
| 6 | [ ] | [동굴 탐험](https://school.programmers.co.kr/learn/courses/30/lessons/67260?language=java) | 그래프, 선행 조건 | 방문 가능 상태와 대기 상태를 나눈다. |

## Lv.4 학습 원칙

- 90분 동안 시도한 후 핵심 아이디어를 공부해도 괜찮다.
- 풀이를 본 뒤 코드를 베끼지 말고, 아이디어만 적은 다음 다시 구현한다.
- 한 문제에서 사용한 고급 자료구조를 별도 템플릿으로 정리한다.
- 경력직 합격을 위해 Lv.4 완주가 반드시 필요한 것은 아니다. Lv.2 안정성과 Lv.3 접근력이 먼저다.

---

# 12주 권장 일정

| 기간 | 학습 범위 | 주당 목표 |
|---|---|---:|
| 1~2주 | Lv.1 | 6문제 |
| 3~6주 | Lv.2-A, Lv.2-B | 5문제 |
| 7~8주 | Lv.2-C와 Lv.2 오답 | 4문제 + 모의 테스트 |
| 9~11주 | Lv.3 | 4문제 |
| 12주 | Lv.3 오답과 지원 기업 기출 | 모의 테스트 2회 |
| 이후 | Lv.4 선택 심화 | 주 1문제 |

## 주간 루틴

- 월~목: 하루 새 문제 1개
- 금: 이번 주에 실패한 문제 재풀이
- 토: 현재 레벨 문제 3개를 제한시간 120분으로 풀이
- 일: 휴식 또는 풀이·시간복잡도 정리

---

# Java 필수 템플릿

```java
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Set;

class JavaCollectionTemplates {
    void createCollections() {
        Map<String, Integer> map = new HashMap<>();
        Set<String> set = new HashSet<>();

        Deque<Integer> stack = new ArrayDeque<>();
        Queue<Integer> queue = new ArrayDeque<>();

        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        PriorityQueue<Integer> maxHeap =
                new PriorityQueue<>(Collections.reverseOrder());
    }
}
```

검색 없이 작성할 수 있어야 하는 항목:

- `getOrDefault()` 빈도 계산
- `ArrayDeque` 스택·큐
- `Comparator` 다중 정렬
- 재귀 DFS와 반복형 BFS
- 방문 배열과 거리 배열
- 투 포인터와 슬라이딩 윈도
- 누적합
- Dijkstra
- 정답 범위 이분탐색
- `int` 대신 `long`이 필요한 범위 판단

---

# 오답 노트 템플릿

```markdown
### 문제명

- 레벨 / 유형:
- 최초 결과: 성공 / 오답 / 시간초과 / 접근 실패
- 소요 시간:
- 처음 떠올린 접근:
- 실패 원인:
- 핵심 아이디어:
- 시간복잡도:
- 다시 풀 날짜: D+1 / D+7 / D+30
```

---

# 공개 출제 방향 참고 자료

- [카카오 2024 겨울 인턴십 코딩테스트 해설](https://tech.kakao.com/posts/610)
- [카카오 2022 테크 여름인턴십 코딩테스트 해설](https://tech.kakao.com/posts/530)
- [카카오 신입 공채 1차 코딩테스트 해설](https://tech.kakao.com/posts/344)
- [LINE 인턴 채용 코딩테스트 문제 해설](https://engineering.linecorp.com/ko/blog/2019-firsthalf-line-internship-recruit-coding-test/)
- [LINE 신입 SW 개발자 코딩테스트 출제 방향](https://engineering.linecorp.com/ko/blog/2020-line-sw-developer-recruit-coding-test/)

## 현실적인 최종 목표

1. Lv.1은 대부분 20분 안에 해결한다.
2. Lv.2 세 문제 중 두 문제 이상을 120분 안에 해결한다.
3. Lv.3 대표 유형에서 풀이 방향을 잡고 구현을 완성한다.
4. Lv.4는 합격의 필수 조건이 아니라 문제 해결력 확장을 위한 선택 과정으로 사용한다.

