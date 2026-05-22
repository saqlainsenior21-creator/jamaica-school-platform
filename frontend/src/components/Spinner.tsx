export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, flexDirection: 'column', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #e5e7eb', borderTopColor: '#006b3f',
        animation: 'spin 0.7s linear infinite'
      }} />
      <span style={{ color: '#9ca3af', fontSize: 14 }}>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
