export function isLoggedIn(): boolean {
  return (
    sessionStorage.getItem('isLoggedIn') === 'true' ||
    localStorage.getItem('auth_isLoggedIn') === 'true'
  )
}

export function isPrivileged(): boolean {
  const m = sessionStorage.getItem('memberType') ?? localStorage.getItem('auth_memberType') ?? ''
  return m === 'professor' || m === 'admin'
}

export function isSameDept(targetDeptId: number | null | undefined, targetDeptName?: string | null): boolean {
  const myDeptId = sessionStorage.getItem('deptId') ?? localStorage.getItem('auth_deptId')
  if (myDeptId && targetDeptId) return String(myDeptId) === String(targetDeptId)
  // ID 없으면 이름 폴백
  const myDeptName = sessionStorage.getItem('department') ?? localStorage.getItem('auth_department')
  if (!myDeptName || !targetDeptName) return false
  return myDeptName === targetDeptName
}

export function isSameFaculty(targetFacultyId: number | null | undefined, targetFacultyName?: string | null): boolean {
  const myFacultyId = sessionStorage.getItem('facultyId') ?? localStorage.getItem('auth_facultyId')
  if (myFacultyId && targetFacultyId) return String(myFacultyId) === String(targetFacultyId)
  // ID 없으면 이름 폴백
  const myCollege = sessionStorage.getItem('college') ?? localStorage.getItem('auth_college')
  if (!myCollege || !targetFacultyName) return false
  return myCollege === targetFacultyName
}
