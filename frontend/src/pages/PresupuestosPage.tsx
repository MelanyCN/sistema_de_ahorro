import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { presupuestosService } from '../services'
import type { CategoriaGasto, PresupuestoCreate } from '../types'

const C = { surface:'#18181B', surface2:'#1C1C1F', border:'#27272A', muted:'#A1A1AA', primary:'#6D28D9', primary2:'#8B5CF6', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B' }
const fmt = (n: number) => `S/${n.toFixed(2)}`

const CATEGORIAS: CategoriaGasto[] = ['Alimentación','Transporte','Entretenimiento','Educación','Salud','Servicios','Compras','Otros']
const CAT_ICONS: Record<string, string> = { 'Alimentación':'🍔','Transporte':'🚌','Entretenimiento':'🎬','Educación':'📚','Salud':'💊','Servicios':'💡','Compras':'🛍️','Otros':'📦' }

function barColor(pct: number) {
  if (pct >= 100) return C.danger
  if (pct >= 80) return C.warn
  return C.success
}

function MesSelector({ mes, anio, onChange }: { mes: number; anio: number; onChange: (m: number, a: number) => void }) {
  const prev = () => {
    let m = mes - 1, a = anio
    if (m < 1) { m = 12; a-- }
    onChange(m, a)
  }
  const next = () => {
    const now = new Date()
    let m = mes + 1, a = anio
    if (m > 12) { m = 1; a++ }
    if (a > now.getFullYear() || (a === now.getFullYear() && m > now.getMonth() + 1)) return
    onChange(m, a)
  }
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <button onClick={prev} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:14 }}>‹</button>
      <span style={{ fontSize:14, fontWeight:600, minWidth:80, textAlign:'center' }}>{MESES[mes-1]} {anio}</span>
      <button onClick={next} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:14 }}>›</button>
    </div>
  )
}

export default function PresupuestosPage() {
  const qc = useQueryClient()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<{ id: number; limite: string } | null>(null)
  const [form, setForm] = useState<{ categoria: CategoriaGasto; limite: string }>({ categoria: 'Alimentación', limite: '' })

  const { data: presupuestos = [], isLoading } = useQuery({
    queryKey: ['presupuestos', mes, anio],
    queryFn: () => presupuestosService.list({ mes, anio }),
  })

  const createM = useMutation({
    mutationFn: (d: PresupuestoCreate) => presupuestosService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presupuestos'] }); setModal(false) },
  })
  const updateM = useMutation({
    mutationFn: ({ id, limite }: { id: number; limite: number }) => presupuestosService.update(id, { monto_limite: limite }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presupuestos'] }); setEditing(null) },
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => presupuestosService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presupuestos'] }),
  })

  const categoriasUsadas = presupuestos.map(p => p.categoria)
  const categoriasDisponibles = CATEGORIAS.filter(c => !categoriasUsadas.includes(c))

  const inputStyle = { background:C.surface2, border:`1px solid ${C.border}`, color:'#fff', padding:'10px 13px', borderRadius:10, fontSize:13, width:'100%', outline:'none', fontFamily:'Inter,sans-serif' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700 }}>Presupuestos</h2>
          <p style={{ color:C.muted, fontSize:13 }}>Límites de gasto por categoría</p>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <MesSelector mes={mes} anio={anio} onChange={(m, a) => { setMes(m); setAnio(a) }} />
          {categoriasDisponibles.length > 0 && (
            <button
              onClick={() => { setForm({ categoria: categoriasDisponibles[0], limite: '' }); setModal(true) }}
              style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}
            >
              + Nuevo
            </button>
          )}
        </div>
      </div>

      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Cargando...</p>}

      {!isLoading && presupuestos.length === 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'2.5rem', textAlign:'center', color:C.muted }}>
          <p style={{ fontSize:32, marginBottom:8 }}>📊</p>
          <p style={{ fontWeight:600, marginBottom:4 }}>Sin presupuestos para este mes</p>
          <p style={{ fontSize:13 }}>Crea límites por categoría y controla tus gastos.</p>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
        {presupuestos.map(p => {
          const color = barColor(p.porcentaje_usado)
          const isEditing = editing?.id === p.id
          return (
            <div key={p.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderLeft:`3px solid ${color}`, borderRadius:14, padding:'1rem 1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:22 }}>{CAT_ICONS[p.categoria]}</span>
                  <p style={{ fontWeight:700, fontSize:15 }}>{p.categoria}</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button
                    onClick={() => setEditing({ id: p.id, limite: String(p.monto_limite) })}
                    style={{ background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:7, padding:'3px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteM.mutate(p.id)}
                    style={{ background:C.danger+'22', border:`1px solid ${C.danger}44`, color:C.danger, borderRadius:7, padding:'3px 8px', fontSize:11, fontWeight:600, cursor:'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <input
                    type="number"
                    value={editing.limite}
                    onChange={e => setEditing(prev => prev ? { ...prev, limite: e.target.value } : null)}
                    style={{ ...inputStyle, flex:1 }}
                    placeholder="Nuevo límite"
                  />
                  <button
                    onClick={() => editing && updateM.mutate({ id: editing.id, limite: parseFloat(editing.limite) })}
                    style={{ background:C.primary2, border:'none', color:'#fff', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:'6px 8px', fontSize:12, cursor:'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ) : null}

              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.muted }}>Usado</span>
                  <span style={{ fontSize:13, fontWeight:700, color }}>{p.porcentaje_usado.toFixed(1)}%</span>
                </div>
                <div style={{ background:C.border, borderRadius:99, height:7 }}>
                  <div style={{ width:`${Math.min(100, p.porcentaje_usado)}%`, height:'100%', background:color, borderRadius:99, transition:'width .5s' }} />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, background:'#1C1C1F', borderRadius:10, padding:'8px 0' }}>
                {[
                  ['Gastado', fmt(p.gasto_actual), color],
                  ['Límite', fmt(p.monto_limite), '#fff'],
                  ['Disponible', fmt(p.disponible), p.disponible > 0 ? C.success : C.danger],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign:'center' }}>
                    <p style={{ fontSize:10, color:C.muted }}>{l}</p>
                    <p style={{ fontSize:13, fontWeight:700, color: c as string }}>{v}</p>
                  </div>
                ))}
              </div>

              {p.porcentaje_usado >= 100 && (
                <p style={{ marginTop:10, fontSize:12, color:C.danger, fontWeight:600 }}>⚠️ Límite superado</p>
              )}
              {p.porcentaje_usado >= 80 && p.porcentaje_usado < 100 && (
                <p style={{ marginTop:10, fontSize:12, color:C.warn, fontWeight:600 }}>⚡ Cerca del límite</p>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:400 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontSize:17, fontWeight:700 }}>Nuevo presupuesto</h3>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', color:C.muted, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm(p => ({ ...p, categoria: e.target.value as CategoriaGasto }))}
                  style={{ ...inputStyle, cursor:'pointer' }}
                >
                  {categoriasDisponibles.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Límite mensual (S/)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.limite}
                  onChange={e => setForm(p => ({ ...p, limite: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button
                  onClick={() => {
                    if (!form.limite) return
                    createM.mutate({ categoria: form.categoria, monto_limite: parseFloat(form.limite), mes, anio })
                  }}
                  style={{ flex:1, background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}
                >
                  Guardar
                </button>
                <button
                  onClick={() => setModal(false)}
                  style={{ flex:1, background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
