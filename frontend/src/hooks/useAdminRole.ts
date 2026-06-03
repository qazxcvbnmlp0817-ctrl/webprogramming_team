import { useEffect, useState } from 'react'
import { getAuthItem } from '../utils/authStorage'

/**
 * UI 분기 전용. sessionStorage를 직접 읽으므로 실제 권한 보안이 아니다.
 * 서버 권한 검사는 백엔드 API 가드에서 별도로 처리해야 한다.
 */
export type AdminRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'DEPT_ADMIN' | null

function readAdminRole(): AdminRole {
  if (typeof window === 'undefined') return null
  if (getAuthItem('isLoggedIn') !== 'true') return null
  const raw = getAuthItem('adminRole') ?? ''
  if (raw === 'SUPER_ADMIN') return 'SUPER_ADMIN'
  if (raw === 'SCHOOL_ADMIN') return 'SCHOOL_ADMIN'
  if (raw === 'DEPT_ADMIN') return 'DEPT_ADMIN'
  return null
}

export function useAdminRole(): AdminRole {
  const [role, setRole] = useState<AdminRole>(readAdminRole)
  useEffect(() => {
    const handler = () => setRole(readAdminRole())
    window.addEventListener('loginChanged', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('loginChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])
  return role
}
