import type { DeptPageContentDto, ProfessorEditDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): ProfessorEditDto => ({
  name: '',
  specialty: '',
  email: '',
  lab: '',
  courses: [],
})

export default function ProfessorForm({ value, onChange }: Props) {
  const items = value.professors ?? []

  const update = (i: number, patch: Partial<ProfessorEditDto>) =>
    onChange({ ...value, professors: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const updateCourse = (pi: number, ci: number, v: string) =>
    update(pi, { courses: items[pi].courses.map((c, idx) => idx === ci ? v : c) })

  const addCourse = (pi: number) =>
    update(pi, { courses: [...items[pi].courses, ''] })

  const removeCourse = (pi: number, ci: number) =>
    update(pi, { courses: items[pi].courses.filter((_, idx) => idx !== ci) })

  const add = () =>
    onChange({ ...value, professors: [...items, empty()] })

  const remove = (i: number) =>
    onChange({ ...value, professors: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500 leading-relaxed">
        학과 PROFESSORS 테이블의 교수 레코드를 직접 편집합니다. 카드를 삭제하면 해당 교수의 수업 시간표·강좌 배정도 함께 제거되고, 연결된 로그인 계정은 연결만 해제됩니다.
      </p>
      {items.length === 0 && (
        <p className="border-2 border-black bg-yellow-50 px-3 py-2 text-xs font-bold">
          등록된 교수가 없습니다. 아래 "교수 추가"로 새 교수를 등록하세요.
        </p>
      )}
      {items.map((item, i) => (
        <div key={item.id ?? `new-${i}`} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">
              교수 #{i + 1}
              {item.id == null && <span className="ml-2 text-[10px] font-bold text-blue-600">신규</span>}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs border-2 border-black px-2 py-0.5 font-bold"
            >
              삭제
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">이름</label>
              <input
                className="border-2 border-black px-2 py-1 text-sm"
                value={item.name}
                onChange={e => update(i, { name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">전공</label>
              <input
                className="border-2 border-black px-2 py-1 text-sm"
                value={item.specialty ?? ''}
                onChange={e => update(i, { specialty: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">이메일</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.email ?? ''}
              onChange={e => update(i, { email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">연구실</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.lab ?? ''}
              onChange={e => update(i, { lab: e.target.value })}
              placeholder="예: 공학관 301호"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">담당 과목</label>
            {item.courses.map((c, ci) => (
              <div key={ci} className="flex gap-2">
                <input
                  className="border-2 border-black px-2 py-1 text-sm flex-1"
                  value={c}
                  onChange={e => updateCourse(i, ci, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCourse(i, ci)}
                  className="border-2 border-black px-2 text-sm font-bold"
                  aria-label="과목 삭제"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addCourse(i)}
              className="border-2 border-black px-2 py-1 text-xs font-bold self-start"
            >
              + 과목 추가
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start"
      >
        + 교수 추가
      </button>
    </div>
  )
}
