import Navbar from '../components/Navbar'

const PROFESSORS = [
  { name: '김○○ 교수', specialty: '전공: 인공지능 / 머신러닝', email: 'professor1@mokpo.ac.kr' },
  { name: '이○○ 교수', specialty: '전공: 데이터베이스 / 빅데이터', email: 'professor2@mokpo.ac.kr' },
  { name: '박○○ 교수', specialty: '전공: 네트워크 / 보안', email: 'professor3@mokpo.ac.kr' },
  { name: '최○○ 교수', specialty: '전공: 소프트웨어공학', email: 'professor4@mokpo.ac.kr' },
  { name: '정○○ 교수', specialty: '전공: 컴퓨터 비전 / 영상처리', email: 'professor5@mokpo.ac.kr' },
  { name: '한○○ 교수', specialty: '전공: 알고리즘 / 이론컴퓨팅', email: 'professor6@mokpo.ac.kr' },
]

const CURRICULUM = [
  { name: '자료구조',       year: '1학년', required: true,  credit: 3 },
  { name: '알고리즘 분석',  year: '2학년', required: true,  credit: 3 },
  { name: '운영체제',       year: '2학년', required: true,  credit: 3 },
  { name: '데이터베이스',   year: '2학년', required: true,  credit: 3 },
  { name: '웹 프로그래밍',  year: '3학년', required: false, credit: 3 },
  { name: '인공지능 개론',  year: '3학년', required: false, credit: 3 },
  { name: '소프트웨어공학', year: '3학년', required: true,  credit: 3 },
  { name: '졸업프로젝트',   year: '4학년', required: true,  credit: 4 },
]

export default function DepartmentPage() {
  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <main>
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 pb-3 border-b-2 border-black">학과 소개</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                컴퓨터공학과는 소프트웨어·하드웨어·네트워크 전반의 핵심 역량을 갖춘 창의적 인재를 양성하는 학과입니다.
                이론과 실무를 균형 있게 교육하여 산업 현장에서 즉시 활약할 수 있는 전문가를 배출합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                본 학과는 알고리즘·운영체제·데이터베이스·인공지능·웹 프로그래밍 등 폭넓은 교과과정을 운영하며,
                산학협력 프로젝트·교내 해커톤·연구실 인턴십 등 다양한 비교과 활동을 통해 학생들의 실전 역량을 강화합니다.
              </p>
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
            {PROFESSORS.map(prof => (
              <div key={prof.email} className="border-2 border-black p-6 flex gap-4 items-start hover:bg-gray-50 transition">
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
                {CURRICULUM.map(c => (
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
                { icon: 'fa-location-dot', label: '주소',     value: '전남 목포시 영산로 1666\n국립목포대학교 공과대학 ○○호' },
                { icon: 'fa-phone',        label: '전화',     value: '061-450-XXXX' },
                { icon: 'fa-envelope',     label: '이메일',   value: 'cs-dept@mokpo.ac.kr' },
                { icon: 'fa-clock',        label: '운영시간', value: '평일 09:00 ~ 18:00\n(점심 12:00 ~ 13:00)' },
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
    </div>
  )
}
