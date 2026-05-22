import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { Send, MessageSquare } from 'lucide-react'

export default function SMSPage() {
  const { user } = useAuth()
  const [log, setLog] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [classId, setClassId] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)

  useEffect(() => {
    const school_id = user?.school_id
    if (school_id) {
      api.get(`/sms/log?school_id=${school_id}`).then(r => setLog(r.data))
      api.get(`/classes?school_id=${school_id}`).then(r => setClasses(r.data))
    }
  }, [user])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    try {
      const payload: any = { message }
      if (classId) payload.class_id = classId
      const { data } = await api.post('/sms/broadcast', payload)
      setResult({ sent: data.sent, failed: data.failed })
      setMessage('')
      api.get(`/sms/log?school_id=${user?.school_id}`).then(r => setLog(r.data))
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>SMS Notifications</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Send broadcast messages to parents via Twilio SMS</p>
      </div>

      {/* Compose */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Broadcast Message</h2>
        <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Target (optional — leave blank for whole school)
            </label>
            <select value={classId} onChange={e => setClassId(e.target.value)}
              style={{ padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, minWidth: 250 }}>
              <option value="">All parents in school</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} — Grade {c.grade}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Message ({message.length}/160)
            </label>
            <textarea
              required value={message} onChange={e => setMessage(e.target.value)}
              maxLength={320} rows={4}
              placeholder="Type your message to parents…"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          {result && (
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              background: result.failed === 0 ? '#d1fae5' : '#fef3c7',
              color: result.failed === 0 ? '#065f46' : '#92400e', fontSize: 14, fontWeight: 600
            }}>
              Sent: {result.sent} · Failed: {result.failed}
            </div>
          )}
          <div>
            <button type="submit" disabled={sending} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px',
              background: '#006b3f', color: '#fff', border: 'none', borderRadius: 8,
              fontWeight: 600, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1
            }}>
              <Send size={16} /> {sending ? 'Sending…' : 'Send SMS'}
            </button>
          </div>
        </form>
      </div>

      {/* Log */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={18} /> SMS Log
        </h2>
        {log.length === 0 ? (
          <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: 32 }}>No SMS sent yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Time', 'Phone', 'Type', 'Status', 'Message'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    {new Date(s.created_at).toLocaleString('en-JM', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{s.phone_number}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: '#f3f4f6', color: '#374151' }}>
                      {s.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 12, padding: '2px 8px', borderRadius: 20,
                      background: s.status === 'sent' ? '#d1fae5' : '#fee2e2',
                      color: s.status === 'sent' ? '#065f46' : '#991b1b'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
