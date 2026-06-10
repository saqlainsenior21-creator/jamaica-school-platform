import { Link } from 'react-router-dom'

export default function Partner() {
  const GREEN = '#006B3F'
  const GOLD = '#FFB81C'
  const NAVY = '#0F2A4A'
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: GREEN, color: 'white', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🇯🇲</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>SchoolTrack JM</span>
        <span style={{ opacity: 0.6, margin: '0 0.5rem' }}>|</span>
        <span style={{ opacity: 0.85 }}>Ministry of Education Partnership</span>
      </div>

      <div style={{ maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: GREEN, fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>← Back</Link>

        <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #004d2c 100%)`, color: 'white', borderRadius: 16, padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,184,28,0.2)', border: '1px solid rgba(255,184,28,0.4)', borderRadius: 999, padding: '0.4rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: GOLD, fontWeight: 600 }}>
            🇯🇲 Partnership Proposal — Ministry of Education & Youth Jamaica
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Partner with SchoolTrack JM</h1>
          <p style={{ opacity: 0.9, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            SchoolTrack JM is a fully operational school management platform built for Jamaica's public schools — already loaded with 48 schools across all 14 parishes.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: GREEN, marginBottom: '1.25rem' }}>What SchoolTrack JM Offers</h2>
          {[
            ['Digital Attendance', 'Teachers mark attendance on any device. Records are instant, auditable, and backed up automatically — no more paper registers.'],
            ['Behaviour Tracking', 'Log incidents, warnings, and commendations per student. Full history retained across school years.'],
            ['Parent SMS Alerts', 'Automatic SMS to parents when a student is marked absent or when a behaviour incident is logged (via Twilio).'],
            ['Student Management', 'Complete student profiles including class, parent/guardian contacts, and academic history.'],
            ['MOE Admin Dashboard', 'Ministry-level view across all 48 (or 1,000+) schools — attendance rates, trends, and flagged issues.'],
            ['Reports & CSV Export', 'Generate daily, weekly, or monthly attendance and behaviour reports. Export to CSV for further analysis.'],
            ['Role-Based Access', 'Separate roles for MOE admin, school principal, teacher, and parent portal.'],
            ['Audit Logging', 'Every action is logged with timestamp and user — full accountability trail.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ color: GREEN, fontSize: '1.2rem', flexShrink: 0 }}>✓</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: GREEN, marginBottom: '1.25rem' }}>Pilot Programme — 3 Phases</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: GREEN }}>
              {['Phase','Timeline','Scope','Cost'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                ['Pilot', 'Month 1–2', '5–10 schools across 3 parishes', 'FREE (30-day trial)'],
                ['Expand', 'Month 3–6', '50 schools across all 14 parishes', 'J$15,000/school/month'],
                ['National', 'Month 7–12', 'All 1,000+ public schools', 'Bulk rate negotiable'],
              ].map(([phase, time, scope, cost], i) => (
                <tr key={phase} style={{ background: i % 2 === 0 ? '#e6f4ee' : 'white' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.88rem' }}>{phase}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{time}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{scope}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', fontWeight: 600, color: GREEN }}>{cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#e6f4ee', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', border: `1px solid ${GREEN}` }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: GREEN, marginBottom: '1rem' }}>Try the Live Demo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>MOE Admin</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>admin@moe.gov.jm</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Family#25@</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Demo School (Ardenne High)</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>demo@schooltrackjm.com</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Demo2026!</div>
            </div>
          </div>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GREEN, color: 'white', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Access Live Demo</Link>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: GREEN, marginBottom: '0.5rem' }}>Get in Touch</h2>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <a href="mailto:saqlain@schooltrackjm.com" style={{ color: GREEN, fontWeight: 600 }}>✉ saqlain@schooltrackjm.com</a>
            <a href="tel:+18768751969" style={{ color: GREEN, fontWeight: 600 }}>📞 +1 (876) 875-1969 / +1 (876) 234-5464</a>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
            Saqlain Senior | Founder, SchoolTrack JM | Black River, St. Elizabeth, Jamaica 🇯🇲
          </div>
        </div>
      </div>
    </div>
  )
}
