import { useState, useEffect, useMemo } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg:        "#0F0F0F",
  surface:   "#18181B",
  surface2:  "#1C1C1F",
  border:    "#27272A",
  primary:   "#6D28D9",
  primary2:  "#8B5CF6",
  text:      "#FFFFFF",
  muted:     "#A1A1AA",
  success:   "#22C55E",
  warn:      "#F59E0B",
  danger:    "#EF4444",
  info:      "#3B82F6",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:${C.bg};color:${C.text};min-height:100vh}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
  input,select,textarea{background:${C.surface2};border:1px solid ${C.border};color:${C.text};padding:10px 14px;border-radius:10px;font-family:'Inter',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s}
  input:focus,select:focus,textarea:focus{border-color:${C.primary}}
  select option{background:${C.surface}}
  button{cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s}
  a{color:inherit;text-decoration:none}
`;

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_GASTOS = [
  {id:1,monto:45,fecha:"2025-06-01",categoria:"Alimentación",desc:"Café con leche"},
  {id:2,monto:12,fecha:"2025-06-01",categoria:"Alimentación",desc:"Café con leche"},
  {id:3,monto:80,fecha:"2025-06-02",categoria:"Transporte",desc:"Uber"},
  {id:4,monto:35,fecha:"2025-06-03",categoria:"Entretenimiento",desc:"Netflix"},
  {id:5,monto:220,fecha:"2025-06-04",categoria:"Alimentación",desc:"Supermercado"},
  {id:6,monto:15,fecha:"2025-06-04",categoria:"Alimentación",desc:"Café con leche"},
  {id:7,monto:180,fecha:"2025-06-05",categoria:"Compras",desc:"Ropa"},
  {id:8,monto:60,fecha:"2025-06-06",categoria:"Salud",desc:"Farmacia"},
  {id:9,monto:45,fecha:"2025-06-06",categoria:"Entretenimiento",desc:"Delivery"},
  {id:10,monto:12,fecha:"2025-06-07",categoria:"Alimentación",desc:"Café con leche"},
  {id:11,monto:90,fecha:"2025-06-08",categoria:"Servicios",desc:"Luz + agua"},
  {id:12,monto:55,fecha:"2025-06-09",categoria:"Entretenimiento",desc:"Delivery"},
  {id:13,monto:12,fecha:"2025-06-10",categoria:"Alimentación",desc:"Café con leche"},
  {id:14,monto:30,fecha:"2025-06-10",categoria:"Transporte",desc:"Bus"},
  {id:15,monto:45,fecha:"2025-06-11",categoria:"Entretenimiento",desc:"Delivery"},
  {id:16,monto:12,fecha:"2025-06-12",categoria:"Alimentación",desc:"Café con leche"},
  {id:17,monto:150,fecha:"2025-06-13",categoria:"Educación",desc:"Curso online"},
  {id:18,monto:12,fecha:"2025-06-14",categoria:"Alimentación",desc:"Café con leche"},
  {id:19,monto:25,fecha:"2025-06-15",categoria:"Transporte",desc:"Gasolina"},
  {id:20,monto:38,fecha:"2025-06-15",categoria:"Entretenimiento",desc:"Cine"},
];
const SEED_INGRESOS = [
  {id:1,monto:2200,fecha:"2025-06-01",tipo:"Sueldo",desc:"Sueldo mensual"},
  {id:2,monto:350,fecha:"2025-06-10",tipo:"Freelance",desc:"Proyecto web"},
  {id:3,monto:80,fecha:"2025-06-14",tipo:"Propina",desc:"Propinas acumuladas"},
];
const SEED_METAS = [
  {id:1,nombre:"Laptop nueva",objetivo:2500,actual:850,fechaObj:"2025-09-01",estado:"activa"},
  {id:2,nombre:"Viaje a Lima",objetivo:800,actual:800,fechaObj:"2025-07-15",estado:"completada"},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n) => `S/${Number(n).toFixed(2)}`;
const fmtShort = (n) => `S/${Math.round(n)}`;
const CAT_COLORS = {
  "Alimentación":"#22C55E","Transporte":"#3B82F6","Entretenimiento":"#A855F7",
  "Educación":"#F59E0B","Salud":"#EF4444","Servicios":"#06B6D4","Compras":"#EC4899","Otros":"#6B7280"
};
const PIE_PALETTE = Object.values(CAT_COLORS);

// ─── MINI CHARTS ─────────────────────────────────────────────────────────────
function MiniPieChart({data}){
  const total = data.reduce((a,d)=>a+d.value,0);
  if(!total) return <div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>Sin datos</div>;
  let angle = -Math.PI/2;
  const slices = data.map((d,i)=>{
    const pct = d.value/total;
    const a1=angle, a2=angle+pct*Math.PI*2;
    angle=a2;
    const lx=80+70*Math.cos(a1+(a2-a1)/2), ly=80+70*Math.sin(a1+(a2-a1)/2);
    const x1=80+68*Math.cos(a1),y1=80+68*Math.sin(a1);
    const x2=80+68*Math.cos(a2),y2=80+68*Math.sin(a2);
    const large=pct>.5?1:0;
    return{...d,path:`M80 80 L${x1} ${y1} A68 68 0 ${large} 1 ${x2} ${y2}Z`,color:PIE_PALETTE[i%PIE_PALETTE.length],pct:Math.round(pct*100),lx,ly};
  });
  return(
    <svg viewBox="0 0 160 160" style={{width:"100%",maxWidth:160}}>
      {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} opacity={.9}/>)}
      <circle cx="80" cy="80" r="30" fill={C.surface}/>
    </svg>
  );
}

function MiniBarChart({labels,incomes,expenses}){
  const max=Math.max(...incomes,...expenses,1);
  const W=280,H=120,pad=32,barW=14,gap=4;
  const bw=(W-pad*2)/(labels.length);
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
      {labels.map((l,i)=>{
        const x=pad+i*bw+bw/2;
        const ih=(incomes[i]/max)*(H-30);
        const eh=(expenses[i]/max)*(H-30);
        return(
          <g key={i}>
            <rect x={x-barW-gap/2} y={H-10-ih} width={barW} height={ih} rx={3} fill={C.success} opacity={.8}/>
            <rect x={x+gap/2} y={H-10-eh} width={barW} height={eh} rx={3} fill={C.danger} opacity={.8}/>
            <text x={x} y={H-2} textAnchor="middle" fontSize={9} fill={C.muted}>{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniLineChart({data,color=C.primary2}){
  if(!data||data.length<2) return null;
  const max=Math.max(...data,1);
  const W=280,H=80,pad=8;
  const pts=data.map((v,i)=>{
    const x=pad+i*(W-pad*2)/(data.length-1);
    const y=H-pad-(v/max)*(H-pad*2);
    return`${x},${y}`;
  }).join(" ");
  const area=`M${pad},${H-pad} `+data.map((v,i)=>{
    const x=pad+i*(W-pad*2)/(data.length-1);
    const y=H-pad-(v/max)*(H-pad*2);
    return`L${x},${y}`;
  }).join(" ")+` L${W-pad},${H-pad}Z`;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".35"/>
          <stop offset="100%" stopColor={color} stopOpacity=".02"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round"/>
    </svg>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Card({children,style={},onClick}){
  return(
    <div onClick={onClick} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"1rem 1.25rem",...style,cursor:onClick?"pointer":"default"}}>
      {children}
    </div>
  );
}

function StatCard({label,value,sub,color=C.primary2,icon}){
  return(
    <Card style={{flex:1,minWidth:140}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:500}}>{label}</p>
          <p style={{fontSize:22,fontWeight:700,color}}>{value}</p>
          {sub&&<p style={{fontSize:11,color:C.muted,marginTop:4}}>{sub}</p>}
        </div>
        {icon&&<div style={{fontSize:22,opacity:.6}}>{icon}</div>}
      </div>
    </Card>
  );
}

function Badge({text,color="#6D28D9"}){
  return<span style={{display:"inline-block",background:color+"22",color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{text}</span>;
}

function Btn({children,onClick,variant="primary",size="md",style={},disabled=false}){
  const base={border:"none",borderRadius:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,...style};
  const sizes={sm:{padding:"6px 14px",fontSize:12},md:{padding:"10px 20px",fontSize:14},lg:{padding:"13px 28px",fontSize:15}};
  const variants={
    primary:{background:`linear-gradient(135deg,${C.primary},${C.primary2})`,color:"#fff"},
    ghost:{background:"transparent",color:C.primary2,border:`1px solid ${C.primary2}`},
    danger:{background:C.danger+"22",color:C.danger,border:`1px solid ${C.danger}44`},
    success:{background:C.success+"22",color:C.success,border:`1px solid ${C.success}44`},
  };
  return<button disabled={disabled} onClick={onClick} style={{...base,...sizes[size],...variants[variant]}}>{children}</button>;
}

function Modal({open,onClose,title,children}){
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:20,padding:"1.5rem",width:"100%",maxWidth:440,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h3 style={{fontSize:18,fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProgressBar({value,max,color=C.primary2}){
  const pct=Math.min(100,(value/max)*100);
  return(
    <div style={{background:C.border,borderRadius:99,height:6,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:pct>=100?C.success:color,borderRadius:99,transition:"width .5s"}}/>
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// LOGIN
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({nombre:"",apellido:"",email:"demo@aura.pe",edad:"",ingreso:"",password:"demo1234",confirm:""});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const submit=()=>{
    if(mode==="login"){onLogin({nombre:"Alex",apellido:"Torres",email:form.email,edad:23,ingreso:2630});}
    else{onLogin({nombre:form.nombre,apellido:form.apellido,email:form.email,edad:parseInt(form.edad)||22,ingreso:parseFloat(form.ingreso)||0});}
  };
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,padding:24}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${C.primary},${C.primary2})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 32px ${C.primary}55`}}>
            <span style={{fontSize:32}}>✦</span>
          </div>
          <h1 style={{fontSize:30,fontWeight:800,background:`linear-gradient(90deg,${C.primary2},#C084FC)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>AURA</h1>
          <p style={{color:C.muted,fontSize:13,marginTop:4}}>Asistente Útil para el Rendimiento y Ahorro</p>
        </div>
        <Card>
          <div style={{display:"flex",gap:8,marginBottom:"1.25rem"}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:mode===m?C.primary:"transparent",color:mode===m?"#fff":C.muted,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
                {m==="login"?"Iniciar sesión":"Registrarse"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="register"&&<>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <input placeholder="Nombre" value={form.nombre} onChange={set("nombre")}/>
                <input placeholder="Apellido" value={form.apellido} onChange={set("apellido")}/>
              </div>
              <input placeholder="Edad" type="number" value={form.edad} onChange={set("edad")}/>
              <input placeholder="Ingreso mensual (S/)" type="number" value={form.ingreso} onChange={set("ingreso")}/>
            </>}
            <input placeholder="Correo electrónico" type="email" value={form.email} onChange={set("email")}/>
            <input placeholder="Contraseña" type="password" value={form.password} onChange={set("password")}/>
            {mode==="register"&&<input placeholder="Confirmar contraseña" type="password" value={form.confirm} onChange={set("confirm")}/>}
            <Btn onClick={submit} style={{marginTop:4}}>
              {mode==="login"?"Ingresar →":"Crear cuenta →"}
            </Btn>
          </div>
          {mode==="login"&&<p style={{textAlign:"center",fontSize:12,color:C.muted,marginTop:12}}>Demo: demo@aura.pe / demo1234</p>}
        </Card>
      </div>
    </div>
  );
}

// SIDEBAR NAV
const NAV = [
  {id:"dashboard",icon:"◈",label:"Dashboard"},
  {id:"ingresos",icon:"↑",label:"Ingresos"},
  {id:"gastos",icon:"↓",label:"Gastos"},
  {id:"analisis",icon:"◎",label:"Análisis"},
  {id:"hormigas",icon:"⬡",label:"Gastos Hormiga"},
  {id:"metas",icon:"◉",label:"Metas"},
  {id:"recomendaciones",icon:"✦",label:"Recomendaciones"},
  {id:"perfil",icon:"◯",label:"Perfil"},
];

function Sidebar({active,onNav,onLogout,user,collapsed,onToggle}){
  return(
    <div style={{width:collapsed?68:220,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,transition:"width .25s",overflow:"hidden",flexShrink:0}}>
      <div style={{padding:"16px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={onToggle}>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.primary2})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>✦</div>
        {!collapsed&&<div><p style={{fontWeight:800,fontSize:17,background:`linear-gradient(90deg,${C.primary2},#C084FC)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>AURA</p></div>}
      </div>
      <nav style={{flex:1,padding:"12px 8px",overflowY:"auto"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>onNav(n.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 10px",borderRadius:10,border:"none",background:active===n.id?C.primary+"33":"transparent",color:active===n.id?C.primary2:C.muted,fontWeight:active===n.id?600:400,fontSize:13,cursor:"pointer",marginBottom:2,transition:"all .15s",textAlign:"left",whiteSpace:"nowrap"}}>
            <span style={{fontSize:16,flexShrink:0,width:20,textAlign:"center"}}>{n.icon}</span>
            {!collapsed&&n.label}
          </button>
        ))}
      </nav>
      <div style={{padding:"12px 8px",borderTop:`1px solid ${C.border}`}}>
        {!collapsed&&<div style={{padding:"8px 10px",marginBottom:6}}>
          <p style={{fontSize:12,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.nombre} {user.apellido}</p>
        </div>}
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 10px",borderRadius:10,border:"none",background:"transparent",color:C.danger,fontSize:13,cursor:"pointer"}}>
          <span style={{fontSize:16,flexShrink:0,width:20,textAlign:"center"}}>⏏</span>
          {!collapsed&&"Salir"}
        </button>
      </div>
    </div>
  );
}

// DASHBOARD
function Dashboard({gastos,ingresos,user}){
  const totalIngresos=ingresos.reduce((a,i)=>a+i.monto,0);
  const totalGastos=gastos.reduce((a,g)=>a+g.monto,0);
  const saldo=totalIngresos-totalGastos;
  const ahorroPct=totalIngresos>0?((saldo/totalIngresos)*100).toFixed(1):0;
  const byCat={};
  gastos.forEach(g=>{byCat[g.categoria]=(byCat[g.categoria]||0)+g.monto;});
  const catData=Object.entries(byCat).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const semanas=["S1","S2","S3","S4"];
  const gSem=[0,0,0,0],iSem=[0,0,0,0];
  gastos.forEach(g=>{const d=new Date(g.fecha).getDate();const s=Math.min(3,Math.floor((d-1)/7));gSem[s]+=g.monto;});
  ingresos.forEach(i=>{const d=new Date(i.fecha).getDate();const s=Math.min(3,Math.floor((d-1)/7));iSem[s]+=i.monto;});
  const catMax=catData[0]?.name||"-";
  const entPct=((byCat["Entretenimiento"]||0)/totalIngresos*100).toFixed(0);
  return(
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:22,fontWeight:700}}>Buenos días, {user.nombre} 👋</h2>
        <p style={{color:C.muted,fontSize:14,marginTop:4}}>Junio 2025 · Resumen financiero</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:"1.5rem"}}>
        <StatCard label="Saldo Disponible" value={fmtShort(saldo)} color={saldo>=0?C.success:C.danger} icon="◈"/>
        <StatCard label="Ingresos del Mes" value={fmtShort(totalIngresos)} color={C.success} icon="↑"/>
        <StatCard label="Gastos del Mes" value={fmtShort(totalGastos)} color={C.danger} icon="↓"/>
        <StatCard label="Ahorro Estimado" value={`${ahorroPct}%`} color={parseFloat(ahorroPct)>=10?C.success:C.warn} icon="✦"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:"1.5rem"}}>
        <Card>
          <p style={{fontSize:13,fontWeight:600,marginBottom:12,color:C.muted}}>Distribución de gastos</p>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{flexShrink:0}}><MiniPieChart data={catData}/></div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
              {catData.slice(0,5).map(c=>(
                <div key={c.name} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:99,background:CAT_COLORS[c.name]||C.muted,flexShrink:0}}/>
                  <span style={{fontSize:12,color:C.muted,flex:1}}>{c.name}</span>
                  <span style={{fontSize:12,fontWeight:600}}>{fmtShort(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <p style={{fontSize:13,fontWeight:600,marginBottom:8,color:C.muted}}>Evolución semanal</p>
          <MiniLineChart data={gSem} color={C.primary2}/>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            <span style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:2,background:C.primary2,display:"inline-block"}}/>Gastos</span>
          </div>
        </Card>
        <Card>
          <p style={{fontSize:13,fontWeight:600,marginBottom:8,color:C.muted}}>Ingresos vs Gastos</p>
          <MiniBarChart labels={semanas} incomes={iSem} expenses={gSem}/>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            <span style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.success,display:"inline-block"}}/>Ingresos</span>
            <span style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.danger,display:"inline-block"}}/>Gastos</span>
          </div>
        </Card>
      </div>
      <Card style={{background:`linear-gradient(135deg,${C.primary}22,${C.primary2}11)`,border:`1px solid ${C.primary}44`}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
          <div style={{width:40,height:40,borderRadius:12,background:C.primary+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✦</div>
          <div>
            <p style={{fontSize:12,color:C.primary2,fontWeight:600,marginBottom:4}}>AURA IA · Insight del mes</p>
            <p style={{fontSize:14,color:C.text,lineHeight:1.6}}>
              {parseInt(entPct)>20
                ?`Este mes has gastado ${entPct}% en entretenimiento. Considera reducirlo para aumentar tu ahorro.`
                :`Tu categoría más costosa es "${catMax}". Llevas un gasto total de ${fmtShort(totalGastos)} este mes.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// INGRESOS
function Ingresos({data,setData}){
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({monto:"",fecha:new Date().toISOString().slice(0,10),tipo:"Sueldo",desc:""});
  const tipos=["Sueldo","Freelance","Propina","Negocio","Otros"];
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const open=(item=null)=>{
    setEditing(item);
    setForm(item?{monto:item.monto,fecha:item.fecha,tipo:item.tipo,desc:item.desc}:{monto:"",fecha:new Date().toISOString().slice(0,10),tipo:"Sueldo",desc:""});
    setModal(true);
  };
  const save=()=>{
    if(!form.monto||isNaN(form.monto))return;
    if(editing){setData(d=>d.map(i=>i.id===editing.id?{...editing,...form,monto:parseFloat(form.monto)}:i));}
    else{setData(d=>[...d,{id:Date.now(),...form,monto:parseFloat(form.monto)}]);}
    setModal(false);
  };
  const del=(id)=>setData(d=>d.filter(i=>i.id!==id));
  const TIPO_COLOR={Sueldo:C.success,Freelance:C.primary2,Propina:C.warn,Negocio:C.info,Otros:C.muted};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
        <div><h2 style={{fontSize:22,fontWeight:700}}>Ingresos</h2><p style={{color:C.muted,fontSize:13}}>Gestiona tus fuentes de ingreso</p></div>
        <Btn onClick={()=>open()}>+ Agregar</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:"1.5rem"}}>
        <StatCard label="Total Ingresos" value={fmtShort(data.reduce((a,i)=>a+i.monto,0))} color={C.success}/>
        <StatCard label="Registros" value={data.length} color={C.primary2}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {data.length===0&&<Card><p style={{color:C.muted,textAlign:"center",padding:"2rem 0"}}>No hay ingresos registrados</p></Card>}
        {data.map(i=>(
          <Card key={i.id} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:12,background:(TIPO_COLOR[i.tipo]||C.muted)+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:18}}>↑</span>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <p style={{fontWeight:600,fontSize:14}}>{i.desc||i.tipo}</p>
                <Badge text={i.tipo} color={TIPO_COLOR[i.tipo]||C.muted}/>
              </div>
              <p style={{color:C.muted,fontSize:12}}>{i.fecha}</p>
            </div>
            <p style={{fontWeight:700,fontSize:18,color:C.success}}>{fmt(i.monto)}</p>
            <div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="ghost" onClick={()=>open(i)}>Editar</Btn>
              <Btn size="sm" variant="danger" onClick={()=>del(i.id)}>✕</Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar ingreso":"Nuevo ingreso"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Monto (S/)</label><input type="number" placeholder="0.00" value={form.monto} onChange={set("monto")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Fecha</label><input type="date" value={form.fecha} onChange={set("fecha")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Tipo</label><select value={form.tipo} onChange={set("tipo")}>{tipos.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Descripción</label><input placeholder="Descripción opcional" value={form.desc} onChange={set("desc")}/></div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={save} style={{flex:1}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// GASTOS
function Gastos({data,setData}){
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [filterCat,setFilterCat]=useState("Todas");
  const [form,setForm]=useState({monto:"",fecha:new Date().toISOString().slice(0,10),categoria:"Alimentación",desc:""});
  const categorias=["Alimentación","Transporte","Entretenimiento","Educación","Salud","Servicios","Compras","Otros"];
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const open=(item=null)=>{
    setEditing(item);
    setForm(item?{monto:item.monto,fecha:item.fecha,categoria:item.categoria,desc:item.desc}:{monto:"",fecha:new Date().toISOString().slice(0,10),categoria:"Alimentación",desc:""});
    setModal(true);
  };
  const save=()=>{
    if(!form.monto||isNaN(form.monto))return;
    if(editing){setData(d=>d.map(g=>g.id===editing.id?{...editing,...form,monto:parseFloat(form.monto)}:g));}
    else{setData(d=>[...d,{id:Date.now(),...form,monto:parseFloat(form.monto)}]);}
    setModal(false);
  };
  const del=(id)=>setData(d=>d.filter(g=>g.id!==id));
  const filtered=filterCat==="Todas"?data:data.filter(g=>g.categoria===filterCat);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
        <div><h2 style={{fontSize:22,fontWeight:700}}>Gastos</h2><p style={{color:C.muted,fontSize:13}}>Controla tus egresos</p></div>
        <Btn onClick={()=>open()}>+ Agregar</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:"1.5rem"}}>
        <StatCard label="Total Gastos" value={fmtShort(data.reduce((a,g)=>a+g.monto,0))} color={C.danger}/>
        <StatCard label="Registros" value={data.length} color={C.primary2}/>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:"1.25rem"}}>
        {["Todas",...categorias].map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${filterCat===c?C.primary:C.border}`,background:filterCat===c?C.primary+"33":"transparent",color:filterCat===c?C.primary2:C.muted,fontSize:12,cursor:"pointer",transition:"all .15s"}}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.length===0&&<Card><p style={{color:C.muted,textAlign:"center",padding:"2rem 0"}}>Sin registros</p></Card>}
        {filtered.map(g=>(
          <Card key={g.id} style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:12,background:(CAT_COLORS[g.categoria]||C.muted)+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{width:16,height:16,borderRadius:99,background:CAT_COLORS[g.categoria]||C.muted,display:"block"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <p style={{fontWeight:600,fontSize:14}}>{g.desc||g.categoria}</p>
                <Badge text={g.categoria} color={CAT_COLORS[g.categoria]||C.muted}/>
              </div>
              <p style={{color:C.muted,fontSize:12}}>{g.fecha}</p>
            </div>
            <p style={{fontWeight:700,fontSize:18,color:C.danger}}>-{fmt(g.monto)}</p>
            <div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="ghost" onClick={()=>open(g)}>Editar</Btn>
              <Btn size="sm" variant="danger" onClick={()=>del(g.id)}>✕</Btn>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar gasto":"Nuevo gasto"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Monto (S/)</label><input type="number" placeholder="0.00" value={form.monto} onChange={set("monto")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Fecha</label><input type="date" value={form.fecha} onChange={set("fecha")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Categoría</label><select value={form.categoria} onChange={set("categoria")}>{categorias.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Descripción</label><input placeholder="Descripción opcional" value={form.desc} onChange={set("desc")}/></div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={save} style={{flex:1}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ANÁLISIS
function Analisis({gastos,ingresos}){
  const totalI=ingresos.reduce((a,i)=>a+i.monto,0);
  const totalG=gastos.reduce((a,g)=>a+g.monto,0);
  const balance=totalI-totalG;
  const dias=[...new Set(gastos.map(g=>g.fecha))].length||1;
  const semanas=Math.ceil(dias/7)||1;
  const byCat={};
  gastos.forEach(g=>{byCat[g.categoria]=(byCat[g.categoria]||0)+g.monto;});
  const catData=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const catMax=catData[0]?.[0]||"-";
  const ahorroPct=totalI>0?((balance/totalI)*100).toFixed(1):0;
  const stats=[
    {label:"Ingreso Total",value:fmt(totalI),color:C.success},
    {label:"Gasto Total",value:fmt(totalG),color:C.danger},
    {label:"Balance",value:fmt(balance),color:balance>=0?C.success:C.danger},
    {label:"Promedio Diario",value:fmt(totalG/dias),color:C.primary2},
    {label:"Promedio Semanal",value:fmt(totalG/semanas),color:C.primary2},
    {label:"Promedio Mensual",value:fmt(totalG),color:C.primary2},
    {label:"Categoría + Costosa",value:catMax,color:C.warn},
    {label:"% de Ahorro",value:`${ahorroPct}%`,color:parseFloat(ahorroPct)>=10?C.success:C.warn},
  ];
  return(
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:22,fontWeight:700}}>Análisis Financiero</h2>
        <p style={{color:C.muted,fontSize:13}}>Métricas detalladas de tu mes</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:"1.5rem"}}>
        {stats.map(s=>(
          <Card key={s.label}>
            <p style={{fontSize:12,color:C.muted,marginBottom:6}}>{s.label}</p>
            <p style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <p style={{fontSize:14,fontWeight:600,marginBottom:14}}>Detalle por categoría</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {catData.map(([cat,val])=>{
            const pct=totalG>0?((val/totalG)*100).toFixed(1):0;
            return(
              <div key={cat}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:10,height:10,borderRadius:99,background:CAT_COLORS[cat]||C.muted,flexShrink:0}}/>
                    <span style={{fontSize:13}}>{cat}</span>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:12,color:C.muted}}>{pct}%</span>
                    <span style={{fontSize:13,fontWeight:600}}>{fmt(val)}</span>
                  </div>
                </div>
                <ProgressBar value={val} max={totalG} color={CAT_COLORS[cat]||C.primary2}/>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// GASTOS HORMIGA
function GastosHormiga({gastos}){
  const grupos={};
  gastos.forEach(g=>{
    const key=g.desc.toLowerCase().trim();
    if(!grupos[key])grupos[key]={desc:g.desc,count:0,total:0,categoria:g.categoria};
    grupos[key].count++;
    grupos[key].total+=g.monto;
  });
  const hormigas=Object.values(grupos).filter(h=>h.count>=2||h.total<50*h.count).sort((a,b)=>b.total-a.total);
  const totalMensual=hormigas.reduce((a,h)=>a+h.total,0);
  return(
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:22,fontWeight:700}}>Gastos Hormiga</h2>
        <p style={{color:C.muted,fontSize:13}}>Pequeños gastos repetitivos que suman mucho</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:"1.5rem"}}>
        <StatCard label="Impacto Mensual" value={fmtShort(totalMensual)} color={C.warn}/>
        <StatCard label="Impacto Anual" value={fmtShort(totalMensual*12)} color={C.danger}/>
        <StatCard label="Posible Ahorro/mes" value={fmtShort(totalMensual*0.5)} color={C.success}/>
      </div>
      {hormigas.length===0&&<Card><p style={{color:C.muted,textAlign:"center",padding:"2rem 0"}}>No se detectaron gastos hormiga</p></Card>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
        {hormigas.map((h,i)=>(
          <Card key={i} style={{borderLeft:`3px solid ${C.warn}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <p style={{fontWeight:600,fontSize:15}}>{h.desc}</p>
                <Badge text={h.categoria} color={CAT_COLORS[h.categoria]||C.muted}/>
              </div>
              <p style={{fontWeight:800,fontSize:20,color:C.warn}}>{fmtShort(h.total)}</p>
            </div>
            <div style={{background:C.surface2,borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:C.muted}}>Veces</p>
                <p style={{fontWeight:700,fontSize:16}}>{h.count}</p>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:C.muted}}>Prom. por vez</p>
                <p style={{fontWeight:700,fontSize:16}}>{fmtShort(h.total/h.count)}</p>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:11,color:C.muted}}>Anual est.</p>
                <p style={{fontWeight:700,fontSize:16,color:C.danger}}>{fmtShort(h.total*12)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// METAS
function Metas({data,setData}){
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({nombre:"",objetivo:"",actual:"",fechaObj:""});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const open=(item=null)=>{
    setEditing(item);
    setForm(item?{nombre:item.nombre,objetivo:item.objetivo,actual:item.actual,fechaObj:item.fechaObj}:{nombre:"",objetivo:"",actual:"",fechaObj:""});
    setModal(true);
  };
  const save=()=>{
    if(!form.nombre||!form.objetivo)return;
    const pct=(parseFloat(form.actual)||0)/(parseFloat(form.objetivo)||1)*100;
    const estado=pct>=100?"completada":"activa";
    if(editing){setData(d=>d.map(m=>m.id===editing.id?{...editing,...form,objetivo:parseFloat(form.objetivo),actual:parseFloat(form.actual)||0,estado}:m));}
    else{setData(d=>[...d,{id:Date.now(),...form,objetivo:parseFloat(form.objetivo),actual:parseFloat(form.actual)||0,estado}]);}
    setModal(false);
  };
  const del=(id)=>setData(d=>d.filter(m=>m.id!==id));
  const getDias=(f)=>{
    const diff=new Date(f)-new Date();
    return Math.max(0,Math.ceil(diff/(1000*60*60*24)));
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
        <div><h2 style={{fontSize:22,fontWeight:700}}>Metas de Ahorro</h2><p style={{color:C.muted,fontSize:13}}>Define y sigue tus objetivos</p></div>
        <Btn onClick={()=>open()}>+ Nueva meta</Btn>
      </div>
      {data.length===0&&<Card><p style={{color:C.muted,textAlign:"center",padding:"2rem 0"}}>No hay metas definidas</p></Card>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        {data.map(m=>{
          const pct=Math.min(100,(m.actual/m.objetivo)*100);
          const restante=m.objetivo-m.actual;
          const dias=getDias(m.fechaObj);
          const done=m.estado==="completada";
          return(
            <Card key={m.id} style={{borderTop:`3px solid ${done?C.success:C.primary}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <p style={{fontWeight:700,fontSize:16}}>{m.nombre}</p>
                  <p style={{color:C.muted,fontSize:12,marginTop:2}}>{done?"✅ Meta alcanzada":`${dias} días restantes`}</p>
                </div>
                <Badge text={done?"Completada":"Activa"} color={done?C.success:C.primary2}/>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,color:C.muted}}>Progreso</span>
                  <span style={{fontSize:13,fontWeight:700,color:done?C.success:C.primary2}}>{pct.toFixed(1)}%</span>
                </div>
                <ProgressBar value={m.actual} max={m.objetivo} color={done?C.success:C.primary2}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,background:C.surface2,borderRadius:10,padding:"8px 0"}}>
                {[["Ahorrado",fmtShort(m.actual),C.success],["Objetivo",fmtShort(m.objetivo),C.text],["Restante",fmtShort(restante),C.warn]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <p style={{fontSize:10,color:C.muted}}>{l}</p>
                    <p style={{fontSize:14,fontWeight:700,color:c}}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <Btn size="sm" variant="ghost" onClick={()=>open(m)} style={{flex:1}}>Editar</Btn>
                <Btn size="sm" variant="danger" onClick={()=>del(m.id)}>✕</Btn>
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar meta":"Nueva meta"}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Nombre de la meta</label><input placeholder="Ej: Laptop nueva" value={form.nombre} onChange={set("nombre")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Monto objetivo (S/)</label><input type="number" placeholder="0" value={form.objetivo} onChange={set("objetivo")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Monto ahorrado (S/)</label><input type="number" placeholder="0" value={form.actual} onChange={set("actual")}/></div>
          <div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Fecha objetivo</label><input type="date" value={form.fechaObj} onChange={set("fechaObj")}/></div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={save} style={{flex:1}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModal(false)} style={{flex:1}}>Cancelar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// RECOMENDACIONES
function Recomendaciones({gastos,ingresos}){
  const totalI=ingresos.reduce((a,i)=>a+i.monto,0);
  const totalG=gastos.reduce((a,g)=>a+g.monto,0);
  const byCat={};
  gastos.forEach(g=>{byCat[g.categoria]=(byCat[g.categoria]||0)+g.monto;});
  const pct=k=>totalI>0?((byCat[k]||0)/totalI*100):0;
  const ahorroPct=totalI>0?((totalI-totalG)/totalI*100):0;
  const grupos={};
  gastos.forEach(g=>{const k=g.desc.toLowerCase().trim();grupos[k]=(grupos[k]||{count:0,total:0,desc:g.desc});grupos[k].count++;grupos[k].total+=g.monto;});
  const hormigas=Object.values(grupos).filter(h=>h.count>=2);
  const totalH=hormigas.reduce((a,h)=>a+h.total,0);
  const rules=[
    {cond:pct("Entretenimiento")>25,icon:"🎬",tipo:"warn",titulo:"Entretenimiento elevado",msg:`Tu gasto en entretenimiento representa el ${pct("Entretenimiento").toFixed(1)}% de tus ingresos. Considera reducirlo un 10%.`},
    {cond:ahorroPct<10,icon:"💰",tipo:"warn",titulo:"Ahorro bajo",msg:`Tu porcentaje de ahorro es del ${ahorroPct.toFixed(1)}%. Intenta reservar al menos el 10% de tus ingresos.`},
    {cond:pct("Alimentación")>40,icon:"🍔",tipo:"warn",titulo:"Alto gasto en alimentación",msg:`Una gran parte (${pct("Alimentación").toFixed(1)}%) de tus ingresos se destina a alimentación. Considera cocinar en casa.`},
    {cond:hormigas.length>0,icon:"🐜",tipo:"info",titulo:"Gastos hormiga detectados",msg:`Reduciendo tus gastos hormiga podrías ahorrar aproximadamente ${fmtShort(totalH*0.5)} mensuales (${fmtShort(totalH*0.5*12)} al año).`},
    {cond:ahorroPct>=20,icon:"🏆",tipo:"success",titulo:"¡Excelente ahorro!",msg:`Estás ahorrando el ${ahorroPct.toFixed(1)}% de tus ingresos. ¡Sigue así y considera invertir el excedente!`},
    {cond:ahorroPct>=10&&ahorroPct<20,icon:"📈",tipo:"success",titulo:"Buen progreso",msg:`Estás ahorrando el ${ahorroPct.toFixed(1)}%. Vas por buen camino. Intenta llegar al 20%.`},
  ].filter(r=>r.cond);
  const typeStyle={warn:{bg:C.warn+"22",border:C.warn+"44",color:C.warn},info:{bg:C.info+"22",border:C.info+"44",color:C.info},success:{bg:C.success+"22",border:C.success+"44",color:C.success}};
  return(
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:22,fontWeight:700}}>Recomendaciones</h2>
        <p style={{color:C.muted,fontSize:13}}>Consejos personalizados basados en tus hábitos</p>
      </div>
      {rules.length===0&&<Card><p style={{color:C.muted,textAlign:"center",padding:"2rem 0"}}>Sin datos suficientes para generar recomendaciones</p></Card>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {rules.map((r,i)=>{
          const s=typeStyle[r.tipo];
          return(
            <div key={i} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:14,padding:"1rem 1.25rem",display:"flex",gap:14,alignItems:"flex-start"}}>
              <span style={{fontSize:24,flexShrink:0}}>{r.icon}</span>
              <div>
                <p style={{fontWeight:600,fontSize:15,color:s.color,marginBottom:4}}>{r.titulo}</p>
                <p style={{fontSize:13,color:C.text,lineHeight:1.6}}>{r.msg}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// PERFIL
function Perfil({user,gastos,ingresos}){
  const totalI=ingresos.reduce((a,i)=>a+i.monto,0);
  const totalG=gastos.reduce((a,g)=>a+g.monto,0);
  const ahorroPct=totalI>0?((totalI-totalG)/totalI*100):0;
  let tipo,desc,color,icon;
  if(totalG>totalI){tipo="GASTADOR";desc="Tus gastos superan tus ingresos. Toma acción urgente.";color=C.danger;icon="⚠️";}
  else if(ahorroPct<10){tipo="EN RIESGO";desc="Tu ahorro es menor al 10%. Necesitas ajustar tus hábitos.";color=C.warn;icon="📉";}
  else if(ahorroPct<20){tipo="MODERADO";desc="Ahorras entre el 10% y 20%. Vas bien, pero puedes mejorar.";color=C.info;icon="📊";}
  else{tipo="AHORRADOR";desc="Ahorras más del 20% de tus ingresos. ¡Excelente gestión!";color=C.success;icon="⭐";}
  return(
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:22,fontWeight:700}}>Perfil Financiero</h2>
        <p style={{color:C.muted,fontSize:13}}>Tu clasificación y datos personales</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:"1.5rem"}}>
        <Card style={{gridColumn:"1/-1"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${C.primary},${C.primary2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
              {user.nombre[0]}{user.apellido[0]}
            </div>
            <div>
              <p style={{fontWeight:700,fontSize:20}}>{user.nombre} {user.apellido}</p>
              <p style={{color:C.muted,fontSize:14}}>{user.email}</p>
              <p style={{color:C.muted,fontSize:13,marginTop:2}}>{user.edad} años · Ingreso base: {fmt(user.ingreso)}</p>
            </div>
          </div>
        </Card>
        <Card style={{gridColumn:"1/-1",border:`2px solid ${color}44`,background:color+"11"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:36}}>{icon}</span>
            <div>
              <p style={{fontSize:12,color:C.muted,marginBottom:2}}>Perfil financiero</p>
              <p style={{fontSize:24,fontWeight:800,color}}>{tipo}</p>
              <p style={{fontSize:13,color:C.text,marginTop:4,lineHeight:1.5}}>{desc}</p>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <p style={{fontSize:12,color:C.muted}}>Tasa de ahorro</p>
              <p style={{fontSize:28,fontWeight:800,color}}>{ahorroPct.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <StatCard label="Total Ingresos" value={fmt(totalI)} color={C.success}/>
        <StatCard label="Total Gastos" value={fmt(totalG)} color={C.danger}/>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("dashboard");
  const [gastos,setGastos]=useState(SEED_GASTOS);
  const [ingresos,setIngresos]=useState(SEED_INGRESOS);
  const [metas,setMetas]=useState(SEED_METAS);
  const [collapsed,setCollapsed]=useState(false);

  if(!user) return<><style>{css}</style><LoginScreen onLogin={u=>{setUser(u);setScreen("dashboard");}}/></>;

  const screens={
    dashboard:<Dashboard gastos={gastos} ingresos={ingresos} user={user}/>,
    ingresos:<Ingresos data={ingresos} setData={setIngresos}/>,
    gastos:<Gastos data={gastos} setData={setGastos}/>,
    analisis:<Analisis gastos={gastos} ingresos={ingresos}/>,
    hormigas:<GastosHormiga gastos={gastos}/>,
    metas:<Metas data={metas} setData={setMetas}/>,
    recomendaciones:<Recomendaciones gastos={gastos} ingresos={ingresos}/>,
    perfil:<Perfil user={user} gastos={gastos} ingresos={ingresos}/>,
  };

  return(
    <>
      <style>{css}</style>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar active={screen} onNav={setScreen} onLogout={()=>setUser(null)} user={user} collapsed={collapsed} onToggle={()=>setCollapsed(p=>!p)}/>
        <main style={{flex:1,padding:"2rem",overflowY:"auto",minWidth:0}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            {screens[screen]||<p style={{color:C.muted}}>Módulo en construcción</p>}
          </div>
        </main>
      </div>
    </>
  );
}
