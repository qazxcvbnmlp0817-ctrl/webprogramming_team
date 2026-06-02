import type { DeptPageContentDto } from '../types/department'
import type { DepartmentExtra } from '../data/departmentExtras'

export function mergeExtra(
  api: DeptPageContentDto | null | undefined,
  fallback: DepartmentExtra,
): DepartmentExtra {
  if (!api) return fallback

  return {
    deptId: fallback.deptId,
    slogan: (api.slogan && api.slogan.trim()) ? api.slogan : fallback.slogan,
    homepage: api.homepage ?? fallback.homepage,
    keywords: (api.keywords && api.keywords.length > 0) ? api.keywords : fallback.keywords,
    guideCards: (api.guideCards && api.guideCards.length > 0) ? api.guideCards : fallback.guideCards,
    overviewCounts: api.overviewCounts
      ? {
          notices: api.overviewCounts.notices ?? fallback.overviewCounts.notices,
          schedules: api.overviewCounts.schedules ?? fallback.overviewCounts.schedules,
        }
      : fallback.overviewCounts,
    introHighlights: (api.introHighlights && api.introHighlights.length > 0)
      ? api.introHighlights
      : fallback.introHighlights,
    careers: (api.careers && api.careers.length > 0) ? api.careers : fallback.careers,
    facilities: (api.facilities && api.facilities.length > 0) ? api.facilities : fallback.facilities,
    faqs: (api.faqs && api.faqs.length > 0) ? api.faqs : fallback.faqs,
    studentLife: (api.studentLife && api.studentLife.length > 0) ? api.studentLife : fallback.studentLife,
    professorEnhancements: (api.professorEnhancements && api.professorEnhancements.length > 0)
      ? api.professorEnhancements
      : fallback.professorEnhancements,
    requirements: (api.requirements && api.requirements.length > 0) ? api.requirements : fallback.requirements,
  }
}
