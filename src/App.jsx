import { useEffect, useMemo, useState, useRef } from "react";
import { productos } from "./data/productos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS — premium fonts, animations, microinteractions
   ═══════════════════════════════════════════════════════════════ */
const injectGlobalStyles = () => {
  if (document.getElementById("bl-global-styles")) return;
  const style = document.createElement("style");
  style.id = "bl-global-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(234,88,12,0.22);border-radius:99px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(234,88,12,0.45)}
    button,select,input,a{transition:all 0.22s cubic-bezier(0.25,0.46,0.45,0.94);font-family:'DM Sans',sans-serif}
    button:active:not(:disabled){transform:scale(0.96)!important}
    button:disabled{opacity:0.55;cursor:not-allowed}
    select:focus,input:focus,button:focus-visible{outline:none;border-color:#ea580c!important;box-shadow:0 0 0 3px rgba(234,88,12,0.14),0 2px 8px rgba(234,88,12,0.08)!important}
    input[type="number"]{-moz-appearance:textfield}
    input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{opacity:0;height:0}
    input[type="number"]:hover::-webkit-inner-spin-button,input[type="number"]:hover::-webkit-outer-spin-button{opacity:1;height:28px}
    ::selection{background:rgba(234,88,12,0.18);color:#7c2d12}
    @keyframes blFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes blScaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
    @keyframes blPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.85}}
    @keyframes blSlideDown{from{opacity:0;transform:translateY(-6px);max-height:0}to{opacity:1;transform:translateY(0);max-height:1200px}}
    @keyframes blShine{0%{background-position:-200% center}100%{background-position:200% center}}
    .bl-section{animation:blFadeUp 0.45s cubic-bezier(0.25,0.46,0.45,0.94) both}
    .bl-d1{animation-delay:.06s}.bl-d2{animation-delay:.12s}.bl-d3{animation-delay:.18s}.bl-d4{animation-delay:.24s}.bl-d5{animation-delay:.30s}.bl-d6{animation-delay:.36s}
    .bl-card{transition:transform .24s cubic-bezier(.25,.46,.45,.94),box-shadow .24s cubic-bezier(.25,.46,.45,.94),border-color .24s}
    .bl-card:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(124,45,18,.10)}
    .bl-expand{animation:blSlideDown .35s cubic-bezier(.25,.46,.45,.94) both;overflow:hidden}
    .bl-progress-bar{transition:width .7s cubic-bezier(.25,.46,.45,.94)}
    .bl-btn-hover:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(234,88,12,.15)}
    .bl-shine{background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.12) 50%,transparent 70%);background-size:200% 100%;animation:blShine 3s ease-in-out infinite}
    .bl-semaforo{animation:blPulse 2.5s cubic-bezier(.4,0,.6,1) infinite}
    @media(max-width:768px){.bl-desktop-only{display:none!important}button,select,input{min-height:44px}select{font-size:16px!important}}
    @media(min-width:769px){.bl-mobile-only{display:none!important}}
  `;
  document.head.appendChild(style);
};

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T={orange900:"#5f250f",orange800:"#7c2d12",orange700:"#9a3412",orange600:"#c2410c",orange500:"#ea580c",orange400:"#fb923c",orange300:"#fdba74",orange200:"#fed7aa",orange100:"#ffedd5",orange50:"#fff7ed",cream50:"#fffdf9",cream100:"#fffaf5",cream200:"#fff4ea",cream300:"#fff1e6",cream400:"#ffe4cf",cream500:"#fde2cc",cream600:"#fde4d3",cream700:"#fdc9a3",text:"#5b4d43",textDark:"#7c2d12",textMuted:"#7c6f64",red500:"#dc2626",red100:"#fee2e2",redBorder:"#ef4444",redText:"#991b1b",yellow500:"#d97706",yellow100:"#fef3c7",yellowBorder:"#f59e0b",yellowText:"#92400e",green500:"#65a30d",green100:"#ecfccb",greenBorder:"#84cc16",greenText:"#3f6212",white:"#ffffff",black:"#111827",
fontDisplay:"'Playfair Display',Georgia,serif",fontBody:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
r:{xs:"8px",sm:"12px",md:"16px",lg:"22px",xl:"28px",pill:"999px"},
s:{xs:"0 1px 3px rgba(124,45,18,.03)",sm:"0 2px 8px rgba(124,45,18,.05)",md:"0 8px 24px rgba(124,45,18,.07)",lg:"0 16px 48px rgba(124,45,18,.09)",xl:"0 24px 64px rgba(194,65,12,.16)",glow:"0 0 0 3px rgba(234,88,12,.14)",inner:"inset 0 1px 2px rgba(124,45,18,.06)"}};

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function MiniDato({label,value,highlight,large}){
  return <div style={{backgroundColor:highlight?"rgba(255,237,213,.6)":"rgba(255,255,255,.85)",border:`1px solid ${highlight?T.orange300:T.cream500}`,borderRadius:T.r.sm,padding:large?"12px 14px":"9px 11px",transition:"all .2s ease",backdropFilter:"blur(4px)"}}>
    <div style={{fontSize:"10px",color:T.textMuted,marginBottom:"3px",fontWeight:600,letterSpacing:".4px",textTransform:"uppercase"}}>{label}</div>
    <div style={{fontSize:large?"16px":"13px",fontWeight:700,color:highlight?T.orange600:T.textDark,lineHeight:1.3}}>{value}</div>
  </div>;
}

function ProgressBar({current,target,label,colorStart=T.orange400,colorEnd=T.orange500}){
  const pct=target>0?Math.min((current/target)*100,100):0;
  return <div style={{marginTop:"10px"}}>
    {label&&<div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",color:T.textMuted,marginBottom:"6px",fontWeight:600}}><span>{label}</span><span style={{fontWeight:800,color:pct>=100?T.green500:T.orange600}}>{Math.round(pct)}%</span></div>}
    <div style={{height:"6px",borderRadius:"99px",backgroundColor:"rgba(253,226,204,.6)",overflow:"hidden",boxShadow:T.s.inner}}>
      <div className="bl-progress-bar" style={{height:"100%",width:`${pct}%`,borderRadius:"99px",background:pct>=100?`linear-gradient(90deg,${T.green500},#84cc16)`:`linear-gradient(90deg,${colorStart},${colorEnd})`,boxShadow:pct>=100?"0 0 8px rgba(101,163,13,.3)":"0 0 8px rgba(234,88,12,.2)"}}/>
    </div>
  </div>;
}

function SectionCard({children,style:extra,className="",delay=0}){
  return <section className={`bl-section ${delay>0?`bl-d${delay}`:""} ${className}`.trim()} style={{backgroundColor:"rgba(255,255,255,.92)",borderRadius:T.r.xl,padding:"clamp(18px,3vw,28px)",boxShadow:T.s.lg,border:`1px solid ${T.cream600}`,marginBottom:"18px",backdropFilter:"blur(12px)",...extra}}>{children}</section>;
}

function Badge({children,style:s}){
  return <span style={{display:"inline-block",padding:"4px 10px",borderRadius:T.r.pill,backgroundColor:T.orange200,color:T.orange700,fontSize:"11px",fontWeight:700,letterSpacing:".3px",...s}}>{children}</span>;
}

