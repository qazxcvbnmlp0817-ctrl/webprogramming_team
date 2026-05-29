import { useDept } from '../context/DeptContext'

export function useInitialRedirect(): string | null {
  const { selectedDeptId, selectedUniversityId } = useDept()

  // [AUTH_HOOK] 로그인 기반 리다이렉트 진입점
  // 인증 시스템 추가 시 이 아래에 주입:
  // const user = useAuth()
  // if (user?.deptId) return `/dept-redirect/${user.deptId}`

  if (selectedDeptId) return null
  if (selectedUniversityId) return '/school/departments'
  return '/universities'
}
