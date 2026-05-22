import { useState } from 'react'
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import DepartmentHero from '../components/department/DepartmentHero'
import DepartmentGuideCards from '../components/department/DepartmentGuideCards'
import DepartmentSectionNav from '../components/department/DepartmentSectionNav'
import DepartmentCompletenessCard from '../components/department/DepartmentCompletenessCard'
import DepartmentOverview from '../components/department/DepartmentOverview'
import ProfessorSection from '../components/department/ProfessorSection'
import CurriculumSection from '../components/department/CurriculumSection'
import CareerSection from '../components/department/CareerSection'
import DepartmentRequirementSection from '../components/department/DepartmentRequirementSection'
import DepartmentCommunityTags from '../components/department/DepartmentCommunityTags'
import FacilitySection from '../components/department/FacilitySection'
import ContactSection from '../components/department/ContactSection'
import FaqSection from '../components/department/FaqSection'
import InfoReportModal from '../components/department/InfoReportModal'
import SourceBadge from '../components/department/SourceBadge'
import RoleActionBar from '../components/common/RoleActionBar'
import { useCurrentRole } from '../hooks/useCurrentRole'
import { fetchDepartmentDetail } from '../api/departments'
import { useDept } from '../context/DeptContext'
import { getDepartmentExtra } from '../data/departmentExtras'
import { useDeptFetch } from '../hooks/useDeptFetch'
import AdminBanner from '../components/common/AdminBanner'

interface DepartmentPageProps {
  embedded?: boolean
}

export default function DepartmentPage({ embedded = false }: DepartmentPageProps = {}) {
  const { selectedDeptId, selectedUniversityName, selectedSchoolName } = useDept()
  const { data: dept, loading, error } = useDeptFetch(fetchDepartmentDetail, selectedDeptId)
  const [reportOpen, setReportOpen] = useState(false)
  const role = useCurrentRole()

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
            {error ?? '공식 페이지에서 확인 가능한 정보가 없습니다.'}
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

  const extra = getDepartmentExtra(dept.id, dept.name)
  const hubFeatures = [
    { title: '학과 소개 읽기', description: '공식 소개와 핵심 키워드로 학과 방향을 빠르게 파악합니다.' },
    { title: '교육과정 훑기', description: '학년별 과목과 전공 분류를 필터로 확인합니다.' },
    { title: '진로 연결하기', description: '직무, 준비 항목, 포트폴리오 예시를 함께 봅니다.' },
    { title: '졸업·자격증 동선', description: '학점, 졸업작품, 자격증 기준을 공식 공지와 문의 메뉴로 연결합니다.' },
  ]

  return (
    <Frame>
      <main>
        <DepartmentHero
          dept={dept}
          extra={extra}
          universityName={selectedUniversityName}
          schoolName={selectedSchoolName}
        />
        {!embedded && <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />}
        {!embedded && <RoleActionBar role={role} scope="department" />}
        <DepartmentSectionNav />
        <DepartmentGuideCards guideCards={extra.guideCards} />
        <DepartmentOverview dept={dept} extra={extra} />

        <section id="intro" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-32">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div>
              <div className="mb-6 border-b-2 border-black pb-3">
                <p className="text-sm text-gray-500">About</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-3xl font-black">학과 소개</h2>
                  <SourceBadge type="official" />
                </div>
              </div>
              <p className="text-gray-700 leading-8 whitespace-pre-line break-keep">
                {dept.description || '공식 페이지에서 확인 가능한 학과 소개 정보가 없습니다.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {extra.keywords.map(keyword => (
                  <span key={keyword} className="border-2 border-black px-3 py-1 text-xs font-bold">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <DepartmentCompletenessCard dept={dept} extra={extra} />
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

        <ProfessorSection professors={dept.professors} enhancements={extra.professorEnhancements} />
        <CurriculumSection curriculum={dept.curriculum} />
        <CareerSection careers={extra.careers} />
        <DepartmentRequirementSection requirements={extra.requirements} />
        <DepartmentCommunityTags />
        <FacilitySection facilities={extra.facilities} />
        <ContactSection dept={dept} studentLife={extra.studentLife} />
        <FaqSection faqs={extra.faqs} onReportClick={embedded ? () => {} : () => setReportOpen(true)} />
      </main>
      {!embedded && <InfoReportModal open={reportOpen} onClose={() => setReportOpen(false)} />}
    </Frame>
  )
}
