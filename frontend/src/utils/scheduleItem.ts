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
  meeting: { label: '회의',  color: '#4C7BFF' },
  task:    { label: '과제',  color: '#FF6B6B' },
  exam:    { label: '시험',  color: '#F59E0B' },
  personal:{ label: '개인',  color: '#6BCB77' },
  other:   { label: '기타',  color: '#BDBDBD' },
}
