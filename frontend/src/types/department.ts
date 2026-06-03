import type {
  CareerItem, FacilityItem, FaqItem, StudentLifeItem,
  ProfessorEnhancement, RequirementItem, GuideCard, IntroHighlight,
  CommunityTopic,
} from '../data/departmentExtras'

export interface ProfessorDto {
  id: number
  name: string
  specialty: string
  email: string
}

export interface CurriculumItemDto {
  id?: number
  name: string
  year: string
  semester?: string | null
  required: boolean
  credit: number
  category?: string
}

export interface ProfessorEditDto {
  id?: number
  name: string
  specialty: string
  email: string
  lab: string
  courses: string[]
}

export interface DeptPageContentDto {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  hours?: string
  slogan?: string
  homepage?: string
  keywords?: string[]
  guideCards?: GuideCard[]
  introHighlights?: IntroHighlight[]
  careers?: CareerItem[]
  facilities?: FacilityItem[]
  faqs?: FaqItem[]
  studentLife?: StudentLifeItem[]
  professorEnhancements?: ProfessorEnhancement[]
  professors?: ProfessorEditDto[]
  requirements?: RequirementItem[]
  curriculumItems?: CurriculumItemDto[]
  communityTopics?: CommunityTopic[]
  overviewCounts?: { notices?: number; schedules?: number }
}

export interface DepartmentDetailDto {
  id: number
  name: string
  description: string
  professors: ProfessorDto[]
  curriculum: CurriculumItemDto[]
  address: string
  phone: string
  email: string
  hours: string
  pageContent?: DeptPageContentDto | null
}
