import { useNavigate } from 'react-router-dom'
import { useAdminRole } from '../../hooks/useAdminRole'
import type { AdminRole } from '../../hooks/useAdminRole'

export type AdminBannerScope = 'selection' | 'school' | 'dept'

interface AdminBannerProps {
  scope: AdminBannerScope
  targetId?: number
}

const ALLOWED: Record<AdminBannerScope, AdminRole[]> = {
  // selection scope (e.g. /universities) needs to be visible to every admin role
  // so school/dept admins have an entry point into their own dashboard.
  selection: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DEPT_ADMIN'],
  school:    ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  dept:      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DEPT_ADMIN'],
}

const ROLE_LABELS: Record<NonNullable<AdminRole>, string> = {
  SUPER_ADMIN:  '최고 관리자',
  SCHOOL_ADMIN: '학교 관리자',
  DEPT_ADMIN:   '학과 관리자',
}

function adminUrl(scope: AdminBannerScope, role: NonNullable<AdminRole>, targetId?: number): string {
  if (scope === 'selection') {
    if (role === 'SUPER_ADMIN')  return '/admin/super'
    if (role === 'SCHOOL_ADMIN') {
      const univ = sessionStorage.getItem('universityId')
      return univ ? `/admin/school/${univ}` : '/admin/super'
    }
    // DEPT_ADMIN
    const dept = sessionStorage.getItem('deptId')
    if (dept) return `/admin/dept/${dept}`
    const univ = sessionStorage.getItem('universityId')
    return univ ? `/admin/school/${univ}` : '/universities'
  }
  if (scope === 'school') return `/admin/school/${targetId ?? ''}`
  return `/admin/dept/${targetId ?? ''}`
}

export default function AdminBanner({ scope, targetId }: AdminBannerProps) {
  const role = useAdminRole()
  const navigate = useNavigate()

  if (!role || !ALLOWED[scope].includes(role)) return null

  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="border border-gray-300 bg-gray-50 px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <i className="fas fa-shield-halved text-gray-500" />
          <span className="inline-flex items-center border border-gray-400 px-2 py-0.5 text-xs font-bold text-gray-600">
            {ROLE_LABELS[role]}
          </span>
          <p className="text-sm text-gray-600 font-medium hidden sm:block">관리자 메뉴</p>
        </div>
        <button
          onClick={() => navigate(adminUrl(scope, role, targetId))}
          className="shrink-0 border-2 border-black px-4 py-1.5 text-sm font-bold hover:bg-black hover:text-white transition"
        >
          관리자 페이지 <i className="fas fa-arrow-right ml-1" />
        </button>
      </div>
    </section>
  )
}
