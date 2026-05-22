import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { CheckCircle, XCircle, Clock, FileCheck, Send } from 'lucide-react'

type Status = 'present' | 'absent' | 'late' | 'excused'

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  present: { bg: '#d1fae5', text: '#065f46' },
  absent:  { bg: '#fee2e2', text: '#991b1b' },
  late:    { bg: '#fef3c7', text: '#92400e' },
  excused: { bg: '#ede9fe', text: '#5b21b6' },
}

const STATUS_ICONS: Record<Status, React.ElementType> = {
  present: CheckCircle, absent: XCircle, late: Clock, excused: FileCheck
}

export default function AttendancePage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [roster, setRoster] = useState<any[]>([])
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const url = user?.role === 'teacher' ? '/classes/my' : `/classes?school_id=${user?.school_id}`
    api.get(url).then(r => {
      setClasses(r.data)
      if (r.data.length > 0) setSelectedClass(r.data[0].id)
    })
  }, [user])

  useEffect(() => {
    if (!selectedClass || !date) return
    api.get(`/reports/class/attendance?class_id=${selectedClass}&date=${date}`).then(r => {
      setRoster(r.data)
      const initial: Record<string, Status> = {}
      r.data.forEach((s: any) => { initial[s.id] = s.status || 'present' })
      setStatuses(initial)
      setSaved(false)
    })
  }, [selectedClass, date])

  async function submitAttendance() {
    setSaving(true)
    const records = roster.map(s => ({ student_id: s.id, status: statuses[s.id] || 'present' }))
    try {
      await api.post('/attendance/bulk', { class_id: selectedClass, date, records })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const present = Object.values(statuses).filter(s => s === 'present').length
  const absent  = Object.values(statuses).filter(s => s === 'absent').length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Mark Attendance</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Select a class and date, then mark each student.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={inputStyle}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} — Grade {c.grade}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {present} present · {absent} absent
          </span>
          <button onClick={submitAttendance} disabled={saving || roster.length === 0} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: '#006b3f', color: '#fff',
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
          }}>
            <Send size={16} />
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Submit & Send SMS'}
          </button>
        </div>
      </div>

      {/* Mark all */}
      {roster.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center', marginRight: 4 }}>Mark all:</span>
          {(['present', 'absent', 'late', 'excused'] as Status[]).map(s => (
            <button key={s} onClick={() => {
              const all: Record<string, Status> = {}
              roster.forEach(st => { all[st.id] = s })
              setStatuses(all)
            }} style={{
              padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Roster */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {roster.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            {classes.length === 0 ? 'No classes assigned to you.' : 'No students in this class.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Student</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s, i) => {
                const current = statuses[s.id] || 'present'
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ ...tdStyle, color: '#9ca3af', width: 40 }}>{i + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        {s.last_name}, {s.first_name}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(['present', 'absent', 'late', 'excused'] as Status[]).map(st => {
                          const Icon = STATUS_ICONS[st]
                          const active = current === st
                          return (
                            <button key={st} onClick={() => setStatuses(prev => ({ ...prev, [s.id]: st }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '5px 10px', borderRadius: 20, border: '2px solid',
                                borderColor: active ? STATUS_COLORS[st].text : '#e5e7eb',
                                background: active ? STATUS_COLORS[st].bg : '#fff',
                                color: active ? STATUS_COLORS[st].text : '#9ca3af',
                                fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer'
                              }}>
                              <Icon size={13} /> {st}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8,
  fontSize: 14, outline: 'none', minWidth: 160
}
const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 14 }
