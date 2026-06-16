import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', edad: '',
    ingreso_mensual: '', password: '', password_confirm: '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const token = await authService.login(form.email, form.password)
        setToken(token.access_token)
        const user = await authService.getMe()
        setUser(user)
        navigate('/')
      } else {
        if (form.password !== form.password_confirm) {
          setError('Las contraseñas no coinciden')
          return
        }
        await authService.register({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          edad: parseInt(form.edad) || undefined,
          ingreso_mensual: parseFloat(form.ingreso_mensual) || 0,
          password: form.password,
          password_confirm: form.password_confirm,
        })
        // Auto-login tras registro
        const token = await authService.login(form.email, form.password)
        setToken(token.access_token)
        const user = await authService.getMe()
        setUser(user)
        navigate('/')
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const inp = (ph: string, k: string, type = 'text') => (
    <input
      type={type}
      placeholder={ph}
      value={(form as any)[k]}
      onChange={set(k)}
      style={{
        background: '#1C1C1F', border: '1px solid #27272A', color: '#fff',
        padding: '10px 14px', borderRadius: 10, fontSize: 14, width: '100%',
        outline: 'none', fontFamily: 'Inter, sans-serif',
      }}
    />
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0F0F0F', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 32,
          }}>✦</div>
          <h1 style={{
            fontSize: 30, fontWeight: 800,
            background: 'linear-gradient(90deg,#8B5CF6,#C084FC)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>AURA</h1>
          <p style={{ color: '#A1A1AA', fontSize: 13, marginTop: 4 }}>
            Asistente Útil para el Rendimiento y Ahorro
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#18181B', border: '1px solid #27272A',
          borderRadius: 16, padding: '1.5rem',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: mode === m ? '#6D28D9' : 'transparent',
                color: mode === m ? '#fff' : '#A1A1AA',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {inp('Nombre', 'nombre')}
                {inp('Apellido', 'apellido')}
              </div>
            )}
            {mode === 'register' && inp('Edad', 'edad', 'number')}
            {mode === 'register' && inp('Ingreso mensual (S/)', 'ingreso_mensual', 'number')}
            {inp('Correo electrónico', 'email', 'email')}
            {inp('Contraseña', 'password', 'password')}
            {mode === 'register' && inp('Confirmar contraseña', 'password_confirm', 'password')}

            {error && (
              <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '11px', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar →' : 'Crear cuenta →'}
            </button>
          </div>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#A1A1AA', marginTop: 12 }}>
              Demo: demo@aura.pe / demo1234
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
