import { useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchUniversity } from '../api/universities'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import type { UniversityDto } from '../types/university'
import AdminBanner from '../components/common/AdminBanner'

export default function SchoolDepartmentsPage() {
  const { selectedUniversityId, setDept } = useDept()
  const navigate = useNavigate()

  const { data: univ, loading } = useDeptFetch(fetchUniversity, selectedUniversityId)

  const handleDeptClick = useCallback((
    deptId: number,
    deptName: string,
    schoolName: string,
    u: UniversityDto,
  ) => {
    setDept({
      selectedDeptId: deptId,
      selectedDeptName: deptName,
      selectedUniversityId: u.id,
      selectedUniversityName: u.name,
      selectedSchoolName: schoolName,
    })
    navigate('/dept/home')
  }, [setDept, navigate])

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      {/* 페이지 헤더 */}
      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">
              <i className="fas fa-sitemap mr-2" />학부·학과 선택
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              학과를 클릭하면 해당 학과 포털로 바로 이동합니다
            </p>
          </div>
          {univ && (
            <span className="hidden md:block text-xs text-gray-500 pb-0.5">
              {univ.schools.length}개 단과대학 · {univ.totalDeptCount}개 학과
            </span>
          )}
        </div>
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading || !univ ? (
          <div className="py-24 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {univ.schools.map(school => (
              <div key={school.id} className="border-2 border-black flex flex-col">

                {/* 단과대학 헤더 */}
                <div className="bg-black text-white px-4 py-3">
                  <h2 className="font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-building text-xs opacity-70" />
                    {school.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {school.faculties.length}개 학부 ·{' '}
                    {school.faculties.reduce((s, f) => s + f.depts.length, 0)}개 학과
                  </p>
                </div>

                {/* 학부 목록 */}
                <div className="flex-1 divide-y divide-gray-100">
                  {school.faculties.map(faculty => (
                    <div key={faculty.id} className="px-4 py-3">

                      {/* 학부명 — 클릭 시 학부 상세 페이지로 이동 */}
                      <Link
                        to={`/school/faculty/${faculty.id}`}
                        className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 hover:text-black transition-colors group"
                      >
                        <i className="fas fa-layer-group text-[9px]" />
                        {faculty.name}
                        <i className="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-60 transition-opacity" />
                      </Link>

                      {/* 학과 태그 */}
                      <div className="flex flex-wrap gap-1.5">
                        {faculty.depts.map(dept => (
                          <button
                            key={dept.id}
                            onClick={() => handleDeptClick(dept.id, dept.name, school.name, univ)}
                            className="text-xs border border-gray-300 px-2.5 py-1 font-medium
                                       hover:border-black hover:bg-black hover:text-white
                                       transition-all duration-100 cursor-pointer"
                          >
                            {dept.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
