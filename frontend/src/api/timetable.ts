import { readError } from './_error'

export interface LectureOfferingDto {
  id: number
  semester: string
  departmentName: string
  targetYear: string
  completionType: string
  areaType: string
  courseCode: string
  courseName: string
  section: string
  credits: number
  theoryHours: number
  designHours: number
  practiceHours: number
  totalHours: number
  enrolled: number
  capacity: number
  professorName: string
  lectureTime: string
}

export interface TimetableEntryDto {
  entryId: number
  offering: LectureOfferingDto
}

export async function fetchLectureOfferings(semester = '2026-1'): Promise<LectureOfferingDto[]> {
  const res = await fetch(`/api/timetable/offerings?semester=${encodeURIComponent(semester)}`)
  if (!res.ok) throw new Error(await readError(res, '개설강좌를 불러오지 못했습니다.'))
  return res.json()
}

export async function fetchMyTimetable(username: string, semester = '2026-1'): Promise<TimetableEntryDto[]> {
  const res = await fetch(`/api/timetable/my?semester=${encodeURIComponent(semester)}`, {
    headers: { 'X-Username': username },
  })
  if (!res.ok) throw new Error(await readError(res, '내 시간표를 불러오지 못했습니다.'))
  return res.json()
}

export async function addTimetableEntry(username: string, offeringId: number): Promise<TimetableEntryDto> {
  const res = await fetch('/api/timetable/my', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    body: JSON.stringify({ offeringId }),
  })
  if (!res.ok) throw new Error(await readError(res, '시간표에 담지 못했습니다.'))
  return res.json()
}

export async function removeTimetableEntry(username: string, entryId: number): Promise<void> {
  const res = await fetch(`/api/timetable/my/${entryId}`, {
    method: 'DELETE',
    headers: { 'X-Username': username },
  })
  if (!res.ok) throw new Error(await readError(res, '시간표에서 제거하지 못했습니다.'))
}
