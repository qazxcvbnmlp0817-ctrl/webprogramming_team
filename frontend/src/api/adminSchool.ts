const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Username': sessionStorage.getItem('username') ?? '',
})

function handle403(res: Response) {
  if (res.status === 403) {
    window.location.href = '/universities'
    throw new Error('Forbidden')
  }
}

function univParam(univId?: number) {
  return univId != null ? `univId=${univId}` : ''
}

function qs(...parts: string[]) {
  const filtered = parts.filter(Boolean)
  return filtered.length ? '?' + filtered.join('&') : ''
}

export interface SchoolStats {
  totalPosts: number
  totalNotices: number
  todayVisitors: number
}

export interface VisitorPoint {
  date: string
  count: number
}

export interface PostItem {
  id: number
  title: string
  author: string
  category: string
  viewCount: number
  createdDate: string
}

export interface PostPage {
  posts: PostItem[]
  totalPages: number
  totalElements: number
}

export interface AdminUser {
  id: number
  username: string
  name: string
  memberType: string
  adminRole: string | null
  status: string
  department: string | null
  universityId: string | null
  createdDate: string
}

export interface AdminLog {
  id: number
  actionType: string
  actorUsername: string
  targetUsername: string | null
  detail: string | null
  createdAt: string
}

export interface MonthlyStats {
  month: string
  signups: number
  posts: number
  visitors: number
}

export async function fetchSchoolStats(univId?: number): Promise<SchoolStats> {
  const res = await fetch('/api/admin/school/stats' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolVisitors(univId?: number): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/school/visitors' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolPosts(page: number, univId?: number): Promise<PostPage> {
  const res = await fetch('/api/admin/school/posts' + qs(`page=${page}`, univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteSchoolPost(postId: number, univId?: number): Promise<void> {
  const res = await fetch('/api/admin/school/posts/' + postId + qs(univParam(univId)), {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchSchoolUsers(univId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/users' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolAllUsers(univId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/all-users' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolPendingUsers(univId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/pending-users' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateUserStatus(userId: number, status: string, univId?: number): Promise<void> {
  const res = await fetch('/api/admin/school/users/' + userId + '/status' + qs(univParam(univId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  handle403(res)
}

export async function updateSchoolUserRole(userId: number, role: string, univId?: number): Promise<void> {
  const res = await fetch('/api/admin/school/users/' + userId + '/role' + qs(univParam(univId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role }),
  })
  handle403(res)
}

export async function fetchAdminLogs(univId?: number): Promise<AdminLog[]> {
  const res = await fetch('/api/admin/school/logs' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolMonthlyStats(univId?: number): Promise<MonthlyStats[]> {
  const res = await fetch('/api/admin/school/monthly-stats' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export interface ProfessorItem {
  id: number
  name: string
  specialty: string | null
  email: string | null
  deptId: number
}

export interface CourseItem {
  id: number
  name: string
  year: string | null
  credits: number
  required: boolean
  deptId: number
}

export interface AssignmentItem {
  id: number
  professorId: number
  courseId: number
  deptId: number
  professorName: string
  courseName: string
}

export async function fetchSchoolProfessors(univId?: number): Promise<ProfessorItem[]> {
  const res = await fetch('/api/admin/school/professors' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolCourses(univId?: number): Promise<CourseItem[]> {
  const res = await fetch('/api/admin/school/courses' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolAssignments(univId?: number): Promise<AssignmentItem[]> {
  const res = await fetch('/api/admin/school/assignments' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function createSchoolAssignment(
  professorId: number, courseId: number, deptId: number, univId?: number
): Promise<AssignmentItem> {
  const res = await fetch('/api/admin/school/assignments' + qs(univParam(univId)), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ professorId, courseId, deptId }),
  })
  if (!res.ok) {
    handle403(res)
    throw new Error(await res.text())
  }
  return res.json()
}

export async function deleteSchoolAssignment(assignmentId: number, univId?: number): Promise<void> {
  const res = await fetch(
    `/api/admin/school/assignments/${assignmentId}` + qs(univParam(univId)),
    { method: 'DELETE', headers: headers() }
  )
  handle403(res)
}
