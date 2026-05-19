import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DeptProvider, useDept } from './context/DeptContext'
import Footer from './components/Footer'
import UniversityListPage from './pages/UniversityListPage'
import UniversityShowPage from './pages/UniversityShowPage'
import MainPage from './pages/MainPage'
import NoticePage from './pages/NoticePage'
import BoardPage from './pages/BoardPage'
import WritePostPage from './pages/WritePostPage'
import SchedulePage from './pages/SchedulePage'
import DepartmentPage from './pages/DepartmentPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyPage from './pages/MyPage'
import FindIdPage from './pages/FindIdPage'
import FindPasswordPage from './pages/FindPasswordPage'
import SchoolNoticePage from './pages/SchoolNoticePage'
import SchoolBoardPage from './pages/SchoolBoardPage'
import SchoolSchedulePage from './pages/SchoolSchedulePage'
import SchoolInfoPage from './pages/SchoolInfoPage'
import SchoolDepartmentsPage from './pages/SchoolDepartmentsPage'
import FacultyPage from './pages/FacultyPage'
import FacultyBoardPage from './pages/FacultyBoardPage'
import FacultyNoticePage from './pages/FacultyNoticePage'
import FacultySchedulePage from './pages/FacultySchedulePage'

function ProtectedSchool({ children }: { children: ReactNode }) {
  const { selectedUniversityId } = useDept()
  if (!selectedUniversityId) return <Navigate to="/universities" replace />
  return <>{children}</>
}

function ProtectedDept({ children }: { children: ReactNode }) {
  const { selectedDeptId } = useDept()
  if (!selectedDeptId) return <Navigate to="/universities" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <DeptProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Routes>
          {/* 대학 목록 / 대학 홈 */}
          <Route path="/universities"    element={<UniversityListPage />} />
          <Route path="/universities/:id" element={<UniversityShowPage />} />
          <Route path="/universities/:id/schools" element={<Navigate to="/universities/:id" replace />} />

          {/* 학교(school) 범위 페이지 — /school/* */}
          <Route path="/school/departments" element={<ProtectedSchool><SchoolDepartmentsPage /></ProtectedSchool>} />
          <Route path="/school/faculty/:facultyId"          element={<ProtectedSchool><FacultyPage /></ProtectedSchool>} />
          <Route path="/school/faculty/:facultyId/notice"   element={<ProtectedSchool><FacultyNoticePage /></ProtectedSchool>} />
          <Route path="/school/faculty/:facultyId/board"    element={<ProtectedSchool><FacultyBoardPage /></ProtectedSchool>} />
          <Route path="/school/faculty/:facultyId/schedule" element={<ProtectedSchool><FacultySchedulePage /></ProtectedSchool>} />
          <Route path="/school/notice"      element={<ProtectedSchool><SchoolNoticePage /></ProtectedSchool>} />
          <Route path="/school/board"       element={<ProtectedSchool><SchoolBoardPage /></ProtectedSchool>} />
          <Route path="/school/schedule"    element={<ProtectedSchool><SchoolSchedulePage /></ProtectedSchool>} />
          <Route path="/school/info"        element={<ProtectedSchool><SchoolInfoPage /></ProtectedSchool>} />

          {/* 진입점 — 학교 선택 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/universities" replace />} />

          {/* 학과(dept) 범위 페이지 — /dept/* */}
          <Route path="/dept/home"       element={<ProtectedDept><MainPage /></ProtectedDept>} />
          <Route path="/dept/notice"     element={<ProtectedDept><NoticePage /></ProtectedDept>} />
          <Route path="/dept/board"       element={<ProtectedDept><BoardPage /></ProtectedDept>} />
          <Route path="/dept/board/write" element={<ProtectedDept><WritePostPage /></ProtectedDept>} />
          <Route path="/dept/schedule"   element={<ProtectedDept><SchedulePage /></ProtectedDept>} />
          <Route path="/dept/department" element={<ProtectedDept><DepartmentPage /></ProtectedDept>} />

          {/* 이전 경로 호환성 리다이렉트 */}
          <Route path="/notice"     element={<Navigate to="/dept/notice"     replace />} />
          <Route path="/board"      element={<Navigate to="/dept/board"      replace />} />
          <Route path="/schedule"   element={<Navigate to="/dept/schedule"   replace />} />
          <Route path="/department" element={<Navigate to="/dept/department" replace />} />
          <Route path="/universities/:univId/notices"  element={<Navigate to="/school/notice"   replace />} />
          <Route path="/universities/:univId/board"    element={<Navigate to="/school/board"    replace />} />
          <Route path="/universities/:univId/schedule" element={<Navigate to="/school/schedule" replace />} />
          <Route path="/universities/:univId/info"     element={<Navigate to="/school/info"     replace />} />

          <Route path="/login"         element={<LoginPage />} />
          <Route path="/signup"        element={<SignupPage />} />
          <Route path="/mypage"        element={<MyPage />} />
          <Route path="/find-id"       element={<FindIdPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </DeptProvider>
  )
}
