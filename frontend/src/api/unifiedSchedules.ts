// 통합 일정 API — POST/GET/PATCH/DELETE /api/schedules

// 표준 타입명 (백엔드 schedule_type 컬럼 값과 1:1 매핑)
export type ScheduleType =
  | 'PERSONAL'       // 개인 일정
  | 'COURSE'         // 과목 일정
  | 'DEPT_NOTICE'    // 학과 일정
  | 'SCHOOL_NOTICE'  // 학교 일정 (같은 university_id)
  | 'GLOBAL_NOTICE'  // 전체 공지
  | 'GRADE_NOTICE'   // 학년별 공지
  // 구형 별칭 (하위 호환, 백엔드에서 정규화됨)
  | 'DEPARTMENT'
  | 'SCHOOL'
  | 'GLOBAL'

export interface UnifiedScheduleDto {
  id: number
  title: string
  content?: string
  scheduleType: ScheduleType
  ownerId?: number
  courseId?: number
  courseName?: string
  departmentId?: number
  targetGrade?: number
  targetGradesJson?: string  // "1,2,3" 형식
  isAllGrades?: boolean
  category: string
  isCompleted: boolean
  startDate: string          // yyyy-MM-dd
  endDate?: string
  startTime?: string
  endTime?: string
  createdBy?: string
  universityId?: string
}

export interface ScheduleCreateReq {
  title: string
  content?: string
  scheduleType: ScheduleType
  courseId?: number
  departmentId?: number
  targetGrade?: number
  targetGrades?: number[]    // 다중 학년 선택
  isAllGrades?: boolean
  category: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
}

export async function fetchMySchedules(username: string): Promise<UnifiedScheduleDto[]> {
  if (!username) return []
  try {
    const res = await fetch('/api/schedules/my', {
      headers: { 'X-Username': username },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function createSchedule(
  username: string,
  req: ScheduleCreateReq,
): Promise<UnifiedScheduleDto | null> {
  try {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
      body: JSON.stringify(req),
    })
    if (!res.ok) {
      const text = await res.text()
      let msg = '알 수 없는 오류'
      try {
        const j = JSON.parse(text)
        if (j.message) msg = j.message
        else if (j.error) msg = j.error
      } catch { msg = text || msg }
      const detail = `요청 URL: POST /api/schedules\n상태 코드: ${res.status}\n사유: ${msg}`
      console.error('[createSchedule] API error:', res.status, msg, '\nreq:', req)
      alert(`일정 저장에 실패했습니다.\n\n${detail}`)
      return null
    }
    return res.json()
  } catch (e) {
    console.error('[createSchedule] Network error:', e)
    alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    return null
  }
}

export async function updateSchedule(
  username: string,
  id: number,
  req: ScheduleCreateReq,
): Promise<UnifiedScheduleDto | null> {
  try {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
      body: JSON.stringify(req),
    })
    if (!res.ok) {
      const text = await res.text()
      let msg = '일정 수정에 실패했습니다.'
      try { const j = JSON.parse(text); if (j.message) msg = j.message } catch {}
      alert(msg)
      return null
    }
    return res.json()
  } catch { return null }
}

export async function toggleScheduleComplete(
  username: string,
  id: number,
): Promise<UnifiedScheduleDto | null> {
  try {
    const res = await fetch(`/api/schedules/${id}/complete`, {
      method: 'PATCH',
      headers: { 'X-Username': username },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function deleteUnifiedSchedule(
  username: string,
  id: number,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'DELETE',
      headers: { 'X-Username': username },
    })
    return res.ok
  } catch { return false }
}
