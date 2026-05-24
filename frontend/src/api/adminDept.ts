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

function deptParam(deptId?: number) {
  return deptId != null ? `deptId=${deptId}` : ''
}

function qs(...parts: string[]) {
  const filtered = parts.filter(Boolean)
  return filtered.length ? '?' + filtered.join('&') : ''
}

export interface DeptStats {
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

export interface NoticeItem {
  id: number
  title: string
  author: string
  category: string
  viewCount: number
  featured: boolean
  createdDate: string
}

export interface NoticePage {
  notices: NoticeItem[]
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

export interface MonthlyStats {
  month: string
  signups: number
  posts: number
  visitors: number
}

export async function fetchDeptStats(deptId?: number): Promise<DeptStats> {
  const res = await fetch('/api/admin/dept/stats' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchDeptVisitors(deptId?: number): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/dept/visitors' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchDeptPosts(page: number, deptId?: number): Promise<PostPage> {
  const res = await fetch('/api/admin/dept/posts' + qs(`page=${page}`, deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteDeptPost(postId: number, deptId?: number): Promise<void> {
  const res = await fetch('/api/admin/dept/posts/' + postId + qs(deptParam(deptId)), {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchDeptNotices(page: number, deptId?: number): Promise<NoticePage> {
  const res = await fetch('/api/admin/dept/notices' + qs(`page=${page}`, deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteDeptNotice(noticeId: number, deptId?: number): Promise<void> {
  const res = await fetch('/api/admin/dept/notices/' + noticeId + qs(deptParam(deptId)), {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchDeptUsers(deptId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/dept/users' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateDeptUserStatus(userId: number, status: string, deptId?: number): Promise<void> {
  const res = await fetch('/api/admin/dept/users/' + userId + '/status' + qs(deptParam(deptId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  handle403(res)
}

export async function fetchDeptMonthlyStats(deptId?: number): Promise<MonthlyStats[]> {
  const res = await fetch('/api/admin/dept/monthly-stats' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export interface ProfessorItem {
  id: number
  name: string
  specialty: string | null
  email: string | null
}

export interface CourseItem {
  id: number
  name: string
  year: string | null
  credits: number
  required: boolean
}

export interface AssignmentItem {
  id: number
  professorId: number
  courseId: number
  deptId: number
  professorName: string
  courseName: string
}

export async function fetchDeptProfessors(deptId?: number): Promise<ProfessorItem[]> {
  const res = await fetch('/api/admin/dept/professors' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchDeptCourses(deptId?: number): Promise<CourseItem[]> {
  const res = await fetch('/api/admin/dept/courses' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchDeptAssignments(deptId?: number): Promise<AssignmentItem[]> {
  const res = await fetch('/api/admin/dept/assignments' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function createDeptAssignment(
  professorId: number, courseId: number, deptId?: number
): Promise<AssignmentItem> {
  const res = await fetch('/api/admin/dept/assignments' + qs(deptParam(deptId)), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ professorId, courseId }),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteDeptAssignment(assignmentId: number, deptId?: number): Promise<void> {
  const res = await fetch(
    `/api/admin/dept/assignments/${assignmentId}` + qs(deptParam(deptId)),
    { method: 'DELETE', headers: headers() }
  )
  handle403(res)
}
