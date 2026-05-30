// 교수가 등록한 수업 이벤트를 localStorage에 저장하여
// 같은 학과(deptId)의 학생 캘린더에 자동 반영

export interface SharedCourseEvent {
  id: string
  courseName: string
  title: string
  date: string        // YYYY-MM-DD
  category: string    // '시험' | '과제' | '기타'
  deptId: string
  registeredBy: string
}

const STORAGE_KEY = 'class_course_events_v1'

function uid(): string {
  return 'ce-' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadAll(): SharedCourseEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function saveAll(list: SharedCourseEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addSharedCourseEvent(ev: Omit<SharedCourseEvent, 'id'>): SharedCourseEvent {
  const list = loadAll()
  const item = { ...ev, id: uid() }
  list.push(item)
  saveAll(list)
  return item
}

export function loadSharedCourseEventsByDept(deptId: string): SharedCourseEvent[] {
  return loadAll().filter(e => e.deptId === deptId)
}

export function deleteSharedCourseEvent(id: string): void {
  saveAll(loadAll().filter(e => e.id !== id))
}

export function sharedEventToScheduleItem(ev: SharedCourseEvent) {
  const evDate = new Date(ev.date)
  const dday = Math.round((evDate.getTime() - Date.now()) / 86400000)
  return {
    id: ev.id,
    title: `[${ev.courseName}] ${ev.title}`,
    date: ev.date,
    category: ev.category,
    allDay: true as const,
    dday: Math.max(0, dday),
    readonly: true as const,
  }
}
