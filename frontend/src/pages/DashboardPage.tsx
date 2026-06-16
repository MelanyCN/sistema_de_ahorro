/**
 * DashboardPage — conecta con la API real
 */
import { useQuery } from '@tanstack/react-query'
import { analisisService, ingresosService, gastosService } from '../services'
import { useAuthStore } from '../store/authStore'

const C = { surface:'#18181B', border:'#27272A', muted:'#A1A1AA', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B', primary2:'#8B5CF6' }
const fmt = (n: number) => `S/${Math.round(n)}`

function StatCard({ label, value, color = C.primary2 }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1rem 1.25rem', flex: 1, minWidth: 140 }}>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color }}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const now = new Date()
  const { data: analisis } = useQuery({
    queryKey: ['analisis', now.getMonth() + 1, now.getFullYear()],
    queryFn: () => analisisService.getAnalisis({ mes: now.getMonth() + 1, anio: now.getFullYear() }),
  })
  const { data: recs } = useQuery({
    queryKey: ['recs'],
    queryFn: () => analisisService.getRecomendaciones(),
  })

  const tI = analisis?.ingreso_total ?? 0
  const tG = analisis?.gasto_total ?? 0
  const saldo = analisis?.balance ?? 0
  const aPct = analisis?.porcentaje_ahorro ?? 0

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Hola, {user?.nombre} 👋</h2>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
          {now.toLocaleString('es-PE', { month: 'long', year: 'numeric' })} · Resumen financiero
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard label="Saldo Disponible" value={fmt(saldo)} color={saldo >= 0 ? C.success : C.danger} />
        <StatCard label="Ingresos del Mes" value={fmt(tI)} color={C.success} />
        <StatCard label="Gastos del Mes" value={fmt(tG)} color={C.danger} />
        <StatCard label="Ahorro Estimado" value={`${aPct.toFixed(1)}%`} color={aPct >= 10 ? C.success : C.warn} />
      </div>

      {/* Distribución por categoría */}
      {analisis && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Gastos por categoría</p>
          {Object.entries(analisis.gastos_por_categoria).sort((a,b) => b[1]-a[1]).map(([cat, val]) => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{cat}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(val)}</span>
              </div>
              <div style={{ background: C.border, borderRadius: 99, height: 5 }}>
                <div style={{ width: `${Math.min(100,(val/tG)*100)}%`, height: '100%', background: C.primary2, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recomendaciones rápidas */}
      {recs && recs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recs.slice(0,2).map((r, i) => (
            <div key={i} style={{
              background: r.tipo === 'success' ? '#22C55E11' : r.tipo === 'warn' ? '#F59E0B11' : '#3B82F611',
              border: `1px solid ${r.tipo === 'success' ? '#22C55E33' : r.tipo === 'warn' ? '#F59E0B33' : '#3B82F633'}`,
              borderRadius: 12, padding: '0.875rem 1rem', display: 'flex', gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>{r.icono}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{r.titulo}</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{r.mensaje}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
