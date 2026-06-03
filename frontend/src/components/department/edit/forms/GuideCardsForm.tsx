import type { GuideCard } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'
import { ICON_OPTIONS, LINK_OPTIONS } from '../../../../data/guideCardOptions'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): GuideCard => ({
  title: '',
  description: '',
  action: '',
  icon: ICON_OPTIONS[0].className,
  href: LINK_OPTIONS[0].href,
})

interface IconPickerGridProps {
  value: string
  onChange: (className: string) => void
}

function IconPickerGrid({ value, onChange }: IconPickerGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ICON_OPTIONS.map(opt => {
        const selected = opt.className === value
        return (
          <button
            key={opt.className}
            type="button"
            onClick={() => onChange(opt.className)}
            className={
              'border-2 border-black flex flex-col items-center justify-center gap-1 py-2 transition ' +
              (selected ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100')
            }
          >
            <i className={`fas ${opt.className} text-lg`} />
            <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function GuideCardsForm({ value, onChange }: Props) {
  const items = value.guideCards ?? []

  const update = (i: number, patch: Partial<GuideCard>) =>
    onChange({ ...value, guideCards: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, guideCards: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, guideCards: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">카드 #{i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs border-2 border-black px-2 py-0.5 font-bold"
            >
              삭제
            </button>
          </div>

          {(
            [['제목', 'title'], ['설명', 'description'], ['버튼 텍스트', 'action']] as [string, keyof GuideCard][]
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
            <label className="text-xs font-bold text-gray-500">아이콘</label>
            <IconPickerGrid value={item.icon} onChange={className => update(i, { icon: className })} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">이동할 위치</label>
            <select
              className="border-2 border-black px-2 py-1 text-sm bg-white"
              value={item.href}
              onChange={e => update(i, { href: e.target.value })}
            >
              {LINK_OPTIONS.map(opt => (
                <option key={opt.href} value={opt.href}>
                  {opt.label} ({opt.href})
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start"
      >
        + 카드 추가
      </button>
    </div>
  )
}
