export interface LocalSchedule {
  id: string
  title: string
  date: string        // YYYY-MM-DD
  startTime: string   // HH:MM
  endTime: string     // HH:MM
  category: 'meeting' | 'task' | 'exam' | 'personal' | 'other'
  status: 'scheduled' | 'done'
  content: string
  allDay: boolean
}

const KEY = 'my_schedules_v1'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function loadSchedules(): LocalSchedule[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export function saveSchedules(list: LocalSchedule[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addSchedule(s: Omit<LocalSchedule, 'id'>): LocalSchedule {
  const list = loadSchedules()
  const item = { ...s, id: uid() }
  list.push(item)
  saveSchedules(list)
  return item
}

export function updateSchedule(updated: LocalSchedule): void {
  const list = loadSchedules().map(s => s.id === updated.id ? updated : s)
  saveSchedules(list)
}

export function deleteSchedule(id: string): void {
  const list = loadSchedules().filter(s => s.id !== id)
  saveSchedules(list)
}

export const CATEGORY_META: Record<LocalSchedule['category'], { label: string; color: string; bg: string; text: string }> = {
  meeting: { label: '회의', color: '#4C7BFF', bg: 'bg-blue-100',   text: 'text-blue-800'   },
  task:    { label: '과제', color: '#FF6B6B', bg: 'bg-red-100',    text: 'text-red-800'    },
  exam:    { label: '시험', color: '#F59E0B', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  personal:{ label: '개인', color: '#6BCB77', bg: 'bg-green-100',  text: 'text-green-800'  },
  other:   { label: '기타', color: '#BDBDBD', bg: 'bg-gray-100',   text: 'text-gray-700'   },
}

export function formatDateKo(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = ['일','월','화','수','목','금','토'][new Date(y, m-1, d).getDay()]
  return `${y}년 ${m}월 ${d}일 (${dow})`
}

export function todayStr(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
}
