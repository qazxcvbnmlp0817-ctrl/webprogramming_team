import type { FacilityItem } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): FacilityItem => ({ name: '', location: '', description: '' })

export default function FacilitiesForm({ value, onChange }: Props) {
  const items = value.facilities ?? []

  const update = (i: number, patch: Partial<FacilityItem>) =>
    onChange({ ...value, facilities: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const updateActivity = (fi: number, ai: number, v: string) =>
    update(fi, { activities: (items[fi].activities ?? []).map((a, idx) => idx === ai ? v : a) })

  const addActivity = (fi: number) =>
    update(fi, { activities: [...(items[fi].activities ?? []), ''] })

  const removeActivity = (fi: number, ai: number) =>
    update(fi, { activities: (items[fi].activities ?? []).filter((_, idx) => idx !== ai) })

  const add = () => onChange({ ...value, facilities: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, facilities: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">시설 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          {(
            [['시설명', 'name'], ['위치', 'location'], ['설명', 'description']] as [string, keyof FacilityItem][]
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
            <label className="text-xs font-bold text-gray-500">활동 목록</label>
            {(item.activities ?? []).map((act, ai) => (
              <div key={ai} className="flex gap-2">
                <input
                  className="border-2 border-black px-2 py-1 text-sm flex-1"
                  value={act}
                  onChange={e => updateActivity(i, ai, e.target.value)}
                />
                <button type="button" onClick={() => removeActivity(i, ai)} className="border-2 border-black px-2 text-sm font-bold">
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addActivity(i)} className="border-2 border-black px-2 py-1 text-xs font-bold self-start">+ 활동 추가</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 시설 추가</button>
    </div>
  )
}
