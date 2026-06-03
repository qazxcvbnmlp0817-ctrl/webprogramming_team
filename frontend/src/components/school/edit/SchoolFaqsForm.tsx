import type { SchoolFaqItem, SchoolPageContentDto } from '../../../types/schoolInfo'

interface Props {
  value: SchoolPageContentDto
  onChange: (v: SchoolPageContentDto) => void
}

const empty = (): SchoolFaqItem => ({ category: '안내', question: '', answer: '' })

export default function SchoolFaqsForm({ value, onChange }: Props) {
  const items = value.faqs ?? []
  const update = (i: number, patch: Partial<SchoolFaqItem>) =>
    onChange({ ...value, faqs: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  const add = () => onChange({ ...value, faqs: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, faqs: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">FAQ #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">
              삭제
            </button>
          </div>
          {([
            ['분류', 'category'],
            ['질문', 'question'],
            ['답변', 'answer'],
          ] as [string, keyof SchoolFaqItem][]).map(([label, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">{label}</label>
              <textarea
                className="border-2 border-black px-2 py-1 text-sm min-h-16"
                value={(item[key] as string) ?? ''}
                onChange={e => update(i, { [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">
        + FAQ 추가
      </button>
    </div>
  )
}
