import { useEffect, useState } from 'react'

/**
 * UI 분기 전용. sessionStorage를 직접 읽으므로 실제 권한 보안이 아니다.
 * 서버 권한 검사는 백엔드 API 가드에서 별도로 처리해야 한다.
 */
export type UserRole = 'GUEST' | 'STUDENT' | 'PROFESSOR' | 'ADMIN'

function readRole(): UserRole {
  if (typeof window === 'undefined') return 'GUEST'
  if (sessionStorage.getItem('isLoggedIn') !== 'true') return 'GUEST'
  const mt = (sessionStorage.getItem('memberType') ?? '').toLowerCase()
  if (mt === 'admin') return 'ADMIN'
  if (mt === 'professor') return 'PROFESSOR'
  if (mt === 'student') return 'STUDENT'
  return 'GUEST'
}

export function useCurrentRole(): UserRole {
  const [role, setRole] = useState<UserRole>(readRole)
  useEffect(() => {
    const handler = () => setRole(readRole())
    window.addEventListener('loginChanged', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('loginChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])
  return role
}
