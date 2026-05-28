# Intro Animation + University List Page 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세션 기반 인트로 애니메이션을 추가하고, 대학교 선택 페이지에 검색/정렬/호버 프리뷰 패널을 구현한다.

**Architecture:** `IntroAnimation`과 `UniversityCard`를 독립 컴포넌트로 분리하고, `App.tsx`에서 sessionStorage 기반으로 인트로 분기 처리한다. `UniversityListPage`는 검색/정렬 상태를 `useMemo`로 파생해 관리한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, Vite, Vitest + @testing-library/react

---

## 파일 구조

| 역할 | 파일 | 신규/수정 |
|------|------|----------|
| 인트로 애니메이션 컴포넌트 | `frontend/src/components/common/IntroAnimation.tsx` | 신규 |
| 인트로 테스트 | `frontend/src/components/common/IntroAnimation.test.tsx` | 신규 |
| 대학교 카드 + activityScore | `frontend/src/components/common/UniversityCard.tsx` | 신규 |
| 카드 테스트 | `frontend/src/components/common/UniversityCard.test.tsx` | 신규 |
| 검색/정렬이 추가된 목록 페이지 | `frontend/src/pages/UniversityListPage.tsx` | 수정 |
| 목록 페이지 테스트 | `frontend/src/pages/UniversityListPage.test.tsx` | 신규 |
| 인트로 분기 진입점 | `frontend/src/App.tsx` | 수정 |

---

## Task 1: IntroAnimation 컴포넌트

**Files:**
- Create: `frontend/src/components/common/IntroAnimation.tsx`
- Create: `frontend/src/components/common/IntroAnimation.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`frontend/src/components/common/IntroAnimation.test.tsx` 를 아래 내용으로 생성:

```tsx
import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import IntroAnimation from './IntroAnimation'

test('서비스 이름이 렌더링된다', () => {
  render(<IntroAnimation onComplete={vi.fn()} />)
  expect(screen.getByText('학과정보통합서비스')).toBeInTheDocument()
})

test('3000ms 후 onComplete가 호출된다', async () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  render(<IntroAnimation onComplete={onComplete} />)
  await act(async () => { vi.advanceTimersByTime(3000) })
  expect(onComplete).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})

