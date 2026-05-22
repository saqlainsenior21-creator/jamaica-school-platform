import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { Plus, X, Star, AlertTriangle, Shield, AlertCircle } from 'lucide-react'

const TYPE_CONFIG = {
  commendation: { icon: Star, bg: '#d1fae5', text: '#065f46', label: 'Commendation' },
  incident:     { icon: AlertCircle, bg: '#fee2e2', text: '#991b1b', label: 'Incident' },
  warning:      { icon: AlertTriangle, bg: '#fef3c7', text: '#92400e', label: 'Warning' },
  suspension:   { icon: Shield, bg: '#ede9fe', text: '#5b21b6', label: 'Suspension' },
}

export default function BehaviourPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [form, setForm] = useState({
    student_id: '', type: 'incident', category: '', description: '',
    action_taken: '', date: new Date().toISOString().split('T')[0], notify_parent: false
  })
  const [saving, setSaving] = useState(false)

  function load() {
    const params = new URLSearchParams()
    if (user?.school_id) params.set('school_id', user.school_id)
    if (typeFilter) params.set('type', typeFilter)
    api.get(`/behaviour?${params}`).then(r => setRecords(r.data))
  }

  useEffect(load, [typeFilter])
  useEffect(() => {
    if (!user?.school_id) return
    api.get(`/students?school_id=${user.school_id}&active=1`).then(r => setStudents(r.data))
  }, [user])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/behaviour', form)
      setShowAdd(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Behaviour Records</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Track incidents, commendations, warnings and suspensions</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: '#006b3f', color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 600, fontSize: 14, cursor: 'pointer'
        }}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'incident', 'commendation', 'warning', 'suspension'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            padding: '6px 16px', borderRadius: 20, border: '1.5px solid',
            borderColor: typeFilter === t ? '#006b3f' : '#d1d5db',
            background: typeFilter === t ? '#006b3f' : '#fff',
            color: typeFilter === t ? '#fff' : '#374151',
            fontSize: 13, fontWeight: typeFilter === t ? 600 : 400, cursor: 'pointer'
          }}>
            {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Records */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {records.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            No behaviour records found.
          </div>
        )}
        {records.map(r => {
          const cfg = TYPE_CONFIG[r.type as keyof typeof TYPE_CONFIG]
          const Icon = cfg.icon
          return (
            <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={cfg.text} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                      {r.first_name} {r.last_name}
                    </span>
                    <span style={{
                      marginLeft: 10, fontSize: 12, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.text
                    }}>
                      {cfg.label}
                    </span>
                    {r.parent_notified === 1 && (
                      <span style={{ marginLeft: 6, fontSize: 12, color: '#6b7280' }}>· Parent notified</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: 14, color: '#374151', marginTop: 6 }}>{r.description}</p>
                {r.action_taken && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Action: {r.action_taken}</p>}
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Reported by {r.teacher_name}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add Behaviour Record</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Student</label>
                <select required value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))} style={sel}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={sel}>
                    <option value="incident">Incident</option>
                    <option value="commendation">Commendation</option>
                    <option value="warning">Warning</option>
                    <option value="suspension">Suspension</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
                </div>
              </div>
              <div>
                <label style={lbl}>Category (optional)</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Fighting, Academic Excellence…" style={inp} />
              </div>
              <div>
                <label style={lbl}>Description *</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe the behaviour…"
                  style={{ ...inp, resize: 'vertical' as const }} />
              </div>
              <div>
                <label style={lbl}>Action Taken (optional)</label>
                <input value={form.action_taken} onChange={e => setForm(f => ({ ...f, action_taken: e.target.value }))} placeholder="e.g. Called parent, Detention…" style={inp} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.notify_parent} onChange={e => setForm(f => ({ ...f, notify_parent: e.target.checked }))} />
                Notify parent via SMS
              </label>
              <button type="submit" disabled={saving} style={{
                marginTop: 8, padding: 12, background: '#006b3f', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer'
              }}>
                {saving ? 'Saving…' : 'Save Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }
const sel: React.CSSProperties = { ...inp, background: '#fff' }
