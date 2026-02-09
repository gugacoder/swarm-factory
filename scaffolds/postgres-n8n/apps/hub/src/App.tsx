import { useEffect, useState } from 'react'

type Status = 'loading' | 'ok' | 'down'

interface ServiceHealth {
  status: 'ok' | 'down'
  latency: number
  port: number
}

interface HealthResponse {
  status: 'ok' | 'degraded'
  services: Record<string, ServiceHealth>
}

const LABELS: Record<string, string> = {
  hub: 'Hub',
  backbone: 'Backbone',
  landing: 'Landing',
  postgres: 'PostgreSQL',
  n8n: 'n8n',
}

const GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Apps', keys: ['hub', 'backbone', 'landing'] },
  { title: 'Plataforma', keys: ['postgres', 'n8n'] },
]

interface ServiceState {
  key: string
  name: string
  status: Status
  latency?: number
  port?: number
}

export default function App() {
  const [services, setServices] = useState<ServiceState[]>(
    GROUPS.flatMap((g) => g.keys.map((key) => ({ key, name: LABELS[key] || key, status: 'loading' as Status }))),
  )

  const checkAll = async () => {
    setServices((prev) => prev.map((s) => ({ ...s, status: 'loading', latency: undefined })))

    try {
      const res = await fetch('/health')
      const data: HealthResponse = await res.json()

      setServices((prev) =>
        prev.map((s) => {
          const svc = data.services[s.key]
          if (!svc) return { ...s, status: 'down' }
          return { ...s, status: svc.status, latency: svc.latency, port: svc.port }
        }),
      )
    } catch {
      setServices((prev) => prev.map((s) => ({ ...s, status: 'down' })))
    }
  }

  useEffect(() => {
    checkAll()
  }, [])

  const dot = (s: Status) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: s === 'ok' ? '#22c55e' : s === 'down' ? '#ef4444' : '#a3a3a3',
  })

  const label = (s: Status) =>
    s === 'ok' ? 'Saudável' : s === 'down' ? 'Indisponível' : 'Verificando...'

  const renderGroup = (title: string, keys: string[]) => {
    const items = services.filter((s) => keys.includes(s.key))
    return (
      <div key={title}>
        <p style={{ color: '#a3a3a3', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
          {title}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {items.map((s) => (
            <div
              key={s.key}
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                padding: '1.5rem',
                minWidth: 160,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#737373', marginBottom: '0.5rem' }}>
                {s.name}{s.port ? ` :${s.port}` : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={dot(s.status)} />
                <span style={{ fontWeight: 500 }}>{label(s.status)}</span>
              </div>
              {s.latency !== undefined && s.latency > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#a3a3a3', marginTop: '0.25rem' }}>
                  {s.latency}ms
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui',
        gap: '2rem',
      }}
    >
      <h1 style={{ margin: 0 }}>Health Check</h1>

      {GROUPS.map((g) => renderGroup(g.title, g.keys))}

      <button
        onClick={checkAll}
        style={{
          padding: '0.5rem 1.5rem',
          borderRadius: 6,
          border: '1px solid #e5e5e5',
          background: 'white',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Verificar novamente
      </button>
    </div>
  )
}
