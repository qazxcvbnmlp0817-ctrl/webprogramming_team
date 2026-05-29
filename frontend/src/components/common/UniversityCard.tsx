import type { UniversityDto } from '../../types/university'
import type { ActivityData } from '../../api/activity'

interface Props {
  univ: UniversityDto
  activityData?: ActivityData
  maxScore: number
  maxDepts: number
  maxSchools: number
  maxVisitors?: number
  maxPosts?: number
  maxComments?: number
  onSelect: () => void
}

export function activityScore(univ: UniversityDto, data?: ActivityData): number {
  if (data) return data.activityScore
  // fallback when API hasn't responded yet
  return Math.min(univ.totalDeptCount * 3 + univ.schools.length * 5, 100)
}

export default function UniversityCard({
  univ, activityData,
  maxScore, maxDepts, maxSchools,
  maxVisitors = 1, maxPosts = 1, maxComments = 1,
  onSelect,
}: Props) {
  const score = activityScore(univ, activityData)
  const scoreColor =
    score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#6b7280'

  return (
    <button
      onClick={onSelect}
      className="group relative block w-full text-left border-2 border-black p-8 overflow-hidden hover:bg-black hover:text-white transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <i className="fas fa-university text-3xl mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{univ.name}</h2>
            {/* activity score badge */}
            <span
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color: scoreColor, borderColor: scoreColor }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
              {score.toFixed(1)}점
            </span>
          </div>
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
        <p className="text-xs font-semibold text-gray-400 mb-3">📊 주간 현황 (최근 7일)</p>

        {activityData ? (
          <div className="space-y-2">
            <PreviewBar
              label="방문자"
              value={activityData.weeklyVisitors}
              unit="명"
              ratio={maxVisitors > 0 ? activityData.weeklyVisitors / maxVisitors : 0}
            />
            <PreviewBar
              label="새 게시글"
              value={activityData.newPosts}
              unit="건"
              ratio={maxPosts > 0 ? activityData.newPosts / maxPosts : 0}
            />
            <PreviewBar
              label="새 댓글"
              value={activityData.newComments}
              unit="건"
              ratio={maxComments > 0 ? activityData.newComments / maxComments : 0}
            />
            <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
              <span>활동 점수</span>
              <span className="font-bold" style={{ color: scoreColor }}>
                {activityData.activityScore.toFixed(1)} / 100
              </span>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </button>
  )
}

function PreviewBar({
  label, value, unit, ratio,
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
          style={{ width: `${Math.min(Math.round(ratio * 100), 100)}%` }}
        />
      </div>
      <span className="w-14 text-right text-gray-300">
        {value}{unit}
      </span>
    </div>
  )
}
