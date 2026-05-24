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

function defaultData(): LocalSchedule[] {
  const y = new Date().getFullYear()
  const m = String(new Date().getMonth() + 1).padStart(2, '0')
  return [
    { id: uid(), title: '팀 프로젝트 회의', date: `${y}-${m}-05`, startTime: '14:00', endTime: '15:30', category: 'meeting', status: 'scheduled', content: '- 역할 분담\n- DB 설계\n- UI 시안 공유', allDay: false },
    { id: uid(), title: 'DB 과제 마감', date: `${y}-${m}-08`, startTime: '23:59', endTime: '', category: 'task', status: 'scheduled', content: 'DB 설계 과제 제출 마감', allDay: false },
    { id: uid(), title: '중간고사', date: `${y}-${m}-13`, startTime: '09:00', endTime: '11:00', category: 'exam', status: 'scheduled', content: '자료구조 중간고사', allDay: false },
    { id: uid(), title: '발표 준비', date: `${y}-${m}-15`, startTime: '13:00', endTime: '15:00', category: 'meeting', status: 'done', content: '팀 프로젝트 발표 준비', allDay: false },
    { id: uid(), title: '팀 프로젝트', date: `${y}-${m}-19`, startTime: '14:00', endTime: '16:00', category: 'meeting', status: 'scheduled', content: '팀 프로젝트 진행 미팅', allDay: false },
    { id: uid(), title: 'UI 과제 마감', date: `${y}-${m}-28`, startTime: '23:59', endTime: '', category: 'task', status: 'scheduled', content: 'UI 설계 과제 제출', allDay: false },
  ]
}

export function loadSchedules(): LocalSchedule[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const init = defaultData()
      localStorage.setItem(KEY, JSON.stringify(init))
      return init
    }
    return JSON.parse(raw)
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
