import type { UniversityDto } from '../../types/university'

interface Props {
  univ: UniversityDto
  maxScore: number
  maxDepts: number
  maxSchools: number
  onSelect: () => void
}

export function activityScore(univ: UniversityDto): number {
  return univ.totalDeptCount * 3 + univ.schools.length * 5
}

export default function UniversityCard({ univ, maxScore, maxDepts, maxSchools, onSelect }: Props) {
  const score = activityScore(univ)

  return (
    <button
      onClick={onSelect}
      className="group relative block w-full text-left border-2 border-black p-8 overflow-hidden hover:bg-black hover:text-white transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <i className="fas fa-university text-3xl mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold mb-2">{univ.name}</h2>
          <p className="text-sm text-gray-500 group-hover:text-gray-300 leading-snug">
            {univ.description}
          </p>
          <div className="mt-4 flex gap-4 text-xs text-gray-400">
            <span><i className="fas fa-building mr-1" />{univ.schools.length}개 단과대학</span>
            <span><i className="fas fa-door-open mr-1" />{univ.totalDeptCount}개 학과</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-200 group-hover:border-gray-600 flex items-center justify-between text-sm font-medium">
        <span>대학교 입장</span>
        <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
      </div>

      {/* Live Data Preview Panel */}
      <div className="absolute inset-x-0 bottom-0 bg-black/95 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <p className="text-xs font-semibold text-gray-400 mb-3">📊 현황</p>
        <div className="space-y-2">
          <PreviewBar
            label="단과대학"
            value={univ.schools.length}
            unit="개"
            ratio={maxSchools > 0 ? univ.schools.length / maxSchools : 0}
          />
          <PreviewBar
            label="학과 수"
            value={univ.totalDeptCount}
            unit="개"
            ratio={maxDepts > 0 ? univ.totalDeptCount / maxDepts : 0}
          />
          <PreviewBar
            label="활동 점수"
            value={score}
            unit="점"
            ratio={maxScore > 0 ? score / maxScore : 0}
          />
        </div>
      </div>
    </button>
  )
}

function PreviewBar({
  label,
  value,
  unit,
  ratio,
}: {
  label: string
  value: number
  unit: string
  ratio: number
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-white h-full rounded-full"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
      <span className="w-14 text-right text-gray-300">
        {value}{unit}
      </span>
    </div>
  )
}
