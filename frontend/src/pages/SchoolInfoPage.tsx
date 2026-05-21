import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchSchoolInfo } from '../api/school'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDept } from '../context/DeptContext'
import { getSchoolExtra } from '../data/schoolExtras'
import RoleActionBar from '../components/common/RoleActionBar'
import { useCurrentRole } from '../hooks/useCurrentRole'

export default function SchoolInfoPage() {
  const { selectedUniversityId, selectedUniversityName } = useDept()
  const { data: univ, loading, error } = useDeptFetch(fetchSchoolInfo, selectedUniversityId)
  const extra = getSchoolExtra(selectedUniversityId)
  const role = useCurrentRole()

  const schoolCount = univ?.schools.length ?? 0
  const facultyCount = univ?.schools.reduce((sum, school) => sum + school.faculties.length, 0) ?? 0
  const deptCount = univ?.totalDeptCount ?? 0
  const overviewItems = [
    { label: '단과대학', value: schoolCount, description: '학교 단위 구조를 빠르게 확인' },
    { label: '학부', value: facultyCount, description: '학부별 게시판과 공지를 연결' },
    { label: '학과', value: deptCount, description: '학과 커뮤니티 진입점' },
    { label: '생활 동선', value: extra.campusGuides.length, description: '공지·일정·게시판 빠른 이동' },
  ]
  const contacts = [
    { icon: 'fa-location-dot', label: '주소', value: extra.address },
    { icon: 'fa-phone', label: '대표전화', value: extra.phone },
    { icon: 'fa-envelope', label: '이메일', value: extra.email },
    { icon: 'fa-clock', label: '운영시간', value: extra.hours },
  ]

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-5">
            <Link to={`/universities/${selectedUniversityId}`} className="hover:text-white transition">
              {selectedUniversityName ?? '학교 홈'}
            </Link>
            <i className="fas fa-chevron-right text-[10px]" />
            <span className="text-white font-bold">학교 정보</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-end">
            <div>
              <p className="inline-flex items-center gap-2 border border-white px-3 py-1 text-xs font-bold mb-4">
                <i className="fas fa-university" />
                학교 생활 정보 허브
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight break-keep">
                {univ?.name ?? selectedUniversityName ?? '학교 정보'}
              </h1>
              <p className="mt-5 text-lg md:text-xl text-gray-200 leading-relaxed break-keep max-w-3xl">
                {extra.slogan}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {extra.keywords.map(keyword => (
                  <span key={keyword} className="border border-white px-3 py-1 text-xs font-semibold">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link to="/school/departments" className="bg-white text-black border-2 border-white px-4 py-3 font-bold text-center hover:bg-black hover:text-white transition">
                <i className="fas fa-sitemap mr-2" />
                학부·학과 선택
              </Link>
              <Link to="/school/notice" className="border-2 border-white px-4 py-3 font-bold text-center hover:bg-white hover:text-black transition">
                <i className="fas fa-bullhorn mr-2" />
                학교 공지 보기
              </Link>
              <Link to="/school/schedule" className="border-2 border-white px-4 py-3 font-bold text-center hover:bg-white hover:text-black transition">
                <i className="fas fa-calendar-days mr-2" />
                학교 일정 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RoleActionBar role={role} scope="school" />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {loading || !univ ? (
          <div className="py-16 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />
            {error ? '학교 정보를 불러올 수 없습니다.' : '불러오는 중...'}
          </div>
        ) : (
          <>
            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">Overview</p>
                <h2 className="text-3xl font-black">학교 한눈에 보기</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {overviewItems.map(item => (
                  <article key={item.label} className="border-2 border-black p-4">
                    <p className="text-sm font-bold text-gray-500">{item.label}</p>
                    <p className="text-3xl font-black mt-2">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-2 break-keep">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">Campus Guide</p>
                <h2 className="text-3xl font-black">캠퍼스 생활 가이드</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {extra.campusGuides.map(item => (
                  <Link key={item.title} to={item.href} className="border-2 border-black p-5 hover:bg-black hover:text-white transition min-h-44">
                    <i className={`fas ${item.icon} text-2xl mb-4 block`} />
                    <p className="font-black text-lg">{item.title}</p>
                    <p className="text-sm mt-2 opacity-80 break-keep">{item.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">Structure</p>
                <h2 className="text-3xl font-black">단과대학·학부·학과 구성</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                {univ.schools.map(school => (
                  <article key={school.id} className="border-2 border-black">
                    <div className="bg-black text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-black text-xl">{school.name}</h3>
                        <p className="text-xs text-gray-300 mt-1">{school.description}</p>
                      </div>
                      <span className="text-xs text-gray-300 shrink-0">
                        {school.faculties.length}개 학부 · {school.faculties.reduce((sum, faculty) => sum + faculty.depts.length, 0)}개 학과
                      </span>
                    </div>
                    <div className="p-5 space-y-5">
                      {school.faculties.map(faculty => (
                        <div key={faculty.id}>
                          <Link
                            to={`/school/faculty/${faculty.id}`}
                            className="inline-flex items-center gap-2 text-sm font-black hover:underline underline-offset-4"
                          >
                            <i className="fas fa-layer-group text-xs" />
                            {faculty.name}
                            <i className="fas fa-chevron-right text-[10px]" />
                          </Link>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {faculty.depts.map(dept => (
                              <span key={dept.id} className="text-xs border border-gray-300 px-2.5 py-1 font-medium">
                                {dept.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">Contact</p>
                <h2 className="text-3xl font-black">위치 및 연락정보</h2>
              </div>
              <div className="grid lg:grid-cols-[1fr_360px] gap-6">
                <div className="border-2 border-black">
                  <div className="h-64 bg-gray-100 border-b-2 border-black flex items-center justify-center">
                    <div className="text-center text-black px-6">
                      <i className="fas fa-map-location-dot text-4xl mb-3 block" />
                      <p className="font-black text-xl">캠퍼스 위치 안내</p>
                      <p className="text-sm text-gray-600 mt-2">외부 지도 API 없이 주소 검색 동선 제공</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="font-black">찾아가는 방법</p>
                    <div className="mt-4 space-y-3">
                      {extra.transitGuide.map(guide => (
                        <p key={guide} className="border-l-2 border-black pl-3 text-sm text-gray-600 break-keep">
                          {guide}
                        </p>
                      ))}
                    </div>
                    <a
                      href={`https://map.naver.com/p/search/${encodeURIComponent(extra.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-black hover:bg-black hover:text-white transition"
                    >
                      <i className="fas fa-arrow-up-right-from-square" />
                      지도에서 주소 검색
                    </a>
                  </div>
                </div>

                <aside className="border-2 border-black p-5">
                  <h3 className="font-black text-xl mb-4">대표 연락처</h3>
                  <div className="space-y-4">
                    {contacts.map(contact => (
                      <div key={contact.label} className="flex items-start gap-3">
                        <i className={`fas ${contact.icon} text-lg mt-0.5 shrink-0`} />
                        <div>
                          <p className="font-bold text-sm">{contact.label}</p>
                          <p className="text-sm text-gray-600 break-keep">{contact.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </section>

            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">Quick Links</p>
                <h2 className="text-3xl font-black">지금 바로 이동</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: '/school/notice', icon: 'fa-bullhorn', label: '학교 공지' },
                  { href: '/school/schedule', icon: 'fa-calendar-days', label: '학교 일정' },
                  { href: '/school/board', icon: 'fa-comments', label: '학교 게시판' },
                  { href: '/school/departments', icon: 'fa-sitemap', label: '학부·학과 선택' },
                ].map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="border-2 border-black p-4 flex items-center gap-3 hover:bg-black hover:text-white transition"
                  >
                    <i className={`fas ${item.icon} shrink-0`} />
                    <span className="font-bold text-sm break-keep">{item.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">FAQ</p>
                <h2 className="text-3xl font-black">학교정보 FAQ</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {extra.faqs.map(faq => (
                  <article key={faq.question} className="border-2 border-black p-5">
                    <span className="inline-block border border-black px-2 py-0.5 text-xs font-bold mb-3">
                      {faq.category}
                    </span>
                    <h3 className="font-black break-keep">{faq.question}</h3>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed break-keep">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
