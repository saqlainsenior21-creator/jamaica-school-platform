import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { Download } from 'lucide-react'

function exportCSV(url: string, filename: string) {
  const token = localStorage.getItem('token')
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
    })
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([])
  const [absentees, setAbsentees] = useState<any[]>([])
  const [behaviour, setBehaviour] = useState<any[]>([])
  const [start, setStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [end, setEnd] = useState(new Date().toISOString().split('T')[0])

  function load() {
    const school_id = user?.school_id
    const params = `school_id=${school_id || ''}&start=${start}&end=${end}`

    if (user?.role === 'moe_admin') {
      api.get(`/reports/moe/attendance?start=${start}&end=${end}`).then(r => {
        const grouped: Record<string, any> = {}
        r.data.forEach((d: any) => {
          if (!grouped[d.date]) grouped[d.date] = { date: d.date, present: 0, absent: 0, total: 0 }
          grouped[d.date].present += d.present
          grouped[d.date].absent  += d.absent
          grouped[d.date].total   += d.total
        })
        setAttendanceTrend(Object.values(grouped).slice(-30).map((d: any) => ({
          date: d.date.slice(5),
          rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
        })))
      })
    } else {
      api.get(`/reports/school/attendance?${params}`).then(r => {
        setAttendanceTrend(r.data.slice(0, 30).reverse().map((d: any) => ({
          date: d.date.slice(5),
          rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
          absent: d.absent
        })))
      })
      api.get(`/reports/school/chronic-absentees?school_id=${school_id}&threshold=3`).then(r => setAbsentees(r.data))
    }

    const bParams = new URLSearchParams({ start, end })
    if (school_id) bParams.set('school_id', school_id)
    api.get(`/behaviour?${bParams}`).then(r => {
      const counts: Record<string, number> = { incident: 0, commendation: 0, warning: 0, suspension: 0 }
      r.data.forEach((b: any) => { counts[b.type] = (counts[b.type] || 0) + 1 })
      setBehaviour(Object.entries(counts).map(([type, count]) => ({ type, count })))
    })
  }

  useEffect(load, [start, end])

  const BEHAVIOUR_COLORS: Record<string, string> = {
    incident: '#dc2626', commendation: '#006b3f', warning: '#f59e0b', suspension: '#7e3af2'
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Reports & Analytics</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          {user?.role === 'moe_admin' ? 'National performance data' : 'School performance data'}
        </p>
      </div>

      {/* Date range */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        {[['From', start, setStart], ['To', end, setEnd]].map(([label, val, setter]) => (
          <div key={label as string}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label as string}</label>
            <input type="date" value={val as string} onChange={e => (setter as Function)(e.target.value)}
              style={{ padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
          </div>
        ))}
        <button onClick={load} style={{
          padding: '9px 20px', background: '#006b3f', color: '#fff', border: 'none',
          borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer'
        }}>Apply</button>

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {user?.role === 'moe_admin' ? (
            <button onClick={() => exportCSV(
              `/api/export/moe/national?start=${start}&end=${end}`,
              `national_attendance_${start}_${end}.csv`
            )} style={exportBtnStyle}>
              <Download size={14} /> National CSV
            </button>
          ) : (
            <>
              <button onClick={() => exportCSV(
                `/api/export/attendance?school_id=${user?.school_id}&start=${start}&end=${end}`,
                `attendance_${start}_${end}.csv`
              )} style={exportBtnStyle}>
                <Download size={14} /> Attendance CSV
              </button>
              <button onClick={() => exportCSV(
                `/api/export/behaviour?school_id=${user?.school_id}&start=${start}&end=${end}`,
                `behaviour_${start}_${end}.csv`
              )} style={exportBtnStyle}>
                <Download size={14} /> Behaviour CSV
              </button>
              <button onClick={() => exportCSV(
                `/api/export/students?school_id=${user?.school_id}`,
                `students.csv`
              )} style={exportBtnStyle}>
                <Download size={14} /> Students CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Attendance trend */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Daily Attendance Rate</h2>
          {attendanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={attendanceTrend}>
                <XAxis dataKey="date" fontSize={11} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={11} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="#006b3f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40, fontSize: 14 }}>No data for this period</div>
          )}
        </div>

        {/* Behaviour breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111827' }}>Behaviour Breakdown</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={behaviour}>
              <XAxis dataKey="type" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {behaviour.map((b, i) => <Cell key={i} fill={BEHAVIOUR_COLORS[b.type] || '#374151'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chronic absentees */}
      {user?.role !== 'moe_admin' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111827' }}>Chronic Absentees (3+ days)</h2>
          {absentees.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: 24 }}>No chronic absentees in this period.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Student', 'Class', 'Days Absent', 'Parent Phone'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {absentees.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 14 }}>{s.first_name} {s.last_name}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#6b7280' }}>{s.class_name || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                        {s.absent_days}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151' }}>{s.parent_phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

const exportBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', background: '#fff', color: '#374151',
  border: '1.5px solid #d1d5db', borderRadius: 8, fontWeight: 600,
  fontSize: 13, cursor: 'pointer'
}
