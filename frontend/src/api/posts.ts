import type { PostDto } from '../types/post'

export async function fetchPosts(deptId: number): Promise<{ featured: PostDto; posts: PostDto[] }> {
  const res = await fetch(`/api/posts?deptId=${deptId}`)
  if (!res.ok) throw new Error('게시글 로딩 실패')
  return res.json()
}
