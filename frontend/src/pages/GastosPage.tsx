import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gastosService } from '../services'
import type { GastoCreate, GastoUpdate, Gasto, CategoriaGasto } from '../types'

const C = { surface:'#18181B', surface2:'#1C1C1F', border:'#27272A', muted:'#A1A1AA', primary2:'#8B5CF6', danger:'#EF4444' }
const CATS: CategoriaGasto[] = ['Alimentación','Transporte','Entretenimiento','Educación','Salud','Servicios','Compras','Otros']
const CAT_COLORS: Record<string,string> = { 'Alimentación':'#22C55E','Transporte':'#3B82F6','Entretenimiento':'#A855F7','Educación':'#F59E0B','Salud':'#EF4444','Servicios':'#06B6D4','Compras':'#EC4899','Otros':'#6B7280' }
const fmt = (n: number) => `S/${n.toFixed(2)}`
const today = () => new Date().toISOString().slice(0,10)

export default function GastosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Gasto | null>(null)
  const [filterCat, setFilterCat] = useState('Todas')
  const [form, setForm] = useState({ monto:'', fecha:today(), categoria:'Alimentación', descripcion:'' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const { data: gastos = [], isLoading } = useQuery({
    queryKey: ['gastos', filterCat],
    queryFn: () => gastosService.list(filterCat !== 'Todas' ? { categoria: filterCat } : {}),
  })

  const createM = useMutation({ mutationFn: (d: GastoCreate) => gastosService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['gastos'] }); qc.invalidateQueries({ queryKey: ['analisis'] }); setModal(false) } })
  const updateM = useMutation({ mutationFn: ({ id, d }: { id: number; d: GastoUpdate }) => gastosService.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['gastos'] }); qc.invalidateQueries({ queryKey: ['analisis'] }); setModal(false) } })
  const deleteM = useMutation({ mutationFn: (id: number) => gastosService.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['gastos'] }); qc.invalidateQueries({ queryKey: ['analisis'] }) } })

  const openModal = (item?: Gasto) => {
    setEditing(item || null)
    setForm(item ? { monto:String(item.monto), fecha:item.fecha, categoria:item.categoria, descripcion:item.descripcion||'' } : { monto:'', fecha:today(), categoria:'Alimentación', descripcion:'' })
    setModal(true)
  }
  const save = () => {
    if (!form.monto) return
    const data = { monto:parseFloat(form.monto), fecha:form.fecha, categoria:form.categoria as CategoriaGasto, descripcion:form.descripcion||undefined }
    if (editing) updateM.mutate({ id: editing.id, d: data })
    else createM.mutate(data)
  }

  const total = gastos.reduce((a, g) => a + g.monto, 0)
  const inputStyle = { background:C.surface2, border:`1px solid ${C.border}`, color:'#fff', padding:'10px 13px', borderRadius:10, fontSize:13, width:'100%', outline:'none', fontFamily:'Inter,sans-serif' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div><h2 style={{ fontSize:22, fontWeight:700 }}>Gastos</h2><p style={{ color:C.muted, fontSize:13 }}>Controla tus egresos</p></div>
        <button onClick={() => openModal()} style={{ background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}>+ Agregar</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:'1.25rem' }}>
        {[['Total gastos', `S/${Math.round(total)}`, C.danger],['Registros', String(gastos.length), C.primary2]].map(([l,v,c]) => (
          <div key={l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem' }}>
            <p style={{ fontSize:12, color:C.muted, marginBottom:6 }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1rem' }}>
        {['Todas', ...CATS].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ padding:'4px 12px', borderRadius:20, border:`1px solid ${filterCat===c ? '#6D28D9' : C.border}`, background:filterCat===c ? '#6D28D933':'transparent', color:filterCat===c ? C.primary2 : C.muted, fontSize:11, cursor:'pointer' }}>{c}</button>
        ))}
      </div>

      {isLoading && <p style={{ color:C.muted, textAlign:'center', padding:'2rem' }}>Cargando...</p>}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {gastos.map(g => (
          <div key={g.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:(CAT_COLORS[g.categoria]||C.muted)+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ width:14, height:14, borderRadius:99, background:CAT_COLORS[g.categoria]||C.muted, display:'block' }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <p style={{ fontWeight:600, fontSize:14 }}>{g.descripcion || g.categoria}</p>
                <span style={{ background:(CAT_COLORS[g.categoria]||C.muted)+'22', color:CAT_COLORS[g.categoria]||C.muted, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{g.categoria}</span>
              </div>
              <p style={{ color:C.muted, fontSize:12 }}>{g.fecha}</p>
            </div>
            <p style={{ fontWeight:700, fontSize:18, color:C.danger }}>-{fmt(g.monto)}</p>
            <button onClick={() => openModal(g)} style={{ background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:8, padding:'5px 13px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Editar</button>
            <button onClick={() => deleteM.mutate(g.id)} style={{ background:C.danger+'22', border:`1px solid ${C.danger}44`, color:C.danger, borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>✕</button>
          </div>
        ))}
        {!isLoading && gastos.length === 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'2rem', textAlign:'center', color:C.muted }}>Sin registros.</div>
        )}
      </div>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:'1.5rem', width:'100%', maxWidth:420 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontSize:17, fontWeight:700 }}>{editing ? 'Editar gasto' : 'Nuevo gasto'}</h3>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', color:C.muted, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Monto (S/)</label><input type="number" placeholder="0.00" value={form.monto} onChange={set('monto')} style={inputStyle}/></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Fecha</label><input type="date" value={form.fecha} onChange={set('fecha')} style={inputStyle}/></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Categoría</label><select value={form.categoria} onChange={set('categoria')} style={inputStyle}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:3 }}>Descripción</label><input placeholder="Opcional" value={form.descripcion} onChange={set('descripcion')} style={inputStyle}/></div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={save} style={{ flex:1, background:'linear-gradient(135deg,#6D28D9,#8B5CF6)', color:'#fff', border:'none', borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Guardar</button>
                <button onClick={() => setModal(false)} style={{ flex:1, background:'transparent', border:`1px solid ${C.primary2}`, color:C.primary2, borderRadius:10, padding:'10px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
