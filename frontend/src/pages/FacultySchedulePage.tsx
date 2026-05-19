import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import Sidebar from '../components/Sidebar'
import { fetchUniversity } from '../api/universities'
import { fetchFacultySchedules } from '../api/school'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import { groupByMonth } from '../utils/scheduleUtils'

const SCHEDULE_TABS = ['전체', '학사', '행사', '시험', '기타']

export default function FacultySchedulePage() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const { selectedUniversityId } = useDept()
  const [active, setActive] = useState('전체')

  const facultyIdNum = facultyId ? Number(facultyId) : null

  const { data: univ }      = useDeptFetch(fetchUniversity, selectedUniversityId)
  const { data, loading }   = useDeptFetch(fetchFacultySchedules, facultyIdNum)

  const schedules = data ?? []
  const filtered  = active === '전체' ? schedules : schedules.filter(s => s.category === active)
  const grouped   = useMemo(() => groupByMonth(filtered), [filtered])

  const school  = univ?.schools.find(s => s.faculties.some(f => f.id === facultyIdNum))
  const faculty = school?.faculties.find(f => f.id === facultyIdNum)

  const categoryCounts = SCHEDULE_TABS.map(label => ({
    label,
    count: label === '전체' ? schedules.length : schedules.filter(s => s.category === label).length,
  }))

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-500 text-xs mb-2">
            <Link to={`/school/faculty/${facultyId}`} className="hover:text-gray-300 transition">
              {faculty?.name ?? '학부'} 홈
            </Link>
            <span className="mx-1">›</span>
            <span>일정</span>
          </p>
          <h1 className="text-2xl font-bold">
            <i className="fas fa-calendar-alt mr-2" />일정
          </h1>
          {faculty && (
            <p className="text-gray-400 text-sm mt-1">{faculty.name} 일정</p>
          )}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : (
          <>
            <FilterTabs tabs={SCHEDULE_TABS} active={active} onChange={setActive} />

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <i className="fas fa-calendar text-3xl mb-3 block" />등록된 일정이 없습니다.
                  </div>
                ) : Array.from(grouped.entries()).map(([month, items]) => (
                  <div key={month}>
                    <div className="text-base font-bold py-3 px-1 mt-4 border-b-2 border-black flex items-center gap-2">
                      <i className="fas fa-caret-right" />
                      {month.slice(0, 4)}년 {month.slice(5, 7)}월
                    </div>
                    {items.map(s => (
                      <div key={s.id} className="flex items-start gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition">
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-2xl font-bold leading-none">{s.date.slice(8, 10)}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.date.slice(5, 7)}월</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold leading-snug">{s.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 bg-black text-white">
                              {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                            </span>
                            <span className="text-xs border border-black px-1.5 py-0.5 font-medium">{s.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <Sidebar
                categoryWidget={{ title: '이번 달 일정', items: categoryCounts, onSelect: setActive }}
                recentWidget={{
                  title: 'D-Day 임박 TOP 5',
                  items: schedules.slice(0, 5).map(s => ({
                    title: s.title,
                    sub: `${s.dday === 0 ? 'D-Day' : `D-${s.dday}`}  ${s.date}`,
                  })),
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
