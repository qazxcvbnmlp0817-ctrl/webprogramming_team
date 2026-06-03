export interface IconOption {
  className: string
  label: string
}

export interface LinkOption {
  href: string
  label: string
  kind: 'anchor' | 'route'
}

export const ICON_OPTIONS: IconOption[] = [
  { className: 'fa-magnifying-glass', label: '검색/탐색' },
  { className: 'fa-route', label: '학습 경로' },
  { className: 'fa-briefcase', label: '진로/직무' },
  { className: 'fa-comments', label: '상담/문의' },
  { className: 'fa-book-open', label: '교육과정' },
  { className: 'fa-graduation-cap', label: '졸업/학위' },
  { className: 'fa-bullhorn', label: '공지/안내' },
  { className: 'fa-calendar-check', label: '일정' },
  { className: 'fa-user-tie', label: '교수진' },
  { className: 'fa-building-columns', label: '학과 시설' },
  { className: 'fa-circle-info', label: '정보 안내' },
  { className: 'fa-arrow-right-long', label: '바로 이동' },
]

export const LINK_OPTIONS: LinkOption[] = [
  { href: '#intro', label: '학과 소개 섹션', kind: 'anchor' },
  { href: '#curriculum', label: '교육과정 섹션', kind: 'anchor' },
  { href: '#careers', label: '진로 카드 섹션', kind: 'anchor' },
  { href: '#contact', label: '연락처 섹션', kind: 'anchor' },
  { href: '/dept/notice', label: '학과 공지사항 페이지', kind: 'route' },
  { href: '/dept/schedule', label: '학과 일정 페이지', kind: 'route' },
  { href: '/dept/board', label: '학과 자유게시판', kind: 'route' },
  { href: '/dept/timetable', label: '학과 시간표 페이지', kind: 'route' },
]
