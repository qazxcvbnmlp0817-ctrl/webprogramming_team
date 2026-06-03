import type { CommunityTopic } from '../../../../data/departmentExtras'
import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const empty = (): CommunityTopic => ({ label: '', slug: '' })

function toSlug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s/_]+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
}

export default function CommunityTopicsForm({ value, onChange }: Props) {
  const items = value.communityTopics ?? []

  const update = (i: number, patch: Partial<CommunityTopic>) =>
    onChange({ ...value, communityTopics: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })

  const add = () => onChange({ ...value, communityTopics: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, communityTopics: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        주제명을 입력하면 게시판 필터로 쓰일 slug가 자동으로 채워집니다. 필요하면 직접 수정할 수 있습니다.
      </p>
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">주제 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">삭제</button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">표시 이름</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm"
              value={item.label}
              onChange={e => {
                const label = e.target.value
                // slug가 비어있거나 이전 label에서 파생된 값이면 자동 갱신
                const prevAuto = toSlug(item.label)
                const slug = (!item.slug || item.slug === prevAuto) ? toSlug(label) : item.slug
                update(i, { label, slug })
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">slug (URL 식별자)</label>
            <input
              className="border-2 border-black px-2 py-1 text-sm font-mono"
              value={item.slug}
              onChange={e => update(i, { slug: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">+ 주제 추가</button>
    </div>
  )
}
