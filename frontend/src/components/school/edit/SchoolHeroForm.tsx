import type { SchoolPageContentDto } from '../../../types/schoolInfo'

interface Props {
  value: SchoolPageContentDto
  onChange: (v: SchoolPageContentDto) => void
}

function splitCsv(value: string) {
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

export default function SchoolHeroForm({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-500">슬로건</label>
        <textarea
          className="border-2 border-black px-3 py-2 text-sm min-h-24"
          value={value.slogan ?? ''}
          onChange={e => onChange({ ...value, slogan: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-500">공식 홈페이지</label>
        <input
          className="border-2 border-black px-3 py-2 text-sm"
          value={value.homepage ?? ''}
          onChange={e => onChange({ ...value, homepage: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-500">키워드 (쉼표로 구분)</label>
        <input
          className="border-2 border-black px-3 py-2 text-sm"
          value={(value.keywords ?? []).join(', ')}
          onChange={e => onChange({ ...value, keywords: splitCsv(e.target.value) })}
        />
      </div>
    </div>
  )
}
