import Navbar from '../components/Navbar'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { fetchDepartmentDetail } from '../api/departments'

export default function DepartmentPage() {
  const { selectedDeptId } = useDept()
  const { data: dept, loading } = useDeptFetch(fetchDepartmentDetail, selectedDeptId)

  const professors = dept?.professors ?? []
  const curriculum = dept?.curriculum ?? []

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      {loading || !dept ? (
        <div className="py-24 text-center text-gray-400">
          <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
        </div>
      ) : (
        <main>
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 pb-3 border-b-2 border-black">학과 소개</h2>
                <p className="text-gray-700 leading-relaxed">{dept.description}</p>
              </div>
              <div className="lg:w-96 w-full h-64 bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
                <div className="text-center text-gray-400">
                  <i className="fas fa-image text-4xl mb-2 block" />
                  <span className="text-sm">학과 사진</span>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200" />

          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">교수진</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professors.map(prof => (
                <div key={prof.id} className="border-2 border-black p-6 flex gap-4 items-start hover:bg-gray-50 transition">
                  <div className="w-16 h-16 bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0 rounded-full">
                    <i className="fas fa-user text-2xl text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{prof.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{prof.specialty}</p>
                    <p className="text-xs text-gray-400 mt-1">{prof.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-gray-200" />

          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">교육과정</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-black text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="px-4 py-3 text-left font-medium border-r border-gray-700">과목명</th>
                    <th className="px-4 py-3 text-center font-medium border-r border-gray-700">학년</th>
                    <th className="px-4 py-3 text-center font-medium border-r border-gray-700">구분</th>
                    <th className="px-4 py-3 text-center font-medium">학점</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {curriculum.map(c => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium border-r border-gray-200">{c.name}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-200">{c.year}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-200">
                        {c.required
                          ? <span className="border border-black px-1.5 py-0.5 text-xs font-medium">필수</span>
                          : <span className="text-gray-500 text-xs">선택</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center">{c.credit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="border-t border-gray-200" />

          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">위치 및 연락정보</h2>
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:flex-1 h-72 bg-gray-200 border-2 border-black flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <i className="fas fa-map-location-dot text-4xl mb-2 block" />
                  <span className="text-sm">지도 영역 (API 연동 예정)</span>
                </div>
              </div>
              <div className="lg:w-80 flex flex-col gap-4 justify-center">
                {[
                  { icon: 'fa-location-dot', label: '주소',     value: dept.address },
                  { icon: 'fa-phone',        label: '전화',     value: dept.phone },
                  { icon: 'fa-envelope',     label: '이메일',   value: dept.email },
                  { icon: 'fa-clock',        label: '운영시간', value: dept.hours },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <i className={`fas ${icon} text-lg mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{label}</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
