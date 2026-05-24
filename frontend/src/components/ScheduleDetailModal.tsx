// ScheduleDetailModal.tsx — 일정 상세 보기 모달
import type { LocalSchedule } from '../utils/localSchedule'
import { CATEGORY_META, formatDateKo } from '../utils/localSchedule'

interface Props {
  schedule: LocalSchedule | null
  onClose: () => void
  onEdit: (s: LocalSchedule) => void
  onDelete: (id: string) => void
}

export default function ScheduleDetailModal({ schedule, onClose, onEdit, onDelete }: Props) {
  if (!schedule) return null

  const meta = CATEGORY_META[schedule.category]
  const timeLabel = schedule.allDay ? '종일' : `${schedule.startTime}${schedule.endTime ? ' ~ ' + schedule.endTime : ''}`

  const handleDelete = () => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      onDelete(schedule.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold">일정 상세</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: meta.color }} />
            <h4 className="text-lg font-bold text-gray-900">{schedule.title}</h4>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            <Row icon="📅" label="날짜" value={formatDateKo(schedule.date)} />
            <Row icon="🕐" label="시간" value={timeLabel} />
            <Row icon="🏷" label="카테고리" value={
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: meta.color }}>{meta.label}</span>
            } />
            <Row icon="📌" label="상태" value={
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                schedule.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>{schedule.status === 'done' ? '완료' : '예정'}</span>
            } />
          </div>
          {schedule.content && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">내용</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{schedule.content}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">← 목록으로</button>
          <button onClick={() => onEdit(schedule)} className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">수정</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded text-sm font-semibold hover:bg-red-600 transition">삭제</button>
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-base w-5 flex-shrink-0">{icon}</span>
      <span className="text-sm text-gray-500 w-16 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 flex-1">{value}</span>
    </div>
  )
}
