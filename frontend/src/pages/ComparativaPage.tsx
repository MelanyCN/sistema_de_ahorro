import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analisisService } from '../services'

const C = { surface:'#18181B', border:'#27272A', muted:'#A1A1AA', primary2:'#8B5CF6', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B' }
const fmt = (n: number) => `S/${Math.round(n)}`
const CAT_COLORS: Record<string, string> = { 'Alimentación':'#22C55E','Transporte':'#3B82F6','Entretenimiento':'#A855F7','Educación':'#F59E0B','Salud':'#EF4444','Servicios':'#06B6D4','Compras':'#EC4899','Otros':'#6B7280' }

export default function ComparativaPage() {
  const [meses, setMeses] = useState(3)

  const { data = [], isLoading } = useQuery({
    queryKey: ['comparativa', meses],
    queryFn: () => analisisService.getComparativa(meses),
  })

  const chartData = data.map(m => ({
    name: m.label,
    Ingresos: m.ingreso_total,
    Gastos: m.gasto_total,
    Balance: m.balance,
  }))

  const actual = data[data.length - 1]
  const anterior = data[data.length - 2]

  const delta = (campo: 'ingreso_total' | 'gasto_total' | 'porcentaje_ahorro') => {
    if (!actual || !anterior) return null
    const diff = actual[campo] - anterior[campo]
    const pct = anterior[campo] !== 0 ? (diff / Math.abs(anterior[campo])) * 100 : 0
    return { diff, pct }
  }

  const allCats = [...new Set(data.flatMap(m => Object.keys(m.gastos_por_categoria)))]

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700 }}>Comparativa Mensual</h2>
          <p style={{ color:C.muted, fontSize:13 }}>Evolución de tus finanzas en el tiempo</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[3, 6, 12].map(n => (
            <button
              key={n}
              onClick={() => setMeses(n)}
              style={{
                background: meses === n ? C.primary2 : 'transparent',
                border: `1px solid ${meses === n ? C.primary2 : C.border}`,
                color: meses === n ? '#fff' : C.muted,
                borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer',
              }}
            >
              {n} meses
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Calculando...</p>}

      {/* Tarjetas de variación vs mes anterior */}
      {actual && anterior && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:'1.5rem' }}>
          {[
            { label:'Ingresos', campo:'ingreso_total' as const, invert:false },
            { label:'Gastos', campo:'gasto_total' as const, invert:true },
            { label:'% Ahorro', campo:'porcentaje_ahorro' as const, invert:false },
          ].map(({ label, campo, invert }) => {
            const d = delta(campo)
            if (!d) return null
            const positive = invert ? d.diff < 0 : d.diff >= 0
            const color = positive ? C.success : C.danger
            const arrow = d.diff >= 0 ? '↑' : '↓'
            return (
              <div key={campo} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
                <p style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{label} vs mes anterior</p>
                <p style={{ fontSize:20, fontWeight:700, color }}>
                  {arrow} {Math.abs(d.pct).toFixed(1)}%
                </p>
                <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  {d.diff >= 0 ? '+' : ''}{campo === 'porcentaje_ahorro' ? d.diff.toFixed(1) + '%' : fmt(d.diff)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Gráfico de barras */}
      {data.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1.25rem', marginBottom:'1.5rem' }}>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Ingresos vs Gastos por mes</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top:0, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `S/${Math.round(v)}`} />
              <Tooltip
                contentStyle={{ background:'#1C1C1F', border:`1px solid ${C.border}`, borderRadius:10 }}
                labelStyle={{ color:'#fff', fontWeight:600 }}
                formatter={(value: number) => [`S/${value.toFixed(2)}`, '']}
              />
              <Legend wrapperStyle={{ fontSize:13, color:C.muted }} />
              <Bar dataKey="Ingresos" fill={C.success} radius={[4,4,0,0]} />
              <Bar dataKey="Gastos" fill={C.danger} radius={[4,4,0,0]} />
              <Bar dataKey="Balance" fill={C.primary2} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de ahorro por mes */}
      {data.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1.25rem', marginBottom:'1.5rem', overflowX:'auto' }}>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Resumen por mes</p>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                {['Mes','Ingresos','Gastos','Balance','% Ahorro'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'6px 12px', color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}22` }}>
                  <td style={{ padding:'8px 12px', fontWeight:600 }}>{m.label}</td>
                  <td style={{ padding:'8px 12px', color:C.success }}>{fmt(m.ingreso_total)}</td>
                  <td style={{ padding:'8px 12px', color:C.danger }}>{fmt(m.gasto_total)}</td>
                  <td style={{ padding:'8px 12px', color: m.balance >= 0 ? C.success : C.danger, fontWeight:700 }}>{fmt(m.balance)}</td>
                  <td style={{ padding:'8px 12px', color: m.porcentaje_ahorro >= 10 ? C.success : C.warn }}>
                    {m.porcentaje_ahorro.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Desglose por categoría a lo largo de los meses */}
      {allCats.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1.25rem', overflowX:'auto' }}>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Gastos por categoría</p>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding:'6px 12px', color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>Categoría</th>
                {data.map((m, i) => (
                  <th key={i} style={{ textAlign:'right', padding:'6px 12px', color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}` }}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allCats.map(cat => (
                <tr key={cat} style={{ borderBottom:`1px solid ${C.border}22` }}>
                  <td style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:9, height:9, borderRadius:99, background:CAT_COLORS[cat] || C.muted, flexShrink:0, display:'inline-block' }} />
                    {cat}
                  </td>
                  {data.map((m, i) => (
                    <td key={i} style={{ padding:'8px 12px', textAlign:'right', color: m.gastos_por_categoria[cat] ? '#fff' : C.border }}>
                      {m.gastos_por_categoria[cat] ? fmt(m.gastos_por_categoria[cat]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
