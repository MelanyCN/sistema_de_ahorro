import { useQuery } from '@tanstack/react-query'
import { analisisService } from '../services'
import { useAuthStore } from '../store/authStore'

const C = { surface:'#18181B', border:'#27272A', muted:'#A1A1AA', primary:'#6D28D9', primary2:'#8B5CF6', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B', info:'#3B82F6' }
const fmt = (n: number) => `S/${n.toFixed(2)}`

export default function PerfilPage() {
  const user = useAuthStore(s => s.user)
  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil'],
    queryFn: () => analisisService.getPerfilFinanciero(),
  })

  const colorMap: Record<string,string> = { danger:C.danger, warn:C.warn, info:C.info, success:C.success }
  const iconMap: Record<string,string> = { GASTADOR:'⚠️', EN_RIESGO:'📉', MODERADO:'📊', AHORRADOR:'⭐' }
  const mainColor = perfil ? (colorMap[perfil.color] || C.primary2) : C.primary2

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:22, fontWeight:700 }}>Perfil Financiero</h2>
        <p style={{ color:C.muted, fontSize:13 }}>Tu clasificación y datos personales</p>
      </div>

      {/* Datos de usuario */}
      {user && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem', marginBottom:14, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${C.primary},${C.primary2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, flexShrink:0 }}>
            {user.nombre[0]}{user.apellido?.[0] || ''}
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:18 }}>{user.nombre} {user.apellido}</p>
            <p style={{ color:C.muted, fontSize:13 }}>{user.email}</p>
            {user.edad && <p style={{ color:C.muted, fontSize:12, marginTop:2 }}>{user.edad} años · Ingreso base: {fmt(user.ingreso_mensual || 0)}</p>}
          </div>
        </div>
      )}

      {/* Perfil financiero */}
      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Calculando perfil...</p>}
      {perfil && (
        <>
          <div style={{ background:mainColor+'11', border:`2px solid ${mainColor}44`, borderRadius:14, padding:'1.25rem', marginBottom:14, display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:36 }}>{iconMap[perfil.tipo] || '📊'}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:12, color:C.muted, marginBottom:2 }}>Perfil financiero</p>
              <p style={{ fontSize:24, fontWeight:800, color:mainColor }}>{perfil.tipo}</p>
              <p style={{ fontSize:13, color:'#fff', marginTop:4, lineHeight:1.5 }}>{perfil.descripcion}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:12, color:C.muted }}>Tasa de ahorro</p>
              <p style={{ fontSize:28, fontWeight:800, color:mainColor }}>{perfil.porcentaje_ahorro.toFixed(1)}%</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
            {[['Total ingresos', fmt(perfil.ingreso_total), C.success],['Total gastos', fmt(perfil.gasto_total), C.danger],['Balance', fmt(perfil.balance), perfil.balance>=0?C.success:C.danger]].map(([l,v,c]) => (
              <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
                <p style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{l}</p>
                <p style={{ fontSize:20, fontWeight:700, color:c as string }}>{v}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
