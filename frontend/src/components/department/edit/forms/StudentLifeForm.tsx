import type { StudentLifeItem } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): StudentLifeItem => ({ title: '', description: '', href: '' })

export default function StudentLifeForm({ value, onChange }: Props) {
  const items = value.studentLife ?? []

  const update = (i: number, patch: Partial<StudentLifeItem>) =>
    onChange({ ...value, studentLife: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, studentLife: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, studentLife: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">항목 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          {(
            [
              ['제목', 'title', false],
              ['설명', 'description', false],
              ['링크 (href)', 'href', false],
            ] as [string, keyof StudentLifeItem, boolean][]
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.external ?? false}
              onChange={e => update(i, { external: e.target.checked })}
            />
            외부 링크
          </label>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 항목 추가</button>
    </div>
  )
}
