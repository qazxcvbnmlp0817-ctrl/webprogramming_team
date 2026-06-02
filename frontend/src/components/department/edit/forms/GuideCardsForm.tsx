import type { GuideCard } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): GuideCard => ({ title: '', description: '', action: '', icon: 'fa-circle-info', href: '#' })

export default function GuideCardsForm({ value, onChange }: Props) {
  const items = value.guideCards ?? []

  const update = (i: number, patch: Partial<GuideCard>) =>
    onChange({ ...value, guideCards: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, guideCards: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, guideCards: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">카드 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          {(
            [['제목', 'title'], ['설명', 'description'], ['버튼 텍스트', 'action'], ['아이콘 클래스', 'icon'], ['링크 (href)', 'href']] as [string, keyof GuideCard][]
          ).map(([label, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">{label}</label>
              <input
                className="border-2 border-black px-2 py-1 text-sm"
                value={(item[key] as string) ?? ''}
                onChange={e => update(i, { [key]: e.target.value })}
                placeholder={key === 'icon' ? 'fa-magnifying-glass' : undefined}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 카드 추가</button>
    </div>
  )
}
