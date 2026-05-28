// Normalized schedule type shared across all schedule views (personal, dept, school, faculty).
// API-fetched schedules map to this via `{ ...dto, id: String(dto.id) }`.
// LocalSchedule is a structural superset and assignable without cast.

export interface ScheduleItem {
  id: string
  title: string
  date: string       // YYYY-MM-DD
  category: string
  startTime?: string // HH:MM
  endTime?: string   // HH:MM
  allDay?: boolean
  content?: string
  dday?: number      // server-computed, API-only
  readonly?: boolean // true for course-synced events (edit/delete disabled)
}

export interface CategoryMeta {
  label: string
  color: string      // hex, used for dot / chip / tooltip
}

// Categories for API-backed schedule pages (dept, school, faculty)
export const API_CATEGORY_META: Record<string, CategoryMeta> = {
  '학사': { label: '학사', color: '#4C7BFF' },
  '행사': { label: '행사', color: '#6BCB77' },
  '시험': { label: '시험', color: '#FF6B6B' },
  '기타': { label: '기타', color: '#BDBDBD' },
}

// Categories for personal calendar (localStorage)
export const PERSONAL_CATEGORY_META: Record<string, CategoryMeta> = {
  meeting:        { label: '회의',    color: '#4C7BFF' },
  task:           { label: '과제',    color: '#FF6B6B' },
  exam:           { label: '시험',    color: '#F59E0B' },
  personal:       { label: '개인',    color: '#6BCB77' },
  other:          { label: '기타',    color: '#BDBDBD' },
  course:         { label: '수업',    color: '#8B5CF6' }, // recurring class — readonly
  '시험':         { label: '수업시험', color: '#DC2626' }, // professor-posted exam
  '과제':         { label: '수업과제', color: '#EA580C' }, // professor-posted assignment
  '기타':         { label: '수업기타', color: '#9CA3AF' }, // professor-posted other
}
