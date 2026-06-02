// Normalized schedule type shared across all schedule views (personal, dept, school, faculty).
// API-fetched schedules map to this via `{ ...dto, id: String(dto.id) }`.
// LocalSchedule is a structural superset and assignable without cast.

export interface ScheduleItem {
  id: string
  title: string
  date: string           // 시작일 YYYY-MM-DD
  endDate?: string       // 종료일 YYYY-MM-DD
  category: string
  scheduleType?: string  // PERSONAL|COURSE|GRADE_NOTICE|DEPT_NOTICE|GLOBAL_NOTICE
  isCompleted?: boolean  // 완료 체크박스
  courseId?: number      // COURSE 유형일 때
  targetGrade?: number   // GRADE_NOTICE 유형일 때
  startTime?: string     // HH:MM
  endTime?: string       // HH:MM
  allDay?: boolean
  content?: string
  dday?: number          // server-computed, API-only
  readonly?: boolean     // true for timetable-synced events (수업 시간표)
  createdBy?: string     // 작성자 username (수정/삭제 권한 판단용)
}

export interface CategoryMeta {
  label: string
  color: string      // hex, used for dot / chip / tooltip
}

// ── 공통 카테고리 목록 ────────────────────────────────────────────────────────
// 필터 사이드바 · 등록/수정 모달 · 상세 모달 · 캘린더 색상 모두 이 목록에서 파생
export const SCHEDULE_CATEGORY_LIST: { value: string; label: string; color: string }[] = [
  { value: 'meeting',  label: '회의',  color: '#4C7BFF' },
  { value: 'task',     label: '과제',  color: '#FF6B6B' },
  { value: 'exam',     label: '시험',  color: '#F59E0B' },
  { value: 'personal', label: '개인',  color: '#6BCB77' },
  { value: 'academic', label: '학사',  color: '#3B82F6' },
  { value: 'event',    label: '행사',  color: '#10B981' },
  { value: 'other',    label: '기타',  color: '#BDBDBD' },
  { value: 'course',   label: '수업',  color: '#8B5CF6' },
]

// Record 형태로 변환 — categoryMeta prop 전달용
export const PERSONAL_CATEGORY_META: Record<string, CategoryMeta> =
  Object.fromEntries(SCHEDULE_CATEGORY_LIST.map(c => [c.value, { label: c.label, color: c.color }]))

// API-backed schedule pages 하위 호환 (학사/행사 한글키)
export const API_CATEGORY_META: Record<string, CategoryMeta> = {
  '학사': { label: '학사', color: '#3B82F6' },
  '행사': { label: '행사', color: '#10B981' },
  '시험': { label: '시험', color: '#F59E0B' },
  '기타': { label: '기타', color: '#BDBDBD' },
}
