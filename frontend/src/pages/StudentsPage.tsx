import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { Search, UserPlus, X } from 'lucide-react'

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', gender: '', date_of_birth: '', class_id: '', parent_name: '', parent_phone: '', parent_email: '', student_id_number: '' })
  const [saving, setSaving] = useState(false)

  function load() {
    const school_id = user?.school_id
    const params = new URLSearchParams({ active: '1' })
    if (school_id) params.set('school_id', school_id)
    if (classFilter) params.set('class_id', classFilter)
    if (search) params.set('search', search)
    api.get(`/students?${params}`).then(r => setStudents(r.data))
  }

  useEffect(load, [classFilter, search])

  useEffect(() => {
    const url = user?.role === 'teacher' ? '/classes/my' : `/classes?school_id=${user?.school_id}`
    api.get(url).then(r => setClasses(r.data))
  }, [user])

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/students', form)
      setShowAdd(false)
      setForm({ first_name: '', last_name: '', gender: '', date_of_birth: '', class_id: '', parent_name: '', parent_phone: '', parent_email: '', student_id_number: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Students</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>{students.length} students found</p>
        </div>
        {['school_admin', 'moe_admin', 'teacher'].includes(user?.role || '') && (
          <button onClick={() => setShowAdd(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: '#006b3f', color: '#fff', border: 'none', borderRadius: 8,
            fontWeight: 600, fontSize: 14, cursor: 'pointer'
          }}>
            <UserPlus size={16} /> Add Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input placeholder="Search name or ID…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, padding: '9px 12px 9px 36px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%' }} />
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14 }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} — Gr {c.grade}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Name', 'Class', 'ID #', 'Parent', 'Phone'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{s.first_name} {s.last_name}</div>
                  {s.gender && <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.gender}</div>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{s.class_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{s.student_id_number || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{s.parent_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{s.parent_phone || '—'}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add Student</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={addStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['first_name', 'First Name', 'text', true],
                  ['last_name', 'Last Name', 'text', true],
                  ['student_id_number', 'Student ID #', 'text', false],
                  ['date_of_birth', 'Date of Birth', 'date', false],
                  ['parent_name', 'Parent Name', 'text', false],
                  ['parent_phone', 'Parent Phone', 'tel', false],
                  ['parent_email', 'Parent Email', 'email', false],
                ].map(([key, label, type, req]) => (
                  <div key={key as string}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label as string}</label>
                    <input type={type as string} required={!!req}
                      value={(form as any)[key as string]}
                      onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Class</label>
                  <select value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
                    <option value="">None</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} — Gr {c.grade}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} style={{
                marginTop: 24, width: '100%', padding: 12, background: '#006b3f', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer'
              }}>
                {saving ? 'Saving…' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
