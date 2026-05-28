// =============================================================
// authStorage.ts
// 로그인 상태 읽기/쓰기 공통 헬퍼
// =============================================================

const SESSION_KEYS = [
  'isLoggedIn',
  'username',
  'memberType',
  'name',
  'department',
  'universityId',
  'college',
  'grade',
  'enrollmentStatus',
  'adminRole',
  'deptId',
  'facultyId',
] as const

type SessionKey = (typeof SESSION_KEYS)[number]

const DEPT_STATE_KEY = 'deptState'

// ── 읽기: sessionStorage → localStorage 순서로 폴백 ──
export function getAuthItem(key: SessionKey): string | null {
  const fromSession = sessionStorage.getItem(key)
  if (fromSession !== null) return fromSession
  return localStorage.getItem(`auth_${key}`)
}

// ── 쓰기: rememberMe 여부에 따라 저장소 선택 ──
export function setAuthItem(key: SessionKey, value: string, rememberMe: boolean): void {
  sessionStorage.setItem(key, value)
  if (rememberMe) {
    localStorage.setItem(`auth_${key}`, value)
  }
}

// ── 로그인 여부 확인 (두 저장소 모두 검사) ──
export function isLoggedIn(): boolean {
  return (
    sessionStorage.getItem('isLoggedIn') === 'true' ||
    localStorage.getItem('auth_isLoggedIn') === 'true'
  )
}

// ── 자동 로그인 복원 ──
// App 최초 마운트 시 1회 호출
export function restoreSessionFromLocalStorage(): void {
  if (sessionStorage.getItem('isLoggedIn') === 'true') return

  if (localStorage.getItem('auth_isLoggedIn') === 'true') {
    SESSION_KEYS.forEach(key => {
      const val = localStorage.getItem(`auth_${key}`)
      if (val !== null) sessionStorage.setItem(key, val)
    })

    try {
      const raw = localStorage.getItem(DEPT_STATE_KEY)
      const deptState = raw ? JSON.parse(raw) : {}

      if (!deptState.selectedUniversityId) {
        const univId = localStorage.getItem('auth_universityId')
        if (univId) {
          const next = {
            selectedDeptId: deptState.selectedDeptId ?? null,
            selectedDeptName: deptState.selectedDeptName ?? null,
            selectedUniversityId: Number(univId),
            selectedUniversityName: deptState.selectedUniversityName ?? null,
            selectedSchoolName: deptState.selectedSchoolName ?? null,
          }
          localStorage.setItem(DEPT_STATE_KEY, JSON.stringify(next))
        }
      }
    } catch { /* deptState 복원 실패 시 무시 */ }

    window.dispatchEvent(new Event('loginChanged'))
  }
}

// ── 로그아웃: 두 저장소 모두 정리 ──
export function clearAuthStorage(): void {
  SESSION_KEYS.forEach(key => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(`auth_${key}`)
  })
}

// ── 저장된 자동 로그인 여부 확인 ──
export function hasRememberMe(): boolean {
  return localStorage.getItem('auth_isLoggedIn') === 'true'
}
