import type { CareerItem } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): CareerItem => ({ category: '', jobs: [], description: '' })

const StringListEditor = ({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange: (v: string[]) => void
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold text-gray-500">{label}</label>
    {items.map((item, i) => (
      <div key={i} className="flex gap-2">
        <input
          className="border-2 border-black px-2 py-1 text-sm flex-1"
          value={item}
          onChange={e => onChange(items.map((v, idx) => idx === i ? e.target.value : v))}
        />
        <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="border-2 border-black px-2 text-sm font-bold">
          <i className="fas fa-trash" />
        </button>
      </div>
    ))}
    <button type="button" onClick={() => onChange([...items, ''])} className="border-2 border-black px-2 py-1 text-xs font-bold self-start">+ 추가</button>
  </div>
)

export default function CareersForm({ value, onChange }: Props) {
  const items = value.careers ?? []

  const update = (i: number, patch: Partial<CareerItem>) =>
    onChange({ ...value, careers: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, careers: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, careers: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-5">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">진로 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">카테고리</label>
            <input className="border-2 border-black px-2 py-1 text-sm" value={item.category} onChange={e => update(i, { category: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">설명</label>
            <textarea className="border-2 border-black px-2 py-1 text-sm resize-y min-h-[60px]" value={item.description} onChange={e => update(i, { description: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">포트폴리오 힌트 (선택)</label>
            <input className="border-2 border-black px-2 py-1 text-sm" value={item.portfolio ?? ''} onChange={e => update(i, { portfolio: e.target.value })} />
          </div>
          <StringListEditor label="직무 목록" items={item.jobs} onChange={v => update(i, { jobs: v })} />
          <StringListEditor label="준비 항목" items={item.preparation ?? []} onChange={v => update(i, { preparation: v })} />
          <StringListEditor label="관련 과목" items={item.courses ?? []} onChange={v => update(i, { courses: v })} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">관련 자격증</label>
            {(item.certificates ?? []).map((cert, ci) => (
              <div key={ci} className="flex gap-2">
                <input
                  className="border-2 border-black px-2 py-1 text-sm flex-1"
                  placeholder="자격증명"
                  value={cert.name}
                  onChange={e => {
                    const certs = [...(item.certificates ?? [])]
                    certs[ci] = { ...certs[ci], name: e.target.value }
                    update(i, { certificates: certs })
                  }}
                />
                <input
                  className="border-2 border-black px-2 py-1 text-sm flex-1"
                  placeholder="링크"
                  value={cert.href}
                  onChange={e => {
                    const certs = [...(item.certificates ?? [])]
                    certs[ci] = { ...certs[ci], href: e.target.value }
                    update(i, { certificates: certs })
                  }}
                />
                <button
                  type="button"
                  onClick={() => update(i, { certificates: (item.certificates ?? []).filter((_, idx) => idx !== ci) })}
                  className="border-2 border-black px-2 text-sm font-bold"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update(i, { certificates: [...(item.certificates ?? []), { name: '', href: '' }] })}
              className="border-2 border-black px-2 py-1 text-xs font-bold self-start"
            >
              + 자격증 추가
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 진로 추가</button>
    </div>
  )
}
