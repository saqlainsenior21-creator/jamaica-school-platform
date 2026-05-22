import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { School } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #006b3f 0%, #ffd700 100%)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 40, width: 380,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#006b3f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <School size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Jamaica MOE</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>School Attendance Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="admin@moe.gov.jm"
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
                borderRadius: 8, fontSize: 14, outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
                borderRadius: 8, fontSize: 14, outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
              padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#006b3f',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 24, padding: 12, background: '#f9fafb', borderRadius: 8,
          fontSize: 12, color: '#6b7280', textAlign: 'center'
        }}>
          Default: admin@moe.gov.jm / Admin2026!
        </div>
      </div>
    </div>
  )
}
