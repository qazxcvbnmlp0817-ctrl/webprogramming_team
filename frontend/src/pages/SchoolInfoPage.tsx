import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchSchoolInfo } from '../api/school'
import { useDept } from '../context/DeptContext'
import { getSchoolExtra } from '../data/schoolExtras'
import RoleActionBar from '../components/common/RoleActionBar'
import { useCurrentRole } from '../hooks/useCurrentRole'
import AdminBanner from '../components/common/AdminBanner'
import type { SchoolFacilityItem, SchoolInfoDto, SchoolPageContentDto } from '../types/schoolInfo'
import SchoolEditableSection from '../components/school/edit/SchoolEditableSection'
import SchoolHeroForm from '../components/school/edit/SchoolHeroForm'
import SchoolContactForm from '../components/school/edit/SchoolContactForm'
import SchoolGuideCardsForm from '../components/school/edit/SchoolGuideCardsForm'
import SchoolFacilitiesForm from '../components/school/edit/SchoolFacilitiesForm'
import SchoolFaqsForm from '../components/school/edit/SchoolFaqsForm'
import SchoolQuickLinksForm from '../components/school/edit/SchoolQuickLinksForm'

interface SchoolInfoPageProps {
  embedded?: boolean
  univIdOverride?: number
  refreshKey?: number
}

function hasItems<T>(items?: T[] | null): items is T[] {
  return Array.isArray(items) && items.length > 0
}

function useMergedContent(info: SchoolInfoDto | null, univId: number | null): SchoolPageContentDto {
  const extra = getSchoolExtra(univId)
  const content = info?.content ?? {}
  return {
    slogan: content.slogan || extra.slogan,
    homepage: content.homepage || extra.homepage,
    address: content.address || extra.address,
    phone: content.phone || extra.phone,
    email: content.email || extra.email,
    hours: content.hours || extra.hours,
    keywords: hasItems(content.keywords) ? content.keywords : extra.keywords,
    transitGuides: hasItems(content.transitGuides) ? content.transitGuides : extra.transitGuide,
    campusGuides: hasItems(content.campusGuides) ? content.campusGuides : extra.campusGuides,
    facilities: hasItems(content.facilities) ? content.facilities : extra.facilities,
    faqs: hasItems(content.faqs) ? content.faqs : extra.faqs,
    quickLinks: hasItems(content.quickLinks) ? content.quickLinks : extra.quickLinks,
  }
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (href.startsWith('http')) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  }
  if (href.startsWith('#')) {
    return <a href={href} className={className}>{children}</a>
  }
  return <Link to={href} className={className}>{children}</Link>
}

