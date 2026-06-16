import { useQuery } from '@tanstack/react-query'
import { analisisService } from '../services'

const C = { surface:'#18181B', border:'#27272A', muted:'#A1A1AA', primary2:'#8B5CF6', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B' }
const CAT_COLORS: Record<string,string> = { 'Alimentación':'#22C55E','Transporte':'#3B82F6','Entretenimiento':'#A855F7','Educación':'#F59E0B','Salud':'#EF4444','Servicios':'#06B6D4','Compras':'#EC4899','Otros':'#6B7280' }
const fmt = (n: number) => `S/${Math.round(n)}`

export default function HormigasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analisis-all'],
    queryFn: () => analisisService.getAnalisis(),
  })

  const hormigas = data?.gastos_hormiga ?? []
  const totalMensual = hormigas.reduce((a, h) => a + h.total_acumulado, 0)

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:22, fontWeight:700 }}>Gastos Hormiga</h2>
        <p style={{ color:C.muted, fontSize:13 }}>Pequeños gastos repetitivos que suman mucho</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12, marginBottom:'1.5rem' }}>
        {[['Impacto mensual', fmt(totalMensual), C.warn],['Impacto anual', fmt(totalMensual*12), C.danger],['Ahorro posible/mes', fmt(totalMensual*0.5), C.success]].map(([l,v,c]) => (
          <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
            <p style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Analizando patrones...</p>}
      {!isLoading && hormigas.length === 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'2rem', textAlign:'center', color:C.muted }}>
          No se detectaron gastos hormiga. ¡Excelente hábito de consumo!
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12 }}>
        {hormigas.map((h, i) => (
          <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.warn}`, borderRadius:14, padding:'1rem 1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <p style={{ fontWeight:600, fontSize:15 }}>{h.descripcion}</p>
                <span style={{ background:(CAT_COLORS[h.categoria]||C.muted)+'22', color:CAT_COLORS[h.categoria]||C.muted, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{h.categoria}</span>
              </div>
              <p style={{ fontWeight:800, fontSize:20, color:C.warn }}>{fmt(h.total_acumulado)}</p>
            </div>
            <div style={{ background:'#1C1C1F', borderRadius:10, padding:'8px 0', display:'grid', gridTemplateColumns:'1fr 1fr 1fr' }}>
              {[['Veces', h.cantidad_veces, '#fff'],['Prom.', fmt(h.promedio_por_vez), C.primary2],['Anual', fmt(h.impacto_anual_estimado), C.danger]].map(([l,v,c]) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <p style={{ fontSize:10, color:C.muted }}>{l}</p>
                  <p style={{ fontSize:14, fontWeight:700, color:c as string }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
