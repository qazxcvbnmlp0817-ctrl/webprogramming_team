import { readError } from './_error'

export interface ClassScheduleDto {
  id: number
  courseId: number
  courseName: string
  professorId: number
  professorName: string
  deptId: number
  dayOfWeek: string  // 월|화|수|목|금|토|일
  startTime: string  // HH:mm
  endTime: string    // HH:mm
  room: string
  semester: string
  memo: string
}

export interface ProfessorAssignmentDto {
  id: number
  professorId: number
  courseId: number
  deptId: number
  courseName: string
  professorName?: string
}

export interface ClassSchedulePayload {
  courseId: number
  professorId?: number
  deptId?: number
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string
  semester: string
  memo?: string
}

export interface CourseEventDto {
  id: number
  title: string
  date: string    // yyyy-MM-dd
  endDate?: string
  dday: number
  category: string // 시험, 과제, 기타
  startTime?: string
  endTime?: string
  registeredBy?: string
}

export interface CourseDto {
  courseId: number
  courseName: string
  year: string
  credits: number
  required: boolean
  deptId: number
}

export async function fetchStudentClassSchedules(
  username: string,
  semester: string,
): Promise<ClassScheduleDto[]> {
  try {
    const res = await fetch(
      `/api/student/class-schedules?semester=${encodeURIComponent(semester)}`,
      { headers: { 'X-Username': username } },
    )
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

// 학생: 수강과목에 교수가 등록한 이벤트(시험, 과제 등) 조회
export async function fetchStudentCourseEvents(
  username: string,
  semester: string,
): Promise<CourseEventDto[]> {
  try {
    const res = await fetch(
      `/api/student/course-events?semester=${encodeURIComponent(semester)}`,
      { headers: { 'X-Username': username } },
    )
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

// 교수/조교: 과목 일정 등록
export async function createProfessorCourseSchedule(
  username: string,
  payload: { courseId: number; title: string; eventDate: string; category: string },
): Promise<CourseEventDto | null> {
  try {
    const res = await fetch('/api/professor/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

// 교수: 담당 과목 목록 (수강 신청 정보 기반)
export async function fetchProfessorCourses(username: string): Promise<ClassScheduleDto[]> {
  try {
    const res = await fetch('/api/professor/class-schedules', {
      headers: { 'X-Username': username },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

// 교수: 배정된 과목 목록 (일정 등록 모달 과목 선택 드롭다운용 - 시간표 미등록 과목도 포함)
export async function fetchProfessorAssignedCourses(username: string): Promise<CourseDto[]> {
  try {
    const res = await fetch('/api/professor/my-courses', {
      headers: { 'X-Username': username },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function fetchProfessorClassSchedules(
  username: string,
  semester: string,
): Promise<ClassScheduleDto[]> {
  const res = await fetch(
    `/api/professor/class-schedules?semester=${encodeURIComponent(semester)}`,
    { headers: { 'X-Username': username } },
  )
  if (!res.ok) throw new Error(await readError(res, '교수 시간표를 불러오지 못했습니다.'))
  return res.json()
}

export async function fetchProfessorAssignments(username: string): Promise<ProfessorAssignmentDto[]> {
  const res = await fetch('/api/professor/assignments', {
    headers: { 'X-Username': username },
  })
  if (!res.ok) throw new Error(await readError(res, '담당 강좌를 불러오지 못했습니다.'))
  return res.json()
}

export async function createClassSchedule(
  username: string,
  payload: ClassSchedulePayload,
): Promise<ClassScheduleDto> {
  const res = await fetch('/api/professor/class-schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readError(res, '수업 시간표 등록에 실패했습니다.'))
  return res.json()
}

export async function updateClassSchedule(
  username: string,
  id: number,
  payload: ClassSchedulePayload,
): Promise<ClassScheduleDto> {
  const res = await fetch(`/api/professor/class-schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readError(res, '수업 시간표 수정에 실패했습니다.'))
  return res.json()
}

export async function deleteClassSchedule(username: string, id: number): Promise<void> {
  const res = await fetch(`/api/professor/class-schedules/${id}`, {
    method: 'DELETE',
    headers: { 'X-Username': username },
  })
  if (!res.ok) throw new Error(await readError(res, '수업 시간표 삭제에 실패했습니다.'))
}

export async function fetchDeptClassSchedules(
  deptId: number,
  semester: string,
): Promise<ClassScheduleDto[]> {
  const res = await fetch(`/api/dept/${deptId}/class-schedules?semester=${encodeURIComponent(semester)}`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchAdminClassSchedules(
  username: string,
  semester: string,
  deptId?: number,
): Promise<ClassScheduleDto[]> {
  const qs = new URLSearchParams({ semester })
  if (deptId != null) qs.set('deptId', String(deptId))
  const res = await fetch(`/api/admin/class-schedules?${qs.toString()}`, {
    headers: { 'X-Username': username },
  })
  if (!res.ok) throw new Error(await readError(res, '관리 범위의 수업 시간표를 불러오지 못했습니다.'))
  return res.json()
}

export async function createAdminClassSchedule(
  username: string,
  payload: ClassSchedulePayload,
): Promise<ClassScheduleDto> {
  const res = await fetch('/api/admin/class-schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readError(res, '관리자 수업 시간표 등록에 실패했습니다.'))
  return res.json()
}

export async function updateAdminClassSchedule(
  username: string,
  id: number,
  payload: ClassSchedulePayload,
): Promise<ClassScheduleDto> {
  const res = await fetch(`/api/admin/class-schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await readError(res, '관리자 수업 시간표 수정에 실패했습니다.'))
  return res.json()
}

export async function deleteAdminClassSchedule(username: string, id: number): Promise<void> {
  const res = await fetch(`/api/admin/class-schedules/${id}`, {
    method: 'DELETE',
    headers: { 'X-Username': username },
  })
  if (!res.ok) throw new Error(await readError(res, '관리자 수업 시간표 삭제에 실패했습니다.'))
}

// 학과별 과목 목록 (수업 선택 탭)
export async function fetchCoursesByDept(deptId: number): Promise<CourseDto[]> {
  try {
    const res = await fetch(`/api/courses?deptId=${deptId}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

// 조교: 소속 학과 과목 목록 (일정 등록 모달용)
export async function fetchAssistantCourses(username: string): Promise<CourseDto[]> {
  try {
    const res = await fetch('/api/assistant/courses', {
      headers: { 'X-Username': username },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export interface DeptCourseEventDto {
  id: number
  title: string
  date: string
  endDate?: string
  dday: number
  category: string
  courseName?: string
  memo?: string
  startTime?: string
  endTime?: string
  registeredBy?: string
}

// 교수·조교·관리자: 공지 일정 등록
// scope: 'NOTICE'(학과공지, 기본값) | 'GLOBAL'(전체공지, 관리자만)
export async function createProfessorDeptSchedule(
  username: string,
  payload: {
    courseName: string
    title: string
    eventDate: string
    endDate?: string
    category: string
    memo?: string
    scope?: string
    startTime?: string
    endTime?: string
  },
): Promise<DeptCourseEventDto | null> {
  try {
    const res = await fetch('/api/professor/dept-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
      body: JSON.stringify({ scope: 'NOTICE', ...payload }),
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

// 교수 전용: 담당 과목 수강생 대상 이벤트 등록
export async function createProfessorCourseScheduleV2(
  username: string,
  payload: { courseId: number; title: string; eventDate: string; endDate?: string; category: string; memo?: string; startTime?: string; endTime?: string },
): Promise<DeptCourseEventDto | null> {
  try {
    const res = await fetch('/api/professor/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

// 학생: 소속 학과 교수 등록 일정 조회 (username 있으면 X-Username 헤더로 권한 체크)
export async function fetchStudentDeptEvents(deptId: string, username?: string): Promise<DeptCourseEventDto[]> {
  try {
    const headers: Record<string, string> = {}
    if (username) headers['X-Username'] = username
    const res = await fetch(`/api/student/dept-events?deptId=${encodeURIComponent(deptId)}`, { headers })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}
