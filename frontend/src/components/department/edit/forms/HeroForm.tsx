import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

export default function HeroForm({ value, onChange }: Props) {
  const keywords = value.keywords ?? []

  const updateKeyword = (i: number, v: string) =>
    onChange({ ...value, keywords: keywords.map((k, idx) => idx === i ? v : k) })

  const addKeyword = () =>
    onChange({ ...value, keywords: [...keywords, ''] })

  const removeKeyword = (i: number) =>
    onChange({ ...value, keywords: keywords.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-wide">슬로건</label>
        <textarea
          className="border-2 border-black px-3 py-2 text-sm resize-y min-h-[60px]"
          value={value.slogan ?? ''}
          onChange={e => onChange({ ...value, slogan: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-wide">키워드 태그</label>
        {keywords.map((kw, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="border-2 border-black px-3 py-1.5 text-sm flex-1"
              value={kw}
              onChange={e => updateKeyword(i, e.target.value)}
              placeholder="키워드"
            />
            <button
              type="button"
              onClick={() => removeKeyword(i)}
              className="border-2 border-black px-2 text-sm font-bold"
            >
              <i className="fas fa-trash" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addKeyword}
          className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start"
        >
          + 키워드 추가
        </button>
      </div>
    </div>
  )
}
