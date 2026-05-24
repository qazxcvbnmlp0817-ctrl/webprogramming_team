// ScheduleModal.tsx — 일정 추가/수정 모달 (공통 컴포넌트)
import { useState, useEffect } from 'react'
import type { LocalSchedule } from '../utils/localSchedule'
import { CATEGORY_META } from '../utils/localSchedule'

interface Props {
  open: boolean
  initial?: LocalSchedule | null
  defaultDate?: string
  onSave: (data: Omit<LocalSchedule, 'id'> & { id?: string }) => void
  onClose: () => void
}

const EMPTY = (): Omit<LocalSchedule, 'id'> => ({
  title: '', date: '', startTime: '09:00', endTime: '10:00',
  category: 'meeting', status: 'scheduled', content: '', allDay: false,
})

export default function ScheduleModal({ open, initial, defaultDate, onSave, onClose }: Props) {
  const [form, setForm] = useState(EMPTY())

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({ title: initial.title, date: initial.date, startTime: initial.startTime,
          endTime: initial.endTime, category: initial.category, status: initial.status,
          content: initial.content, allDay: initial.allDay })
      } else {
        const e = EMPTY()
        e.date = defaultDate || new Date().toISOString().slice(0, 10)
        setForm(e)
      }
    }
  }, [open, initial, defaultDate])

  if (!open) return null

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) { alert('제목을 입력해주세요.'); return }
    if (!form.date) { alert('날짜를 선택해주세요.'); return }
    onSave(initial ? { ...form, id: initial.id } : form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold">{initial ? '일정 수정' : '일정 추가'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">제목 <span className="text-red-500">*</span></label>
            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="제목을 입력하세요" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">날짜 <span className="text-red-500">*</span></label>
              <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pb-2">
              <input type="checkbox" checked={form.allDay} onChange={e => set('allDay', e.target.checked)} />
              종일
            </label>
          </div>
          {!form.allDay && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">시간</label>
              <div className="flex items-center gap-2">
                <input type="time" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                <span className="text-gray-400 text-sm">~</span>
                <input type="time" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">카테고리 <span className="text-red-500">*</span></label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.category} onChange={e => set('category', e.target.value as LocalSchedule['category'])}>
                {(Object.entries(CATEGORY_META) as [LocalSchedule['category'], typeof CATEGORY_META[keyof typeof CATEGORY_META]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">상태</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.status} onChange={e => set('status', e.target.value as LocalSchedule['status'])}>
                <option value="scheduled">예정</option>
                <option value="done">완료</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">내용</label>
            <textarea className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
              rows={4} placeholder="내용을 입력하세요" value={form.content} onChange={e => set('content', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 justify-end">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">취소</button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition">저장</button>
        </div>
      </div>
    </div>
  )
}
