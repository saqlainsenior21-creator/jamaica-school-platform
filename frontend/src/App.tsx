import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import MOEDashboard from './pages/MOEDashboard'
import SchoolDashboard from './pages/SchoolDashboard'
import AttendancePage from './pages/AttendancePage'
import StudentsPage from './pages/StudentsPage'
import BehaviourPage from './pages/BehaviourPage'
import ReportsPage from './pages/ReportsPage'
import SMSPage from './pages/SMSPage'
import ParentPortal from './pages/ParentPortal'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'moe_admin') return <Navigate to="/moe" replace />
  if (user.role === 'parent')    return <Navigate to="/parent" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/moe"        element={<MOEDashboard />} />
            <Route path="/dashboard"  element={<SchoolDashboard />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/students"   element={<StudentsPage />} />
            <Route path="/behaviour"  element={<BehaviourPage />} />
            <Route path="/reports"    element={<ReportsPage />} />
            <Route path="/sms"        element={<SMSPage />} />
            <Route path="/parent"     element={<ParentPortal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
