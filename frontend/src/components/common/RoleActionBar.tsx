import { Link } from 'react-router-dom'
import SourceBadge from '../department/SourceBadge'
import type { UserRole } from '../../hooks/useCurrentRole'

interface RoleActionBarProps {
  role: UserRole
  scope: 'department' | 'school'
}

export default function RoleActionBar({ role, scope }: RoleActionBarProps) {
  const boardLink = scope === 'department' ? '/dept/board' : '/school/board'
  const noticeLink = scope === 'department' ? '/dept/notice' : '/school/notice'
  const reportLink = `${boardLink}?tag=${encodeURIComponent('정보수정요청')}`

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
    return (
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="border-2 border-gray-300 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 border border-gray-400 px-2 py-0.5 text-xs font-bold text-gray-500 mb-2">
                <i className="fas fa-shield-halved text-[10px]" />
                관리자
              </span>
              <p className="font-black text-gray-700 break-keep">관리자 전용 메뉴는 준비 중입니다</p>
              <p className="text-sm text-gray-500 mt-1 break-keep">
                임시로 수정 요청 게시판을 통해 정보 오류를 제보해 주세요.
              </p>
            </div>
            <Link
              to={reportLink}
              className="shrink-0 border-2 border-gray-400 px-5 py-2 font-black text-sm text-gray-600 hover:border-black hover:text-black transition text-center"
            >
              <i className="fas fa-pen-to-square mr-2" />
              수정 요청 게시판
            </Link>
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
