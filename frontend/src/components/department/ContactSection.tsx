import { Link } from 'react-router-dom'
import type { DepartmentDetailDto } from '../../types/department'
import SourceBadge from './SourceBadge'

interface ContactSectionProps {
  dept: DepartmentDetailDto
}

function hasConcreteAddress(address?: string | null) {
  const value = address?.trim()
  if (!value) return false
  const genericWords = ['미공개', '확인 필요', '공식 홈페이지', '공식 페이지', '학과 실습 공간', '공동 공간', '생활 공간']
  return !genericWords.some(word => value.includes(word))
}

export default function ContactSection({ dept }: ContactSectionProps) {
  const contacts = [
    { icon: 'fa-location-dot', label: '주소', value: dept.address },
    { icon: 'fa-phone', label: '전화', value: dept.phone },
    { icon: 'fa-envelope', label: '이메일', value: dept.email || '이메일 미공개' },
    { icon: 'fa-clock', label: '운영시간', value: dept.hours },
  ]
  const showMapLink = hasConcreteAddress(dept.address)
  const encodedAddress = encodeURIComponent(dept.address)

  return (
    <section id="contact" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">Contact</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">연락처 및 위치</h2>
          <SourceBadge type="official" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <aside className="border-2 border-black p-5">
          <h3 className="font-black text-xl mb-4">위치 및 연락정보</h3>
          <div className="space-y-4">
            {contacts.map(contact => (
              <div key={contact.label} className="flex items-start gap-3">
                <i className={`fas ${contact.icon} text-lg mt-0.5 shrink-0`} />
                <div>
                  <p className="font-bold text-sm">{contact.label}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line break-keep">{contact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <aside className="border-2 border-black p-5">
          <h3 className="font-black text-xl mb-4">찾아가는 방법</h3>
          <p className="text-sm text-gray-600 leading-relaxed break-keep">
            학과 사무실 위치, 전화번호, 운영시간을 먼저 확인하세요.
            방문 전에 궁금한 점이 있으면 학과 게시판에 질문을 남기거나 전화로 문의할 수 있습니다.
          </p>
          {showMapLink ? (
            <a
              href={`https://map.naver.com/p/search/${encodedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-black hover:bg-black hover:text-white transition"
            >
              <i className="fas fa-arrow-up-right-from-square" />
              지도에서 주소 검색
            </a>
          ) : (
            <p className="mt-4 border-2 border-black px-4 py-3 text-sm font-bold text-gray-600 break-keep">
              구체적인 주소가 등록되면 지도 링크가 표시됩니다.
            </p>
          )}
          <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600 break-keep">
            정보가 다르거나 비어 있다면{' '}
            <Link to="/dept/board" className="font-bold underline underline-offset-2 hover:text-black">
              학과 게시판
            </Link>
            에 질문을 남겨 주세요.
          </div>
        </aside>
      </div>
    </section>
  )
}
