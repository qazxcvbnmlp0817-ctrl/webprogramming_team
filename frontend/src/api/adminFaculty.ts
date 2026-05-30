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

function facultyParam(facultyId?: number) {
  return facultyId != null ? `facultyId=${facultyId}` : ''
}

function qs(...parts: string[]) {
  const filtered = parts.filter(Boolean)
  return filtered.length ? '?' + filtered.join('&') : ''
}

export interface FacultyStats {
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
  hidden: boolean
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
  hidden: boolean
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

export async function fetchFacultyStats(facultyId?: number): Promise<FacultyStats> {
  const res = await fetch('/api/admin/faculty/stats' + qs(facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchFacultyVisitors(facultyId?: number): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/faculty/visitors' + qs(facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchFacultyPosts(page: number, facultyId?: number): Promise<PostPage> {
  const res = await fetch('/api/admin/faculty/posts' + qs(`page=${page}`, facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteFacultyPost(postId: number, facultyId?: number): Promise<void> {
  const res = await fetch('/api/admin/faculty/posts/' + postId + qs(facultyParam(facultyId)), {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchFacultyNotices(page: number, facultyId?: number): Promise<NoticePage> {
  const res = await fetch('/api/admin/faculty/notices' + qs(`page=${page}`, facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteFacultyNotice(noticeId: number, facultyId?: number): Promise<void> {
  const res = await fetch('/api/admin/faculty/notices/' + noticeId + qs(facultyParam(facultyId)), {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function hideFacultyPost(postId: number, hidden: boolean, facultyId?: number): Promise<void> {
  const res = await fetch('/api/admin/faculty/posts/' + postId + '/hidden' + qs(facultyParam(facultyId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ hidden }),
  })
  handle403(res)
}

export async function hideFacultyNotice(noticeId: number, hidden: boolean, facultyId?: number): Promise<void> {
  const res = await fetch('/api/admin/faculty/notices/' + noticeId + '/hidden' + qs(facultyParam(facultyId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ hidden }),
  })
  handle403(res)
}

export async function fetchFacultyUsers(facultyId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/faculty/users' + qs(facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchFacultyPendingUsers(facultyId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/faculty/pending-users' + qs(facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateFacultyUserStatus(userId: number, status: string, facultyId?: number): Promise<void> {
  const res = await fetch('/api/admin/faculty/users/' + userId + '/status' + qs(facultyParam(facultyId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  handle403(res)
}

export async function fetchFacultyMonthlyStats(facultyId?: number): Promise<MonthlyStats[]> {
  const res = await fetch('/api/admin/faculty/monthly-stats' + qs(facultyParam(facultyId)), { headers: headers() })
  handle403(res)
  return res.json()
}
