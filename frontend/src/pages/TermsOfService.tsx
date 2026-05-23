import { useNavigate } from 'react-router-dom'

const G = '#006b3f'

export default function TermsOfService() {
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
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: '#6b7280', marginBottom: 40 }}>Last updated: May 23, 2026</p>

        {[
          {
            title: '1. Agreement to Terms',
            body: `By accessing or using SchoolTrack JM ("the Platform") operated by SchoolTrack JM Ltd, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the Platform.

These terms apply to all users including MOE administrators, school administrators, teachers, and parents.`
          },
          {
            title: '2. Description of Service',
            body: `SchoolTrack JM is a cloud-based school management platform providing:
• Digital attendance tracking and reporting
• Student and class management
• Behaviour record keeping
• Automated SMS notifications to parents
• MOE-level reporting and oversight
• Parent portal for viewing student records`
          },
          {
            title: '3. User Accounts & Responsibilities',
            body: `School administrators are responsible for:
• Ensuring all staff accounts are created only for authorised personnel
• Maintaining the confidentiality of login credentials
• Promptly deactivating accounts of departed staff
• Ensuring accuracy of student and parent data entered into the system
• Obtaining appropriate consent from parents for SMS notifications

Users must not share passwords, attempt to access unauthorised data, or use the platform for any unlawful purpose.`
          },
          {
            title: '4. Subscription & Payment',
            body: `Free Trial: Schools receive a 30-day free trial with full access to all features. No credit card is required during the trial period.

School Plan: After the trial period, continued access requires a subscription of J$15,000 per month per school. Payment is due at the beginning of each month.

District/MOE Plan: Custom pricing for 5 or more schools. Contact us for a quote.

Failure to pay within 14 days of the due date may result in suspension of service. Data is retained for 30 days after suspension before permanent deletion.`
          },
          {
            title: '5. Data Ownership',
            body: `All student, attendance, and school data entered into the platform remains the property of the respective school or the Ministry of Education. SchoolTrack JM Ltd does not claim ownership of any school data.

Upon termination of service, schools may request a full export of their data in CSV format within 30 days of termination.`
          },
          {
            title: '6. Acceptable Use',
            body: `You agree not to:
• Use the platform for any purpose other than school management
• Attempt to reverse engineer, hack, or disrupt the platform
• Enter false or misleading student data
• Share student data with unauthorised third parties
• Use the platform in any way that violates Jamaican law`
          },
          {
            title: '7. Service Availability',
            body: `We aim to maintain 99% uptime. Planned maintenance will be communicated in advance where possible. We are not liable for losses resulting from temporary service interruptions.

The platform is hosted on Railway cloud infrastructure. We maintain automated daily backups of all data.`
          },
          {
            title: '8. Limitation of Liability',
            body: `SchoolTrack JM Ltd shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform. Our total liability to any school or user shall not exceed the total fees paid in the 3 months preceding the claim.

We are not responsible for SMS delivery failures caused by mobile network issues or incorrect phone numbers provided by schools.`
          },
          {
            title: '9. Termination',
            body: `Either party may terminate the service agreement with 30 days written notice. We reserve the right to immediately terminate accounts that violate these terms.

Upon termination, data export requests must be submitted within 30 days.`
          },
          {
            title: '10. Governing Law',
            body: `These Terms of Service are governed by the laws of Jamaica. Any disputes shall be subject to the exclusive jurisdiction of the courts of Jamaica.`
          },
          {
            title: '11. Contact',
            body: `SchoolTrack JM Ltd
Black River, St. Elizabeth, Jamaica
Email: saqlain@schooltrackjm.com
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
            These Terms of Service constitute the entire agreement between SchoolTrack JM Ltd and the school or user. By using the platform, you acknowledge that you have read and understood these terms.
          </p>
        </div>
      </div>
    </div>
  )
}