function Btn({children,onClick,active,ghost,danger,style:s,...rest}){
  const base={padding:"11px 20px",borderRadius:T.r.sm,cursor:"pointer",fontWeight:active?700:600,fontSize:"14px",letterSpacing:"-.2px"};
  const variant=danger?{border:"1.5px solid #fecaca",backgroundColor:"#fff5f5",color:"#b91c1c",boxShadow:"none"}
    :ghost?{border:`1px solid ${T.cream500}`,backgroundColor:"transparent",color:T.textMuted,boxShadow:"none"}
    :active?{border:`2px solid ${T.orange500}`,background:`linear-gradient(135deg,${T.orange400},${T.orange500})`,color:T.white,boxShadow:"0 6px 24px rgba(234,88,12,.22)"}
    :{border:`1px solid ${T.cream500}`,background:"rgba(255,255,255,.8)",color:T.textDark,boxShadow:T.s.xs};
  return <button onClick={onClick} className="bl-btn-hover" style={{...base,...variant,...s}} {...rest}>{children}</button>;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP — all business logic preserved exactly
   ═══════════════════════════════════════════════════════════════ */
function App(){
  useEffect(()=>{injectGlobalStyles();},[]);

  const [perfilUsuario,setPerfilUsuario]=useState("distribuidor");
  const [cantidades,setCantidades]=useState({});
  const [modo,setModo]=useState("compraInicial");
  const [categoriaSeleccionada,setCategoriaSeleccionada]=useState("TODAS");
  const [filaActiva,setFilaActiva]=useState("");
  const [busqueda,setBusqueda]=useState("");
  const [esMovil,setEsMovil]=useState(window.innerWidth<=768);
  const [vistaMovil,setVistaMovil]=useState(window.innerWidth<=768?"cards":"tabla");
  const [resumenContraido,setResumenContraido]=useState(false);
  const [descargandoArchivo,setDescargandoArchivo]=useState("");
  const [programaRecompra,setProgramaRecompra]=useState("lealtad");
  const [mesLealtad,setMesLealtad]=useState(1);
  const [dentroPrimeros15,setDentroPrimeros15]=useState(true);
  const [puntosPersonalesAcelerado,setPuntosPersonalesAcelerado]=useState(0);
  const [puntosGrupalesAcelerado,setPuntosGrupalesAcelerado]=useState(0);
  const [acumuladoPrevioAcelerado,setAcumuladoPrevioAcelerado]=useState(0);
  const [acumuladoPrevioClientePreferente,setAcumuladoPrevioClientePreferente]=useState(0);
  const [animKey,setAnimKey]=useState(0);
  const productRefs=useRef({});
  const tablaWrapperRef=useRef(null);

  useEffect(()=>{const h=()=>{const m=window.innerWidth<=768;setEsMovil(m);if(!m)setVistaMovil("tabla");};window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{setAnimKey(k=>k+1);},[perfilUsuario,modo,programaRecompra]);
  useEffect(()=>{if(!busqueda.trim())return;const t=setTimeout(()=>{const q=busqueda.trim().toLowerCase();const m=productos.find(i=>i.producto.toLowerCase().includes(q)||i.codigo.toLowerCase().includes(q));if(m&&productRefs.current[m.codigo]){productRefs.current[m.codigo].scrollIntoView({behavior:"smooth",block:"center"});setFilaActiva(m.codigo);}},350);return()=>clearTimeout(t);},[busqueda]);

  const categorias=useMemo(()=>{const u=[...new Set(productos.map(i=>i.categoria))];return["TODAS",...u];},[]);
  const documentos=[{nombre:"Catálogo Bodylogic 2026",archivo:"CATALOGO-BODYLOGIC-2026.pdf",descripcion:"Consulta visual del catálogo general.",tipo:"normal",icono:"📖"},{nombre:"Lista de Precios CP Marzo 26",archivo:"LISTA-PRECIOS-CP-MARZO-26.pdf",descripcion:"Precios para Cliente Preferente.",tipo:"normal",icono:"💰"},{nombre:"Lista de Precios DI Marzo 26",archivo:"LISTA-PRECIOS-DI-MARZO-26.pdf",descripcion:"Precios para Distribuidor Independiente.",tipo:"normal",icono:"📊"},{nombre:"Solicitud de Membresía",archivo:"SOLICITUD-DE-MEMBRESIA.pdf",descripcion:"Formato oficial editable para alta de nuevos asociados.",tipo:"membresia",icono:"📝"}];
  const documentosVisibles=perfilUsuario==="clientePreferente"?documentos.filter(d=>d.archivo!=="LISTA-PRECIOS-DI-MARZO-26.pdf"&&d.archivo!=="SOLICITUD-DE-MEMBRESIA.pdf"):documentos;

  const descargarArchivoRobusto=async(archivo,nombreVisible)=>{const ruta=`/archivos/${archivo}`;setDescargandoArchivo(archivo);try{const r=await fetch(ruta,{cache:"no-store"});if(!r.ok)throw new Error(`${r.status}`);const b=await r.blob();const u=window.URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=archivo;a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>window.URL.revokeObjectURL(u),1500);}catch(e){console.error(e);alert(`No se pudo descargar "${nombreVisible}".`);window.open(ruta,"_blank","noopener,noreferrer");}finally{setDescargandoArchivo("");}};

  const cambiarCantidad=(c,v)=>{const n=Number(v);setCantidades(p=>({...p,[c]:n>=0?n:0}));setFilaActiva(c);};
  const incrementarProducto=(c)=>{setCantidades(p=>({...p,[c]:(p[c]||0)+1}));setFilaActiva(c);};
  const decrementarProducto=(c)=>{setCantidades(p=>({...p,[c]:Math.max((p[c]||0)-1,0)}));setFilaActiva(c);};
  const eliminarProducto=(c)=>{setCantidades(p=>({...p,[c]:0}));if(filaActiva===c)setFilaActiva("");};
  const limpiarCantidades=()=>{setCantidades({});setFilaActiva("");};
  const vaciarPedidoActual=()=>{setCantidades({});setFilaActiva("");};
  const irAPedidoActual=()=>{const s=document.getElementById("pedido-actual");if(s)s.scrollIntoView({behavior:"smooth",block:"start"});};
  const irArriba=()=>window.scrollTo({top:0,behavior:"smooth"});

  const productosFiltradosBase=categoriaSeleccionada==="TODAS"?productos:productos.filter(i=>i.categoria===categoriaSeleccionada);
  const textoBusqueda=busqueda.trim().toLowerCase();
  const productosFiltrados=productosFiltradosBase.filter(i=>{if(!textoBusqueda)return true;return i.producto.toLowerCase().includes(textoBusqueda)||i.codigo.toLowerCase().includes(textoBusqueda)||i.categoria.toLowerCase().includes(textoBusqueda);});

  const mapearFila=(item)=>{const u=Number(cantidades[item.codigo]||0);return{...item,unidades:u,subtotalPuntos:u*item.puntos,subtotalPrecioPublico:u*item.precioPublico,subtotalValorComisionable:u*item.valorComisionable,subtotal10:item.precioCP10!==undefined?u*item.precioCP10:u*item.precioPublico*0.9,subtotal15:u*item.precioPublico*0.85,subtotal20:item.precio20!==undefined?u*item.precio20:u*item.precioPublico*0.8,subtotal30:u*item.precio30,subtotal33:u*item.precio33,subtotal35:u*item.precio35,subtotal37:u*item.precio37,subtotal40:u*item.precio40,subtotal42:u*item.precio42};};

  const filasCalculadas=productosFiltrados.map(mapearFila);
  const filasTotales=productos.map(mapearFila);
  const productosSeleccionados=filasTotales.filter(i=>i.unidades>0);
  const totalUnidades=filasTotales.reduce((a,i)=>a+i.unidades,0);
  const totalPuntos=filasTotales.reduce((a,i)=>a+i.subtotalPuntos,0);
  const totalPrecioPublico=filasTotales.reduce((a,i)=>a+i.subtotalPrecioPublico,0);
  const totalValorComisionable=filasTotales.reduce((a,i)=>a+i.subtotalValorComisionable,0);
  const total10=filasTotales.reduce((a,i)=>a+i.subtotal10,0);
  const total15=filasTotales.reduce((a,i)=>a+i.subtotal15,0);
  const total20=filasTotales.reduce((a,i)=>a+i.subtotal20,0);
  const total30=filasTotales.reduce((a,i)=>a+i.subtotal30,0);
  const total33=filasTotales.reduce((a,i)=>a+i.subtotal33,0);
  const total35=filasTotales.reduce((a,i)=>a+i.subtotal35,0);
  const total37=filasTotales.reduce((a,i)=>a+i.subtotal37,0);
  const total40=filasTotales.reduce((a,i)=>a+i.subtotal40,0);
  const total42=filasTotales.reduce((a,i)=>a+i.subtotal42,0);

  const obtenerPaqueteCompraInicial=(puntos)=>{if(puntos>=500)return{nombre:"Paquete 500",descuento:42,totalConDescuento:total42,siguientePaquete:null,siguienteObjetivo:null};if(puntos>=400)return{nombre:"Paquete 400",descuento:33,totalConDescuento:total33,siguientePaquete:"Paquete 500",siguienteObjetivo:500};if(puntos>=300)return{nombre:"Paquete 300",descuento:33,totalConDescuento:total33,siguientePaquete:"Paquete 400",siguienteObjetivo:400};if(puntos>=200)return{nombre:"Paquete 200",descuento:33,totalConDescuento:total33,siguientePaquete:"Paquete 300",siguienteObjetivo:300};if(puntos>=100)return{nombre:"Paquete 100",descuento:30,totalConDescuento:total30,siguientePaquete:"Paquete 200",siguienteObjetivo:200};return{nombre:"Aún no calificas",descuento:0,totalConDescuento:0,siguientePaquete:"Paquete 100",siguienteObjetivo:100};};
  const paqueteActual=obtenerPaqueteCompraInicial(totalPuntos);

  const obtenerMensajeCompraInicial=()=>{if(totalPuntos<100){const f=100-totalPuntos;return{texto:`Te faltan ${f} puntos para iniciar con el paquete de 100 puntos.`,colorFondo:T.red100,colorTexto:T.redText,colorBorde:T.redBorder,colorSemaforo:T.red500,siguienteMensaje:`Te faltan ${f} puntos para iniciar (${paqueteActual.siguientePaquete}).`};}if(totalPuntos>=500)return{texto:"Ya alcanzaste el paquete de 500 puntos y el 42% de descuento. ¡Estás en el nivel más alto de compra inicial!",colorFondo:T.green100,colorTexto:T.greenText,colorBorde:T.greenBorder,colorSemaforo:T.green500,siguienteMensaje:"Ya estás en el paquete más alto de compra inicial."};const f=paqueteActual.siguienteObjetivo-totalPuntos;return{texto:`Ya estás dentro del ${paqueteActual.nombre} con ${paqueteActual.descuento}% de descuento. Te faltan ${f} puntos para alcanzar ${paqueteActual.siguientePaquete}.`,colorFondo:T.yellow100,colorTexto:T.yellowText,colorBorde:T.yellowBorder,colorSemaforo:T.yellow500,siguienteMensaje:`Te faltan ${f} puntos para llegar a ${paqueteActual.siguientePaquete}.`};};

  const obtenerDescuentoLealtad=(mes)=>{if(mes<=1)return 30;if(mes<=3)return 33;if(mes<=5)return 35;if(mes<=11)return 37;if(mes<=17)return 40;return 42;};
  const descuentoLealtadActual=obtenerDescuentoLealtad(mesLealtad);
  const totalSegunDescuentoLealtad=descuentoLealtadActual===30?total30:descuentoLealtadActual===33?total33:descuentoLealtadActual===35?total35:descuentoLealtadActual===37?total37:descuentoLealtadActual===40?total40:total42;
  const obtenerSiguienteEscalonLealtad=(mes)=>{if(mes<2)return{etiqueta:"33%",mesesFaltantes:2-mes};if(mes<4)return{etiqueta:"35%",mesesFaltantes:4-mes};if(mes<6)return{etiqueta:"37%",mesesFaltantes:6-mes};if(mes<12)return{etiqueta:"40%",mesesFaltantes:12-mes};if(mes<18)return{etiqueta:"42%",mesesFaltantes:18-mes};return null;};
  const siguienteEscalonLealtad=obtenerSiguienteEscalonLealtad(mesLealtad);

  const obtenerMensajeLealtad=()=>{const c100=totalPuntos>=100;if(!dentroPrimeros15)return{texto:"Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",colorFondo:T.red100,colorTexto:T.redText,colorBorde:T.redBorder,colorSemaforo:T.red500,mensajePrincipal:"Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",mensajeSecundario:c100?"Aunque cubriste 100 puntos, al no comprar dentro de los primeros 15 días no conservas continuidad.":`Además, te faltan ${100-totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,continuidad:false};if(!c100)return{texto:`Te faltan ${100-totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,colorFondo:T.red100,colorTexto:T.redText,colorBorde:T.redBorder,colorSemaforo:T.red500,mensajePrincipal:`Te faltan ${100-totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,mensajeSecundario:"Necesitas mínimo 100 puntos personales en los primeros 15 días para sostener tu avance en Lealtad.",continuidad:false};if(siguienteEscalonLealtad){const p=siguienteEscalonLealtad.mesesFaltantes===1?"mes":"meses";return{texto:`¡Felicidades! Ya sostienes tu mes ${mesLealtad} en Lealtad con ${descuentoLealtadActual}% de descuento.`,colorFondo:T.green100,colorTexto:T.greenText,colorBorde:T.greenBorder,colorSemaforo:T.green500,mensajePrincipal:"¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",mensajeSecundario:`Te faltan ${siguienteEscalonLealtad.mesesFaltantes} ${p} consecutivos para llegar al ${siguienteEscalonLealtad.etiqueta}.`,continuidad:true};}return{texto:`¡Felicidades! Ya estás en el tramo máximo del Programa de Lealtad con ${descuentoLealtadActual}% de descuento.`,colorFondo:T.green100,colorTexto:T.greenText,colorBorde:T.greenBorder,colorSemaforo:T.green500,mensajePrincipal:"¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",mensajeSecundario:"Ya te encuentras en el tramo más alto del Programa de Lealtad.",continuidad:true};};

  const totalAcumuladoAcelerado=Number(puntosPersonalesAcelerado||0)+Number(puntosGrupalesAcelerado||0)+Number(acumuladoPrevioAcelerado||0);
  const obtenerDescuentoAcelerado=(a)=>{if(a>=3001)return 42;if(a>=1501)return 40;if(a>=501)return 35;if(a>=1)return 30;return 0;};
  const descuentoAceleradoActual=obtenerDescuentoAcelerado(totalAcumuladoAcelerado);
  const totalSegunDescuentoAcelerado=descuentoAceleradoActual===30?total30:descuentoAceleradoActual===35?total35:descuentoAceleradoActual===40?total40:descuentoAceleradoActual===42?total42:0;
  const obtenerSiguienteEscalonAcelerado=(a)=>{if(a<501)return{meta:501,etiqueta:"35%"};if(a<1501)return{meta:1501,etiqueta:"40%"};if(a<3001)return{meta:3001,etiqueta:"42%"};return null;};
  const siguienteEscalonAcelerado=obtenerSiguienteEscalonAcelerado(totalAcumuladoAcelerado);
  const obtenerMensajeAcelerado=()=>{if(totalAcumuladoAcelerado<=0)return{texto:"Captura puntos personales, grupales y acumulado previo para evaluar tu Lealtad Acelerado.",colorFondo:T.red100,colorTexto:T.redText,colorBorde:T.redBorder,colorSemaforo:T.red500,mensajePrincipal:"Aún no has capturado puntos suficientes para evaluar el Programa de Lealtad Acelerado.",mensajeSecundario:"Ingresa tus puntos personales, grupales y acumulado previo."};if(siguienteEscalonAcelerado){const f=siguienteEscalonAcelerado.meta-totalAcumuladoAcelerado;return{texto:`Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y te coloca en ${descuentoAceleradoActual}% dentro del Programa de Lealtad Acelerado.`,colorFondo:descuentoAceleradoActual>=35?T.yellow100:T.red100,colorTexto:descuentoAceleradoActual>=35?T.yellowText:T.redText,colorBorde:descuentoAceleradoActual>=35?T.yellowBorder:T.redBorder,colorSemaforo:descuentoAceleradoActual>=35?T.yellow500:T.red500,mensajePrincipal:`Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y ya estás en ${descuentoAceleradoActual}% de descuento.`,mensajeSecundario:`Te faltan ${f} puntos acumulados para llegar al ${siguienteEscalonAcelerado.etiqueta}.`};}return{texto:`¡Felicidades! Ya alcanzaste ${totalAcumuladoAcelerado} puntos acumulados y entras al 42% en Lealtad Acelerado.`,colorFondo:T.green100,colorTexto:T.greenText,colorBorde:T.greenBorder,colorSemaforo:T.green500,mensajePrincipal:"¡Felicidades! Ya alcanzaste el tramo máximo del Programa de Lealtad Acelerado.",mensajeSecundario:"Ya estás en 42% de descuento por acumulado."};};

  const puntosAcumuladosClientePreferente=Number(acumuladoPrevioClientePreferente||0)+Number(totalPuntos||0);
  const obtenerDescuentoClientePreferente=(p)=>{if(p>=650)return 20;if(p>=150)return 15;return 10;};
  const descuentoClientePreferenteActual=obtenerDescuentoClientePreferente(puntosAcumuladosClientePreferente);
  const totalSegunDescuentoClientePreferente=descuentoClientePreferenteActual===10?total10:descuentoClientePreferenteActual===15?total15:total20;
  const obtenerSiguienteNivelClientePreferente=(p)=>{if(p<150)return{meta:150,etiqueta:"15%"};if(p<650)return{meta:650,etiqueta:"20%"};return null;};
  const siguienteNivelClientePreferente=obtenerSiguienteNivelClientePreferente(puntosAcumuladosClientePreferente);
  const obtenerMensajeClientePreferente=()=>{if(puntosAcumuladosClientePreferente<150){const f=150-puntosAcumuladosClientePreferente;return{texto:`Actualmente estás en 10% de descuento. Te faltan ${f} puntos acumulados para llegar al 15%.`,colorFondo:T.red100,colorTexto:T.redText,colorBorde:T.redBorder,colorSemaforo:T.red500,mensajePrincipal:"Tu descuento actual como Cliente Preferente es 10%.",mensajeSecundario:`Te faltan ${f} puntos acumulados para llegar al 15%.`};}if(puntosAcumuladosClientePreferente<650){const f=650-puntosAcumuladosClientePreferente;return{texto:`Actualmente estás en 15% de descuento. Te faltan ${f} puntos acumulados para llegar al 20%.`,colorFondo:T.yellow100,colorTexto:T.yellowText,colorBorde:T.yellowBorder,colorSemaforo:T.yellow500,mensajePrincipal:"Tu descuento actual como Cliente Preferente es 15%.",mensajeSecundario:`Te faltan ${f} puntos acumulados para llegar al 20%.`};}return{texto:"¡Felicidades! Ya alcanzaste el 20% de descuento como Cliente Preferente.",colorFondo:T.green100,colorTexto:T.greenText,colorBorde:T.greenBorder,colorSemaforo:T.green500,mensajePrincipal:"Tu descuento actual como Cliente Preferente es 20%.",mensajeSecundario:"Ya estás en el nivel máximo de Cliente Preferente."};};

  const estado=perfilUsuario==="clientePreferente"?obtenerMensajeClientePreferente():modo==="compraInicial"?obtenerMensajeCompraInicial():programaRecompra==="lealtad"?obtenerMensajeLealtad():obtenerMensajeAcelerado();
  const formatoMoneda=(n)=>Number(n||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});

  const obtenerPrecioActualPorPerfil=(item)=>{if(perfilUsuario==="clientePreferente"){if(descuentoClientePreferenteActual===10)return item.precioCP10!==undefined?item.precioCP10:item.precioPublico*0.9;if(descuentoClientePreferenteActual===15)return item.precioPublico*0.85;return item.precio20!==undefined?item.precio20:item.precioPublico*0.8;}if(modo==="compraInicial"){if(paqueteActual.descuento===30)return item.precio30;if(paqueteActual.descuento===33)return item.precio33;if(paqueteActual.descuento===42)return item.precio42;return item.precioPublico;}if(programaRecompra==="lealtad"){if(descuentoLealtadActual===30)return item.precio30;if(descuentoLealtadActual===33)return item.precio33;if(descuentoLealtadActual===35)return item.precio35;if(descuentoLealtadActual===37)return item.precio37;if(descuentoLealtadActual===40)return item.precio40;return item.precio42;}if(descuentoAceleradoActual===30)return item.precio30;if(descuentoAceleradoActual===35)return item.precio35;if(descuentoAceleradoActual===40)return item.precio40;if(descuentoAceleradoActual===42)return item.precio42;return item.precioPublico;};
  const obtenerTotalPedidoActual=(item)=>{if(perfilUsuario==="clientePreferente"){if(descuentoClientePreferenteActual===10)return item.subtotal10;if(descuentoClientePreferenteActual===15)return item.subtotal15;return item.subtotal20;}if(modo==="compraInicial"){if(paqueteActual.descuento===30)return item.subtotal30;if(paqueteActual.descuento===33)return item.subtotal33;if(paqueteActual.descuento===42)return item.subtotal42;return 0;}if(programaRecompra==="lealtad"){if(descuentoLealtadActual===30)return item.subtotal30;if(descuentoLealtadActual===33)return item.subtotal33;if(descuentoLealtadActual===35)return item.subtotal35;if(descuentoLealtadActual===37)return item.subtotal37;if(descuentoLealtadActual===40)return item.subtotal40;return item.subtotal42;}if(descuentoAceleradoActual===30)return item.subtotal30;if(descuentoAceleradoActual===35)return item.subtotal35;if(descuentoAceleradoActual===40)return item.subtotal40;if(descuentoAceleradoActual===42)return item.subtotal42;return 0;};
  const obtenerDescuentoActualGeneral=()=>{if(perfilUsuario==="clientePreferente")return descuentoClientePreferenteActual;if(modo==="compraInicial")return paqueteActual.descuento;if(programaRecompra==="lealtad")return descuentoLealtadActual;return descuentoAceleradoActual;};
  const obtenerTotalConDescuentoGeneral=()=>{if(perfilUsuario==="clientePreferente")return totalSegunDescuentoClientePreferente;if(modo==="compraInicial")return paqueteActual.totalConDescuento;if(programaRecompra==="lealtad")return totalSegunDescuentoLealtad;return totalSegunDescuentoAcelerado;};

  const descargarPDFPedido=()=>{if(productosSeleccionados.length===0){alert("Primero captura al menos un producto.");return;}const doc=new jsPDF({orientation:"landscape",unit:"pt",format:"a4"});const fecha=new Date().toLocaleString("es-MX");doc.setFillColor(234,88,12);doc.rect(0,0,842,84,"F");doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(24);doc.text("BodyLogic - Resumen de pedido",40,38);doc.setFont("helvetica","normal");doc.setFontSize(10);let tm="";if(perfilUsuario==="clientePreferente")tm=`Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}`;else if(modo==="compraInicial")tm=`Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;else if(programaRecompra==="lealtad")tm=`Recompra mensual | Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;else tm=`Recompra mensual | Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;doc.text(tm,40,60);doc.setTextColor(80,80,80);doc.text(`Fecha: ${fecha}`,40,108);doc.text(`Estado: ${estado.texto}`,40,124);const dP=obtenerDescuentoActualGeneral();const body=productosSeleccionados.map(i=>[i.producto,String(i.unidades),String(i.subtotalPuntos),formatoMoneda(i.subtotalPrecioPublico),formatoMoneda(obtenerTotalPedidoActual(i))]);autoTable(doc,{startY:145,head:[["Producto","Uds","Sub. pts","Sub. público",`Sub. ${dP}%`]],body,theme:"grid",headStyles:{fillColor:[234,88,12],textColor:[255,255,255],fontStyle:"bold",halign:"center"},styles:{fontSize:9,cellPadding:6,textColor:[40,40,40],valign:"middle"},alternateRowStyles:{fillColor:[255,250,245]},margin:{left:40,right:40}});const fy=doc.lastAutoTable.finalY+22;doc.setDrawColor(234,88,12);doc.setLineWidth(1);doc.line(40,fy,802,fy);doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(124,45,18);doc.text(`Total unidades: ${totalUnidades}`,40,fy+22);doc.text(`Total puntos: ${totalPuntos}`,190,fy+22);doc.text(`Total público: ${formatoMoneda(totalPrecioPublico)}`,330,fy+22);doc.text(`Total descuento: ${formatoMoneda(obtenerTotalConDescuentoGeneral())}`,40,fy+44);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(90,90,90);doc.text("Creado por Jorge Francisco Sánchez Yerenas para su comunidad empresarial BodyLogic.",40,fy+70);doc.save("Resumen-Pedido-BodyLogic.pdf");};

  const imprimirFormulario=()=>{if(productosSeleccionados.length===0){alert("Primero captura al menos un producto.");return;}const fH=productosSeleccionados.map(i=>`<tr><td>${i.producto}</td><td style="text-align:center">${i.unidades}</td><td style="text-align:center">${i.subtotalPuntos}</td><td style="text-align:right">${formatoMoneda(i.subtotalPrecioPublico)}</td><td style="text-align:right">${formatoMoneda(obtenerTotalPedidoActual(i))}</td></tr>`).join("");const w=window.open("","_blank","width=1200,height=900");if(!w){alert("Permite pop-ups.");return;}const dI=obtenerDescuentoActualGeneral();let sub="";if(perfilUsuario==="clientePreferente")sub=`CP | ${descuentoClientePreferenteActual}% | Acum ${puntosAcumuladosClientePreferente}`;else if(modo==="compraInicial")sub=`Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;else if(programaRecompra==="lealtad")sub=`Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;else sub=`Acelerado | Acum ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;w.document.write(`<html><head><title>BodyLogic</title><style>body{font-family:'DM Sans',Arial,sans-serif;margin:30px;color:#222}.enc{background:linear-gradient(135deg,#c2410c,#fb923c);color:#fff;padding:18px 22px;border-radius:16px;margin-bottom:24px}h1{margin:0 0 6px;font-size:26px}.sub{font-size:13px;opacity:.95}.meta{margin:14px 0 20px;font-size:13px;line-height:1.7}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#ea580c;color:#fff;padding:10px;border:1px solid #d6d3d1;font-size:13px}td{border:1px solid #e5e7eb;padding:10px;font-size:13px}tr:nth-child(even){background:#fffaf5}.tot{margin-top:24px;padding:16px;border:1px solid #fdba74;border-radius:14px;background:#fff7ed;line-height:1.8;font-size:14px}.firm{margin-top:40px;font-size:12px;color:#666}</style></head><body><div class="enc"><h1>BodyLogic - Formulario</h1><div class="sub">${sub}</div></div><div class="meta"><div><strong>Fecha:</strong> ${new Date().toLocaleString("es-MX")}</div><div><strong>Estado:</strong> ${estado.texto}</div></div><table><thead><tr><th>Producto</th><th>Uds</th><th>Sub. pts</th><th>Sub. público</th><th>Sub. ${dI}%</th></tr></thead><tbody>${fH}</tbody></table><div class="tot"><div><strong>Total uds:</strong> ${totalUnidades}</div><div><strong>Total pts:</strong> ${totalPuntos}</div><div><strong>Total público:</strong> ${formatoMoneda(totalPrecioPublico)}</div><div><strong>Total descuento:</strong> ${formatoMoneda(obtenerTotalConDescuentoGeneral())}</div></div><div class="firm">Creado por Jorge Francisco Sánchez Yerenas para su comunidad BodyLogic.</div><script>window.onload=function(){window.print();};</script></body></html>`);w.document.close();};

  const tel="8007024840";
  const isD=perfilUsuario==="distribuidor",isCP=perfilUsuario==="clientePreferente";
  const descuentoActual=obtenerDescuentoActualGeneral(),totalConDescuento=obtenerTotalConDescuentoGeneral();
  const cc={background:`linear-gradient(180deg,${T.cream100},rgba(255,247,237,.5))`,border:`1px solid ${T.cream500}`,borderRadius:T.r.lg,padding:"16px",boxShadow:T.s.xs};
  const ic={background:`linear-gradient(135deg,${T.orange100},${T.orange200})`,border:`1px solid ${T.orange300}`,borderRadius:T.r.lg,padding:"16px",display:"flex",flexDirection:"column",justifyContent:"center",boxShadow:T.s.sm};
  const lb={display:"block",marginBottom:"8px",fontWeight:600,color:T.textDark,fontSize:"12px",letterSpacing:".5px",textTransform:"uppercase"};
  const sel={width:"100%",padding:"12px 14px",borderRadius:T.r.sm,border:`1.5px solid ${T.cream700}`,backgroundColor:T.white,color:T.textDark,fontSize:"14px",fontWeight:500,boxShadow:T.s.inner};
  const inp={width:"100%",padding:"12px 14px",borderRadius:T.r.sm,border:`1.5px solid ${T.cream700}`,backgroundColor:T.white,color:T.black,fontSize:"14px",fontWeight:500,boxSizing:"border-box",boxShadow:T.s.inner};
  const tdS={padding:"10px",borderBottom:`1px solid ${T.cream200}`,color:T.text,fontSize:"13px",whiteSpace:"nowrap",transition:"background-color .15s"};
  const tdT={padding:"12px 10px",borderTop:`2px solid ${T.cream500}`,color:T.textDark,fontSize:"13px",whiteSpace:"nowrap"};
  const inpT={width:"68px",padding:"8px",borderRadius:T.r.xs,border:`1.5px solid ${T.cream700}`,backgroundColor:T.white,color:T.black,fontSize:"13px",fontWeight:600,textAlign:"center",boxShadow:T.s.inner};
  const rowBg=(item,idx)=>filaActiva===item.codigo?T.orange200:item.unidades>0?"rgba(255,241,230,.7)":idx%2===0?T.white:"rgba(255,250,245,.5)";
  const secTitle={margin:0,fontSize:"clamp(19px,3vw,25px)",color:T.textDark,fontFamily:T.fontDisplay,fontWeight:700,letterSpacing:"-.3px"};
  const secSub={margin:"4px 0 0",color:T.textMuted,fontSize:"13px",lineHeight:1.5};

  const renderTable=(headers,renderRow,renderTotal)=>(
    <div ref={tablaWrapperRef} style={{overflowX:"auto",borderRadius:T.r.lg,border:`1px solid ${T.cream500}`,boxShadow:T.s.sm}}>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0,minWidth:"1100px",backgroundColor:T.white,fontSize:"13px"}}>
        <thead><tr>{headers.map(h=><th key={h} style={{textAlign:"left",padding:"11px 10px",borderBottom:`2px solid ${T.cream500}`,color:T.orange800,fontSize:"10px",fontWeight:700,whiteSpace:"nowrap",position:"sticky",top:0,background:`linear-gradient(180deg,${T.cream300},${T.cream400})`,zIndex:1,letterSpacing:".6px",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
        <tbody>{filasCalculadas.map((item,idx)=>renderRow(item,idx))}{renderTotal()}</tbody>
      </table>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 20% 0%,rgba(255,237,213,.7) 0%,rgba(255,247,237,.6) 25%,${T.cream100} 50%,${T.cream50} 100%)`,padding:"clamp(12px,3vw,22px)",paddingBottom:"190px",fontFamily:T.fontBody,position:"relative",overflow:"hidden",color:T.text}}>
      <div style={{position:"absolute",top:"-120px",right:"-80px",width:"350px",height:"350px",borderRadius:"50%",background:"radial-gradient(circle,rgba(251,146,60,.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"8%",left:"-60px",width:"240px",height:"240px",borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,.07) 0%,transparent 72%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:"1500px",margin:"0 auto",position:"relative",zIndex:1}}>

        {/* HERO */}
        <header className="bl-section" style={{borderRadius:T.r.xl,overflow:"hidden",background:`linear-gradient(135deg,${T.orange900} 0%,#8f3412 18%,${T.orange600} 42%,${T.orange500} 70%,${T.orange400} 100%)`,boxShadow:T.s.xl,marginBottom:"18px"}}>
          <div className="bl-shine" style={{background:"radial-gradient(circle at top right,rgba(255,255,255,.18),transparent 50%),linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.08))",padding:"clamp(22px,5vw,44px)",color:T.white}}>
            <Badge style={{backgroundColor:"rgba(255,255,255,.14)",color:"#fff",border:"1px solid rgba(255,255,255,.22)",fontSize:"12px",fontWeight:600}}>Plataforma de Apoyo Comercial</Badge>
            <h1 style={{margin:"14px 0 0",fontSize:"clamp(30px,7vw,50px)",lineHeight:1.05,fontFamily:T.fontDisplay,fontWeight:800,letterSpacing:"-.6px",textShadow:"0 3px 16px rgba(0,0,0,.18)"}}>BodyLogic</h1>
            <p style={{marginTop:"10px",maxWidth:"640px",fontSize:"clamp(13px,2.5vw,16px)",lineHeight:1.65,color:"rgba(255,255,255,.90)"}}>Centro avanzado de cálculo de puntos, validación comercial, documentos oficiales y gestión operativa para asociados.</p>
            <div style={{display:"inline-block",marginTop:"14px",padding:"11px 16px",borderRadius:T.r.md,backgroundColor:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",color:"#fff7ed",lineHeight:1.5,fontSize:"12px",backdropFilter:"blur(6px)",maxWidth:"640px"}}>Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.</div>
          </div>
        </header>

        {/* PANEL DE CONTROL */}
        <SectionCard delay={1} key={`p-${animKey}`}>
          <div style={{marginBottom:"18px"}}><h2 style={secTitle}>Panel de control</h2><p style={secSub}>Selecciona tu perfil, configura y filtra productos.</p></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px"}}>
            <div style={cc}><label style={lb}>Perfil</label><select value={perfilUsuario} onChange={e=>setPerfilUsuario(e.target.value)} style={sel}><option value="distribuidor">Distribuidor Independiente</option><option value="clientePreferente">Cliente Preferente</option></select></div>
            <div style={cc}><label style={lb}>Categoría</label><select value={categoriaSeleccionada} onChange={e=>setCategoriaSeleccionada(e.target.value)} style={sel}>{categorias.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div style={cc}><label style={lb}>Buscar</label><div style={{position:"relative"}}><input type="text" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Ej. Omega 3, 4045156..." style={{...inp,paddingLeft:"36px"}}/><span style={{position:"absolute",left:"11px",top:"50%",transform:"translateY(-50%)",fontSize:"15px",opacity:.35,pointerEvents:"none"}}>🔍</span></div></div>
            <div style={{...ic,animation:"blScaleIn .35s ease both",animationDelay:".1s"}}><div style={{fontSize:"18px",fontWeight:800,color:T.orange700,fontFamily:T.fontDisplay}}>{isD?"Distribuidor":"Cliente Preferente"}</div><div style={{marginTop:"4px",color:T.textMuted,fontSize:"12px"}}>{isD?"Ingreso y recompra":"Descuento progresivo"}</div></div>
          </div>

          {isD?(
            <div key={`d-${animKey}`} style={{animation:"blFadeUp .3s ease both"}}>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap",margin:"16px 0"}}>
                <Btn onClick={()=>setModo("compraInicial")} active={modo==="compraInicial"}>Compra inicial</Btn>
                <Btn onClick={()=>setModo("recompraMensual")} active={modo==="recompraMensual"}>Recompra mensual</Btn>
                <Btn onClick={limpiarCantidades} ghost>Limpiar</Btn>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px"}}>
                {modo==="compraInicial"?(
                  <div style={{...ic,animation:"blScaleIn .3s ease both"}}><div style={{fontSize:"18px",fontWeight:800,color:T.orange700,fontFamily:T.fontDisplay}}>{paqueteActual.nombre}</div><div style={{marginTop:"4px",color:T.textMuted,fontSize:"12px"}}>Detectado automáticamente</div>{paqueteActual.siguienteObjetivo&&<ProgressBar current={totalPuntos} target={paqueteActual.siguienteObjetivo} label={`${totalPuntos}/${paqueteActual.siguienteObjetivo} pts → ${paqueteActual.siguientePaquete}`}/>}</div>
                ):(
                  <>
                    <div style={cc}><label style={lb}>Programa</label><select value={programaRecompra} onChange={e=>setProgramaRecompra(e.target.value)} style={sel}><option value="lealtad">Lealtad</option><option value="acelerado">Acelerado</option></select></div>
                    {programaRecompra==="lealtad"?(<><div style={cc}><label style={lb}>Mes</label><select value={mesLealtad} onChange={e=>setMesLealtad(Number(e.target.value))} style={sel}>{Array.from({length:18},(_,i)=>i+1).map(m=><option key={m} value={m}>{m===18?"Mes 18+": `Mes ${m}`}</option>)}</select></div><div style={cc}><label style={lb}>¿Primeros 15 días?</label><select value={dentroPrimeros15?"si":"no"} onChange={e=>setDentroPrimeros15(e.target.value==="si")} style={sel}><option value="si">Sí</option><option value="no">No</option></select></div></>):(<><div style={cc}><label style={lb}>Pts personales</label><input type="number" min="0" value={puntosPersonalesAcelerado} onChange={e=>setPuntosPersonalesAcelerado(Number(e.target.value||0))} style={inp}/></div><div style={cc}><label style={lb}>Pts grupales</label><input type="number" min="0" value={puntosGrupalesAcelerado} onChange={e=>setPuntosGrupalesAcelerado(Number(e.target.value||0))} style={inp}/></div><div style={cc}><label style={lb}>Acum. previo</label><input type="number" min="0" value={acumuladoPrevioAcelerado} onChange={e=>setAcumuladoPrevioAcelerado(Number(e.target.value||0))} style={inp}/></div></>)}
                  </>
                )}
              </div>
            </div>
          ):(
            <div key={`cp-${animKey}`} style={{animation:"blFadeUp .3s ease both"}}>
              <div style={{display:"flex",gap:"8px",margin:"16px 0"}}><Btn onClick={limpiarCantidades} ghost>Limpiar</Btn></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px"}}>
                <div style={cc}><label style={lb}>Pts acum. previos</label><input type="number" min="0" value={acumuladoPrevioClientePreferente} onChange={e=>setAcumuladoPrevioClientePreferente(Number(e.target.value||0))} style={inp}/></div>
                <div style={{...ic,animation:"blScaleIn .3s ease both"}}><div style={{fontSize:"30px",fontWeight:800,color:T.orange600,fontFamily:T.fontDisplay}}>{descuentoClientePreferenteActual}%</div><div style={{marginTop:"3px",color:T.textMuted,fontSize:"12px"}}>Descuento actual</div></div>
                <div style={{...ic,animation:"blScaleIn .3s ease both",animationDelay:".08s"}}><div style={{fontSize:"26px",fontWeight:800,color:T.orange600,fontFamily:T.fontDisplay}}>{puntosAcumuladosClientePreferente}</div><div style={{marginTop:"3px",color:T.textMuted,fontSize:"12px"}}>Pts acumulados</div>{siguienteNivelClientePreferente&&<ProgressBar current={puntosAcumuladosClientePreferente} target={siguienteNivelClientePreferente.meta} label={`${puntosAcumuladosClientePreferente}/${siguienteNivelClientePreferente.meta} → ${siguienteNivelClientePreferente.etiqueta}`}/>}</div>
                <div style={{...ic,animation:"blScaleIn .3s ease both",animationDelay:".16s"}}><div style={{fontSize:"18px",fontWeight:700,color:T.orange700}}>{siguienteNivelClientePreferente?`${siguienteNivelClientePreferente.meta-puntosAcumuladosClientePreferente} pts`:"Nivel máximo"}</div><div style={{marginTop:"4px",color:T.textMuted,fontSize:"12px"}}>{siguienteNivelClientePreferente?`Faltan → ${siguienteNivelClientePreferente.etiqueta}`:"Ya en 20%"}</div></div>
              </div>
            </div>
          )}
          {esMovil&&<div style={{display:"flex",gap:"6px",marginTop:"14px"}}><Btn onClick={()=>setVistaMovil("cards")} active={vistaMovil==="cards"} style={{flex:1,fontSize:"13px",padding:"10px"}}>Tarjetas</Btn><Btn onClick={()=>setVistaMovil("tabla")} active={vistaMovil==="tabla"} style={{flex:1,fontSize:"13px",padding:"10px"}}>Tabla</Btn></div>}
        </SectionCard>

        {/* SEMÁFORO */}
        <section className="bl-section bl-d2" key={`s-${animKey}-${estado.colorSemaforo}`} style={{display:"flex",gap:"14px",alignItems:"center",borderRadius:T.r.lg,padding:"18px 22px",marginBottom:"18px",backgroundColor:estado.colorFondo,border:`2px solid ${estado.colorBorde}`,boxShadow:T.s.md,transition:"all .4s cubic-bezier(.25,.46,.45,.94)"}}>
          <div className="bl-semaforo" style={{width:"16px",height:"16px",borderRadius:"50%",flexShrink:0,backgroundColor:estado.colorSemaforo,boxShadow:`0 0 0 5px ${estado.colorFondo},0 0 16px ${estado.colorSemaforo}50`}}/>
          <div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:700,color:estado.colorTexto,lineHeight:1.3}}>{isCP?"Cliente Preferente":modo==="compraInicial"?"Compra inicial":programaRecompra==="lealtad"?"Lealtad":"Lealtad Acelerado"}</div><div style={{marginTop:"3px",lineHeight:1.5,color:estado.colorTexto,fontSize:"13px",opacity:.9}}>{estado.texto}</div></div>
        </section>

        {/* PEDIDO ACTUAL */}
        <SectionCard delay={3}>
          <div id="pedido-actual" style={{marginBottom:"14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}><div><h2 style={secTitle}>Pedido actual</h2><p style={secSub}>Productos capturados.</p></div>{productosSeleccionados.length>0&&<Btn onClick={vaciarPedidoActual} danger style={{fontSize:"12px",padding:"9px 14px"}}>Vaciar pedido</Btn>}</div></div>
          {productosSeleccionados.length===0?<div style={{padding:"28px",borderRadius:T.r.lg,backgroundColor:"rgba(255,250,245,.6)",border:`2px dashed ${T.cream700}`,color:T.textMuted,textAlign:"center",fontSize:"14px"}}>Aún no has agregado productos.</div>:(
            <><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"8px",marginBottom:"14px"}}><MiniDato label="Unidades" value={totalUnidades} highlight large/><MiniDato label="Puntos" value={totalPuntos} highlight large/><MiniDato label="P. público" value={formatoMoneda(totalPrecioPublico)} large/><MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(totalConDescuento)} highlight large/></div>
            <div style={{display:"grid",gap:"10px"}}>{productosSeleccionados.map((item,i)=>(
              <div key={item.codigo} className="bl-card" style={{background:`linear-gradient(135deg,rgba(255,250,245,.8),rgba(255,244,234,.6))`,border:`1px solid ${T.cream500}`,borderRadius:T.r.lg,padding:"14px",animation:`blFadeUp .3s ease both`,animationDelay:`${i*.04}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:"10px",alignItems:"flex-start"}}><div><Badge>{item.codigo}</Badge><div style={{marginTop:"5px",fontSize:"15px",fontWeight:700,color:T.textDark,lineHeight:1.3}}>{item.producto}</div>{item.contenido&&<div style={{marginTop:"2px",fontSize:"11px",color:T.textMuted}}>{item.contenido}</div>}</div><Btn onClick={()=>eliminarProducto(item.codigo)} danger style={{padding:"5px 10px",fontSize:"11px"}}>Quitar</Btn></div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px"}}><Btn onClick={()=>decrementarProducto(item.codigo)} style={{width:"38px",height:"38px",padding:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",borderRadius:T.r.sm,border:`1.5px solid ${T.cream700}`,backgroundColor:T.white,color:T.orange700,boxShadow:T.s.xs}}>−</Btn><input type="number" min="0" value={item.unidades} onChange={e=>cambiarCantidad(item.codigo,e.target.value)} style={{width:"70px",padding:"9px",borderRadius:T.r.sm,border:`1.5px solid ${T.cream700}`,backgroundColor:T.white,color:T.black,textAlign:"center",fontWeight:700,fontSize:"15px",boxShadow:T.s.inner}}/><Btn onClick={()=>incrementarProducto(item.codigo)} style={{width:"38px",height:"38px",padding:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",borderRadius:T.r.sm,border:`1.5px solid ${T.cream700}`,backgroundColor:T.white,color:T.orange700,boxShadow:T.s.xs}}>+</Btn></div>
                <div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"6px"}}><MiniDato label="Sub. pts" value={item.subtotalPuntos}/><MiniDato label="Público" value={formatoMoneda(item.subtotalPrecioPublico)}/><MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(obtenerTotalPedidoActual(item))} highlight/></div>
              </div>
            ))}</div></>
          )}
        </SectionCard>

        {/* TABLA MAESTRA */}
        <SectionCard delay={4}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px",marginBottom:"14px"}}><div><h2 style={secTitle}>Tabla maestra</h2><p style={secSub}><strong>{filasCalculadas.length}</strong> producto(s){categoriaSeleccionada!=="TODAS"?` en "${categoriaSeleccionada}"`:""}</p></div><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><Btn onClick={descargarPDFPedido} active style={{fontSize:"13px",padding:"9px 16px"}}>PDF</Btn><Btn onClick={imprimirFormulario} style={{fontSize:"13px",padding:"9px 16px"}}>Imprimir</Btn></div></div>
          {esMovil&&vistaMovil==="cards"?(
            <div style={{display:"grid",gap:"10px"}}>{filasCalculadas.map((item,i)=>{const act=filaActiva===item.codigo;return(
              <div key={item.codigo} ref={el=>{productRefs.current[item.codigo]=el;}} className="bl-card" onClick={()=>setFilaActiva(item.codigo)} style={{background:item.unidades>0?`linear-gradient(135deg,${T.orange50},${T.orange100})`:`linear-gradient(135deg,rgba(255,250,245,.7),rgba(255,244,234,.5))`,border:act?`2px solid ${T.orange500}`:`1px solid ${T.cream500}`,borderRadius:T.r.lg,padding:"14px",boxShadow:act?T.s.glow:T.s.xs,animation:`blFadeUp .3s ease both`,animationDelay:`${i*.025}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:"6px",alignItems:"flex-start"}}><div><Badge>{item.codigo}</Badge><div style={{marginTop:"5px",fontSize:"15px",fontWeight:700,color:T.textDark,lineHeight:1.3}}>{item.producto}</div>{item.contenido&&<div style={{marginTop:"2px",fontSize:"11px",color:T.textMuted}}>{item.contenido}</div>}</div><Badge style={{backgroundColor:T.cream400,color:T.orange800,fontSize:"9px",padding:"3px 7px"}}>{item.categoria}</Badge></div>
                <div style={{marginTop:"10px"}}><label style={{display:"block",marginBottom:"5px",fontSize:"11px",fontWeight:600,color:T.textDark,textTransform:"uppercase",letterSpacing:".4px"}}>Unidades</label><input type="number" min="0" value={item.unidades} onChange={e=>cambiarCantidad(item.codigo,e.target.value)} onFocus={()=>setFilaActiva(item.codigo)} style={inp}/></div>
                <div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}><MiniDato label="Pts unit." value={item.puntos}/><MiniDato label="Sub. pts" value={item.subtotalPuntos}/><MiniDato label="Público" value={formatoMoneda(item.subtotalPrecioPublico)}/><MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(obtenerTotalPedidoActual(item))} highlight/></div>
              </div>);})}</div>
          ):isCP?renderTable(["Cat.","Cód.","Producto","Contenido","Uds.","Pts","Sub.pts","P.púb.","Sub.púb.","P.desc.","Sub.desc."],(item,idx)=><tr key={item.codigo} ref={el=>{productRefs.current[item.codigo]=el;}} onClick={()=>setFilaActiva(item.codigo)} style={{backgroundColor:rowBg(item,idx),cursor:"pointer",transition:"background-color .18s"}}><td style={tdS}>{item.categoria}</td><td style={tdS}>{item.codigo}</td><td style={{...tdS,color:T.textDark,fontWeight:600}}>{item.producto}</td><td style={tdS}>{item.contenido}</td><td style={tdS}><input type="number" min="0" value={item.unidades} onChange={e=>cambiarCantidad(item.codigo,e.target.value)} onFocus={()=>setFilaActiva(item.codigo)} style={inpT}/></td><td style={tdS}>{item.puntos}</td><td style={tdS}>{item.subtotalPuntos}</td><td style={tdS}>{formatoMoneda(item.precioPublico)}</td><td style={tdS}>{formatoMoneda(item.subtotalPrecioPublico)}</td><td style={tdS}>{formatoMoneda(obtenerPrecioActualPorPerfil(item))}</td><td style={tdS}>{formatoMoneda(obtenerTotalPedidoActual(item))}</td></tr>,()=><tr style={{background:`linear-gradient(180deg,${T.cream100},${T.cream300})`}}><td style={tdT}/><td style={tdT}/><td style={{...tdT,fontWeight:700}}>TOTAL</td><td style={tdT}/><td style={{...tdT,fontWeight:700}}>{totalUnidades}</td><td style={tdT}/><td style={{...tdT,fontWeight:700,backgroundColor:estado.colorFondo,color:estado.colorTexto,border:`2px solid ${estado.colorBorde}`,borderRadius:"6px"}}>{totalPuntos}</td><td style={tdT}/><td style={{...tdT,fontWeight:700}}>{formatoMoneda(totalPrecioPublico)}</td><td style={tdT}/><td style={{...tdT,fontWeight:700}}>{formatoMoneda(totalSegunDescuentoClientePreferente)}</td></tr>)
          :renderTable(["Cat.","Cód.","Producto","Contenido","Uds.","Pts","Sub.pts","P.púb.","Sub.púb.","V.com.","Sub.com."],(item,idx)=><tr key={item.codigo} ref={el=>{productRefs.current[item.codigo]=el;}} onClick={()=>setFilaActiva(item.codigo)} style={{backgroundColor:rowBg(item,idx),cursor:"pointer",transition:"background-color .18s"}}><td style={tdS}>{item.categoria}</td><td style={tdS}>{item.codigo}</td><td style={{...tdS,color:T.textDark,fontWeight:600}}>{item.producto}</td><td style={tdS}>{item.contenido}</td><td style={tdS}><input type="number" min="0" value={item.unidades} onChange={e=>cambiarCantidad(item.codigo,e.target.value)} onFocus={()=>setFilaActiva(item.codigo)} style={inpT}/></td><td style={tdS}>{item.puntos}</td><td style={tdS}>{item.subtotalPuntos}</td><td style={tdS}>{formatoMoneda(item.precioPublico)}</td><td style={tdS}>{formatoMoneda(item.subtotalPrecioPublico)}</td><td style={tdS}>{formatoMoneda(item.valorComisionable)}</td><td style={tdS}>{formatoMoneda(item.subtotalValorComisionable)}</td></tr>,()=><tr style={{background:`linear-gradient(180deg,${T.cream100},${T.cream300})`}}><td style={tdT}/><td style={tdT}/><td style={{...tdT,fontWeight:700}}>TOTAL</td><td style={tdT}/><td style={{...tdT,fontWeight:700}}>{totalUnidades}</td><td style={tdT}/><td style={{...tdT,fontWeight:700,backgroundColor:estado.colorFondo,color:estado.colorTexto,border:`2px solid ${estado.colorBorde}`,borderRadius:"6px"}}>{totalPuntos}</td><td style={tdT}/><td style={{...tdT,fontWeight:700}}>{formatoMoneda(totalPrecioPublico)}</td><td style={tdT}/><td style={{...tdT,fontWeight:700}}>{formatoMoneda(totalValorComisionable)}</td></tr>)}
        </SectionCard>

        {/* INFO */}
        <SectionCard delay={5}><h2 style={secTitle}>3 formas de adquirir</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px",marginTop:"14px"}}><div className="bl-card" style={{background:`linear-gradient(135deg,${T.orange50},${T.orange100})`,border:`1px solid ${T.orange300}`,borderRadius:T.r.lg,padding:"16px"}}><Badge>Web</Badge><h3 style={{margin:"8px 0 6px",color:T.textDark,fontSize:"16px",fontWeight:700}}>Sitio web</h3><p style={{margin:0,color:T.textMuted,fontSize:"13px"}}>Ingresa a:</p><a href="https://www.bodylogicglobal.com" target="_blank" rel="noreferrer" className="bl-btn-hover" style={{display:"inline-block",marginTop:"8px",color:T.orange600,fontWeight:700,textDecoration:"none",padding:"9px 14px",borderRadius:T.r.sm,backgroundColor:T.white,border:`1px solid ${T.cream700}`,fontSize:"13px"}}>bodylogicglobal.com ↗</a></div><div className="bl-card" style={{background:`linear-gradient(180deg,${T.cream100},${T.cream200})`,border:`1px solid ${T.cream500}`,borderRadius:T.r.lg,padding:"16px"}}><Badge>Teléfono</Badge><h3 style={{margin:"8px 0 6px",color:T.textDark,fontSize:"16px",fontWeight:700}}>Centro de servicio</h3><a href={`tel:${tel}`} style={{display:"inline-block",color:T.orange600,fontWeight:700,textDecoration:"none",fontSize:"17px"}}>800 702 4840</a><p style={{margin:"4px 0 0",color:T.textMuted,fontSize:"12px",lineHeight:1.5}}>L-V 8:00–20:00 · S 9:00–14:00</p></div><div className="bl-card" style={{background:`linear-gradient(180deg,${T.cream100},${T.cream200})`,border:`1px solid ${T.cream500}`,borderRadius:T.r.lg,padding:"16px"}}><Badge>Presencial</Badge><h3 style={{margin:"8px 0 6px",color:T.textDark,fontSize:"16px",fontWeight:700}}>CAD</h3><p style={{margin:0,color:T.textMuted,fontSize:"13px",lineHeight:1.5}}>Tu CAD más cercano.</p></div></div></SectionCard>

        {/* LEYENDAS */}
        <SectionCard delay={5} style={{background:`linear-gradient(180deg,${T.orange50},rgba(255,244,234,.5))`,border:`1px solid ${T.cream700}`}}><h2 style={{...secTitle,marginBottom:"12px"}}>Leyendas</h2>{["Los puntos corresponden al valor en puntos de cada producto.",isD&&"El valor comisionable = 89% del precio con descuento sin IVA.","Herramientas de negocio no generan puntos ni V.C.","Valida siempre con la lista vigente de la empresa."].filter(Boolean).map((t,i)=><div key={i} style={{padding:"10px 14px",borderRadius:T.r.sm,backgroundColor:"rgba(255,255,255,.65)",border:`1px solid ${T.orange200}`,color:T.orange700,lineHeight:1.55,fontSize:"13px",marginBottom:i<3?"8px":0}}>{t}</div>)}</SectionCard>

        {/* DOCUMENTOS */}
        <SectionCard delay={6}><h2 style={secTitle}>Documentos</h2><p style={{...secSub,marginBottom:"14px"}}>{isCP?"Para Cliente Preferente.":"Archivos oficiales."}</p><div style={{display:"grid",gap:"10px"}}>{documentosVisibles.map((doc,i)=>{const dl=descargandoArchivo===doc.archivo;return(<div key={doc.archivo} className="bl-card" style={{background:`linear-gradient(180deg,${T.cream100},${T.cream200})`,border:`1px solid ${T.cream500}`,borderRadius:T.r.lg,padding:"14px",animation:`blFadeUp .3s ease both`,animationDelay:`${i*.05}s`}}><div style={{display:"flex",gap:"10px",alignItems:"flex-start"}}><span style={{fontSize:"22px",lineHeight:1}}>{doc.icono}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:"15px",color:T.textDark}}>{doc.nombre}</div><div style={{marginTop:"3px",color:T.textMuted,fontSize:"12px",lineHeight:1.5}}>{doc.descripcion}</div><div style={{marginTop:"3px",color:T.orange500,fontSize:"11px",fontWeight:500}}>{doc.archivo}</div></div></div><Btn onClick={()=>descargarArchivoRobusto(doc.archivo,doc.nombre)} active style={{marginTop:"10px",fontSize:"12px",padding:"9px 16px",width:"100%"}} disabled={dl}>{dl?"Descargando...":doc.tipo==="membresia"?"Descargar y rellenar":"Descargar PDF"}</Btn></div>);})}</div></SectionCard>

        {/* RESUMEN FLOTANTE MÓVIL */}
        {esMovil&&(
          <div style={{position:"fixed",left:"8px",right:"8px",bottom:"8px",zIndex:999,borderRadius:T.r.lg,padding:"12px 14px",backgroundColor:estado.colorFondo,border:`1.5px solid ${estado.colorBorde}`,boxShadow:"0 -6px 36px rgba(0,0,0,.18)",backdropFilter:"blur(16px)",color:estado.colorTexto,transition:"all .35s cubic-bezier(.25,.46,.45,.94)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"}}>
              <div style={{display:"flex",gap:"14px",alignItems:"center",flexWrap:"wrap"}}>
                {isCP?(<><FS l="Perfil" v="CP" c={estado.colorTexto}/><FS l="Acum." v={puntosAcumuladosClientePreferente} c={estado.colorTexto} big/><FS l="Desc." v={`${descuentoClientePreferenteActual}%`} c={estado.colorTexto}/></>)
                :modo==="compraInicial"?(<><FS l="Pts" v={totalPuntos} c={estado.colorTexto} big/><FS l="Paq." v={paqueteActual.nombre.replace("Paquete ","")} c={estado.colorTexto}/><FS l="Desc." v={`${paqueteActual.descuento}%`} c={estado.colorTexto}/></>)
                :programaRecompra==="lealtad"?(<><FS l="Prog." v="Lealtad" c={estado.colorTexto}/><FS l="Mes" v={mesLealtad} c={estado.colorTexto} big/><FS l="Desc." v={`${descuentoLealtadActual}%`} c={estado.colorTexto}/></>)
                :(<><FS l="Prog." v="Acelerado" c={estado.colorTexto}/><FS l="Acum." v={totalAcumuladoAcelerado} c={estado.colorTexto} big/><FS l="Desc." v={`${descuentoAceleradoActual}%`} c={estado.colorTexto}/></>)}
              </div>
              <button onClick={()=>setResumenContraido(!resumenContraido)} style={{padding:"8px 11px",borderRadius:T.r.xs,border:`1px solid ${estado.colorBorde}`,backgroundColor:"rgba(255,255,255,.55)",color:T.textDark,fontWeight:700,cursor:"pointer",fontSize:"12px",transition:"transform .2s",transform:resumenContraido?"rotate(0)":"rotate(180deg)"}}>▼</button>
            </div>
            {!resumenContraido&&(
              <div className="bl-expand">
                <div style={{margin:"10px 0 8px",padding:"9px 12px",borderRadius:T.r.sm,backgroundColor:"rgba(255,255,255,.40)"}}><div style={{fontSize:"16px",fontWeight:800,lineHeight:1.2,color:estado.colorTexto}}>{isCP?"Cliente Preferente":modo==="compraInicial"?paqueteActual.nombre:programaRecompra==="lealtad"?(estado.continuidad?"Lealtad sostenida":"Secuencia comprometida"):"Lealtad Acelerado"}</div><div style={{marginTop:"3px",fontSize:"12px",fontWeight:700,color:estado.colorTexto,opacity:.85}}>Descuento: {descuentoActual}%</div></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"8px"}}>
                  <FC l={isCP?"Pts acum.":modo==="compraInicial"?"Puntos":programaRecompra==="lealtad"?"Pts pers.":"Pts periodo"} v={isCP?puntosAcumuladosClientePreferente:modo==="compraInicial"?totalPuntos:programaRecompra==="lealtad"?totalPuntos:Number(puntosPersonalesAcelerado||0)+Number(puntosGrupalesAcelerado||0)} num e={estado}/>
                  <FC l="P. público" v={formatoMoneda(totalPrecioPublico)} e={estado}/>
                  <FC l={`Con ${descuentoActual}%`} v={formatoMoneda(isCP?totalSegunDescuentoClientePreferente:modo==="compraInicial"?paqueteActual.totalConDescuento:programaRecompra==="lealtad"?totalSegunDescuentoLealtad:totalSegunDescuentoAcelerado)} e={estado}/>
                </div>
                <div style={{padding:"8px 10px",borderRadius:T.r.sm,backgroundColor:"rgba(255,255,255,.38)",fontSize:"11px",lineHeight:1.45,marginBottom:"8px"}}><div style={{fontWeight:700,color:estado.colorTexto}}>{estado.mensajePrincipal||estado.siguienteMensaje||estado.texto}</div>{estado.mensajeSecundario&&<div style={{fontWeight:600,color:estado.colorTexto,marginTop:"4px",opacity:.85}}>{estado.mensajeSecundario}</div>}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                  <Btn onClick={irAPedidoActual} active style={{fontSize:"12px",padding:"10px"}}>Ver pedido</Btn>
                  <Btn onClick={descargarPDFPedido} style={{fontSize:"12px",padding:"10px",borderColor:estado.colorBorde,backgroundColor:"rgba(255,255,255,.55)"}}>PDF</Btn>
                  <Btn onClick={imprimirFormulario} style={{fontSize:"12px",padding:"10px",borderColor:estado.colorBorde,backgroundColor:"rgba(255,255,255,.55)"}}>Imprimir</Btn>
                  <Btn onClick={irArriba} style={{fontSize:"12px",padding:"10px",borderColor:estado.colorBorde,backgroundColor:"rgba(255,255,255,.25)"}}>↑ Subir</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FS({l,v,c,big}){return<div style={{display:"flex",flexDirection:"column"}}><span style={{fontSize:"9px",color:c,opacity:.75,fontWeight:600,letterSpacing:".3px",textTransform:"uppercase"}}>{l}</span><span style={{fontSize:big?"17px":"12px",fontWeight:700,color:c}}>{v}</span></div>;}
function FC({l,v,num,e}){return<div style={{borderRadius:T.r.xs,padding:"7px 8px",border:`1px solid ${e.colorBorde}`,backgroundColor:"rgba(255,255,255,.45)"}}><div style={{fontSize:"9px",marginBottom:"2px",color:e.colorTexto,fontWeight:600,letterSpacing:".3px",textTransform:"uppercase"}}>{l}</div><div style={{fontSize:num?"16px":"11px",fontWeight:700,color:e.colorTexto,lineHeight:1.3}}>{v}</div></div>;}

export default App;