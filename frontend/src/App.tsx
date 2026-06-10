import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Layout from './components/Layout'
import MOEDashboard from './pages/MOEDashboard'
import SchoolDashboard from './pages/SchoolDashboard'
import AttendancePage from './pages/AttendancePage'
import StudentsPage from './pages/StudentsPage'
import BehaviourPage from './pages/BehaviourPage'
import ReportsPage from './pages/ReportsPage'
import SMSPage from './pages/SMSPage'
import ParentPortal from './pages/ParentPortal'
import Partner from './pages/Partner'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <LandingPage />
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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/partner" element={<Partner />} />
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
