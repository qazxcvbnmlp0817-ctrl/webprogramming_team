import { Link } from 'react-router-dom'
import type { DepartmentDetailDto } from '../../types/department'
import type { StudentLifeItem } from '../../data/departmentExtras'
import SourceBadge from './SourceBadge'

interface ContactSectionProps {
  dept: DepartmentDetailDto
  studentLife: StudentLifeItem[]
}

export default function ContactSection({ dept, studentLife }: ContactSectionProps) {
  const contacts = [
    { icon: 'fa-location-dot', label: '주소', value: dept.address },
    { icon: 'fa-phone', label: '전화', value: dept.phone },
    { icon: 'fa-envelope', label: '이메일', value: dept.email || '공식 페이지 미공개' },
    { icon: 'fa-clock', label: '운영시간', value: dept.hours },
  ]
  const encodedAddress = encodeURIComponent(dept.address || dept.name)

  return (
    <section id="contact" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
      <div className="mb-6 border-b-2 border-black pb-3">
        <p className="text-sm text-gray-500">Student Life</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-3xl font-black">학과 생활 빠른 링크</h2>
          <SourceBadge type="partial" />
        </div>
        <p className="text-sm text-gray-500 mt-2">공지, 일정, 게시판으로 이어지는 학생용 이동 동선을 모았습니다.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="grid md:grid-cols-2 gap-3">
          {studentLife.map(item => {
            const commonClass = 'border-2 border-black p-4 hover:bg-black hover:text-white transition block min-h-28'
            return item.external ? (
              <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className={commonClass}>
                <span className="flex items-center justify-between gap-3 font-black">
                  {item.title}
                  <i className="fas fa-arrow-up-right-from-square text-xs" />
                </span>
                <span className="block text-sm mt-2 opacity-80">{item.description}</span>
              </a>
            ) : (
              <Link key={item.title} to={item.href} className={commonClass}>
                <span className="flex items-center justify-between gap-3 font-black">
                  {item.title}
                  <i className="fas fa-arrow-right text-xs" />
                </span>
                <span className="block text-sm mt-2 opacity-80">{item.description}</span>
              </Link>
            )
          })}
        </div>

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
          <div className="mt-6 border-t-2 border-black pt-5">
            <p className="font-black">찾아가는 방법</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed break-keep">
              상세 호실과 방문 가능 여부는 학과 사무실 또는 공식 홈페이지에서 최종 확인하세요.
              이 페이지는 학과 커뮤니티 안에서 위치 확인 동선을 빠르게 잡기 위한 안내입니다.
            </p>
            <a
              href={`https://map.naver.com/p/search/${encodedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-black hover:bg-black hover:text-white transition"
            >
              <i className="fas fa-arrow-up-right-from-square" />
              지도에서 주소 검색
            </a>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600 break-keep">
            정보가 다르거나 오류가 있다면{' '}
            <Link to="/dept/board" className="font-bold underline underline-offset-2 hover:text-black">
              학과 게시판
            </Link>
            에 글로 남겨주세요.
          </div>
        </aside>
      </div>
    </section>
  )
}
