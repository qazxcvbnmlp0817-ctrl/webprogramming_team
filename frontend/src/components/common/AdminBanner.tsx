import { useNavigate } from 'react-router-dom'
import { useAdminRole } from '../../hooks/useAdminRole'
import type { AdminRole } from '../../hooks/useAdminRole'
import { getAuthItem } from '../../utils/authStorage'

export type AdminBannerScope = 'selection' | 'school' | 'dept'

interface AdminBannerProps {
  scope: AdminBannerScope
  targetId?: number
}

const ALLOWED: Record<AdminBannerScope, AdminRole[]> = {
  selection: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DEPT_ADMIN'],
  school:    ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  dept:      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DEPT_ADMIN'],
}

const ROLE_LABELS: Record<NonNullable<AdminRole>, string> = {
  SUPER_ADMIN:  '최고 관리자',
  SCHOOL_ADMIN: '학교 관리자',
  DEPT_ADMIN:   '학과 관리자',
}

// URL은 클릭 시점에 sessionStorage를 읽어 계산 (렌더 시점 이후 값 변경 대응)
function resolveSelectionUrl(role: NonNullable<AdminRole>, target: 'school' | 'faculty' | 'dept'): string {
  const univId    = getAuthItem('universityId')
  const facultyId = getAuthItem('facultyId')
  const deptId    = getAuthItem('deptId')

  if (role === 'SUPER_ADMIN')   return '/admin/super'
  if (role === 'SCHOOL_ADMIN') {
    if (target === 'faculty' && facultyId) return `/admin/faculty/${facultyId}`
    return univId ? `/admin/school/${univId}` : '/admin/super'
  }
  // DEPT_ADMIN
  if (deptId) return `/admin/dept/${deptId}`
  return univId ? `/admin/school/${univId}` : '/universities'
}

export default function AdminBanner({ scope, targetId }: AdminBannerProps) {
  const role = useAdminRole()
  const navigate = useNavigate()

  if (!role || !ALLOWED[scope].includes(role)) return null

  // school / dept scope: single button
  if (scope !== 'selection') {
    const url = scope === 'school'
      ? `/admin/school/${targetId ?? ''}`
      : `/admin/dept/${targetId ?? ''}`
    return (
      <section className="max-w-6xl mx-auto px-4 py-3">
        <div className="border border-gray-300 bg-gray-50 px-5 py-3 flex items-center justify-between gap-4">
          <BannerLeft role={role} />
          <button
            onClick={() => navigate(url)}
            className="shrink-0 border-2 border-black px-4 py-1.5 text-sm font-bold hover:bg-black hover:text-white transition"
          >
            관리자 페이지 <i className="fas fa-arrow-right ml-1" />
          </button>
        </div>
      </section>
    )
  }

  // selection scope: role-based buttons
  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="border border-gray-300 bg-gray-50 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <BannerLeft role={role} />
        <div className="flex items-center gap-2 flex-wrap">

          {role === 'SUPER_ADMIN' && (
            <BannerButton label="최고 관리자 페이지" onClick={() => navigate('/admin/super')} />
          )}

          {role === 'SCHOOL_ADMIN' && (
            <>
              <BannerButton
                label="학과 관리 페이지"
                onClick={() => navigate(resolveSelectionUrl('SCHOOL_ADMIN', 'school'))}
              />
              {/* 학부&학과 관리 버튼은 facultyId가 sessionStorage에 존재할 때만 표시 */}
              {getAuthItem('facultyId') && (
                <BannerButton
                  label="학부&학과 관리 페이지"
                  onClick={() => navigate(resolveSelectionUrl('SCHOOL_ADMIN', 'faculty'))}
                />
              )}
            </>
          )}

          {role === 'DEPT_ADMIN' && (
            <BannerButton
              label="학과 관리 페이지"
              onClick={() => navigate(resolveSelectionUrl('DEPT_ADMIN', 'dept'))}
            />
          )}

        </div>
      </div>
    </section>
  )
}

function BannerLeft({ role }: { role: NonNullable<AdminRole> }) {
  return (
    <div className="flex items-center gap-3">
      <i className="fas fa-shield-halved text-gray-500" />
      <span className="inline-flex items-center border border-gray-400 px-2 py-0.5 text-xs font-bold text-gray-600">
        {ROLE_LABELS[role]}
      </span>
      <p className="text-sm text-gray-600 font-medium hidden sm:block">관리자 메뉴</p>
    </div>
  )
}

function BannerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 border-2 border-black px-4 py-1.5 text-sm font-bold hover:bg-black hover:text-white transition"
    >
      {label} <i className="fas fa-arrow-right ml-1" />
    </button>
  )
}
