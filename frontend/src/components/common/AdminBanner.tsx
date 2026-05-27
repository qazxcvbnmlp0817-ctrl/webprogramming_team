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


/**
 * 배너 표시 여부:
 * - SUPER_ADMIN: 항상 표시
 * - SCHOOL_ADMIN: school scope → 본인 대학교 페이지일 때만 표시
 *                 dept scope   → 항상 표시
 *                 selection    → 숨김
 * - DEPT_ADMIN:   dept scope   → 본인 학과 페이지일 때만 표시
 *                 selection    → 숨김
 */
function isBannerVisible(role: NonNullable<AdminRole>, scope: AdminBannerScope, targetId?: number): boolean {
  if (role === 'SUPER_ADMIN') return true
  if (scope === 'selection')  return false

  if (role === 'SCHOOL_ADMIN') {
    if (scope === 'dept') return true
    const myUnivId = getAuthItem('universityId')
    return myUnivId != null && targetId === Number(myUnivId)
  }

  // DEPT_ADMIN — dept scope only
  const myDeptId = getAuthItem('deptId')
  return myDeptId != null && targetId === Number(myDeptId)
}

export default function AdminBanner({ scope, targetId }: AdminBannerProps) {
  const role = useAdminRole()
  const navigate = useNavigate()

  if (!role || !ALLOWED[scope].includes(role)) return null
  if (!isBannerVisible(role, scope, targetId)) return null

  // school / dept scope: single button
  if (scope !== 'selection') {
    const url = scope === 'school' ? `/admin/school/${targetId ?? ''}` : `/admin/dept/${targetId ?? ''}`
    return (
      <section className="max-w-6xl mx-auto px-4 py-3">
        <div className="border border-gray-300 bg-gray-50 px-5 py-3 flex items-center justify-between gap-4">
          <BannerLeft role={role} />
          <BannerButton label="관리자 페이지" onClick={() => navigate(url)} />
        </div>
      </section>
    )
  }

  // selection scope: SUPER_ADMIN only reaches here
  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="border border-gray-300 bg-gray-50 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <BannerLeft role={role} />
        <BannerButton label="최고 관리자 페이지" onClick={() => navigate('/admin/super')} />
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
