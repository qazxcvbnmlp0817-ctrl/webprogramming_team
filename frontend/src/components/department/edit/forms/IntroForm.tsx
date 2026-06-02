import type { IntroHighlight } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): IntroHighlight => ({ title: '', items: [] })

export default function IntroForm({ value, onChange }: Props) {
  const highlights = value.introHighlights ?? []

  const updateHL = (i: number, patch: Partial<IntroHighlight>) =>
    onChange({ ...value, introHighlights: highlights.map((h, idx) => idx === i ? { ...h, ...patch } : h) })

  const addHL = () => onChange({ ...value, introHighlights: [...highlights, empty()] })
  const removeHL = (i: number) => onChange({ ...value, introHighlights: highlights.filter((_, idx) => idx !== i) })

  const updateItem = (hi: number, ii: number, v: string) =>
    updateHL(hi, { items: highlights[hi].items.map((item, idx) => idx === ii ? v : item) })

  const addItem = (hi: number) => updateHL(hi, { items: [...highlights[hi].items, ''] })
  const removeItem = (hi: number, ii: number) =>
    updateHL(hi, { items: highlights[hi].items.filter((_, idx) => idx !== ii) })

  return (
    <div className="flex flex-col gap-4">
      {highlights.map((h, hi) => (
        <div key={hi} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">그룹 #{hi + 1}</span>
            <button type="button" onClick={() => removeHL(hi)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">그룹 제목</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={h.title}
              onChange={e => updateHL(hi, { title: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">항목들</label>
            {h.items.map((item, ii) => (
              <div key={ii} className="flex gap-2">
                <input
                  className="border-2 border-black px-2 py-1 text-sm flex-1"
                  value={item}
                  onChange={e => updateItem(hi, ii, e.target.value)}
                />
                <button type="button" onClick={() => removeItem(hi, ii)} className="border-2 border-black px-2 text-sm font-bold">
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addItem(hi)} className="border-2 border-black px-2 py-1 text-xs font-bold self-start">+ 항목 추가</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addHL} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 그룹 추가</button>
    </div>
  )
}
