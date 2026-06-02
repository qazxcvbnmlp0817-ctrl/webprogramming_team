import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MiniCalendar from '../components/MiniCalendar'
import { fetchUniversity } from '../api/universities'
import { fetchFacultyMainData } from '../api/school'
import { useDept } from '../context/DeptContext'
import { useDeptFetch } from '../hooks/useDeptFetch'
import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'
import AdminBanner from '../components/common/AdminBanner'

interface FacultyPageProps {
  embedded?: boolean
  facultyIdOverride?: number
}

export default function FacultyPage({ embedded = false, facultyIdOverride }: FacultyPageProps = {}) {
  const params = useParams<{ facultyId: string }>()
  const facultyId = facultyIdOverride != null ? String(facultyIdOverride) : params.facultyId
  const { selectedUniversityId, setFacultyName } = useDept()

  const facultyIdNum = facultyId ? Number(facultyId) : null

  const { data: univ } = useDeptFetch(fetchUniversity, selectedUniversityId)

  const [notices,   setNotices]   = useState<NoticeDto[]>([])
  const [posts,     setPosts]     = useState<PostDto[]>([])
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [today,     setToday]     = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!facultyIdNum) return
    let cancelled = false
    setLoading(true)
    fetchFacultyMainData(facultyIdNum)
      .then(data => {
        if (!cancelled) {
          setNotices(data.notices)
          setPosts(data.posts)
          setSchedules(data.schedules)
          setToday(data.today)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [facultyIdNum])

  const school  = univ?.schools.find(s => s.faculties.some(f => f.id === facultyIdNum))
  const faculty = school?.faculties.find(f => f.id === facultyIdNum)
  const facultyName = faculty?.name ?? '학부'

  useEffect(() => {
    if (faculty?.name) setFacultyName(faculty.name)
    return () => { if (!embedded) setFacultyName(null) }
  }, [faculty?.name])

  const base = `/school/faculty/${facultyId}`

  const body = (<>
      {/* 히어로 */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-xs mb-3">
            <Link to="/school/departments" className="hover:text-gray-300 transition">학부·학과 선택</Link>
            {school && <><span className="mx-1">›</span><span className="text-gray-400">{school.name}</span></>}
            {faculty && <><span className="mx-1">›</span><span>{faculty.name}</span></>}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-layer-group mr-3" />{facultyName} 정보 포털
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-6">{today}</p>
          <div className="flex justify-center flex-wrap gap-2">
            {schedules.filter(s => s.dday >= 0 && s.dday <= 14).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
                <i className="fas fa-clock text-xs" />
                {s.title}
                <strong>{s.dday === 0 ? 'D-Day' : `D-${s.dday}`}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      {!embedded && <AdminBanner scope="faculty" targetId={facultyIdNum ?? undefined} />}

      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />불러오는 중...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

              {/* 캘린더 */}
              <div className="h-full">
                <MiniCalendar schedules={schedules} />
              </div>

              {/* 다가오는 일정 */}
              <div className="border-2 border-black flex flex-col">
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-sm"><i className="fas fa-calendar-alt mr-2" />다가오는 일정</span>
                  <Link to={`${base}/schedule`} className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
                </div>
                <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {schedules.length === 0 ? (
                    <li className="px-4 py-8 text-center text-gray-400 text-sm">
                      <i className="fas fa-calendar block mb-2" />등록된 일정이 없습니다.
                    </li>
                  ) : schedules.map(s => (
                    <li key={s.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug line-clamp-1">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 bg-black text-white flex-shrink-0 whitespace-nowrap">
                        {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 최신 공지사항 */}
              <div className="border-2 border-black flex flex-col">
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-sm"><i className="fas fa-bullhorn mr-2" />최신 공지사항</span>
                  <Link to={`${base}/notice`} className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
                </div>
                <ul className="flex-1 divide-y divide-gray-100">
                  {notices.length === 0 ? (
                    <li className="px-4 py-8 text-center text-gray-400 text-sm">
                      <i className="fas fa-inbox block mb-2" />공지사항이 없습니다.
                    </li>
                  ) : notices.map(n => (
                    <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                      <Link to={`${base}/notice`} className="text-sm font-medium hover:underline leading-snug flex-1 min-w-0 line-clamp-1">
                        {n.title}
                      </Link>
                      <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{n.date}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 인기 게시글 */}
              <div className="border-2 border-black flex flex-col">
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-sm"><i className="fas fa-fire mr-2" />인기 게시글</span>
                  <Link to={`${base}/board`} className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
                </div>
                <ul className="flex-1 divide-y divide-gray-100">
                  {posts.length === 0 ? (
                    <li className="px-4 py-8 text-center text-gray-400 text-sm">
                      <i className="fas fa-inbox block mb-2" />게시글이 없습니다.
                    </li>
                  ) : posts.map(p => (
                    <li key={p.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                      <Link to={`${base}/board`} className="text-sm font-medium hover:underline leading-snug flex-1 min-w-0 line-clamp-1">
                        {p.title}
                      </Link>
                      <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                        <i className="fas fa-heart text-red-400 mr-0.5" />{p.likes}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 바로가기 버튼 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { to: `${base}/notice`,   icon: 'fa-bullhorn',     label: '공지사항' },
                { to: `${base}/board`,    icon: 'fa-comments',     label: '게시판' },
                { to: `${base}/schedule`, icon: 'fa-calendar-alt', label: '일정' },
                { to: '/school/departments', icon: 'fa-sitemap',   label: '학과 선택' },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center gap-3 py-6 border-2 border-black hover:bg-black hover:text-white transition font-medium text-sm"
                >
                  <i className={`fas ${icon} text-2xl`} />{label}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
  </>)

  if (embedded) return body

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />
      {body}
    </div>
  )
}
