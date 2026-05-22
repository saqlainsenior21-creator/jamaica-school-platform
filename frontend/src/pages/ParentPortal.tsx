import { useEffect, useState } from 'react'
import api from '../api'
import { CheckCircle, XCircle, Clock, Star, AlertCircle } from 'lucide-react'
import Spinner from '../components/Spinner'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  present: { bg: '#d1fae5', text: '#065f46' },
  absent:  { bg: '#fee2e2', text: '#991b1b' },
  late:    { bg: '#fef3c7', text: '#92400e' },
  excused: { bg: '#ede9fe', text: '#5b21b6' },
}

const BEHAVIOUR_COLORS: Record<string, string> = {
  commendation: '#006b3f', incident: '#dc2626', warning: '#f59e0b', suspension: '#7e3af2'
}

export default function ParentPortal() {
  const [summary, setSummary] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [attendance, setAttendance] = useState<any[]>([])
  const [behaviour, setBehaviour] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/parent/summary').then(r => {
      setSummary(r.data)
      if (r.data.length > 0) setSelected(r.data[0].id)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    api.get(`/parent/attendance?student_id=${selected}`).then(r => setAttendance(r.data))
    api.get(`/parent/behaviour?student_id=${selected}`).then(r => setBehaviour(r.data))
  }, [selected])

  if (loading) return <Spinner label="Loading your children's records…" />

  if (summary.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>No children linked</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Your email address is not yet linked to any student records. Please contact your school to update the parent email on your child's profile.
        </p>
      </div>
    )
  }

  const child = summary.find(c => c.id === selected)
  const rate = child?.stats?.total > 0
    ? Math.round((child.stats.present / child.stats.total) * 100)
    : null

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>My Children</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Attendance and behaviour records for the last 30 days</p>
      </div>

      {/* Child selector */}
      {summary.length > 1 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {summary.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid',
              borderColor: selected === c.id ? '#006b3f' : '#d1d5db',
              background: selected === c.id ? '#006b3f' : '#fff',
              color: selected === c.id ? '#fff' : '#374151',
              fontWeight: selected === c.id ? 700 : 400, fontSize: 14, cursor: 'pointer'
            }}>
              {c.first_name} {c.last_name}
            </button>
          ))}
        </div>
      )}

      {child && (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Days Present',  value: child.stats?.present ?? 0, color: '#006b3f' },
              { label: 'Days Absent',   value: child.stats?.absent  ?? 0, color: '#dc2626' },
              { label: 'Days Late',     value: child.stats?.late    ?? 0, color: '#f59e0b' },
              { label: 'Attendance Rate', value: rate !== null ? `${rate}%` : 'N/A', color: rate !== null && rate >= 85 ? '#006b3f' : '#dc2626' },
              { label: 'Behaviour Alerts', value: child.behaviourCount ?? 0, color: '#7e3af2' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {child.stats?.absent > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#92400e' }}>
              ⚠️ Your child has been absent {child.stats.absent} day{child.stats.absent !== 1 ? 's' : ''} in the last 30 days. Please contact the school if you have not done so.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {/* Attendance log */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111827' }}>Attendance Log</h2>
              {attendance.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>No attendance records yet.</p>
              ) : (
                <div style={{ overflowY: 'auto', maxHeight: 380 }}>
                  {attendance.map((a, i) => {
                    const cfg = STATUS_COLORS[a.status] || { bg: '#f3f4f6', text: '#374151' }
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                        <div style={{ fontSize: 14, color: '#374151' }}>{a.date}</div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: cfg.bg, color: cfg.text }}>
                          {a.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Behaviour log */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111827' }}>Behaviour Records</h2>
              {behaviour.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>No behaviour records.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {behaviour.map((b, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 8, background: '#f9fafb', borderLeft: `4px solid ${BEHAVIOUR_COLORS[b.type] || '#374151'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: BEHAVIOUR_COLORS[b.type] || '#374151', textTransform: 'capitalize' }}>
                          {b.type}
                        </span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{b.date}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{b.description}</p>
                      {b.action_taken && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Action: {b.action_taken}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
