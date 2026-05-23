import { useNavigate } from 'react-router-dom'

const G = '#006b3f'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span onClick={() => navigate('/')} style={{ fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>
          🏫 SchoolTrack <span style={{ color: G }}>JM</span>
        </span>
        <button onClick={() => navigate('/login')} style={{ background: G, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Login</button>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#6b7280', marginBottom: 40 }}>Last updated: May 23, 2026</p>

        {[
          {
            title: '1. Introduction',
            body: `SchoolTrack JM Ltd ("we", "our", or "us") operates the SchoolTrack JM school management platform (schooltrackjm.com). This Privacy Policy explains how we collect, use, store, and protect information in compliance with the Jamaica Data Protection Act, 2020.

We are committed to protecting the privacy of students, parents, teachers, school administrators, and Ministry of Education officials who use our platform.`
          },
          {
            title: '2. Information We Collect',
            body: `We collect the following categories of information:

Student Information: Full name, date of birth, gender, student ID number, home address, class and school assignment.

Parent/Guardian Information: Name, phone number(s), email address.

Staff Information: Name, email address, role, school assignment.

Attendance & Behaviour Data: Daily attendance records, behaviour incidents, commendations, and related notes entered by authorised school staff.

Usage Data: Login times, IP addresses, and actions taken within the platform for security and audit purposes.`
          },
          {
            title: '3. How We Use Your Information',
            body: `We use the information collected to:
• Operate and maintain the school attendance and management platform
• Send SMS notifications to parents/guardians regarding student attendance
• Generate reports for school administrators and the Ministry of Education
• Ensure platform security and prevent unauthorised access
• Comply with legal obligations under Jamaican law`
          },
          {
            title: '4. SMS Notifications',
            body: `With consent from schools and parents, we send automated SMS messages to parent/guardian phone numbers when a student is marked absent. These messages are sent via Twilio, a third-party SMS provider. Message and data rates may apply depending on the recipient's mobile carrier (Digicel, FLOW, etc.).

Parents may opt out of SMS notifications by contacting their school administrator.`
          },
          {
            title: '5. Data Sharing',
            body: `We do not sell, rent, or trade personal information to third parties.

We may share information with:
• Authorised school staff and Ministry of Education administrators within the platform
• Twilio Inc. (SMS delivery only — no data storage by Twilio beyond delivery logs)
• Law enforcement or government authorities if required by Jamaican law

We do not share student data with any commercial third parties.`
          },
          {
            title: '6. Data Security',
            body: `We implement industry-standard security measures including:
• Encrypted data transmission (HTTPS/TLS)
• Bcrypt password hashing
• JWT-based authentication with role-based access control
• Rate limiting to prevent brute-force attacks
• Audit logging of all administrative actions
• Regular automated database backups

Data is stored on secure cloud infrastructure within Railway's platform.`
          },
          {
            title: '7. Data Retention',
            body: `Student and attendance records are retained for the duration of a student's enrolment and for a period of 7 years thereafter, in accordance with standard educational record-keeping requirements in Jamaica.

Audit logs are retained for 2 years. User accounts are deactivated upon staff departure and can be permanently deleted upon written request.`
          },
          {
            title: '8. Your Rights (Jamaica Data Protection Act, 2020)',
            body: `Under the Jamaica Data Protection Act, 2020, you have the right to:
• Access the personal data we hold about you or your child
• Request correction of inaccurate data
• Request deletion of data (subject to legal retention requirements)
• Object to processing of your personal data
• Lodge a complaint with the Office of the Information Commissioner of Jamaica

To exercise any of these rights, contact us at: damian@schooltrackjm.com`
          },
          {
            title: '9. Children\'s Privacy',
            body: `Our platform processes student data including minors. All student data is collected and managed through authorised school administrators, not directly from students or parents. Schools are responsible for obtaining appropriate consent from parents/guardians in accordance with their enrolment procedures.`
          },
          {
            title: '10. Contact Us',
            body: `For any privacy-related questions or concerns:

SchoolTrack JM Ltd
Black River, St. Elizabeth, Jamaica
Email: damian@schooltrackjm.com
WhatsApp: +1 (876) 875-1969`
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: G, marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 24, background: '#f0fdf4', borderRadius: 12, border: `1px solid ${G}` }}>
          <p style={{ margin: 0, color: '#374151', fontSize: 14 }}>
            This Privacy Policy is governed by the laws of Jamaica. By using SchoolTrack JM, you agree to the terms of this policy.
          </p>
        </div>
      </div>
    </div>
  )
}
