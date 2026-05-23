import { useNavigate } from 'react-router-dom'

const G = '#006b3f'   // Jamaica green
const GOLD = '#FFD700'
const DARK = '#0a1628'
const GREY = '#f4f6f9'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: DARK, margin: 0 }}>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', background: '#fff',
        borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: G,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>🏫</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>SchoolTrack <span style={{ color: G }}>JM</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Features</a>
          <a href="#pricing" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Pricing</a>
          <a href="#contact" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>Contact</a>
          <button onClick={() => navigate('/login')} style={{
            background: G, color: '#fff', border: 'none',
            padding: '8px 20px', borderRadius: 8, fontSize: 14,
            fontWeight: 600, cursor: 'pointer'
          }}>Login</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #1a3a5c 60%, ${G} 100%)`,
        padding: '90px 40px 80px', textAlign: 'center', color: '#fff'
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,215,0,0.15)',
          border: '1px solid rgba(255,215,0,0.4)', borderRadius: 20,
          padding: '6px 18px', fontSize: 13, color: GOLD, marginBottom: 24, fontWeight: 600
        }}>
          🇯🇲 Built for Jamaican Schools
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.15 }}>
          Attendance. Behaviour. Parents.<br />
          <span style={{ color: GOLD }}>All in One Place.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
          SchoolTrack JM helps Jamaican schools track attendance, log behaviour,
          and instantly notify parents by SMS — saving hours of paperwork every week.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#contact" style={{
            background: GOLD, color: DARK, padding: '14px 32px',
            borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(255,215,0,0.4)'
          }}>Book a Free Demo →</a>
          <button onClick={() => navigate('/login')} style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.3)', padding: '14px 32px',
            borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer'
          }}>Log In</button>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          30-day free trial · No credit card required · Set up in under 1 hour
        </p>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────── */}
      <section style={{ background: G, padding: '28px 40px' }}>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 60,
          flexWrap: 'wrap', color: '#fff', textAlign: 'center'
        }}>
          {[
            { num: '48+', label: 'Schools Using It' },
            { num: '< 1hr', label: 'Setup Time' },
            { num: '100%', label: 'Web-Based' },
            { num: '24/7', label: 'Always Online' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 800, color: GOLD }}>{s.num}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>Everything Your School Needs</h2>
            <p style={{ color: '#6b7280', fontSize: 17 }}>Built specifically for Jamaican schools and the MOE reporting structure.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
            {[
              {
                icon: '📋', title: 'Attendance Tracking',
                desc: 'Mark students present, absent, late, or excused in seconds. Auto-flag chronic absentees and generate MOE-ready reports instantly.'
              },
              {
                icon: '📱', title: 'SMS Parent Alerts',
                desc: 'Parents get an instant text the moment their child is marked absent. Works on Digicel and FLOW. No app download needed.'
              },
              {
                icon: '🏫', title: 'MOE Dashboard',
                desc: 'Ministry administrators see real-time attendance data across all schools in every parish from one central dashboard.'
              },
              {
                icon: '📊', title: 'Reports & Export',
                desc: 'Generate weekly, monthly, or term attendance and behaviour reports. Export to CSV for MOE submissions in one click.'
              },
              {
                icon: '⚠️', title: 'Behaviour Records',
                desc: 'Log incidents, commendations, warnings, and suspensions. Full history per student, per class, per teacher.'
              },
              {
                icon: '👨‍👩‍👧', title: 'Parent Portal',
                desc: 'Parents can log in to view their child\'s attendance history and behaviour records anytime, from any device.'
              },
            ].map(f => (
              <div key={f.title} style={{
                background: GREY, borderRadius: 16, padding: 28,
                borderTop: `4px solid ${G}`
              }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section style={{ padding: '80px 40px', background: GREY }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>Up and Running in 3 Steps</h2>
          <p style={{ color: '#6b7280', fontSize: 17, marginBottom: 56 }}>No IT department needed.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {[
              { step: '1', title: 'We Set Up Your School', desc: 'We add your classes, teachers, and students. Takes less than an hour. You just send us the list.' },
              { step: '2', title: 'Teachers Mark Attendance', desc: 'Each morning, teachers log in and mark attendance on any phone, tablet, or computer.' },
              { step: '3', title: 'Parents Get Notified', desc: 'Absent students trigger an automatic SMS to parents. No phone calls, no paperwork.' },
            ].map(s => (
              <div key={s.step} style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: G,
                  color: '#fff', fontSize: 22, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>{s.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>Simple, Honest Pricing</h2>
          <p style={{ color: '#6b7280', fontSize: 17, marginBottom: 56 }}>One flat monthly fee. No hidden costs. No per-SMS charges.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {[
              {
                name: 'Trial',
                price: 'FREE',
                period: '30 days',
                color: '#6b7280',
                features: ['Up to 200 students', 'Full SMS alerts', 'All reports', 'MOE dashboard', 'No credit card'],
                cta: 'Start Free Trial',
                highlight: false,
              },
              {
                name: 'School',
                price: 'J$15,000',
                period: 'per month',
                color: G,
                features: ['Unlimited students', 'Full SMS alerts', 'All reports', 'MOE dashboard', 'Priority support', 'Staff training included'],
                cta: 'Get Started',
                highlight: true,
              },
              {
                name: 'District',
                price: 'Custom',
                period: 'contact us',
                color: DARK,
                features: ['5+ schools', 'Central MOE dashboard', 'Bulk student import', 'Dedicated support', 'Custom reports', 'SLA guarantee'],
                cta: 'Contact Us',
                highlight: false,
              },
            ].map(p => (
              <div key={p.name} style={{
                borderRadius: 16, padding: 32, textAlign: 'left',
                border: p.highlight ? `3px solid ${G}` : '1.5px solid #e5e7eb',
                background: p.highlight ? '#f0fdf4' : '#fff',
                position: 'relative', boxShadow: p.highlight ? '0 8px 32px rgba(0,107,63,0.15)' : 'none'
              }}>
                {p.highlight && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: G, color: '#fff', padding: '4px 16px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: p.color, marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontSize: 36, fontWeight: 800, margin: '0 0 4px' }}>{p.price}</div>
                <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>{p.period}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize: 14, color: '#374151', marginBottom: 10, display: 'flex', gap: 8 }}>
                      <span style={{ color: G, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" style={{
                  display: 'block', textAlign: 'center', padding: '12px',
                  background: p.highlight ? G : 'transparent',
                  color: p.highlight ? '#fff' : G,
                  border: `2px solid ${G}`, borderRadius: 8,
                  fontWeight: 700, fontSize: 15, textDecoration: 'none'
                }}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / TRUST ─────────────────────────────────────── */}
      <section style={{ background: G, padding: '70px 40px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>💬</div>
          <blockquote style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 24px' }}>
            "This system saves our office staff at least 3 hours every morning.
            Parents actually thank us now for keeping them informed."
          </blockquote>
          <div style={{ fontWeight: 700, color: GOLD }}>Principal, Kingston Secondary School</div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Beta School Partner</div>
        </div>
      </section>

      {/* ── CONTACT / CTA ───────────────────────────────────────────── */}
      <section id="contact" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>Ready to Get Started?</h2>
          <p style={{ color: '#6b7280', fontSize: 17, marginBottom: 40 }}>
            Book a free demo — we'll walk you through the system live and set up your school the same day.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <a href="https://wa.me/18768751969?text=Hi, I'm interested in SchoolTrack JM for my school" target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#25D366', color: '#fff', padding: '16px',
              borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(37,211,102,0.3)'
            }}>
              <span style={{ fontSize: 24 }}>📲</span> Chat on WhatsApp
            </a>
            <a href="mailto:saqlain@schooltrackjm.com?subject=SchoolTrack JM Demo Request" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#f4f6f9', color: DARK, padding: '16px',
              borderRadius: 12, fontWeight: 700, fontSize: 17, textDecoration: 'none',
              border: '1.5px solid #e5e7eb'
            }}>
              <span style={{ fontSize: 24 }}>✉️</span> Send an Email
            </a>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 20 }}>
            We typically respond within 2 hours during business hours (Mon–Fri, 8am–5pm Jamaica time)
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ background: DARK, color: 'rgba(255,255,255,0.5)', padding: '32px 40px', textAlign: 'center', fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: '#fff' }}>SchoolTrack JM</span> — Jamaica Ministry of Education School Management Platform
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} SchoolTrack JM Ltd</span>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, padding: 0 }}>School Login</button>
          <button onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, padding: 0 }}>Privacy Policy</button>
          <button onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, padding: 0 }}>Terms of Service</button>
        </div>
      </footer>

    </div>
  )
}
