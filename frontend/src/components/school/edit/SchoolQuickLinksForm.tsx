import { SCHOOL_ICON_OPTIONS, SCHOOL_LINK_OPTIONS } from '../../../data/schoolPageOptions'
import type { SchoolPageContentDto, SchoolQuickLinkItem } from '../../../types/schoolInfo'

interface Props {
  value: SchoolPageContentDto
  onChange: (v: SchoolPageContentDto) => void
}

const empty = (): SchoolQuickLinkItem => ({
  title: '',
  description: '',
  icon: SCHOOL_ICON_OPTIONS[0].className,
  href: SCHOOL_LINK_OPTIONS[0].href,
})

export default function SchoolQuickLinksForm({ value, onChange }: Props) {
  const items = value.quickLinks ?? []
  const update = (i: number, patch: Partial<SchoolQuickLinkItem>) =>
    onChange({ ...value, quickLinks: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  const add = () => onChange({ ...value, quickLinks: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, quickLinks: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">빠른 링크 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">
              삭제
            </button>
          </div>
          {([
            ['제목', 'title'],
            ['설명', 'description'],
          ] as [string, keyof SchoolQuickLinkItem][]).map(([label, key]) => (
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
            <select
              className="border-2 border-black px-2 py-1 text-sm bg-white"
              value={item.icon}
              onChange={e => update(i, { icon: e.target.value })}
            >
              {SCHOOL_ICON_OPTIONS.map(opt => <option key={opt.className} value={opt.className}>{opt.label}</option>)}
            </select>
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
        + 빠른 링크 추가
      </button>
    </div>
  )
}
