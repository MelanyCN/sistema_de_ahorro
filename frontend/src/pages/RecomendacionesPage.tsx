import { useQuery } from '@tanstack/react-query'
import { analisisService } from '../services'

const C = { surface:'#18181B', border:'#27272A', muted:'#A1A1AA', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B', info:'#3B82F6' }

export default function RecomendacionesPage() {
  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['recs-all'],
    queryFn: () => analisisService.getRecomendaciones(),
  })
  const ts: Record<string,{ bg:string; border:string; color:string }> = {
    warn:    { bg:C.warn+'22',    border:C.warn+'44',    color:C.warn },
    info:    { bg:C.info+'22',    border:C.info+'44',    color:C.info },
    success: { bg:C.success+'22', border:C.success+'44', color:C.success },
  }

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:22, fontWeight:700 }}>Recomendaciones</h2>
        <p style={{ color:C.muted, fontSize:13 }}>Consejos personalizados basados en tus hábitos</p>
      </div>
      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Analizando tus datos...</p>}
      {!isLoading && recs.length === 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'2rem', textAlign:'center', color:C.muted }}>
          Registra ingresos y gastos para recibir recomendaciones.
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {recs.map((r: any, i: number) => {
          const s = ts[r.tipo] || ts.info
          return (
            <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:14, padding:'1rem 1.25rem', display:'flex', gap:14, alignItems:'flex-start' }}>
              <span style={{ fontSize:24, flexShrink:0 }}>{r.icono}</span>
              <div>
                <p style={{ fontWeight:600, fontSize:15, color:s.color, marginBottom:4 }}>{r.titulo}</p>
                <p style={{ fontSize:13, color:'#fff', lineHeight:1.6 }}>{r.mensaje}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