export default function SchoolInfoPage({
  embedded = false,
  univIdOverride,
  refreshKey = 0,
}: SchoolInfoPageProps) {
  const navigate = useNavigate()
  const {
    selectedUniversityId,
    selectedUniversityName,
    setDept,
  } = useDept()
  const role = useCurrentRole()
  const resolvedUnivId = univIdOverride ?? selectedUniversityId
  const [info, setInfo] = useState<SchoolInfoDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facilityQuery, setFacilityQuery] = useState('')
  const [facilityCategory, setFacilityCategory] = useState('전체')

  useEffect(() => {
    if (resolvedUnivId == null) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSchoolInfo(resolvedUnivId)
      .then(data => { if (!cancelled) setInfo(data) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : '학교 정보를 불러오지 못했습니다.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [resolvedUnivId, refreshKey])

  const univ = info?.university
  const summary = info?.summary
  const schools = univ?.schools ?? []
  const content = useMergedContent(info, resolvedUnivId)
  const facilities = content.facilities ?? []
  const verifiedFacilities = useMemo(
    () => facilities.filter(item => Boolean(item.mapUrl)),
    [facilities],
  )
  const categories = useMemo(
    () => ['전체', ...Array.from(new Set(verifiedFacilities.map(item => item.category).filter(Boolean)))],
    [verifiedFacilities],
  )
  const filteredFacilities = useMemo(() => {
    const q = facilityQuery.trim().toLowerCase()
    return verifiedFacilities.filter(item => {
      const matchesCategory = facilityCategory === '전체' || item.category === facilityCategory
      const haystack = `${item.name} ${item.category} ${item.location} ${item.description}`.toLowerCase()
      return matchesCategory && (!q || haystack.includes(q))
    })
  }, [verifiedFacilities, facilityQuery, facilityCategory])

  const handleDeptClick = useCallback((
    deptId: number,
    deptName: string,
    schoolName: string,
    facultyName: string,
  ) => {
    if (!univ) return
    setDept({
      selectedDeptId: deptId,
      selectedDeptName: deptName,
      selectedUniversityId: univ.id,
      selectedUniversityName: univ.name,
      selectedSchoolName: schoolName,
      selectedFacultyName: facultyName,
    })
    navigate('/dept/home')
  }, [navigate, setDept, univ])

  const summaryItems = [
    { label: '단과대학', value: summary?.schoolCount ?? schools.length, description: '학교 구조의 첫 탐색 단위' },
    { label: '학부', value: summary?.facultyCount ?? schools.reduce((sum, school) => sum + (school.faculties?.length ?? 0), 0), description: '학부 공지와 게시판으로 연결' },
    { label: '학과', value: summary?.deptCount ?? univ?.totalDeptCount ?? 0, description: '전공 커뮤니티 진입점' },
    { label: '공지·일정', value: (summary?.noticeCount ?? 0) + (summary?.scheduleCount ?? 0), description: '오늘 확인할 학교 단위 정보' },
  ]

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      {!embedded && <Navbar />}
      {!embedded && <div className="pt-14" />}

      <SchoolEditableSection
        sectionKey="hero"
        title="학교정보 히어로 편집"
        value={{ slogan: content.slogan, homepage: content.homepage, keywords: content.keywords }}
        renderForm={(value, onChange) => <SchoolHeroForm value={value} onChange={onChange} />}
      >
        <section className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-5">
              <Link to={`/universities/${resolvedUnivId ?? ''}`} className="hover:text-white transition">
                {selectedUniversityName ?? univ?.name ?? '학교 홈'}
              </Link>
              <i className="fas fa-chevron-right text-[10px]" />
              <span className="text-white font-bold">학교 정보</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-end">
              <div>
                <p className="inline-flex items-center gap-2 border border-white px-3 py-1 text-xs font-bold mb-4">
                  <i className="fas fa-university" />
                  학교 단위 정보 통합 허브
                </p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight break-keep">
                  {univ?.name ?? selectedUniversityName ?? '학교 정보'}
                </h1>
                <p className="mt-5 text-lg md:text-xl text-gray-200 leading-relaxed break-keep max-w-3xl">
                  {content.slogan}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(content.keywords ?? []).map(keyword => (
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
                {content.homepage && (
                  <a href={content.homepage} target="_blank" rel="noopener noreferrer" className="border-2 border-white px-4 py-3 font-bold text-center hover:bg-white hover:text-black transition">
                    <i className="fas fa-arrow-up-right-from-square mr-2" />
                    공식 홈페이지
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </SchoolEditableSection>

      {!embedded && <AdminBanner scope="school" targetId={resolvedUnivId ?? undefined} />}
      {!embedded && <RoleActionBar role={role} scope="school" targetId={resolvedUnivId ?? undefined} />}

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
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
                {summaryItems.map(item => (
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
                <p className="text-sm text-gray-500">Today</p>
                <h2 className="text-3xl font-black">오늘 확인할 학교 정보</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                <InfoList
                  title="최신 학교 공지"
                  icon="fa-bullhorn"
                  empty="표시할 학교 공지가 없습니다."
                  items={(info.latestNotices ?? []).map(notice => ({
                    id: notice.id,
                    title: notice.title,
                    meta: `${notice.category} · ${notice.date}`,
                    href: `/notice/${notice.id}`,
                  }))}
                  moreHref="/school/notice"
                  moreLabel="공지 전체 보기"
                />
                <InfoList
                  title="다가오는 학교 일정"
                  icon="fa-calendar-days"
                  empty="표시할 학교 일정이 없습니다."
                  items={(info.upcomingSchedules ?? []).map(schedule => ({
                    id: schedule.id,
                    title: schedule.title,
                    meta: `${schedule.category} · ${schedule.date} · D-${schedule.dday}`,
                    href: '/school/schedule',
                  }))}
                  moreHref="/school/schedule"
                  moreLabel="일정 전체 보기"
                />
              </div>
            </section>

            <SchoolEditableSection
              sectionKey="quickLinks"
              title="빠른 링크 편집"
              value={{ quickLinks: content.quickLinks }}
              renderForm={(value, onChange) => <SchoolQuickLinksForm value={value} onChange={onChange} />}
            >
              <section>
                <div className="mb-6 border-b-2 border-black pb-3">
                  <p className="text-sm text-gray-500">Quick Links</p>
                  <h2 className="text-3xl font-black">지금 바로 이동</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(content.quickLinks ?? []).map(item => (
                    <SmartLink
                      key={`${item.href}-${item.title}`}
                      href={item.href}
                      className="border-2 border-black p-4 min-h-28 flex flex-col justify-between hover:bg-black hover:text-white transition"
                    >
                      <i className={`fas ${item.icon} text-xl`} />
                      <span>
                        <span className="font-black text-sm block break-keep">{item.title}</span>
                        <span className="text-xs opacity-70 mt-1 block break-keep">{item.description}</span>
                      </span>
                    </SmartLink>
                  ))}
                </div>
              </section>
            </SchoolEditableSection>

            <SchoolEditableSection
              sectionKey="campusGuides"
              title="학교 생활 가이드 편집"
              value={{ campusGuides: content.campusGuides }}
              renderForm={(value, onChange) => <SchoolGuideCardsForm value={value} onChange={onChange} />}
            >
              <section>
                <div className="mb-6 border-b-2 border-black pb-3">
                  <p className="text-sm text-gray-500">Campus Guide</p>
                  <h2 className="text-3xl font-black">학교 생활 가이드</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(content.campusGuides ?? []).map(item => (
                    <SmartLink key={item.title} href={item.href} className="border-2 border-black p-5 hover:bg-black hover:text-white transition min-h-44 flex flex-col">
                      <i className={`fas ${item.icon} text-2xl mb-4 block`} />
                      <span className="font-black text-lg">{item.title}</span>
                      <span className="text-sm mt-2 opacity-80 break-keep flex-1">{item.description}</span>
                      <span className="text-xs font-black mt-4">{item.action ?? '바로가기'}</span>
                    </SmartLink>
                  ))}
                </div>
              </section>
            </SchoolEditableSection>

            <section>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">Structure</p>
                <h2 className="text-3xl font-black">단과대학·학부·학과 탐색</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                {schools.map(school => (
                  <article key={school.id} className="border-2 border-black">
                    <div className="bg-black text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-black text-xl">{school.name}</h3>
                        <p className="text-xs text-gray-300 mt-1">{school.description}</p>
                      </div>
                      <span className="text-xs text-gray-300 shrink-0">
                        {(school.faculties ?? []).length}개 학부 · {(school.faculties ?? []).reduce((sum, faculty) => sum + (faculty.depts?.length ?? 0), 0)}개 학과
                      </span>
                    </div>
                    <div className="p-5 space-y-5">
                      {(school.faculties ?? []).map(faculty => (
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
                            {(faculty.depts ?? []).map(dept => (
                              <button
                                key={dept.id}
                                type="button"
                                onClick={() => handleDeptClick(dept.id, dept.name, school.name, faculty.name)}
                                className="text-xs border border-gray-300 px-2.5 py-1 font-medium hover:bg-black hover:text-white hover:border-black transition"
                              >
                                {dept.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <SchoolEditableSection
              sectionKey="facilities"
              title="캠퍼스 시설/위치 편집"
              value={{ facilities: content.facilities }}
              renderForm={(value, onChange) => <SchoolFacilitiesForm value={value} onChange={onChange} />}
            >
              <section id="facilities">
                <div className="mb-6 border-b-2 border-black pb-3">
                  <p className="text-sm text-gray-500">Facilities</p>
                  <h2 className="text-3xl font-black">캠퍼스 시설·위치 찾기</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-3 mb-5">
                  <input
                    value={facilityQuery}
                    onChange={e => setFacilityQuery(e.target.value)}
                    placeholder="시설명, 위치, 설명 검색"
                    className="border-2 border-black px-3 py-2 text-sm flex-1"
                  />
                  <select
                    value={facilityCategory}
                    onChange={e => setFacilityCategory(e.target.value)}
                    className="border-2 border-black px-3 py-2 text-sm bg-white md:w-48"
                  >
                    {categories.map(category => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFacilities.map(item => <FacilityCard key={`${item.name}-${item.location}`} item={item} />)}
                  {filteredFacilities.length === 0 && (
                    <p className="md:col-span-2 lg:col-span-3 border-2 border-black px-4 py-8 text-center text-sm text-gray-500">
                      네이버 지도 결과가 확인된 시설만 표시합니다. 필요한 세부 위치는 학부·학과 탐색 또는 대표 연락처에서 이어서 확인하세요.
                    </p>
                  )}
                </div>
              </section>
            </SchoolEditableSection>

            <SchoolEditableSection
              sectionKey="contact"
              title="위치 및 연락처 편집"
              value={{
                address: content.address,
                phone: content.phone,
                email: content.email,
                hours: content.hours,
                transitGuides: content.transitGuides,
              }}
              renderForm={(value, onChange) => <SchoolContactForm value={value} onChange={onChange} />}
            >
              <section id="contact">
                <div className="mb-6 border-b-2 border-black pb-3">
                  <p className="text-sm text-gray-500">Contact</p>
                  <h2 className="text-3xl font-black">위치 및 문의</h2>
                </div>
                <div className="grid lg:grid-cols-[1fr_360px] gap-6">
                  <div className="border-2 border-black">
                    <div className="h-64 bg-gray-100 border-b-2 border-black flex items-center justify-center">
                      <div className="text-center text-black px-6">
                        <i className="fas fa-map-location-dot text-4xl mb-3 block" />
                        <p className="font-black text-xl">학교 위치를 바로 확인</p>
                        <p className="text-sm text-gray-600 mt-2 break-keep">대표 주소는 지도 검색으로 연결하고, 세부 학과 위치는 학과정보 페이지에서 이어서 확인합니다.</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-black">찾아가는 방법</p>
                      <div className="mt-4 space-y-3">
                        {(content.transitGuides ?? []).map(guide => (
                          <p key={guide} className="border-l-2 border-black pl-3 text-sm text-gray-600 break-keep">
                            {guide}
                          </p>
                        ))}
                      </div>
                      <a
                        href={`https://map.naver.com/p/search/${encodeURIComponent(content.address ?? '')}`}
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
                      {[
                        { icon: 'fa-location-dot', label: '주소', value: content.address },
                        { icon: 'fa-phone', label: '대표전화', value: content.phone },
                        { icon: 'fa-envelope', label: '이메일', value: content.email },
                        { icon: 'fa-clock', label: '운영시간', value: content.hours },
                      ].map(contact => (
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
            </SchoolEditableSection>

            <SchoolEditableSection
              sectionKey="faqs"
              title="학교정보 FAQ 편집"
              value={{ faqs: content.faqs }}
              renderForm={(value, onChange) => <SchoolFaqsForm value={value} onChange={onChange} />}
            >
              <section id="faq">
                <div className="mb-6 border-b-2 border-black pb-3">
                  <p className="text-sm text-gray-500">FAQ</p>
                  <h2 className="text-3xl font-black">학교정보 FAQ</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {(content.faqs ?? []).map(faq => (
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
            </SchoolEditableSection>
          </>
        )}
      </main>
    </div>
  )
}

function InfoList({
  title,
  icon,
  items,
  empty,
  moreHref,
  moreLabel,
}: {
  title: string
  icon: string
  empty: string
  items: { id: number; title: string; meta: string; href: string }[]
  moreHref: string
  moreLabel: string
}) {
  return (
    <section className="border-2 border-black">
      <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
        <h3 className="font-black flex items-center gap-2">
          <i className={`fas ${icon} text-sm`} />
          {title}
        </h3>
        <Link to={moreHref} className="text-xs font-bold hover:underline">{moreLabel}</Link>
      </div>
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">{empty}</p>
        ) : items.map(item => (
          <Link key={`${item.id}-${item.title}`} to={item.href} className="block px-5 py-4 hover:bg-gray-50 transition">
            <p className="font-black text-sm break-keep">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1">{item.meta}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function FacilityCard({ item }: { item: SchoolFacilityItem }) {
  return (
    <article className="border-2 border-black p-5 min-h-52 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block border border-black px-2 py-0.5 text-xs font-bold mb-3">
            {item.category}
          </span>
          <h3 className="font-black text-lg break-keep">{item.name}</h3>
        </div>
        <i className="fas fa-location-dot text-xl text-gray-300" />
      </div>
      <p className="text-xs font-bold text-gray-500 mt-2">{item.location}</p>
      <p className="text-sm text-gray-600 mt-3 leading-relaxed break-keep flex-1">{item.description}</p>
      {item.mapUrl && (
        <a
          href={item.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-xs font-black hover:underline underline-offset-4"
        >
          네이버 지도에서 보기
          <i className="fas fa-arrow-up-right-from-square" />
        </a>
      )}
    </article>
  )
}
