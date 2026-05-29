# 설계 명세: 인트로 애니메이션 + 대학교 선택 페이지 개선

**날짜:** 2026-05-23  
**범위:** `frontend/src`

---

## 1. 인트로 애니메이션

### 목표
사용자가 새 탭/새로고침으로 사이트에 진입할 때 한 번 재생되는 슬림한 인트로 애니메이션 구현.

### 트리거 조건
- `sessionStorage`에 `intro_shown` 키 없을 때 재생
- 재생 완료 후 `sessionStorage.setItem('intro_shown', '1')` 기록
- 이후 같은 세션 내 재방문 시 인트로 스킵

### 컴포넌트
**신규:** `src/components/common/IntroAnimation.tsx`

```
Props:
  onComplete: () => void
```

### 타임라인

| 구간 | 동작 |
|------|------|
| 0 ~ 0.5s | 검은 배경, 텍스트 완전 투명 |
| 0.5 ~ 1.5s | 서비스 이름 페이드인 + 위로 슬라이드인 |
| 1.5 ~ 2.5s | 텍스트 유지 (정지) |
| 2.5 ~ 3.0s | 전체 화면 페이드아웃 |
| 3.0s | `onComplete()` 호출 |

### 애니메이션 방식
- 외부 라이브러리 없음
- Tailwind CSS 유틸리티만 사용: `transition-opacity`, `transition-transform`, `duration-700`, `ease-in-out`
- `useState` + `useEffect`로 단계별 클래스 전환

### App.tsx 통합
```tsx
// sessionStorage 체크 후 분기
const [introShown, setIntroShown] = useState(
  () => !!sessionStorage.getItem('intro_shown')
)

return introShown
  ? <RouterOutlet />
  : <IntroAnimation onComplete={() => {
      sessionStorage.setItem('intro_shown', '1')
      setIntroShown(true)
    }} />
```

---

## 2. 대학교 선택 페이지 개선

### 목표
기존 `UniversityListPage`에 검색, 정렬, 호버 프리뷰 패널 추가.

### 변경 파일
- **수정:** `src/pages/UniversityListPage.tsx`
- **신규:** `src/components/common/UniversityCard.tsx`

### 활동 점수 산출
기존 API 응답(`totalDeptCount`, `schools.length`)만 사용:

```
activityScore = (totalDeptCount × 3) + (schools.length × 5)
```

- 기본 정렬: 활동 점수 내림차순 ("활동 많은 순")

### 검색 + 정렬 UI

**상태:**
```ts
const [searchQuery, setSearchQuery] = useState('')
const [sortMode, setSortMode] = useState<'active' | 'alpha'>('active')
```

**동작:**
- 검색 바: 타이핑 즉시 이름 필터 (대소문자 무관)
- 정렬 탭: `활동 많은 순` / `가나다 순` 토글
- 필터링 + 정렬은 `useMemo`로 파생

**빈 상태:** 결과 없을 때 "검색 결과가 없습니다" 메시지 표시

### UniversityCard 컴포넌트

**Props:**
```ts
interface Props {
  univ: UniversityDto
  maxScore: number       // 전체 대학 중 최고 점수 (바 비율 계산용)
  onSelect: () => void
}
```

**호버 Live Data Preview Panel:**
- 카드 호버 시 카드 하단에서 슬라이드업 오버레이
- Tailwind: `group-hover:translate-y-0`, `translate-y-full`, `transition-transform`, `duration-300`

**패널 표시 항목:**

| 항목 | 값 | 바 너비 |
|------|-----|--------|
| 단과대학 수 | `schools.length`개 | `schools.length / max_schools × 100%` |
| 학과 수 | `totalDeptCount`개 | `totalDeptCount / max_depts × 100%` |
| 활동 점수 | `activityScore`점 | `activityScore / maxScore × 100%` |

바 그래프는 CSS `width` 인라인 스타일로 구현 (Tailwind arbitrary value 미사용).

---

## 3. 파일 구조 요약

```
frontend/src/
├── components/common/
│   ├── IntroAnimation.tsx      (신규)
│   └── UniversityCard.tsx      (신규)
├── pages/
│   └── UniversityListPage.tsx  (수정)
└── App.tsx                     (수정 — 인트로 분기 추가)
```

---

## 4. 제약 조건

- 외부 애니메이션 라이브러리 추가 없음
- 새 API 엔드포인트 추가 없음 (기존 `/api/universities` 그대로 사용)
- TypeScript strict 유지
- 기존 테스트(`UniversityListPage.test.tsx` 없음) 영향 없음
