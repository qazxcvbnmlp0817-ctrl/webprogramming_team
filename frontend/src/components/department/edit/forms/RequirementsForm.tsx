import type { RequirementItem } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): RequirementItem => ({ id: '', label: '', description: '', href: '', kind: 'anchor' })

export default function RequirementsForm({ value, onChange }: Props) {
  const items = value.requirements ?? []

  const update = (i: number, patch: Partial<RequirementItem>) =>
    onChange({ ...value, requirements: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, requirements: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, requirements: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">요건 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          {(
            [['ID', 'id'], ['라벨', 'label'], ['설명', 'description'], ['링크 (href)', 'href']] as [string, keyof RequirementItem][]
          ).map(([label, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">{label}</label>
              <input
                className="border-2 border-black px-2 py-1 text-sm"
                value={(item[key] as string) ?? ''}
                onChange={e => update(i, { [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">종류</label>
            <select
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.kind}
              onChange={e => update(i, { kind: e.target.value as 'anchor' | 'route' })}
            >
              <option value="anchor">anchor (페이지 내 링크)</option>
              <option value="route">route (페이지 이동)</option>
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 항목 추가</button>
    </div>
  )
}
