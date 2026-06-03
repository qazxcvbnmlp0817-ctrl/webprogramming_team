import { Link } from 'react-router-dom'
import type { CommunityTopic } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface DepartmentCommunityTagsProps {
  topics: CommunityTopic[]
}

export default function DepartmentCommunityTags({ topics }: DepartmentCommunityTagsProps) {
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
      {topics.length === 0 ? (
        <p className="border-2 border-black p-6 text-sm text-gray-500">등록된 커뮤니티 주제가 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {topics.map(topic => (
            <Link
              key={topic.slug || topic.label}
              to={`/dept/board?tag=${encodeURIComponent(topic.slug)}`}
              className="border-2 border-black px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition"
            >
              #{topic.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
