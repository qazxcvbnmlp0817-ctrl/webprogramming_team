import type { SchoolFacilityItem, SchoolPageContentDto } from '../../../types/schoolInfo'

interface Props {
  value: SchoolPageContentDto
  onChange: (v: SchoolPageContentDto) => void
}

const empty = (): SchoolFacilityItem => ({
  name: '',
  category: '안내',
  location: '',
  description: '',
  mapUrl: '',
  mapKeyword: '',
})

export default function SchoolFacilitiesForm({ value, onChange }: Props) {
  const items = value.facilities ?? []
  const update = (i: number, patch: Partial<SchoolFacilityItem>) =>
    onChange({ ...value, facilities: items.map((item, idx) => idx === i ? { ...item, ...patch } : item) })
  const add = () => onChange({ ...value, facilities: [...items, empty()] })
  const remove = (i: number) => onChange({ ...value, facilities: items.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600 leading-relaxed break-keep">
        사용자 화면의 지도 버튼은 검증된 네이버 지도 URL이 입력된 시설에만 표시됩니다. 검색어는 관리자 참고용 메모로만 사용하세요.
      </p>
      {items.map((item, i) => (
        <div key={i} className="border-2 border-black p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black">시설 #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs border-2 border-black px-2 py-0.5 font-bold">
              삭제
            </button>
          </div>
          {([
            ['시설명', 'name'],
            ['분류', 'category'],
            ['위치', 'location'],
            ['설명', 'description'],
            ['검증된 네이버 지도 URL', 'mapUrl'],
            ['검색어 메모', 'mapKeyword'],
          ] as [string, keyof SchoolFacilityItem][]).map(([label, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">{label}</label>
              <input
                className="border-2 border-black px-2 py-1 text-sm"
                value={(item[key] as string) ?? ''}
                onChange={e => update(i, { [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={add} className="border-2 border-black px-3 py-1.5 text-sm font-bold self-start">
        + 시설 추가
      </button>
    </div>
  )
}
