import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import DepartmentHero from '../components/department/DepartmentHero'
import DepartmentGuideCards from '../components/department/DepartmentGuideCards'
import DepartmentSectionNav from '../components/department/DepartmentSectionNav'
import DepartmentOverview from '../components/department/DepartmentOverview'
import IntroHighlights from '../components/department/IntroHighlights'
import ProfessorSection from '../components/department/ProfessorSection'
import CurriculumSection from '../components/department/CurriculumSection'
import CareerSection from '../components/department/CareerSection'
import DepartmentRequirementSection from '../components/department/DepartmentRequirementSection'
import DepartmentCommunityTags from '../components/department/DepartmentCommunityTags'
import ContactSection from '../components/department/ContactSection'
import StudentLifeQuickLinks from '../components/department/StudentLifeQuickLinks'
import FaqSection from '../components/department/FaqSection'
import InfoReportModal from '../components/department/InfoReportModal'
import SourceBadge from '../components/department/SourceBadge'
import RoleActionBar from '../components/common/RoleActionBar'
import EditableSection from '../components/department/edit/EditableSection'
import HeroForm from '../components/department/edit/forms/HeroForm'
import ContactForm from '../components/department/edit/forms/ContactForm'
import GuideCardsForm from '../components/department/edit/forms/GuideCardsForm'
import IntroForm from '../components/department/edit/forms/IntroForm'
import CareersForm from '../components/department/edit/forms/CareersForm'
import FaqsForm from '../components/department/edit/forms/FaqsForm'
import StudentLifeForm from '../components/department/edit/forms/StudentLifeForm'
import ProfessorForm from '../components/department/edit/forms/ProfessorForm'
import RequirementsForm from '../components/department/edit/forms/RequirementsForm'
import CurriculumForm from '../components/department/edit/forms/CurriculumForm'
import CommunityTopicsForm from '../components/department/edit/forms/CommunityTopicsForm'
import { useCurrentRole } from '../hooks/useCurrentRole'
import { fetchDepartmentDetail } from '../api/departments'
import { useDept } from '../context/DeptContext'
import { getDepartmentExtra } from '../data/departmentExtras'
import { mergeExtra } from '../utils/deptContentMerge'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDeptOverviewCounts } from '../hooks/useDeptOverviewCounts'
import { fetchLectureOfferings, type LectureOfferingDto } from '../api/timetable'
import AdminBanner from '../components/common/AdminBanner'
import type { DeptPageContentDto } from '../types/department'

interface DepartmentPageProps {
  embedded?: boolean
  deptIdOverride?: number
}

