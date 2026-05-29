import { Link } from 'react-router-dom'
import SourceBadge from './SourceBadge'

const tags: { label: string; slug: string }[] = [
  { label: '학부생 안내',    slug: 'undergraduate-guide' },
  { label: '복학생',        slug: 'returning-student' },
  { label: '수강신청',      slug: 'course-registration' },
  { label: '시험',          slug: 'exam' },
  { label: '과제',          slug: 'assignment' },
  { label: '팀플',          slug: 'team-project' },
  { label: '졸업준비',      slug: 'graduation-prep' },
  { label: '자격증',        slug: 'certification' },
  { label: '진로',          slug: 'career' },
  { label: '취업',          slug: 'employment' },
  { label: '오류제보',      slug: 'error-report' },
  { label: '정보수정요청',  slug: 'info-update-request' },
]

export default function DepartmentCommunityTags() {
  return (
    <section id="community" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">Community</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">학과 커뮤니티 주제</h2>
          <SourceBadge type="guide" />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          학과 생활에서 자주 다루는 주제로 게시판 글을 찾거나 새 글을 작성할 수 있습니다.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <Link
            key={tag.slug}
            to={`/dept/board?tag=${tag.slug}`}
            className="border-2 border-black px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition"
          >
            #{tag.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
