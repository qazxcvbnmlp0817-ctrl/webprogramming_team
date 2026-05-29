import type { ProfessorEnhancement } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface ProfEnhancement extends ProfessorEnhancement {
  name?: string
}

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): ProfEnhancement => ({ name: '', lab: '', courses: [] })

export default function ProfessorEnhancementsForm({ value, onChange }: Props) {
  const items = (value.professorEnhancements ?? []) as ProfEnhancement[]

  const update = (i: number, patch: Partial<ProfEnhancement>) =>
    onChange({ ...value, professorEnhancements: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const updateCourse = (pi: number, ci: number, v: string) =>
    update(pi, { courses: items[pi].courses.map((c, idx) => idx === ci ? v : c) })

  const addCourse = (pi: number) => update(pi, { courses: [...items[pi].courses, ''] })
  const removeCourse = (pi: number, ci: number) =>
    update(pi, { courses: items[pi].courses.filter((_, idx) => idx !== ci) })

  const add = () => onChange({ ...value, professorEnhancements: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, professorEnhancements: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">교수 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">교수명</label>
            <input className="border-2 border-black px-2 py-1 text-sm" value={item.name ?? ''} onChange={e => update(i, { name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">연구실</label>
            <input className="border-2 border-black px-2 py-1 text-sm" value={item.lab} onChange={e => update(i, { lab: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">담당 과목</label>
            {item.courses.map((c, ci) => (
              <div key={ci} className="flex gap-2">
                <input className="border-2 border-black px-2 py-1 text-sm flex-1" value={c} onChange={e => updateCourse(i, ci, e.target.value)} />
                <button type="button" onClick={() => removeCourse(i, ci)} className="border-2 border-black px-2 text-sm font-bold"><i className="fas fa-trash" /></button>
              </div>
            ))}
            <button type="button" onClick={() => addCourse(i)} className="border-2 border-black px-2 py-1 text-xs font-bold self-start">+ 과목 추가</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 교수 추가</button>
    </div>
  )
}
