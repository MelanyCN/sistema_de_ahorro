import { useQuery } from '@tanstack/react-query'
import { analisisService } from '../services'

const C = { surface:'#18181B', border:'#27272A', muted:'#A1A1AA', primary2:'#8B5CF6', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B' }
const CAT_COLORS: Record<string,string> = { 'Alimentación':'#22C55E','Transporte':'#3B82F6','Entretenimiento':'#A855F7','Educación':'#F59E0B','Salud':'#EF4444','Servicios':'#06B6D4','Compras':'#EC4899','Otros':'#6B7280' }
const fmt = (n: number) => `S/${n.toFixed(2)}`

export default function AnalisisPage() {
  const now = new Date()
  const { data, isLoading } = useQuery({
    queryKey: ['analisis', now.getMonth()+1, now.getFullYear()],
    queryFn: () => analisisService.getAnalisis({ mes: now.getMonth()+1, anio: now.getFullYear() }),
  })

  if (isLoading) return <p style={{ color:C.muted, padding:'2rem', textAlign:'center' }}>Calculando análisis...</p>
  if (!data) return null

  const stats = [
    { l:'Ingreso Total', v:fmt(data.ingreso_total), c:C.success },
    { l:'Gasto Total', v:fmt(data.gasto_total), c:C.danger },
    { l:'Balance', v:fmt(data.balance), c:data.balance>=0?C.success:C.danger },
    { l:'Promedio Diario', v:fmt(data.promedio_diario), c:C.primary2 },
    { l:'Promedio Semanal', v:fmt(data.promedio_semanal), c:C.primary2 },
    { l:'Promedio Mensual', v:fmt(data.promedio_mensual), c:C.primary2 },
    { l:'Cat. más costosa', v:data.categoria_mas_costosa||'-', c:C.warn },
    { l:'% Ahorro', v:`${data.porcentaje_ahorro.toFixed(1)}%`, c:data.porcentaje_ahorro>=10?C.success:C.warn },
  ]

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:22, fontWeight:700 }}>Análisis Financiero</h2>
        <p style={{ color:C.muted, fontSize:13 }}>Métricas detalladas de tu mes</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12, marginBottom:'1.5rem' }}>
        {stats.map(s => (
          <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
            <p style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{s.l}</p>
            <p style={{ fontSize:18, fontWeight:700, color:s.c }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
        <p style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Detalle por categoría</p>
        {Object.entries(data.gastos_por_categoria).sort((a,b) => b[1]-a[1]).map(([cat, val]) => {
          const pct = data.gasto_total > 0 ? (val/data.gasto_total*100).toFixed(1) : '0'
          return (
            <div key={cat} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:99, background:CAT_COLORS[cat]||C.muted, flexShrink:0 }}/>
                  <span style={{ fontSize:13 }}>{cat}</span>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <span style={{ fontSize:12, color:C.muted }}>{pct}%</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{fmt(val)}</span>
                </div>
              </div>
              <div style={{ background:'#27272A', borderRadius:99, height:5 }}>
                <div style={{ width:`${Math.min(100,parseFloat(pct))}%`, height:'100%', background:CAT_COLORS[cat]||C.primary2, borderRadius:99 }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
