import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { ErrorBoundary } from './ErrorBoundary'
import {
  LayoutDashboard, Users, CalendarCheck, BookOpen,
  BarChart3, MessageSquare, LogOut, School, Building2, Menu, X
} from 'lucide-react'

const COLORS = {
  moe_admin:    '#006b3f',
  school_admin: '#1a56db',
  teacher:      '#0e9f6e',
  parent:       '#7e3af2',
}

const SIDEBAR_W = 220

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const color = COLORS[user!.role] || '#374151'

  const links = [
    user?.role === 'moe_admin'  && { to: '/moe',       icon: Building2,      label: 'MOE Overview' },
    user?.role !== 'moe_admin'
      && user?.role !== 'parent' && { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    user?.role !== 'parent'     && { to: '/attendance',  icon: CalendarCheck,  label: 'Attendance' },
    { to: '/students',   icon: Users,          label: 'Students' },
    user?.role !== 'parent'     && { to: '/behaviour',   icon: BookOpen,       label: 'Behaviour' },
    { to: '/reports',    icon: BarChart3,      label: 'Reports' },
    ['moe_admin','school_admin'].includes(user?.role || '') && { to: '/sms', icon: MessageSquare, label: 'SMS' },
    user?.role === 'parent'     && { to: '/parent',      icon: Users,          label: 'My Children' },
  ].filter(Boolean) as { to: string; icon: React.ElementType; label: string }[]

  const nav = (
    <aside style={{
      width: SIDEBAR_W, background: color, color: '#fff',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : -SIDEBAR_W) : 0,
      height: '100vh', zIndex: 200,
      transition: 'left 0.25s ease',
      boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <School size={26} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Jamaica MOE</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>School Platform</div>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => isMobile && setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              color: '#fff', textDecoration: 'none', fontSize: 14,
              background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
            })}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{user?.name}</div>
        <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'capitalize', marginBottom: 10 }}>
          {user?.role.replace('_', ' ')}
        </div>
        <button onClick={() => { logout(); navigate('/login') }} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
          padding: '7px 12px', borderRadius: 6, cursor: 'pointer', width: '100%'
        }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {nav}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199
        }} />
      )}

      <main style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, flex: 1, minHeight: '100vh' }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            background: color, color: '#fff', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
              <Menu size={22} />
            </button>
            <School size={20} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Jamaica MOE</span>
          </div>
        )}

        <div style={{ padding: isMobile ? 16 : 28 }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
