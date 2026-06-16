import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const NAV = [
  { path: '/',                icon: '◈', label: 'Dashboard' },
  { path: '/ingresos',        icon: '↑', label: 'Ingresos' },
  { path: '/gastos',          icon: '↓', label: 'Gastos' },
  { path: '/analisis',        icon: '◎', label: 'Análisis' },
  { path: '/hormigas',        icon: '⬡', label: 'Gastos Hormiga' },
  { path: '/metas',           icon: '◉', label: 'Metas' },
  { path: '/recomendaciones', icon: '✦', label: 'Recomendaciones' },
  { path: '/perfil',          icon: '◯', label: 'Perfil' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: collapsed ? 60 : 210, background: '#18181B',
        borderRight: '1px solid #27272A', display: 'flex', flexDirection: 'column',
        height: '100vh', transition: 'width .25s', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div
          onClick={() => setCollapsed(p => !p)}
          style={{
            padding: '14px 10px', display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: '1px solid #27272A', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>✦</div>
          {!collapsed && (
            <span style={{
              fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap',
              background: 'linear-gradient(90deg,#8B5CF6,#C084FC)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>AURA</span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 6px', overflowY: 'auto' }}>
          {NAV.map(n => {
            const active = location.pathname === n.path
            return (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 9px', borderRadius: 10, border: 'none',
                  background: active ? '#6D28D933' : 'transparent',
                  color: active ? '#8B5CF6' : '#A1A1AA',
                  fontWeight: active ? 600 : 400, fontSize: 13,
                  cursor: 'pointer', marginBottom: 2, textAlign: 'left', whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: 'center' }}>
                  {n.icon}
                </span>
                {!collapsed && n.label}
              </button>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '10px 6px', borderTop: '1px solid #27272A' }}>
          {!collapsed && user && (
            <p style={{
              fontSize: 11, color: '#A1A1AA', padding: '6px 9px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user.nombre} {user.apellido}
            </p>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 9px', borderRadius: 10, border: 'none',
              background: 'transparent', color: '#EF4444', fontSize: 13, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: 'center' }}>⏏</span>
            {!collapsed && 'Salir'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', minWidth: 0 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
