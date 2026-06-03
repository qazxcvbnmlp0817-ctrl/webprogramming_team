import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

export default function OverviewForm({ value, onChange }: Props) {
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
      <p className="text-xs text-gray-500 leading-relaxed">
        공지/일정 카운트는 실제 학과 공지·일정 데이터에서 자동으로 계산됩니다.
      </p>
    </div>
  )
}