test('2999ms 시점에는 onComplete가 호출되지 않는다', async () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  render(<IntroAnimation onComplete={onComplete} />)
  await act(async () => { vi.advanceTimersByTime(2999) })
  expect(onComplete).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('언마운트 시 타이머가 정리된다', () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  const { unmount } = render(<IntroAnimation onComplete={onComplete} />)
  unmount()
  vi.advanceTimersByTime(5000)
  expect(onComplete).not.toHaveBeenCalled()
  vi.useRealTimers()
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/components/common/IntroAnimation.test.tsx
```

예상 결과: `Cannot find module './IntroAnimation'` 오류로 실패

- [ ] **Step 3: IntroAnimation 구현**

`frontend/src/components/common/IntroAnimation.tsx` 생성:

```tsx
import { useEffect, useState } from 'react'

interface Props {
  onComplete: () => void
}

export default function IntroAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fadeout'>('hidden')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 500)
    const t2 = setTimeout(() => setPhase('fadeout'), 2500)
    const t3 = setTimeout(() => onComplete(), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-500 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`text-center transition-all duration-700 ease-in-out ${
          phase === 'hidden' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
          학과정보통합서비스
        </h1>
        <p className="text-gray-400 text-sm mt-3 tracking-widest uppercase">Dept Portal</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/common/IntroAnimation.test.tsx
```

예상 결과: 4개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/common/IntroAnimation.tsx \
        frontend/src/components/common/IntroAnimation.test.tsx
git commit -m "feat: IntroAnimation 컴포넌트 추가 (세션 기반 페이드인)"
```

---

## Task 2: UniversityCard 컴포넌트

**Files:**
- Create: `frontend/src/components/common/UniversityCard.tsx`
- Create: `frontend/src/components/common/UniversityCard.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`frontend/src/components/common/UniversityCard.test.tsx` 생성:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import UniversityCard, { activityScore } from './UniversityCard'
import type { UniversityDto } from '../../types/university'

const mockUniv: UniversityDto = {
  id: 1,
  name: '목포대학교',
  description: '국립 목포대학교',
  schools: [
    { id: 1, name: '공과대학', description: '', faculties: [] },
    { id: 2, name: '사범대학', description: '', faculties: [] },
  ],
  totalDeptCount: 10,
}

function renderCard(overrides: Partial<Parameters<typeof UniversityCard>[0]> = {}) {
  return render(
    <UniversityCard
      univ={mockUniv}
      maxScore={40}
      maxDepts={10}
      maxSchools={2}
      onSelect={vi.fn()}
      {...overrides}
    />
  )
}

test('대학교 이름이 표시된다', () => {
  renderCard()
  expect(screen.getByText('목포대학교')).toBeInTheDocument()
})

test('단과대학 수와 학과 수가 표시된다', () => {
  renderCard()
  expect(screen.getByText('2개 단과대학')).toBeInTheDocument()
  expect(screen.getByText('10개 학과')).toBeInTheDocument()
})

test('activityScore = totalDeptCount*3 + schools.length*5', () => {
  expect(activityScore(mockUniv)).toBe(10 * 3 + 2 * 5) // 40
})

test('버튼 클릭 시 onSelect가 호출된다', () => {
  const onSelect = vi.fn()
  renderCard({ onSelect })
  screen.getByRole('button').click()
  expect(onSelect).toHaveBeenCalledTimes(1)
})

test('프리뷰 패널의 현황 레이블이 존재한다', () => {
  renderCard()
  expect(screen.getByText('📊 현황')).toBeInTheDocument()
})

test('프리뷰 패널에 단과대학/학과 수/활동 점수 레이블이 모두 있다', () => {
  renderCard()
  expect(screen.getByText('단과대학')).toBeInTheDocument()
  expect(screen.getByText('학과 수')).toBeInTheDocument()
  expect(screen.getByText('활동 점수')).toBeInTheDocument()
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/components/common/UniversityCard.test.tsx
```

예상 결과: `Cannot find module './UniversityCard'` 오류로 실패

- [ ] **Step 3: UniversityCard 구현**

`frontend/src/components/common/UniversityCard.tsx` 생성:

```tsx
import type { UniversityDto } from '../../types/university'

interface Props {
  univ: UniversityDto
  maxScore: number
  maxDepts: number
  maxSchools: number
  onSelect: () => void
}

export function activityScore(univ: UniversityDto): number {
  return univ.totalDeptCount * 3 + univ.schools.length * 5
}

export default function UniversityCard({ univ, maxScore, maxDepts, maxSchools, onSelect }: Props) {
  const score = activityScore(univ)

  return (
    <button
      onClick={onSelect}
      className="group relative block w-full text-left border-2 border-black p-8 overflow-hidden hover:bg-black hover:text-white transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <i className="fas fa-university text-3xl mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold mb-2">{univ.name}</h2>
          <p className="text-sm text-gray-500 group-hover:text-gray-300 leading-snug">
            {univ.description}
          </p>
          <div className="mt-4 flex gap-4 text-xs text-gray-400">
            <span><i className="fas fa-building mr-1" />{univ.schools.length}개 단과대학</span>
            <span><i className="fas fa-door-open mr-1" />{univ.totalDeptCount}개 학과</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-200 group-hover:border-gray-600 flex items-center justify-between text-sm font-medium">
        <span>대학교 입장</span>
        <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
      </div>

      {/* Live Data Preview Panel */}
      <div className="absolute inset-x-0 bottom-0 bg-black/95 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <p className="text-xs font-semibold text-gray-400 mb-3">📊 현황</p>
        <div className="space-y-2">
          <PreviewBar
            label="단과대학"
            value={univ.schools.length}
            unit="개"
            ratio={maxSchools > 0 ? univ.schools.length / maxSchools : 0}
          />
          <PreviewBar
            label="학과 수"
            value={univ.totalDeptCount}
            unit="개"
            ratio={maxDepts > 0 ? univ.totalDeptCount / maxDepts : 0}
          />
          <PreviewBar
            label="활동 점수"
            value={score}
            unit="점"
            ratio={maxScore > 0 ? score / maxScore : 0}
          />
        </div>
      </div>
    </button>
  )
}

function PreviewBar({
  label,
  value,
  unit,
  ratio,
}: {
  label: string
  value: number
  unit: string
  ratio: number
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-white h-full rounded-full"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
      <span className="w-14 text-right text-gray-300">
        {value}{unit}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/common/UniversityCard.test.tsx
```

예상 결과: 6개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/components/common/UniversityCard.tsx \
        frontend/src/components/common/UniversityCard.test.tsx
git commit -m "feat: UniversityCard 컴포넌트 + activityScore 추가 (호버 프리뷰 패널 포함)"
```

---

## Task 3: UniversityListPage 검색/정렬 개선

**Files:**
- Create: `frontend/src/pages/UniversityListPage.test.tsx`
- Modify: `frontend/src/pages/UniversityListPage.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`frontend/src/pages/UniversityListPage.test.tsx` 생성:

```tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import UniversityListPage from './UniversityListPage'

vi.mock('../api/universities', () => ({
  fetchUniversities: () => Promise.resolve([
    {
      id: 1,
      name: '목포대학교',
      description: '국립 목포대학교',
      schools: [
        { id: 1, name: '공과대학', description: '', faculties: [] },
        { id: 2, name: '사범대학', description: '', faculties: [] },
      ],
      totalDeptCount: 10,
    },
    {
      id: 2,
      name: '한양대학교',
      description: '한양대학교',
      schools: [
        { id: 3, name: '공과대학', description: '', faculties: [] },
      ],
      totalDeptCount: 20,
    },
    {
      id: 3,
      name: '가천대학교',
      description: '가천대학교',
      schools: [],
      totalDeptCount: 5,
    },
  ]),
}))

vi.mock('../context/DeptContext', () => ({
  useDept: () => ({
    setUniversityInfo: vi.fn(),
    selectedUniversityId: null,
    selectedDeptId: null,
    selectedDeptName: '',
  }),
  DeptProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../components/common/AdminBanner', () => ({
  default: () => null,
}))

function renderPage() {
  return render(<MemoryRouter><UniversityListPage /></MemoryRouter>)
}

test('모든 대학교 카드가 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('목포대학교')).toBeInTheDocument()
    expect(screen.getByText('한양대학교')).toBeInTheDocument()
    expect(screen.getByText('가천대학교')).toBeInTheDocument()
  })
})

test('검색어 입력 시 일치하는 대학교만 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  await userEvent.type(screen.getByPlaceholderText('대학교 이름 검색...'), '목포')

  expect(screen.getByText('목포대학교')).toBeInTheDocument()
  expect(screen.queryByText('한양대학교')).not.toBeInTheDocument()
  expect(screen.queryByText('가천대학교')).not.toBeInTheDocument()
})

test('검색 결과가 없으면 빈 상태 메시지가 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  await userEvent.type(screen.getByPlaceholderText('대학교 이름 검색...'), '존재하지않는대학교')

  expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
})

test('가나다 순 정렬 시 가천대학교가 첫 번째로 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  await userEvent.click(screen.getByRole('button', { name: '가나다 순' }))

  const cards = screen.getAllByRole('button', { name: /대학교 입장/ })
  // 가천대학교 < 목포대학교 < 한양대학교 순
  expect(cards[0].textContent).toContain('가천대학교')
})

test('활동 많은 순 정렬 시 totalDeptCount가 높은 대학이 앞에 온다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('목포대학교'))

  // 기본이 활동 많은 순이므로 바로 확인
  // 한양대: 20*3 + 1*5 = 65, 목포: 10*3 + 2*5 = 40, 가천: 5*3 + 0*5 = 15
  const cards = screen.getAllByRole('button', { name: /대학교 입장/ })
  expect(cards[0].textContent).toContain('한양대학교')
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/pages/UniversityListPage.test.tsx
```

예상 결과: import 오류 또는 검색바/정렬 관련 테스트 실패

- [ ] **Step 3: UniversityListPage 수정**

`frontend/src/pages/UniversityListPage.tsx` 를 아래 내용으로 교체:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { UniversityDto } from '../types/university'
import { fetchUniversities } from '../api/universities'
import { useDept } from '../context/DeptContext'
import AdminBanner from '../components/common/AdminBanner'
import UniversityCard, { activityScore } from '../components/common/UniversityCard'

type SortMode = 'active' | 'alpha'

export default function UniversityListPage() {
  const [universities, setUniversities] = useState<UniversityDto[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('active')
  const { setUniversityInfo } = useDept()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUniversities().then(setUniversities)
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = q
      ? universities.filter(u => u.name.toLowerCase().includes(q))
      : [...universities]

    if (sortMode === 'active') {
      list.sort((a, b) => activityScore(b) - activityScore(a))
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    }
    return list
  }, [universities, searchQuery, sortMode])

  const maxScore = useMemo(
    () => Math.max(...universities.map(activityScore), 1),
    [universities]
  )
  const maxDepts = useMemo(
    () => Math.max(...universities.map(u => u.totalDeptCount), 1),
    [universities]
  )
  const maxSchools = useMemo(
    () => Math.max(...universities.map(u => u.schools.length), 1),
    [universities]
  )

  const handleSelect = (univ: UniversityDto) => {
    setUniversityInfo(univ.id, univ.name)
    navigate('/school/departments')
  }

  return (
    <div className="bg-white text-black font-sans">
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">
              로그인
            </Link>
          </div>
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="md:hidden text-white focus:outline-none"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
          >
            <i className="fas fa-bars text-xl" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
            >
              로그인
            </Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-university mr-3" />대학교 선택
          </h1>
          <p className="text-gray-400 text-sm md:text-base">소속 대학교를 선택하세요</p>
        </div>
      </section>

      <AdminBanner scope="selection" />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="대학교 이름 검색..."
            className="flex-1 border-2 border-black px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex border-2 border-black overflow-hidden">
            <button
              onClick={() => setSortMode('active')}
              aria-label="활동 많은 순"
              className={`px-4 py-2 text-sm font-medium transition ${
                sortMode === 'active' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              활동 많은 순
            </button>
            <button
              onClick={() => setSortMode('alpha')}
              aria-label="가나다 순"
              className={`px-4 py-2 text-sm font-medium transition border-l-2 border-black ${
                sortMode === 'alpha' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              가나다 순
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20">검색 결과가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(univ => (
              <UniversityCard
                key={univ.id}
                univ={univ}
                maxScore={maxScore}
                maxDepts={maxDepts}
                maxSchools={maxSchools}
                onSelect={() => handleSelect(univ)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/pages/UniversityListPage.test.tsx
```

예상 결과: 5개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/pages/UniversityListPage.tsx \
        frontend/src/pages/UniversityListPage.test.tsx
git commit -m "feat: UniversityListPage 검색/정렬/카드 분리 적용"
```

---

## Task 4: App.tsx 인트로 분기 통합

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: App.tsx 상단에 import 추가**

`frontend/src/App.tsx` 파일 상단의 import 블록 끝에 추가:

```tsx
import { useState } from 'react'
import IntroAnimation from './components/common/IntroAnimation'
```

> 주의: `useState`는 이미 import되어 있지 않으면 추가, 이미 있으면 생략.

- [ ] **Step 2: App 함수 내 인트로 상태 추가**

`export default function App()` 함수 본문 맨 앞에 추가:

```tsx
const [introShown, setIntroShown] = useState(
  () => !!sessionStorage.getItem('intro_shown')
)
```

- [ ] **Step 3: return 문 앞에 인트로 분기 추가**

기존 `return (` 바로 위에 아래 코드를 삽입:

```tsx
if (!introShown) {
  return (
    <IntroAnimation
      onComplete={() => {
        sessionStorage.setItem('intro_shown', '1')
        setIntroShown(true)
      }}
    />
  )
}
```

- [ ] **Step 4: TypeScript 컴파일 확인**

```bash
cd frontend && npx tsc --noEmit
```

예상 결과: 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/App.tsx
git commit -m "feat: App.tsx에 세션 기반 인트로 애니메이션 분기 추가"
```

---

## Task 5: 전체 테스트 + 빌드 검증

**Files:** 변경 없음 (검증만)

- [ ] **Step 1: 전체 테스트 실행**

```bash
cd frontend && npx vitest run
```

예상 결과: 기존 테스트 포함 모두 PASS. 실패 시 오류 메시지를 확인하고 수정.

- [ ] **Step 2: 프론트엔드 빌드**

```bash
cd frontend && npm run build
```

예상 결과: `dist/` 생성 성공, TypeScript 오류 없음

- [ ] **Step 3: 서버 기동 후 브라우저 확인**

백엔드가 실행 중인 상태에서 `http://localhost:8080` 접속:
1. 인트로 애니메이션이 검은 화면에서 텍스트 페이드인으로 재생되는지 확인
2. 3초 후 대학교 선택 페이지로 자연스럽게 전환되는지 확인
3. 검색 바에 대학교 이름 타이핑 → 실시간 필터링 확인
4. "가나다 순" 탭 클릭 → 순서 변경 확인
5. 대학교 카드에 마우스 호버 → 하단 프리뷰 패널 슬라이드업 확인
6. 탭을 닫고 재접속 → 인트로가 다시 재생되는지 확인
7. 같은 탭에서 뒤로가기 후 재진입 → 인트로 스킵 확인 (sessionStorage 유지)

- [ ] **Step 4: 최종 커밋**

```bash
git add frontend/demo/demo/src/main/resources/static
git commit -m "build: 인트로 애니메이션 + 대학교 목록 개선 프론트엔드 빌드 갱신"
```
