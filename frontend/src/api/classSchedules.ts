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
