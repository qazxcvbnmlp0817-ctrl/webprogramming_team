import type { DeptPageContentDto } from '../../../../types/department'

interface Props {
  value: DeptPageContentDto
  onChange: (v: DeptPageContentDto) => void
}

const field = (
  label: string,
  key: keyof DeptPageContentDto,
  value: DeptPageContentDto,
  onChange: Props['onChange'],
  textarea?: boolean,
) => {
  const val = (value[key] as string | undefined) ?? ''
  const update = (v: string) => onChange({ ...value, [key]: v })
  return (
    <div key={key} className="flex flex-col gap-1">
      <label className="text-xs font-black uppercase tracking-wide">{label}</label>
      {textarea ? (
        <textarea
          className="border-2 border-black px-3 py-2 text-sm resize-y min-h-[80px]"
          value={val}
          onChange={e => update(e.target.value)}
        />
      ) : (
        <input
          className="border-2 border-black px-3 py-2 text-sm"
          value={val}
          onChange={e => update(e.target.value)}
        />
      )}
    </div>
  )
}

export default function ContactForm({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {field('학과명', 'name', value, onChange)}
      {field('학과 소개', 'description', value, onChange, true)}
      {field('주소', 'address', value, onChange)}
      {field('전화', 'phone', value, onChange)}
      {field('이메일', 'email', value, onChange)}
      {field('운영시간', 'hours', value, onChange)}
      {field('홈페이지 URL', 'homepage', value, onChange)}
    </div>
  )
}
