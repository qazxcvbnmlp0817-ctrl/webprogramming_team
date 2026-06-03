import type { NoticeDto } from './notice'
import type { ScheduleDto } from './schedule'
import type { UniversityDto } from './university'

export interface SchoolGuideCard {
  title: string
  description: string
  action?: string
  icon: string
  href: string
}

export interface SchoolFacilityItem {
  name: string
  category: string
  location: string
  description: string
  mapUrl?: string
  mapKeyword?: string
}

export interface SchoolFaqItem {
  category: string
  question: string
  answer: string
}

export interface SchoolQuickLinkItem {
  title: string
  description: string
  icon: string
  href: string
}

export interface SchoolPageContentDto {
  slogan?: string
  homepage?: string
  address?: string
  phone?: string
  email?: string
  hours?: string
  keywords?: string[]
  transitGuides?: string[]
  campusGuides?: SchoolGuideCard[]
  facilities?: SchoolFacilityItem[]
  faqs?: SchoolFaqItem[]
  quickLinks?: SchoolQuickLinkItem[]
}

export interface SchoolInfoSummaryDto {
  schoolCount: number
  facultyCount: number
  deptCount: number
  noticeCount: number
  scheduleCount: number
}

export interface SchoolInfoDto {
  university: UniversityDto
  content: SchoolPageContentDto
  summary: SchoolInfoSummaryDto
  latestNotices: NoticeDto[]
  upcomingSchedules: ScheduleDto[]
}
