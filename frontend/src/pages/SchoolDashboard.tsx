import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { Users, CalendarCheck, BookOpen, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 16, alignItems: 'flex-start'
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function SchoolDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [trend, setTrend] = useState<any[]>([])
  const [absentees, setAbsentees] = useState<any[]>([])

  useEffect(() => {
    if (!user?.school_id) return
    api.get(`/schools/${user.school_id}/stats`).then(r => setStats(r.data))
    api.get(`/reports/school/attendance?school_id=${user.school_id}`).then(r => {
      setTrend(r.data.slice(0, 14).reverse().map((d: any) => ({
        date: d.date.slice(5),
        rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
      })))
    })
    api.get(`/reports/school/chronic-absentees?school_id=${user.school_id}&threshold=3`).then(r => setAbsentees(r.data.slice(0, 5)))
  }, [user])

  if (!stats) return <div style={{ color: '#6b7280', padding: 40 }}>Loading dashboard...</div>

  const todayRate = stats.todayAttendance?.total > 0
    ? Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)
    : null

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>School Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          {user?.role === 'teacher' ? 'Your school overview' : 'School performance overview'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Students" value={stats.studentCount} color="#1a56db" />
        <StatCard icon={BookOpen} label="Classes" value={stats.classCount} color="#7e3af2" />
        <StatCard icon={Users} label="Teachers" value={stats.teacherCount} color="#f59e0b" />
        <StatCard
          icon={TrendingUp}
          label="Today's Attendance"
          value={todayRate !== null ? `${todayRate}%` : 'No data'}
          sub={stats.todayAttendance?.total ? `${stats.todayAttendance.present}/${stats.todayAttendance.total} present` : undefined}
          color="#006b3f"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* Trend chart */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111827' }}>
            Attendance Trend (14 days)
          </h2>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <XAxis dataKey="date" fontSize={11} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={11} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="#006b3f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40, fontSize: 14 }}>
              No attendance data yet. Mark attendance to see trends.
            </div>
          )}
        </div>

        {/* Chronic absentees */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111827' }}>
            Chronic Absentees
          </h2>
          {absentees.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 24 }}>
              No chronic absentees (3+ days)
            </div>
          ) : (
            absentees.map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #f3f4f6'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {s.first_name} {s.last_name}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.class_name}</div>
                </div>
                <span style={{
                  background: '#fef2f2', color: '#dc2626', fontSize: 12,
                  fontWeight: 700, padding: '2px 8px', borderRadius: 20
                }}>
                  {s.absent_days} absent
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
