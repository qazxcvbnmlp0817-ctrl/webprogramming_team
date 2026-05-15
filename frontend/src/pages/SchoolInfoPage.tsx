import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchSchoolInfo } from '../api/school'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { useDept } from '../context/DeptContext'

export default function SchoolInfoPage() {
  const { selectedUniversityId, selectedUniversityName } = useDept()

  const { data: univ, loading } = useDeptFetch(fetchSchoolInfo, selectedUniversityId)

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link to={`/universities/${selectedUniversityId}`} className="text-gray-400 hover:text-white transition text-sm">
            <i className="fas fa-arrow-left mr-1" />{selectedUniversityName ?? '학교 홈'}
          </Link>
          <span className="text-gray-600">›</span>
          <h1 className="text-xl font-bold"><i className="fas fa-university mr-2" />학교 정보</h1>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {loading || !univ ? (
          <div className="py-16 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : (
          <>
            {/* 대학 소개 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-black">
                <i className="fas fa-university mr-2" />{univ.name}
              </h2>
              <p className="text-gray-700 leading-relaxed">{univ.description}</p>
              <div className="flex gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-sm font-medium">
                  <i className="fas fa-building" />{univ.schools.length}개 단과대학
                </span>
                <span className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-sm font-medium">
                  <i className="fas fa-door-open" />{univ.totalDeptCount}개 학과
                </span>
              </div>
            </section>

            {/* 단과대학 및 학과 구성 */}
            <section>
              <h2 className="text-xl font-bold mb-6 pb-3 border-b-2 border-black">
                <i className="fas fa-sitemap mr-2" />단과대학·학과 구성
              </h2>
              <div className="space-y-6">
                {univ.schools.map(school => (
                  <div key={school.id} className="border-2 border-black">
                    <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
                      <span className="font-bold">{school.name}</span>
                      <span className="text-xs text-gray-400">
                        {school.faculties.length}개 학부 · {school.faculties.reduce((s, f) => s + f.depts.length, 0)}개 학과
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      {school.faculties.map(faculty => (
                        <div key={faculty.id}>
                          <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                            <i className="fas fa-layer-group text-xs" />{faculty.name}
                          </p>
                          <div className="flex flex-wrap gap-2 pl-4">
                            {faculty.depts.map(dept => (
                              <span key={dept.id}
                                className="text-sm border border-gray-300 px-3 py-1 hover:border-black transition">
                                {dept.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 연락 및 위치 정보 */}
            <section>
              <h2 className="text-xl font-bold mb-6 pb-3 border-b-2 border-black">
                <i className="fas fa-map-marker-alt mr-2" />위치 및 연락정보
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-56 bg-gray-100 border-2 border-black flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <i className="fas fa-map-location-dot text-4xl mb-2 block" />
                    <span className="text-sm">지도 영역 (API 연동 예정)</span>
                  </div>
                </div>
                <div className="border-2 border-black p-5 space-y-4">
                  {[
                    { icon: 'fa-location-dot', label: '주소',     value: '전남 목포시 영산로 1666 국립목포대학교' },
                    { icon: 'fa-phone',        label: '대표전화', value: '061-450-2114' },
                    { icon: 'fa-envelope',     label: '이메일',   value: 'webmaster@mokpo.ac.kr' },
                    { icon: 'fa-clock',        label: '운영시간', value: '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <i className={`fas ${icon} text-base mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="font-semibold text-xs text-gray-500 mb-0.5">{label}</p>
                        <p className="text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
