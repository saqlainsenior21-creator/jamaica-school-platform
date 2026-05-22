import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60, textAlign: 'center'
      }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: '#6b7280', marginBottom: 20, maxWidth: 400 }}>
          {this.state.error?.message || 'An unexpected error occurred.'}
        </p>
        <button onClick={() => this.setState({ hasError: false })} style={{
          padding: '9px 20px', background: '#006b3f', color: '#fff',
          border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
        }}>
          Try again
        </button>
      </div>
    )
  }
}
