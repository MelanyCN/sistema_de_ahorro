import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingresosService } from '../services'
import type { IngresoCreate, IngresoUpdate, Ingreso } from '../types'

const C = { surface:'#18181B', surface2:'#1C1C1F', border:'#27272A', muted:'#A1A1AA', success:'#22C55E', primary:'#6D28D9', primary2:'#8B5CF6', danger:'#EF4444', warn:'#F59E0B', info:'#3B82F6' }
const TIPOS = ['Sueldo','Freelance','Propina','Negocio','Otros'] as const
const TIPO_COLOR: Record<string,string> = { Sueldo:C.success, Freelance:C.primary2, Propina:C.warn, Negocio:C.info, Otros:C.muted }
const fmt = (n: number) => `S/${n.toFixed(2)}`
const today = () => new Date().toISOString().slice(0,10)

export default function IngresosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Ingreso | null>(null)
  const [form, setForm] = useState({ monto: '', fecha: today(), tipo: 'Sueldo', descripcion: '' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const { data: ingresos = [], isLoading } = useQuery({
    queryKey: ['ingresos'],
    queryFn: () => ingresosService.list(),
  })

  const createM = useMutation({
    mutationFn: (d: IngresoCreate) => ingresosService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingresos'] }); qc.invalidateQueries({ queryKey: ['analisis'] }); setModal(false) },
  })
  const updateM = useMutation({
    mutationFn: ({ id, d }: { id: number; d: IngresoUpdate }) => ingresosService.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingresos'] }); qc.invalidateQueries({ queryKey: ['analisis'] }); setModal(false) },
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => ingresosService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingresos'] }); qc.invalidateQueries({ queryKey: ['analisis'] }) },
  })

  const openModal = (item?: Ingreso) => {
    setEditing(item || null)
    setForm(item ? { monto: String(item.monto), fecha: item.fecha, tipo: item.tipo, descripcion: item.descripcion || '' }
                  : { monto: '', fecha: today(), tipo: 'Sueldo', descripcion: '' })
    setModal(true)
  }

  const save = () => {
    if (!form.monto) return
    const data = { monto: parseFloat(form.monto), fecha: form.fecha, tipo: form.tipo as any, descripcion: form.descripcion || undefined }
    if (editing) updateM.mutate({ id: editing.id, d: data })
    else createM.mutate(data)
  }

  const total = ingresos.reduce((a, i) => a + i.monto, 0)

  const inputStyle = { background: C.surface2, border: `1px solid ${C.border}`, color: '#fff', padding: '10px 13px', borderRadius: 10, fontSize: 13, width: '100%', outline: 'none', fontFamily: 'Inter,sans-serif' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Ingresos</h2>
          <p style={{ color: C.muted, fontSize: 13 }}>Gestiona tus fuentes de ingreso</p>
        </div>
        <button onClick={() => openModal()} style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          + Agregar
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:'1.5rem' }}>
        {[['Total ingresos', `S/${Math.round(total)}`, C.success],['Registros', String(ingresos.length), C.primary2]].map(([l,v,c]) => (
          <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
            <p style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Cargando...</p>}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {ingresos.map(i => (
          <div key={i.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:(TIPO_COLOR[i.tipo]||C.muted)+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>↑</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <p style={{ fontWeight:600, fontSize:14 }}>{i.descripcion || i.tipo}</p>
                <span style={{ background:(TIPO_COLOR[i.tipo]||C.muted)+'22', color:TIPO_COLOR[i.tipo]||C.muted, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{i.tipo}</span>
              </div>
              <p style={{ color:C.muted, fontSize:12 }}>{i.fecha}</p>
            </div>
            <p style={{ fontWeight:700, fontSize:18, color:C.success }}>{fmt(i.monto)}</p>
            <button onClick={() => openModal(i)} style={{ background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:8, padding:'5px 13px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Editar</button>
            <button onClick={() => deleteM.mutate(i.id)} style={{ background:C.danger+'22', border:`1px solid ${C.danger}44`, color:C.danger, borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>✕</button>
          </div>
        ))}
        {!isLoading && ingresos.length === 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'2rem', textAlign:'center', color:C.muted }}>
            No hay ingresos registrados. ¡Agrega el primero!
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:420 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontSize:17, fontWeight:700 }}>{editing ? 'Editar ingreso' : 'Nuevo ingreso'}</h3>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', color:C.muted, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Monto (S/)</label><input type="number" placeholder="0.00" value={form.monto} onChange={set('monto')} style={inputStyle}/></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Fecha</label><input type="date" value={form.fecha} onChange={set('fecha')} style={inputStyle}/></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Tipo</label><select value={form.tipo} onChange={set('tipo')} style={inputStyle}>{TIPOS.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Descripción</label><input placeholder="Opcional" value={form.descripcion} onChange={set('descripcion')} style={inputStyle}/></div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={save} disabled={createM.isPending || updateM.isPending} style={{ flex:1, background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  {(createM.isPending || updateM.isPending) ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={() => setModal(false)} style={{ flex:1, background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