export default function DepartmentPage({ embedded = false, deptIdOverride }: DepartmentPageProps = {}) {
  const { selectedDeptId, selectedUniversityName, selectedSchoolName } = useDept()
  const resolvedDeptId = deptIdOverride ?? selectedDeptId
  const { data: dept, loading, error } = useDeptFetch(fetchDepartmentDetail, resolvedDeptId)
  const [reportOpen, setReportOpen] = useState(false)
  const role = useCurrentRole()
  const liveCounts = useDeptOverviewCounts(resolvedDeptId)
  const [lectureOfferings, setLectureOfferings] = useState<LectureOfferingDto[]>([])

  useEffect(() => {
    fetchLectureOfferings()
      .then(setLectureOfferings)
      .catch(err => console.error('[DepartmentPage] 개설강좌 로드 실패:', err))
  }, [])

  const Frame = ({ children }: { children: ReactNode }) =>
    embedded ? <>{children}</> : (
      <div className="bg-white text-black font-sans min-h-screen">
        <Navbar />
        <div className="pt-14" />
        {children}
      </div>
    )

  if (loading) {
    return (
      <Frame>
        <div className="py-28 text-center text-gray-500">
          <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />
          불러오는 중...
        </div>
      </Frame>
    )
  }

  if (error || !dept) {
    return (
      <Frame>
        <div className="max-w-xl mx-auto px-4 py-28 text-center">
          <i className="fas fa-triangle-exclamation text-4xl text-gray-400 mb-4 block" />
          <h1 className="text-2xl font-black">학과 정보를 불러올 수 없습니다</h1>
          <p className="text-gray-500 text-sm mt-3">
            {error ?? '표시할 학과 정보가 없습니다.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 border-2 border-black px-5 py-2 font-bold hover:bg-black hover:text-white transition"
          >
            다시 시도
          </button>
        </div>
      </Frame>
    )
  }

  const extra = mergeExtra(dept.pageContent, getDepartmentExtra(dept.id, dept.name))
  const curriculumOverride = dept.pageContent?.curriculumItems
  const effectiveCurriculum = curriculumOverride && curriculumOverride.length > 0
    ? curriculumOverride
    : dept.curriculum

  const hubFeatures = [
    { title: '학과 소개 읽기', description: '공식 소개와 핵심 키워드로 학과 방향을 빠르게 파악합니다.' },
    { title: '교육과정 훑기', description: '학년별 과목과 전공 분류를 필터로 확인합니다.' },
    { title: '진로 연결하기', description: '직무, 준비 항목, 포트폴리오 예시를 함께 봅니다.' },
    { title: '졸업·자격증 동선', description: '학점, 졸업작품, 자격증 준비 흐름을 공지와 문의 메뉴로 연결합니다.' },
  ]

  const heroPayload = (): DeptPageContentDto => ({ slogan: extra.slogan, keywords: extra.keywords })
  const contactPayload = (): DeptPageContentDto => ({
    name: dept.name,
    description: dept.description,
    address: dept.address,
    phone: dept.phone,
    email: dept.email,
    hours: dept.hours,
    homepage: extra.homepage,
  })

  return (
    <Frame>
      <main>
        <EditableSection
          sectionKey="hero"
          title="히어로 영역 편집 (슬로건 / 키워드)"
          value={heroPayload()}
          renderForm={(v, onChange) => <HeroForm value={v} onChange={onChange} />}
        >
          <DepartmentHero
            dept={dept}
            extra={extra}
            universityName={selectedUniversityName}
            schoolName={selectedSchoolName}
          />
        </EditableSection>

        {!embedded && <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />}
        {!embedded && <RoleActionBar role={role} scope="department" targetId={resolvedDeptId ?? undefined} />}
        <DepartmentSectionNav />

        <EditableSection
          sectionKey="guideCards"
          title="가이드 카드 편집"
          value={{ guideCards: extra.guideCards }}
          renderForm={(v, onChange) => <GuideCardsForm value={v} onChange={onChange} />}
        >
          <DepartmentGuideCards guideCards={extra.guideCards} />
        </EditableSection>

        <DepartmentOverview
          dept={dept}
          extra={extra}
          liveCounts={liveCounts}
          curriculumCount={effectiveCurriculum.length}
        />

        <section id="intro" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <EditableSection
              sectionKey="intro"
              title="소개 하이라이트 편집"
              value={{ introHighlights: extra.introHighlights ?? [], description: dept.description }}
              renderForm={(v, onChange) => <IntroForm value={v} onChange={onChange} />}
            >
              <div>
                <div className="mb-6 border-b-2 border-black pb-3">
                  <p className="text-sm text-gray-500">About</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-3xl font-black">학과 소개</h2>
                    <SourceBadge type="official" />
                  </div>
                </div>
                <p className="text-gray-700 leading-8 whitespace-pre-line break-keep">
                  {dept.description || '등록된 학과 소개 정보가 없습니다.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {extra.keywords.map(keyword => (
                    <span key={keyword} className="border-2 border-black px-3 py-1 text-xs font-bold">
                      {keyword}
                    </span>
                  ))}
                </div>
                <IntroHighlights highlights={extra.introHighlights ?? []} />
              </div>
            </EditableSection>

            <div className="space-y-5">
              <div className="border-2 border-black">
                <div className="h-56 bg-gray-100 border-b-2 border-black flex items-center justify-center">
                  <div className="text-center text-black px-6">
                    <i className="fas fa-diagram-project text-4xl mb-3 block" />
                    <p className="font-black text-xl">학과 허브 구성</p>
                    <p className="text-sm text-gray-600 mt-2">흩어진 학과 정보를 한 화면에서 탐색</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold">오늘 이 페이지에서 할 수 있는 것</p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    공식 정보는 그대로 보고, 학생 가이드는 수강·진로·졸업 준비에 맞게 활용하세요.
                  </p>
                  <div className="mt-4 space-y-3">
                    {hubFeatures.map(feature => (
                      <div key={feature.title} className="border-l-2 border-black pl-3">
                        <p className="text-sm font-black">{feature.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(() => {
          const liveEnhancements = dept.pageContent?.professorEnhancements ?? []
          const mergedProfs = dept.professors.map(p => {
            const enh = liveEnhancements.find(e => e.name && e.name.trim() === p.name.trim())
            const autoCourses = Array.from(new Set(
              lectureOfferings
                .filter(o => o.professorName.split(',').map(s => s.trim()).includes(p.name.trim()))
                .map(o => o.courseName)
            ))
            const hasManualCourses = enh?.courses && enh.courses.length > 0
            return {
              id: p.id,
              name: p.name,
              specialty: p.specialty ?? '',
              email: p.email ?? '',
              lab: enh?.lab ?? '',
              courses: hasManualCourses ? enh!.courses : autoCourses,
            }
          })
          return (
            <EditableSection
              sectionKey="professors"
              title="교수진 편집"
              value={{ professors: mergedProfs }}
              renderForm={(v, onChange) => <ProfessorForm value={v} onChange={onChange} />}
            >
              <ProfessorSection professors={dept.professors} enhancements={liveEnhancements} deptId={resolvedDeptId} />
            </EditableSection>
          )
        })()}

        <EditableSection
          sectionKey="curriculumItems"
          title="2026 교육과정 편집"
          value={{ curriculumItems: curriculumOverride ?? dept.curriculum }}
          renderForm={(v, onChange) => <CurriculumForm value={v} onChange={onChange} />}
        >
          <CurriculumSection curriculum={effectiveCurriculum} />
        </EditableSection>

        <EditableSection
          sectionKey="careers"
          title="졸업 후 진로 편집"
          value={{ careers: extra.careers }}
          renderForm={(v, onChange) => <CareersForm value={v} onChange={onChange} />}
        >
          <CareerSection careers={extra.careers} />
        </EditableSection>

        <EditableSection
          sectionKey="requirements"
          title="졸업 요건 편집"
          value={{ requirements: extra.requirements }}
          renderForm={(v, onChange) => <RequirementsForm value={v} onChange={onChange} />}
        >
          <DepartmentRequirementSection requirements={extra.requirements} />
        </EditableSection>

        <EditableSection
          sectionKey="communityTopics"
          title="학과 커뮤니티 주제 편집"
          value={{ communityTopics: extra.communityTopics }}
          renderForm={(v, onChange) => <CommunityTopicsForm value={v} onChange={onChange} />}
        >
          <DepartmentCommunityTags topics={extra.communityTopics} />
        </EditableSection>

        <EditableSection
          sectionKey="studentLife"
          title="학과 생활 빠른링크 편집"
          value={{ studentLife: extra.studentLife }}
          renderForm={(v, onChange) => <StudentLifeForm value={v} onChange={onChange} />}
        >
          <StudentLifeQuickLinks studentLife={extra.studentLife} />
        </EditableSection>

        <EditableSection
          sectionKey="contact"
          title="연락처 편집"
          value={contactPayload()}
          renderForm={(v, onChange) => <ContactForm value={v} onChange={onChange} />}
        >
          <ContactSection dept={dept} />
        </EditableSection>

        <EditableSection
          sectionKey="faqs"
          title="FAQ 편집"
          value={{ faqs: extra.faqs }}
          renderForm={(v, onChange) => <FaqsForm value={v} onChange={onChange} />}
        >
          <FaqSection faqs={extra.faqs} onReportClick={embedded ? () => {} : () => setReportOpen(true)} />
        </EditableSection>
      </main>
      {!embedded && <InfoReportModal open={reportOpen} onClose={() => setReportOpen(false)} />}
    </Frame>
  )
}
