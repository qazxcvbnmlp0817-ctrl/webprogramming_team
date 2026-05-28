export type SourceBadgeType = 'official' | 'partial' | 'guide'

interface SourceBadgeProps {
  type: SourceBadgeType
}

const badgeLabels: Record<SourceBadgeType, string> = {
  official: '공식정보',
  partial: '공식정보 / 일부 미공개',
  guide: '학생용 참고 가이드',
}

export default function SourceBadge({ type }: SourceBadgeProps) {
  const guide = type === 'guide'
  return (
    <span className={`inline-flex items-center gap-1 border-2 px-2.5 py-1 text-xs font-black ${
      guide ? 'border-black bg-white text-black' : 'border-black bg-black text-white'
    }`}>
      <i className={`fas ${guide ? 'fa-user-check' : 'fa-circle-check'} text-[10px]`} />
      {badgeLabels[type]}
    </span>
  )
}
