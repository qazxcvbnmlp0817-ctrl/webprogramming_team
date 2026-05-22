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
  adminRole: string | null
  approved: boolean
}

export async function fetchSchoolStats(): Promise<SchoolStats> {
  const res = await fetch('/api/admin/school/stats', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolVisitors(): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/school/visitors', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolPosts(page: number): Promise<PostPage> {
  const res = await fetch(`/api/admin/school/posts?page=${page}`, { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteSchoolPost(postId: number): Promise<void> {
  const res = await fetch(`/api/admin/school/posts/${postId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchSchoolUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/users', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateSchoolUserRole(userId: number, role: string): Promise<void> {
  const res = await fetch(`/api/admin/school/users/${userId}/role`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role }),
  })
  handle403(res)
}

export async function approveSchoolUser(userId: number, approved: boolean): Promise<void> {
  const res = await fetch(`/api/admin/school/users/${userId}/approve`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ approved }),
  })
  handle403(res)
}
