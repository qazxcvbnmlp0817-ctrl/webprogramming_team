import { SCHOOL_ICON_OPTIONS, SCHOOL_LINK_OPTIONS } from '../../../data/schoolPageOptions'
import type { SchoolGuideCard, SchoolPageContentDto } from '../../../types/schoolInfo'

interface Props {
  value: SchoolPageContentDto
  onChange: (v: SchoolPageContentDto) => void
}

const empty = (): SchoolGuideCard => ({
  title: '',
  description: '',
  action: '바로가기',
  icon: SCHOOL_ICON_OPTIONS[0].className,
  href: SCHOOL_LINK_OPTIONS[0].href,
})

function SelectIcon({ value, onChange }: { value?: string; onChange: (next: string) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {SCHOOL_ICON_OPTIONS.map(opt => (
        <button
          key={opt.className}
          type="button"
          onClick={() => onChange(opt.className)}
          className={
            'border-2 border-black py-2 text-xs font-bold flex flex-col items-center gap-1 ' +
            (value === opt.className ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100')
          }
        >
          <i className={`fas ${opt.className}`} />
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function SchoolGuideCardsForm({ value, onChange }: Props) {
  const items = value.campusGuides ?? []
  const update = (i: number, patch: Partial<SchoolGuideCard>) =>
    onChange({ ...value, campusGuides: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  const add = () => onChange({ ...value, campusGuides: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, campusGuides: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">가이드 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">
              삭제
            </button>
          </div>
          {([
            ['제목', 'title'],
            ['설명', 'description'],
            ['버튼 문구', 'action'],
          ] as [string, keyof SchoolGuideCard][]).map(([label, key]) => (
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
            <label className="text-xs font-bold text-gray-500">아이콘</label>
            <SelectIcon value={item.icon} onChange={icon => update(i, { icon })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">이동 위치</label>
            <select
              className="border-2 border-black px-2 py-1 text-sm bg-white"
              value={item.href}
              onChange={e => update(i, { href: e.target.value })}
            >
              {SCHOOL_LINK_OPTIONS.map(opt => <option key={opt.href} value={opt.href}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">
        + 가이드 추가
      </button>
    </div>
  )
}
