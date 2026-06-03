import { Link } from 'react-router-dom'
import SourceBadge from '../department/SourceBadge'
import type { UserRole } from '../../hooks/useCurrentRole'
import { getAuthItem } from '../../utils/authStorage'

interface RoleActionBarProps {
  role: UserRole
  scope: 'department' | 'school'
  targetId?: number
}

export default function RoleActionBar({ role, scope, targetId }: RoleActionBarProps) {
  const boardLink = scope === 'department' ? '/dept/board' : '/school/board'
  const noticeLink = scope === 'department' ? '/dept/notice' : '/school/notice'
  const reportLink = `${boardLink}?tag=${encodeURIComponent('정보수정요청')}`
  const fallbackTarget = scope === 'department' ? getAuthItem('deptId') : getAuthItem('universityId')
  const adminTargetId = targetId ?? (fallbackTarget ? Number(fallbackTarget) : undefined)
  const adminHomeLink = adminTargetId
    ? (scope === 'department' ? `/admin/dept/${adminTargetId}` : `/admin/school/${adminTargetId}`)
    : '/admin/super'

  if (role === 'GUEST') {
    return (
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="border-2 border-black p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-black break-keep">로그인하면 질문·정보 수정 요청 같은 기능을 쓸 수 있어요</p>
            <p className="text-sm text-gray-500 mt-1 break-keep">회원가입 없이 정보 열람은 가능합니다.</p>
          </div>
          <Link
            to="/login"
            className="shrink-0 border-2 border-black bg-black text-white px-5 py-2 font-black text-sm hover:bg-white hover:text-black transition text-center"
          >
            <i className="fas fa-right-to-bracket mr-2" />
            로그인
          </Link>
        </div>
      </section>
    )
  }

  if (role === 'ADMIN') {
    const adminItems = scope === 'department'
      ? [
          { to: adminHomeLink, icon: 'fa-gauge-high', label: '학과 관리자', description: '학과 페이지, 사용자, 공지, 교수 배정을 관리합니다.' },
          { to: '/dept/board/write', icon: 'fa-pen-to-square', label: '학과 글쓰기', description: '학과 게시판에 안내 글을 작성합니다.' },
          { to: '/dept/notice/write', icon: 'fa-bullhorn', label: '공지 작성', description: '학과 공지를 작성하고 공개합니다.' },
          { to: '/dept/timetable', icon: 'fa-calendar-days', label: '시간표 관리', description: '교수별 배정 강좌와 수업 시간을 확인합니다.' },
        ]
      : [
          { to: adminHomeLink, icon: 'fa-gauge-high', label: '학교 관리자', description: '학교 페이지, 사용자, 공지, 교수 배정을 관리합니다.' },
          { to: '/school/board/write', icon: 'fa-pen-to-square', label: '학교 글쓰기', description: '학교 게시판에 안내 글을 작성합니다.' },
          { to: '/school/notice/write', icon: 'fa-bullhorn', label: '공지 작성', description: '학교 공지를 작성하고 공개합니다.' },
          { to: '/school/schedule', icon: 'fa-calendar-days', label: '학교 일정', description: '학교 전체 일정을 확인합니다.' },
        ]

    return (
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="border-2 border-black p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <span className="inline-flex items-center gap-1 border-2 border-black px-2 py-0.5 text-xs font-black mb-2">
                <i className="fas fa-shield-halved text-[10px]" />
                관리자
              </span>
              <p className="font-black break-keep">관리자 메뉴</p>
              <p className="text-sm text-gray-500 mt-1 break-keep">바로 필요한 관리 화면으로 이동합니다.</p>
            </div>
            <Link
              to={reportLink}
              className="shrink-0 border-2 border-black px-4 py-2 font-black text-sm hover:bg-black hover:text-white transition text-center"
            >
              <i className="fas fa-tags mr-2" />
              수정 요청 보기
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {adminItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="border-2 border-black p-4 flex items-start gap-3 hover:bg-black hover:text-white transition"
              >
                <i className={`fas ${item.icon} mt-0.5 shrink-0`} />
                <div>
                  <p className="font-black text-sm">{item.label}</p>
                  <p className="text-xs mt-0.5 opacity-80 break-keep">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const items =
    role === 'PROFESSOR'
      ? [
          { to: noticeLink, icon: 'fa-bullhorn', label: '공지 확인', description: '학과·학교 공지를 바로 확인합니다.' },
          { to: reportLink, icon: 'fa-pen-to-square', label: '정보 수정 요청', description: '오래된 정보를 게시판으로 알려주세요.' },
        ]
      : [
          { to: boardLink, icon: 'fa-comments', label: '질문하기', description: '학과·학교 관련 질문을 게시판에 올려요.' },
          { to: reportLink, icon: 'fa-pen-to-square', label: '정보 수정 요청', description: '틀린 정보가 보이면 게시판에 알려주세요.' },
        ]

  const roleLabel = role === 'PROFESSOR' ? '교수 안내' : '학생 동선'

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="border-2 border-black p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p className="font-black">{roleLabel}</p>
          <SourceBadge type="guide" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="border-2 border-black p-4 flex items-start gap-3 hover:bg-black hover:text-white transition"
            >
              <i className={`fas ${item.icon} mt-0.5 shrink-0`} />
              <div>
                <p className="font-black text-sm">{item.label}</p>
                <p className="text-xs mt-0.5 opacity-80 break-keep">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
