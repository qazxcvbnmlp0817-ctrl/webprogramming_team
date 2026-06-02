import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

export default function OverviewForm({ value, onChange }: Props) {
  const counts = value.overviewCounts ?? {}

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-wide">학과 소개</label>
        <textarea
          className="border-2 border-black px-3 py-2 text-sm resize-y min-h-[100px]"
          value={value.description ?? ''}
          onChange={e => onChange({ ...value, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-wide">공지 수</label>
          <input
            type="number"
            className="border-2 border-black px-3 py-2 text-sm"
            value={counts.notices ?? ''}
            onChange={e => onChange({ ...value, overviewCounts: { ...counts, notices: Number(e.target.value) } })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-wide">일정 수</label>
          <input
            type="number"
            className="border-2 border-black px-3 py-2 text-sm"
            value={counts.schedules ?? ''}
            onChange={e => onChange({ ...value, overviewCounts: { ...counts, schedules: Number(e.target.value) } })}
          />
        </div>
      </div>
    </div>
  )
}
