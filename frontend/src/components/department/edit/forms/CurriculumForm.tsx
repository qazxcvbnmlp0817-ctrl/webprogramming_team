import type { CurriculumItemDto, DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const YEARS = ['1', '2', '3', '4', '전체']
const SEMESTERS = ['1학기', '2학기', '전체(1,2학기)']

const empty = (): CurriculumItemDto => ({
  name: '',
  year: '1',
  semester: '1학기',
  required: false,
  credit: 3,
  category: '',
})

export default function CurriculumForm({ value, onChange }: Props) {
  const items = value.curriculumItems ?? []

  const update = (i: number, patch: Partial<CurriculumItemDto>) =>
    onChange({ ...value, curriculumItems: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, curriculumItems: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, curriculumItems: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        이곳에서 저장한 교육과정 항목은 학과 페이지의 기본(시드) 교육과정을 대체합니다. 비워두면 기본 데이터가 그대로 표시됩니다.
      </p>
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">과목 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">과목명</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.name}
              onChange={e => update(i, { name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">학년</label>
              <select
                className="border-2 border-black px-2 py-1 text-sm"
                value={item.year}
                onChange={e => update(i, { year: e.target.value })}
              >
                {YEARS.map(y => <option key={y} value={y}>{y === '전체' ? '전체' : `${y}학년`}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">학기</label>
              <select
                className="border-2 border-black px-2 py-1 text-sm"
                value={item.semester ?? ''}
                onChange={e => update(i, { semester: e.target.value })}
              >
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">학점</label>
              <input
                type="number"
                min={0}
                className="border-2 border-black px-2 py-1 text-sm"
                value={item.credit}
                onChange={e => update(i, { credit: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">이수구분</label>
              <input
                className="border-2 border-black px-2 py-1 text-sm"
                placeholder="전공필수 / 전공선택 등"
                value={item.category ?? ''}
                onChange={e => update(i, { category: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.required}
              onChange={e => update(i, { required: e.target.checked })}
            />
            필수 과목
          </label>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 과목 추가</button>
    </div>
  )
}
