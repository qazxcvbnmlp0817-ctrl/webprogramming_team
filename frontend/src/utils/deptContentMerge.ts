import type { DeptPageContentDto } from '../types/department'
import type { DepartmentExtra } from '../data/departmentExtras'

// API가 명시적으로 빈 배열을 보냈으면(사용자가 모두 삭제) 그대로 빈 배열을 사용한다.
// fallback은 API 필드가 undefined/null일 때만 적용.
const pickList = <T>(apiValue: T[] | undefined | null, fallback: T[]): T[] =>
  apiValue != null ? apiValue : fallback

export function mergeExtra(
  api: DeptPageContentDto | null | undefined,
  fallback: DepartmentExtra,
): DepartmentExtra {
  if (!api) return fallback

  return {
    deptId: fallback.deptId,
    slogan: (api.slogan && api.slogan.trim()) ? api.slogan : fallback.slogan,
    homepage: api.homepage ?? fallback.homepage,
    keywords: pickList(api.keywords, fallback.keywords),
    guideCards: pickList(api.guideCards, fallback.guideCards),
    overviewCounts: api.overviewCounts
      ? {
          notices: api.overviewCounts.notices ?? fallback.overviewCounts.notices,
          schedules: api.overviewCounts.schedules ?? fallback.overviewCounts.schedules,
        }
      : fallback.overviewCounts,
    introHighlights: pickList(api.introHighlights, fallback.introHighlights ?? []),
    careers: pickList(api.careers, fallback.careers),
    facilities: pickList(api.facilities, fallback.facilities),
    faqs: pickList(api.faqs, fallback.faqs),
    studentLife: pickList(api.studentLife, fallback.studentLife),
    professorEnhancements: pickList(api.professorEnhancements, fallback.professorEnhancements),
    requirements: pickList(api.requirements, fallback.requirements),
    communityTopics: pickList(api.communityTopics, fallback.communityTopics),
  }
}
