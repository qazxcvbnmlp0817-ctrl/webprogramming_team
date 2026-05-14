import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DeptProvider, useDept } from './context/DeptContext'
import UniversityListPage from './pages/UniversityListPage'
import UniversityShowPage from './pages/UniversityShowPage'
import SchoolSelectPage from './pages/SchoolSelectPage'
import MainPage from './pages/MainPage'
import NoticePage from './pages/NoticePage'
import BoardPage from './pages/BoardPage'
import SchedulePage from './pages/SchedulePage'
import DepartmentPage from './pages/DepartmentPage'
import LoginPage from './pages/LoginPage'

function ProtectedMain() {
  const { selectedDeptName } = useDept()
  if (!selectedDeptName) return <Navigate to="/universities" replace />
  return <MainPage />
}

export default function App() {
  return (
    <DeptProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/universities" element={<UniversityListPage />} />
          <Route path="/universities/:id" element={<UniversityShowPage />} />
          <Route path="/universities/:universityId/schools" element={<SchoolSelectPage />} />
          <Route path="/" element={<ProtectedMain />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/department" element={<DepartmentPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </DeptProvider>
  )
}
