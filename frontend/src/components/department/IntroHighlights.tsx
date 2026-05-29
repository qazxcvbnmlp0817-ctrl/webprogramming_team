import type { IntroHighlight } from '../../data/departmentExtras'

interface Props {
  highlights: IntroHighlight[]
}

export default function IntroHighlights({ highlights }: Props) {
  if (highlights.length === 0) return null
  return (
    <div className="mt-8 grid sm:grid-cols-2 gap-4">
      {highlights.map(group => (
        <div key={group.title} className="border-2 border-black p-4">
          <p className="font-black text-sm mb-3">{group.title}</p>
          <ul className="space-y-1.5 text-sm text-gray-700">
            {group.items.map(item => (
              <li key={item} className="flex gap-2 items-start">
                <i className="fas fa-minus text-[8px] mt-[7px] text-black shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
