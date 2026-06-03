export interface SchoolIconOption {
  className: string
  label: string
}

export interface SchoolLinkOption {
  href: string
  label: string
}

export const SCHOOL_ICON_OPTIONS: SchoolIconOption[] = [
  { className: 'fa-sitemap', label: '학부·학과' },
  { className: 'fa-bullhorn', label: '공지' },
  { className: 'fa-calendar-days', label: '일정' },
  { className: 'fa-comments', label: '게시판' },
  { className: 'fa-map-location-dot', label: '위치' },
  { className: 'fa-building-columns', label: '시설' },
  { className: 'fa-circle-info', label: '안내' },
  { className: 'fa-phone', label: '문의' },
  { className: 'fa-arrow-right-long', label: '이동' },
]

export const SCHOOL_LINK_OPTIONS: SchoolLinkOption[] = [
  { href: '/school/departments', label: '학부·학과 선택' },
  { href: '/school/notice', label: '학교 공지' },
  { href: '/school/schedule', label: '학교 일정' },
  { href: '/school/board', label: '학교 게시판' },
  { href: '#facilities', label: '시설/위치 섹션' },
  { href: '#contact', label: '문의 섹션' },
  { href: '#faq', label: 'FAQ 섹션' },
]
