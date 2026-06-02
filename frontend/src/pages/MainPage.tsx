import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDept } from '../context/DeptContext'
import { fetchMainData } from '../api/universities'
import Navbar from '../components/Navbar'
import MiniCalendar from '../components/MiniCalendar'
import type { CalItem } from '../components/MiniCalendar'
import type { NoticeDto } from '../types/notice'
import type { PostDto } from '../types/post'
import type { ScheduleDto } from '../types/schedule'
import AdminBanner from '../components/common/AdminBanner'
import { isLoggedIn } from '../utils/accessCheck'
import { getAuthItem } from '../utils/authStorage'
import { loadSchedules, type LocalSchedule } from '../utils/localSchedule'
import { fetchSchedules, fetchFacultySchedules, fetchUnivSchedules } from '../api/schedules'
import { fetchStudentDeptEvents, type DeptCourseEventDto } from '../api/classSchedules'

const NOTICE_TABS = ['전체', '학사', '장학', '행사', '취업']

interface UpcomingItem { id: string | number; title: string; date: string; dday: number }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calcDday(date: string): number {
  const diff = new Date(date).setHours(0, 0, 0, 0) - new Date(todayStr()).setHours(0, 0, 0, 0)
  return Math.round(diff / 86400000)
}

export default function MainPage() {
  const { selectedDeptId, selectedDeptName } = useDept()
  const navigate = useNavigate()

  const username   = sessionStorage.getItem('username') ?? 'guest'
  const FILTER_KEY = `mainNoticeFilter_${username}`

  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn())
  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    window.addEventListener('loginChanged', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('loginChanged', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const [notices,      setNotices]      = useState<NoticeDto[]>([])
  const [posts,        setPosts]        = useState<PostDto[]>([])
  const [deptSchedules, setDeptSchedules] = useState<ScheduleDto[]>([])
  const [today,        setToday]        = useState('')
  const [noticeFilter, setNoticeFilter] = useState<string>(
    () => localStorage.getItem(FILTER_KEY) ?? '전체'
  )
  const [personalSchedules, setPersonalSchedules]   = useState<LocalSchedule[]>([])
  const [affiliatedSchedules, setAffiliatedSchedules] = useState<ScheduleDto[]>([])

  useEffect(() => {
    setNoticeFilter(localStorage.getItem(FILTER_KEY) ?? '전체')
  }, [FILTER_KEY])

  useEffect(() => {
    if (!selectedDeptId) return
    let cancelled = false
    fetchMainData(selectedDeptId)
      .then(data => {
        if (!cancelled) {
          setNotices(data.notices)
          setPosts(data.posts)
          setDeptSchedules(data.schedules)
          setToday(data.today)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [selectedDeptId])

  // 로그인 시 개인 일정 + 소속 학교·학부·학과 일정 로드
  useEffect(() => {
    if (!loggedIn) return
    let cancelled = false
    setPersonalSchedules(loadSchedules())

    const deptId    = getAuthItem('deptId')
    const facultyId = getAuthItem('facultyId')
    const univId    = getAuthItem('universityId')

    const fetches: Promise<ScheduleDto[]>[] = []

    // 본인 학과 일정 (auth에서 deptId를 못 가져오면 현재 보는 학과로 폴백)
    const resolvedDeptId = deptId ?? (selectedDeptId ? String(selectedDeptId) : null)
    if (resolvedDeptId) fetches.push(fetchSchedules(Number(resolvedDeptId)))
    if (facultyId)      fetches.push(fetchFacultySchedules(Number(facultyId)))
    if (univId)         fetches.push(fetchUnivSchedules(Number(univId)))

    // 교수 등록 학과 이벤트 (시험·과제 등)
    if (resolvedDeptId) {
      fetches.push(
        fetchStudentDeptEvents(resolvedDeptId).then((evs: DeptCourseEventDto[]) =>
          evs.map(ev => ({
            id: ev.id,
            title: ev.courseName ? `[${ev.courseName}] ${ev.title}` : ev.title,
            date: ev.date,
            dday: ev.dday,
            category: ev.category,
          } as ScheduleDto))
        )
      )
    }

    Promise.all(fetches)
      .then(results => {
        if (!cancelled) {
          const seen = new Set<string>()
          const merged: ScheduleDto[] = []
          results.flat().forEach(s => {
            const key = `${s.title}|${s.date}`
            if (!seen.has(key)) { seen.add(key); merged.push(s) }
          })
          setAffiliatedSchedules(merged)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [loggedIn, selectedDeptId])

  const handleFilterChange = (tab: string) => {
    setNoticeFilter(tab)
    localStorage.setItem(FILTER_KEY, tab)
  }

  // 백엔드가 deptId 기준으로 이미 필터링해서 반환하므로
  // 프론트엔드는 로그인 여부만 판단한다.
  function canViewNotice(n: NoticeDto): boolean {
    if (loggedIn) return true
    return n.isPublicToOutsiders === true
  }

  function canViewPost(): boolean {
    return loggedIn
  }

  // 캘린더용 CalItem 목록
  const calendarItems = useMemo<CalItem[]>(() => {
    if (loggedIn) {
      const personal: CalItem[] = personalSchedules.map(s => ({
        id: s.id, title: s.title, date: s.date, category: s.category,
      }))
      // affiliatedSchedules + deptSchedules 통합
      const allAffiliated: CalItem[] = [
        ...affiliatedSchedules,
        ...deptSchedules,
      ].map(s => ({ id: `aff-${s.id}-${s.date}`, title: s.title, date: s.date, category: s.category }))

      const seen = new Set(personal.map(p => `${p.date}|${p.title}`))
      const seenAffiliated = new Set<string>()
      const deduped = allAffiliated.filter(a => {
        const key = `${a.date}|${a.title}`
        if (seen.has(key) || seenAffiliated.has(key)) return false
        seenAffiliated.add(key)
        return true
      })
      return [...personal, ...deduped]
    }
    return deptSchedules.map(s => ({ id: s.id, title: s.title, date: s.date, category: s.category }))
  }, [loggedIn, personalSchedules, affiliatedSchedules, deptSchedules])

  // 다가오는 일정 목록 (공통 형태로 정규화)
  const upcomingItems = useMemo<UpcomingItem[]>(() => {
    if (loggedIn) {
      const t = todayStr()
      const personal = personalSchedules
        .filter(s => s.date >= t)
        .map(s => ({ id: s.id, title: s.title, date: s.date, dday: calcDday(s.date) }))

      // affiliatedSchedules + deptSchedules: dday 기준 대신 날짜 기준으로 필터
      const allAffiliated = [...affiliatedSchedules, ...deptSchedules]
        .filter(s => s.date >= t)
        .map(s => ({ id: `aff-${s.id}-${s.date}`, title: s.title, date: s.date, dday: calcDday(s.date) }))

      const seen = new Set(personal.map(p => `${p.date}|${p.title}`))
      const seenAffiliated = new Set<string>()
      const dedupedAffiliated = allAffiliated.filter(a => {
        const key = `${a.date}|${a.title}`
        if (seen.has(key) || seenAffiliated.has(key)) return false
        seenAffiliated.add(key)
        return true
      })

      return [...personal, ...dedupedAffiliated]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8)
    }
    return deptSchedules.map(s => ({ id: s.id, title: s.title, date: s.date, dday: s.dday })).slice(0, 8)
  }, [loggedIn, personalSchedules, affiliatedSchedules, deptSchedules])

  // 헤더 D-Day 뱃지 (앞으로 14일 이내)
  const ddayBadges = useMemo(() => {
    return upcomingItems.filter(s => s.dday >= 0 && s.dday <= 14)
  }, [upcomingItems])

  const filteredNotices = notices
    .filter(n => noticeFilter === '전체' || n.category === noticeFilter)
    .filter(canViewNotice)
    .slice(0, 8)

  const popularPosts = [...posts]
    .filter(() => canViewPost())
    .sort((a, b) => {
      const score = (p: typeof a) => p.viewCount * 0.1 + p.likes * 0.6 + p.commentCount * 0.3
      return score(b) - score(a)
    })
    .slice(0, 8)

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-graduation-cap mr-3" />
            {selectedDeptName} 정보 포털
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-6">{today}</p>
          <div className="flex justify-center flex-wrap gap-2">
            {ddayBadges.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
                <i className="fas fa-clock text-xs" />
                {s.title}
                <strong>{s.dday === 0 ? 'D-Day' : `D-${s.dday}`}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* 캘린더 */}
          <div className="h-full">
            <MiniCalendar schedules={calendarItems} />
          </div>

          {/* 다가오는 일정 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">
                <i className="fas fa-calendar-alt mr-2" />
                {loggedIn ? '내 다가오는 일정' : '다가오는 일정'}
              </span>
              <Link to={loggedIn ? '/calendar' : '/dept/schedule'} className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {upcomingItems.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-calendar block mb-2" />
                  {loggedIn ? '등록된 개인 일정이 없습니다.' : '등록된 일정이 없습니다.'}
                </li>
              ) : upcomingItems.map(s => (
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
              <Link to="/dept/notice" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-100">
              {NOTICE_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)}
                  aria-pressed={noticeFilter === tab}
                  className={`px-2 py-0.5 text-xs border font-medium transition ${
                    noticeFilter === tab
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {filteredNotices.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox block mb-2" />공지사항이 없습니다.
                </li>
              ) : filteredNotices.map(n => (
                <li
                  key={n.id}
                  onClick={() => navigate(`/notice/${n.id}`)}
                  className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2 cursor-pointer"
                >
                  <span className="text-sm font-medium leading-snug flex-1 min-w-0 line-clamp-1">{n.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{n.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 인기 게시글 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-fire mr-2" />인기 게시글</span>
              <Link to="/dept/board" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {!loggedIn ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-lock block mb-2" />로그인 후 이용할 수 있습니다.
                </li>
              ) : popularPosts.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm">
                  <i className="fas fa-inbox block mb-2" />게시글이 없습니다.
                </li>
              ) : popularPosts.map(p => (
                <li
                  key={p.id}
                  onClick={() => navigate(`/post/${p.id}`)}
                  className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2 cursor-pointer"
                >
                  <span className="text-sm font-medium leading-snug flex-1 min-w-0 line-clamp-1">{p.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                    <i className="fas fa-heart text-red-400 mr-0.5" />{p.likes}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/dept/notice',                         icon: 'fa-bullhorn',     label: '공지사항' },
            { to: '/dept/board',                          icon: 'fa-comments',     label: '게시판' },
            { to: loggedIn ? '/calendar' : '/dept/schedule', icon: 'fa-calendar-alt', label: '일정' },
            { to: '/dept/department',                     icon: 'fa-university',   label: '학과정보' },
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
      </main>
    </div>
  )
}
