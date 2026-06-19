import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { metasService } from '../services'
import type { MetaCreate, MetaUpdate, Meta, AporteMetaCreate } from '../types'

const C = { surface:'#18181B', surface2:'#1C1C1F', border:'#27272A', muted:'#A1A1AA', primary:'#6D28D9', primary2:'#8B5CF6', success:'#22C55E', danger:'#EF4444', warn:'#F59E0B' }
const fmt = (n: number) => `S/${Math.round(n)}`
const today = () => new Date().toISOString().slice(0, 10)

export default function MetasPage() {
  const qc = useQueryClient()

  // Modal de crear/editar meta
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Meta | null>(null)
  const [form, setForm] = useState({ nombre:'', objetivo:'', actual:'', fechaObj:'' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  // Modal de aporte
  const [metaAporte, setMetaAporte] = useState<Meta | null>(null)
  const [aporteForm, setAporteForm] = useState({ monto:'', fecha:today(), descripcion:'' })
  const setA = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAporteForm(p => ({ ...p, [k]: e.target.value }))

  // Meta expandida para ver historial de aportes
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: metas = [], isLoading } = useQuery({ queryKey:['metas'], queryFn:() => metasService.list() })

  const { data: aportes = [] } = useQuery({
    queryKey: ['aportes', expandedId],
    queryFn: () => expandedId ? metasService.listAportes(expandedId) : Promise.resolve([]),
    enabled: expandedId !== null,
  })

  const createM = useMutation({ mutationFn:(d: MetaCreate) => metasService.create(d), onSuccess:() => { qc.invalidateQueries({ queryKey:['metas'] }); setModal(false) } })
  const updateM = useMutation({ mutationFn:({ id, d }: { id:number; d:MetaUpdate }) => metasService.update(id,d), onSuccess:() => { qc.invalidateQueries({ queryKey:['metas'] }); setModal(false) } })
  const deleteM = useMutation({ mutationFn:(id: number) => metasService.delete(id), onSuccess:() => qc.invalidateQueries({ queryKey:['metas'] }) })

  const createAporte = useMutation({
    mutationFn: ({ metaId, data }: { metaId: number; data: AporteMetaCreate }) => metasService.createAporte(metaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:['metas'] })
      qc.invalidateQueries({ queryKey:['aportes', metaAporte?.id] })
      setMetaAporte(null)
      setAporteForm({ monto:'', fecha:today(), descripcion:'' })
    },
  })
  const deleteAporte = useMutation({
    mutationFn: ({ metaId, aporteId }: { metaId: number; aporteId: number }) => metasService.deleteAporte(metaId, aporteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:['metas'] })
      if (expandedId) qc.invalidateQueries({ queryKey:['aportes', expandedId] })
    },
  })

  const openModal = (item?: Meta) => {
    setEditing(item || null)
    setForm(item
      ? { nombre:item.nombre, objetivo:String(item.monto_objetivo), actual:String(item.monto_actual), fechaObj:item.fecha_objetivo || '' }
      : { nombre:'', objetivo:'', actual:'', fechaObj:'' }
    )
    setModal(true)
  }

  const save = () => {
    if (!form.nombre || !form.objetivo) return
    const data = { nombre:form.nombre, monto_objetivo:parseFloat(form.objetivo), monto_actual:parseFloat(form.actual) || 0, fecha_objetivo:form.fechaObj || undefined }
    if (editing) updateM.mutate({ id:editing.id, d:data })
    else createM.mutate(data)
  }

  const inputStyle = { background:C.surface2, border:`1px solid ${C.border}`, color:'#fff', padding:'10px 13px', borderRadius:10, fontSize:13, width:'100%', outline:'none', fontFamily:'Inter,sans-serif' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div><h2 style={{ fontSize:22, fontWeight:700 }}>Metas de Ahorro</h2><p style={{ color:C.muted, fontSize:13 }}>Define y sigue tus objetivos</p></div>
        <button onClick={() => openModal()} style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}>+ Nueva meta</button>
      </div>

      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Cargando...</p>}
      {!isLoading && metas.length === 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'2rem', textAlign:'center', color:C.muted }}>
          No hay metas definidas. ¡Crea tu primer objetivo!
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
        {metas.map(m => {
          const done = m.estado === 'completada'
          const isExpanded = expandedId === m.id
          return (
            <div key={m.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:`3px solid ${done ? C.success : C.primary}`, borderRadius:14, padding:'1rem 1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:16 }}>{m.nombre}</p>
                  <p style={{ color:C.muted, fontSize:12, marginTop:2 }}>
                    {done ? '✅ Completada' : m.dias_restantes >= 0 ? `${m.dias_restantes} días restantes` : 'Sin fecha límite'}
                  </p>
                </div>
                <span style={{ background:done ? C.success+'22' : C.primary2+'22', color:done ? C.success : C.primary2, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>
                  {done ? 'Completada' : 'Activa'}
                </span>
              </div>

              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.muted }}>Progreso</span>
                  <span style={{ fontSize:12, fontWeight:700, color:done ? C.success : C.primary2 }}>{m.progreso_porcentaje.toFixed(1)}%</span>
                </div>
                <div style={{ background:C.border, borderRadius:99, height:6 }}>
                  <div style={{ width:`${m.progreso_porcentaje}%`, height:'100%', background:done ? C.success : C.primary2, borderRadius:99, transition:'width .5s' }} />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, background:'#1C1C1F', borderRadius:10, padding:'8px 0', marginBottom:12 }}>
                {([['Ahorrado', fmt(m.monto_actual), C.success], ['Objetivo', fmt(m.monto_objetivo), '#fff'], ['Restante', fmt(m.monto_restante), C.warn]] as [string, string, string][]).map(([l, v, c]) => (
                  <div key={l} style={{ textAlign:'center' }}>
                    <p style={{ fontSize:10, color:C.muted }}>{l}</p>
                    <p style={{ fontSize:14, fontWeight:700, color:c }}>{v}</p>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:8, marginBottom: isExpanded ? 12 : 0 }}>
                <button onClick={() => openModal(m)} style={{ flex:1, background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:8, padding:'7px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Editar</button>
                {!done && (
                  <button
                    onClick={() => { setMetaAporte(m); setAporteForm({ monto:'', fecha:today(), descripcion:'' }) }}
                    style={{ flex:1, background:C.success+'22', border:`1px solid ${C.success}44`, color:C.success, borderRadius:8, padding:'7px', fontSize:12, fontWeight:600, cursor:'pointer' }}
                  >
                    + Aportar
                  </button>
                )}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:'7px 10px', fontSize:12, cursor:'pointer' }}
                  title="Ver historial"
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
                <button onClick={() => deleteM.mutate(m.id)} style={{ background:C.danger+'22', border:`1px solid ${C.danger}44`, color:C.danger, borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>✕</button>
              </div>

              {/* Historial de aportes */}
              {isExpanded && (
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:C.muted, marginBottom:8 }}>Historial de aportes</p>
                  {aportes.length === 0 && (
                    <p style={{ fontSize:12, color:C.border, textAlign:'center', padding:'8px 0' }}>Sin aportes registrados</p>
                  )}
                  {aportes.map(a => (
                    <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${C.border}22` }}>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.success }}>{fmt(a.monto)}</p>
                        <p style={{ fontSize:11, color:C.muted }}>{a.fecha}{a.descripcion ? ` · ${a.descripcion}` : ''}</p>
                      </div>
                      <button
                        onClick={() => deleteAporte.mutate({ metaId: m.id, aporteId: a.id })}
                        style={{ background:'transparent', border:'none', color:C.danger, fontSize:13, cursor:'pointer', padding:'4px' }}
                        title="Eliminar aporte"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal editar/crear meta */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:420 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontSize:17, fontWeight:700 }}>{editing ? 'Editar meta' : 'Nueva meta'}</h3>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', color:C.muted, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Nombre</label><input placeholder="Ej: Laptop nueva" value={form.nombre} onChange={set('nombre')} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Monto objetivo (S/)</label><input type="number" placeholder="0" value={form.objetivo} onChange={set('objetivo')} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Monto ahorrado inicial (S/)</label><input type="number" placeholder="0" value={form.actual} onChange={set('actual')} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Fecha objetivo</label><input type="date" value={form.fechaObj} onChange={set('fechaObj')} style={inputStyle} /></div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={save} style={{ flex:1, background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Guardar</button>
                <button onClick={() => setModal(false)} style={{ flex:1, background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de aporte */}
      {metaAporte && (
        <div onClick={() => setMetaAporte(null)} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:380 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <div>
                <h3 style={{ fontSize:17, fontWeight:700 }}>Registrar aporte</h3>
                <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>{metaAporte.nombre}</p>
              </div>
              <button onClick={() => setMetaAporte(null)} style={{ background:'none', border:'none', color:C.muted, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Monto (S/)</label><input type="number" placeholder="0.00" value={aporteForm.monto} onChange={setA('monto')} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Fecha</label><input type="date" value={aporteForm.fecha} onChange={setA('fecha')} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Descripción (opcional)</label><input placeholder="Ej: Quincena de junio" value={aporteForm.descripcion} onChange={setA('descripcion')} style={inputStyle} /></div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button
                  onClick={() => {
                    if (!aporteForm.monto || !metaAporte) return
                    createAporte.mutate({
                      metaId: metaAporte.id,
                      data: { monto: parseFloat(aporteForm.monto), fecha: aporteForm.fecha, descripcion: aporteForm.descripcion || undefined },
                    })
                  }}
                  style={{ flex:1, background:'linear-gradient(135deg,#16A34A,#22C55E)', color:'#fff', border:'none', borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}
                >
                  Guardar aporte
                </button>
                <button onClick={() => setMetaAporte(null)} style={{ flex:1, background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
