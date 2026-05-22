import { useEffect, useState } from 'react'
import api from '../api'
import { Building2, Users, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Overview {
  totalSchools: number
  totalStudents: number
  totalTeachers: number
  attendanceRate: number | null
  todayAtt: { present: number; absent: number; total: number }
  schoolStats: Array<{
    id: string; name: string; parish: string
    students: number; present_today: number; total_today: number
  }>
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 16
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      </div>
    </div>
  )
}

export default function MOEDashboard() {
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/moe/overview')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#6b7280', padding: 40 }}>Loading national overview...</div>
  if (!data) return <div style={{ color: '#dc2626' }}>Failed to load data</div>

  const chartData = data.schoolStats.map(s => ({
    name: s.name.length > 18 ? s.name.slice(0, 16) + '…' : s.name,
    rate: s.total_today > 0 ? Math.round((s.present_today / s.total_today) * 100) : 0,
    students: s.students,
  }))

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>National Overview</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Ministry of Education — Jamaica School Attendance Platform
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Building2} label="Active Schools" value={data.totalSchools} color="#006b3f" />
        <StatCard icon={Users} label="Total Students" value={data.totalStudents.toLocaleString()} color="#1a56db" />
        <StatCard icon={GraduationCap} label="Teachers" value={data.totalTeachers} color="#7e3af2" />
        <StatCard
          icon={TrendingUp}
          label="Today's Attendance"
          value={data.attendanceRate !== null ? `${data.attendanceRate}%` : 'No data'}
          color="#0e9f6e"
        />
      </div>

      {/* Today alert */}
      {data.todayAtt.absent > 0 && (
        <div style={{
          background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <AlertCircle size={18} color="#f59e0b" />
          <span style={{ fontSize: 14, color: '#92400e' }}>
            <strong>{data.todayAtt.absent}</strong> students marked absent today — SMS alerts sent to parents.
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Chart */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#111827' }}>
            Today's Attendance by School
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={11} />
              <YAxis type="category" dataKey="name" width={140} fontSize={11} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 90 ? '#006b3f' : entry.rate >= 75 ? '#f59e0b' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* School list */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#111827' }}>All Schools</h2>
          <div style={{ overflowY: 'auto', maxHeight: 300 }}>
            {data.schoolStats.map(s => {
              const rate = s.total_today > 0 ? Math.round((s.present_today / s.total_today) * 100) : null
              return (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #f3f4f6'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.parish} · {s.students} students</div>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: rate === null ? '#9ca3af' : rate >= 90 ? '#006b3f' : rate >= 75 ? '#f59e0b' : '#dc2626'
                  }}>
                    {rate !== null ? `${rate}%` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
