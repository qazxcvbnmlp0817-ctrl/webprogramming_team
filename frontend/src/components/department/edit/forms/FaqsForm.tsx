import type { FaqItem } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): FaqItem => ({ question: '', answer: '' })

export default function FaqsForm({ value, onChange }: Props) {
  const items = value.faqs ?? []

  const update = (i: number, patch: Partial<FaqItem>) =>
    onChange({ ...value, faqs: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, faqs: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, faqs: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">FAQ #{i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs border-2 border-black px-2 py-0.5 font-bold"
            >
              삭제
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">카테고리 (선택)</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.category ?? ''}
              onChange={e => update(i, { category: e.target.value })}
              placeholder="예: 수강신청, 졸업"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">질문</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.question}
              onChange={e => update(i, { question: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">답변</label>
            <textarea
              className="border-2 border-black px-2 py-1 text-sm resize-y min-h-[60px]"
              value={item.answer}
              onChange={e => update(i, { answer: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start"
      >
        + FAQ 추가
      </button>
    </div>
  )
}
