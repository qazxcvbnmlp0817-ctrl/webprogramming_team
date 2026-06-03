import type { SchoolPageContentDto } from '../../../types/schoolInfo'

interface Props {
  value: SchoolPageContentDto
  onChange: (v: SchoolPageContentDto) => void
}

export default function SchoolContactForm({ value, onChange }: Props) {
  const guides = value.transitGuides ?? []
  const updateGuide = (i: number, text: string) =>
    onChange({ ...value, transitGuides: guides.map((guide, idx) => idx === i ? text : guide) })
  const addGuide = () => onChange({ ...value, transitGuides: [...guides, ''] })
  const removeGuide = (i: number) =>
    onChange({ ...value, transitGuides: guides.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {([
        ['주소', 'address'],
        ['대표전화', 'phone'],
        ['이메일', 'email'],
        ['운영시간', 'hours'],
      ] as [string, keyof SchoolPageContentDto][]).map(([label, key]) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500">{label}</label>
          <input
            className="border-2 border-black px-3 py-2 text-sm"
            value={(value[key] as string) ?? ''}
            onChange={e => onChange({ ...value, [key]: e.target.value })}
          />
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-500">찾아가는 방법</label>
        {guides.map((guide, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="border-2 border-black px-3 py-2 text-sm flex-1"
              value={guide}
              onChange={e => updateGuide(i, e.target.value)}
            />
            <button type="button" onClick={() => removeGuide(i)} className="border-2 border-black px-3 text-xs font-bold">
              삭제
            </button>
          </div>
        ))}
        <button type="button" onClick={addGuide} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">
          + 안내 추가
        </button>
      </div>
    </div>
  )
}
