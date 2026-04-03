import { useEffect, useState, useCallback, useMemo } from "react";
import { T } from "./config/tokens";
import { injectGlobalStyles } from "./styles/globalStyles";
import { useOrder } from "./hooks/useOrder";
import { useDiscountEngine } from "./hooks/useDiscountEngine";
import { useResponsive } from "./hooks/useResponsive";
import { getVisibleDocuments } from "./config/documents";
import { formatoMoneda } from "./utils/format";
import { generarPDFPedido, imprimirFormulario } from "./utils/pdf";
import { descargarArchivo } from "./utils/download";
import {
  Badge, Btn, MiniDato, ProgressBar, SectionCard, FS, FC,
} from "./components/shared";

function App() {
  useEffect(() => { injectGlobalStyles(); }, []);

  // ── Profile & mode state ──
  const [perfilUsuario, setPerfilUsuario] = useState("distribuidor");
  const [modo, setModo] = useState("compraInicial");
  const [programaRecompra, setProgramaRecompra] = useState("lealtad");
  const [mesLealtad, setMesLealtad] = useState(1);
  const [dentroPrimeros15, setDentroPrimeros15] = useState(true);
  const [puntosPersonalesAcelerado, setPuntosPersonalesAcelerado] = useState(0);
  const [puntosGrupalesAcelerado, setPuntosGrupalesAcelerado] = useState(0);
  const [acumuladoPrevioAcelerado, setAcumuladoPrevioAcelerado] = useState(0);
  const [acumuladoPrevioClientePreferente, setAcumuladoPrevioClientePreferente] = useState(0);
  const [descargandoArchivo, setDescargandoArchivo] = useState("");
  const [resumenContraido, setResumenContraido] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // ── Hooks ──
  const { esMovil, vistaMovil, setVistaMovil } = useResponsive();
  const order = useOrder();
  const engine = useDiscountEngine({
    perfilUsuario, modo, programaRecompra, mesLealtad, dentroPrimeros15,
    puntosPersonalesAcelerado, puntosGrupalesAcelerado, acumuladoPrevioAcelerado,
    acumuladoPrevioClientePreferente, totales: order.totales,
  });

  useEffect(() => { setAnimKey((k) => k + 1); }, [perfilUsuario, modo, programaRecompra]);

  const isD = perfilUsuario === "distribuidor";
  const isCP = perfilUsuario === "clientePreferente";
  const { estado, descuentoActual, totalConDescuento, obtenerPrecio, obtenerSubtotal, textoModo, paqueteActual } = engine;
  const { totales, productosSeleccionados, filasCalculadas, categorias } = order;
  const documentosVisibles = useMemo(() => getVisibleDocuments(perfilUsuario), [perfilUsuario]);

  // ── Navigation ──
  const irAPedidoActual = useCallback(() => {
    document.getElementById("pedido-actual")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const irArriba = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  // ── PDF/Print handlers ──
  const handlePDF = useCallback(() => {
    generarPDFPedido({
      productosSeleccionados, descuentoActual: descuentoActual,
      totalUnidades: totales.totalUnidades, totalPuntos: totales.totalPuntos,
      totalPrecioPublico: totales.totalPrecioPublico, totalConDescuento,
      obtenerSubtotal, textoModo, estadoTexto: estado.texto,
    });
  }, [productosSeleccionados, descuentoActual, totales, totalConDescuento, obtenerSubtotal, textoModo, estado.texto]);

  const handlePrint = useCallback(() => {
    imprimirFormulario({
      productosSeleccionados, descuentoActual,
      totalUnidades: totales.totalUnidades, totalPuntos: totales.totalPuntos,
      totalPrecioPublico: totales.totalPrecioPublico, totalConDescuento,
      obtenerSubtotal, subtitulo: textoModo, estadoTexto: estado.texto,
    });
  }, [productosSeleccionados, descuentoActual, totales, totalConDescuento, obtenerSubtotal, textoModo, estado.texto]);

  const handleDescargar = useCallback((archivo, nombre) => {
    descargarArchivo(archivo, nombre, setDescargandoArchivo, () => setDescargandoArchivo(""));
  }, []);

  // ── Style helpers ──
  const cc = { background: `linear-gradient(180deg,${T.cream100},rgba(255,247,237,.5))`, border: `1px solid ${T.cream500}`, borderRadius: T.r.lg, padding: "16px", boxShadow: T.s.xs };
  const ic = { background: `linear-gradient(135deg,${T.orange100},${T.orange200})`, border: `1px solid ${T.orange300}`, borderRadius: T.r.lg, padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: T.s.sm };
  const lb = { display: "block", marginBottom: "8px", fontWeight: 600, color: T.textDark, fontSize: "12px", letterSpacing: ".5px", textTransform: "uppercase" };
  const sel = { width: "100%", padding: "12px 14px", borderRadius: T.r.sm, border: `1.5px solid ${T.cream700}`, backgroundColor: T.white, color: T.textDark, fontSize: "14px", fontWeight: 500, boxShadow: T.s.inner };
  const inp = { width: "100%", padding: "12px 14px", borderRadius: T.r.sm, border: `1.5px solid ${T.cream700}`, backgroundColor: T.white, color: T.black, fontSize: "14px", fontWeight: 500, boxSizing: "border-box", boxShadow: T.s.inner };
  const secTitle = { margin: 0, fontSize: "clamp(19px,3vw,25px)", color: T.textDark, fontFamily: T.fontDisplay, fontWeight: 700, letterSpacing: "-.3px" };
  const secSub = { margin: "4px 0 0", color: T.textMuted, fontSize: "13px", lineHeight: 1.5 };
  const tdS = { padding: "10px", borderBottom: `1px solid ${T.cream200}`, color: T.text, fontSize: "13px", whiteSpace: "nowrap", transition: "background-color .18s" };
  const tdT = { padding: "12px 10px", borderTop: `2px solid ${T.cream500}`, color: T.textDark, fontSize: "13px", whiteSpace: "nowrap" };
  const inpT = { width: "68px", padding: "8px", borderRadius: T.r.xs, border: `1.5px solid ${T.cream700}`, backgroundColor: T.white, color: T.black, fontSize: "13px", fontWeight: 600, textAlign: "center", boxShadow: T.s.inner };
  const rowBg = (item, idx) => order.filaActiva === item.codigo ? T.orange200 : item.unidades > 0 ? "rgba(255,241,230,.7)" : idx % 2 === 0 ? T.white : "rgba(255,250,245,.5)";

  const renderTable = (headers, renderRow, renderTotal) => (
    <div style={{ overflowX: "auto", borderRadius: T.r.lg, border: `1px solid ${T.cream500}`, boxShadow: T.s.sm }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: "1100px", backgroundColor: T.white, fontSize: "13px" }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left", padding: "11px 10px", borderBottom: `2px solid ${T.cream500}`, color: T.orange800, fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap", position: "sticky", top: 0, background: `linear-gradient(180deg,${T.cream300},${T.cream400})`, zIndex: 1, letterSpacing: ".6px", textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
        <tbody>{filasCalculadas.map((item, idx) => renderRow(item, idx))}{renderTotal()}</tbody>
      </table>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER — composed from shared components, minimal inline logic
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 15% -5%,rgba(255,237,213,.75) 0%,rgba(255,247,237,.55) 22%,${T.cream100} 48%,${T.cream50} 100%)`, padding: "clamp(10px,3vw,22px)", paddingBottom: "200px", fontFamily: T.fontBody, position: "relative", overflow: "hidden", color: T.text }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "-100px", right: "-60px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(251,146,60,.15) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "5%", left: "-50px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,.06) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ maxWidth: "1500px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ══ HERO ══ */}
        <header className="bl-section" style={{ borderRadius: T.r.xl, overflow: "hidden", background: `linear-gradient(135deg,${T.orange900} 0%,#7a2e10 15%,${T.orange600} 40%,${T.orange500} 65%,${T.orange400} 85%,#fbbf6a 100%)`, boxShadow: T.s.xl, marginBottom: "18px", position: "relative" }}>
          <div className="bl-shine" style={{ padding: "clamp(24px,5vw,48px)", color: T.white, position: "relative", zIndex: 1 }}>
            <Badge style={{ backgroundColor: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.22)" }}>Plataforma de Apoyo Comercial</Badge>
            <h1 style={{ margin: "14px 0 0", fontSize: "clamp(30px,7vw,50px)", lineHeight: 1.05, fontFamily: T.fontDisplay, fontWeight: 800, letterSpacing: "-.6px", textShadow: "0 3px 16px rgba(0,0,0,.18)" }}>BodyLogic</h1>
            <p style={{ marginTop: "10px", maxWidth: "640px", fontSize: "clamp(13px,2.5vw,16px)", lineHeight: 1.65, color: "rgba(255,255,255,.90)" }}>Centro avanzado de cálculo de puntos y gestión operativa para asociados.</p>
            <div style={{ display: "inline-block", marginTop: "14px", padding: "11px 16px", borderRadius: T.r.md, backgroundColor: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.18)", color: "#fff7ed", lineHeight: 1.5, fontSize: "12px", backdropFilter: "blur(6px)", maxWidth: "640px" }}>Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.</div>
          </div>
        </header>

        {/* ══ PANEL DE CONTROL ══ */}
        <SectionCard delay={1} key={`p-${animKey}`}>
          <div style={{ marginBottom: "18px" }}><h2 style={secTitle}>Panel de control</h2><p style={secSub}>Elige tu perfil y filtra los productos de tu pedido.</p></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px" }}>
            <div style={cc}><label style={lb}>Perfil</label><select value={perfilUsuario} onChange={(e) => setPerfilUsuario(e.target.value)} style={sel}><option value="distribuidor">Distribuidor Independiente</option><option value="clientePreferente">Cliente Preferente</option></select></div>
            <div style={cc}><label style={lb}>Categoría</label><select value={order.categoriaSeleccionada} onChange={(e) => order.setCategoriaSeleccionada(e.target.value)} style={sel}>{categorias.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div style={cc}><label style={lb}>Buscar</label><div style={{ position: "relative" }}><input type="text" value={order.busqueda} onChange={(e) => order.setBusqueda(e.target.value)} placeholder="Ej. Omega 3" style={{ ...inp, paddingLeft: "36px" }} /><span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", opacity: .35, pointerEvents: "none" }}>🔍</span></div></div>
            <div style={{ ...ic, animation: "blScaleIn .35s ease both", animationDelay: ".1s" }}><div style={{ fontSize: "18px", fontWeight: 800, color: T.orange700, fontFamily: T.fontDisplay }}>{isD ? "Distribuidor" : "Cliente Preferente"}</div><div style={{ marginTop: "4px", color: T.textMuted, fontSize: "12px" }}>{isD ? "Ingreso y recompra" : "Descuento progresivo"}</div></div>
          </div>

          {isD ? (
            <div key={`d-${animKey}`} style={{ animation: "blFadeUp .3s ease both" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "16px 0" }}>
                <Btn onClick={() => setModo("compraInicial")} active={modo === "compraInicial"}>Compra inicial</Btn>
                <Btn onClick={() => setModo("recompraMensual")} active={modo === "recompraMensual"}>Recompra mensual</Btn>
                <Btn onClick={order.vaciarPedido} ghost>Limpiar</Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px" }}>
                {modo === "compraInicial" ? (
                  <div style={{ ...ic, animation: "blScaleIn .3s ease both" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: T.orange700, fontFamily: T.fontDisplay }}>{paqueteActual.nombre}</div>
                    <div style={{ marginTop: "4px", color: T.textMuted, fontSize: "12px" }}>Detectado automáticamente</div>
                    {paqueteActual.siguienteObjetivo && <ProgressBar current={totales.totalPuntos} target={paqueteActual.siguienteObjetivo} label={`${totales.totalPuntos}/${paqueteActual.siguienteObjetivo} pts → ${paqueteActual.siguientePaquete}`} />}
                  </div>
                ) : (
                  <>
                    <div style={cc}><label style={lb}>Programa</label><select value={programaRecompra} onChange={(e) => setProgramaRecompra(e.target.value)} style={sel}><option value="lealtad">Lealtad</option><option value="acelerado">Acelerado</option></select></div>
                    {programaRecompra === "lealtad" ? (
                      <><div style={cc}><label style={lb}>Mes</label><select value={mesLealtad} onChange={(e) => setMesLealtad(Number(e.target.value))} style={sel}>{Array.from({ length: 18 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m === 18 ? "Mes 18+" : `Mes ${m}`}</option>)}</select></div><div style={cc}><label style={lb}>¿Primeros 15 días?</label><select value={dentroPrimeros15 ? "si" : "no"} onChange={(e) => setDentroPrimeros15(e.target.value === "si")} style={sel}><option value="si">Sí</option><option value="no">No</option></select></div></>
                    ) : (
                      <><div style={cc}><label style={lb}>Pts personales</label><input type="number" min="0" value={puntosPersonalesAcelerado} onChange={(e) => setPuntosPersonalesAcelerado(Number(e.target.value || 0))} style={inp} /></div><div style={cc}><label style={lb}>Pts grupales</label><input type="number" min="0" value={puntosGrupalesAcelerado} onChange={(e) => setPuntosGrupalesAcelerado(Number(e.target.value || 0))} style={inp} /></div><div style={cc}><label style={lb}>Acum. previo</label><input type="number" min="0" value={acumuladoPrevioAcelerado} onChange={(e) => setAcumuladoPrevioAcelerado(Number(e.target.value || 0))} style={inp} /></div></>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div key={`cp-${animKey}`} style={{ animation: "blFadeUp .3s ease both" }}>
              <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}><Btn onClick={order.vaciarPedido} ghost>Limpiar</Btn></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
                <div style={cc}><label style={lb}>Pts acum. previos</label><input type="number" min="0" value={acumuladoPrevioClientePreferente} onChange={(e) => setAcumuladoPrevioClientePreferente(Number(e.target.value || 0))} style={inp} /></div>
                <div style={{ ...ic, animation: "blScaleIn .3s ease both" }}><div style={{ fontSize: "30px", fontWeight: 800, color: T.orange600 }}>{engine.descuentoCP}%</div><div style={{ marginTop: "3px", color: T.textMuted, fontSize: "12px" }}>Descuento actual</div></div>
                <div style={{ ...ic, animation: "blScaleIn .3s ease both", animationDelay: ".08s" }}><div style={{ fontSize: "26px", fontWeight: 800, color: T.orange600 }}>{engine.puntosAcumuladosCP}</div><div style={{ marginTop: "3px", color: T.textMuted, fontSize: "12px" }}>Pts acumulados</div>{engine.siguienteNivelCP && <ProgressBar current={engine.puntosAcumuladosCP} target={engine.siguienteNivelCP.meta} label={`${engine.puntosAcumuladosCP}/${engine.siguienteNivelCP.meta} → ${engine.siguienteNivelCP.etiqueta}`} />}</div>
                <div style={{ ...ic, animation: "blScaleIn .3s ease both", animationDelay: ".16s" }}><div style={{ fontSize: "18px", fontWeight: 700, color: T.orange700 }}>{engine.siguienteNivelCP ? `${engine.siguienteNivelCP.meta - engine.puntosAcumuladosCP} pts` : "Nivel máximo"}</div><div style={{ marginTop: "4px", color: T.textMuted, fontSize: "12px" }}>{engine.siguienteNivelCP ? `Faltan → ${engine.siguienteNivelCP.etiqueta}` : "Ya en 20%"}</div></div>
              </div>
            </div>
          )}
          {esMovil && <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}><Btn onClick={() => setVistaMovil("cards")} active={vistaMovil === "cards"} style={{ flex: 1, fontSize: "13px", padding: "10px" }}>Tarjetas</Btn><Btn onClick={() => setVistaMovil("tabla")} active={vistaMovil === "tabla"} style={{ flex: 1, fontSize: "13px", padding: "10px" }}>Tabla</Btn></div>}
        </SectionCard>

        {/* ══ SEMÁFORO ══ */}
        <section className="bl-section bl-d2" key={`s-${animKey}`} style={{ display: "flex", gap: "14px", alignItems: "center", borderRadius: T.r.lg, padding: "18px 22px", marginBottom: "18px", backgroundColor: estado.colorFondo, border: `2px solid ${estado.colorBorde}`, boxShadow: T.s.md, transition: "all .4s cubic-bezier(.22,.61,.36,1)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: "4px", borderRadius: "0 4px 4px 0", backgroundColor: estado.colorSemaforo, boxShadow: `0 0 8px ${estado.colorSemaforo}40` }} />
          <div className="bl-semaforo" style={{ width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0, backgroundColor: estado.colorSemaforo, boxShadow: `0 0 0 4px ${estado.colorFondo},0 0 16px ${estado.colorSemaforo}45`, marginLeft: "6px" }} />
          <div style={{ flex: 1 }}><div style={{ fontSize: "13px", fontWeight: 700, color: estado.colorTexto, lineHeight: 1.3 }}>{isCP ? "Cliente Preferente" : modo === "compraInicial" ? "Compra inicial" : programaRecompra === "lealtad" ? "Lealtad" : "Lealtad Acelerado"}</div><div style={{ marginTop: "4px", lineHeight: 1.55, color: estado.colorTexto, fontSize: "13px", opacity: .88 }}>{estado.texto}</div></div>
        </section>

        {/* ══ PEDIDO ACTUAL ══ */}
        <SectionCard delay={3}>
          <div id="pedido-actual" style={{ marginBottom: "14px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}><div><h2 style={secTitle}>Pedido actual</h2><p style={secSub}>Productos capturados.</p></div>{productosSeleccionados.length > 0 && <Btn onClick={order.vaciarPedido} danger style={{ fontSize: "12px", padding: "9px 14px" }}>Vaciar pedido</Btn>}</div></div>
          {productosSeleccionados.length === 0 ? <div style={{ padding: "28px", borderRadius: T.r.lg, backgroundColor: "rgba(255,250,245,.6)", border: `2px dashed ${T.cream700}`, color: T.textMuted, textAlign: "center", fontSize: "14px" }}>Aún no has agregado productos.</div> : (
            <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "8px", marginBottom: "14px" }}><MiniDato label="Unidades" value={totales.totalUnidades} highlight large /><MiniDato label="Puntos" value={totales.totalPuntos} highlight large /><MiniDato label="P. público" value={formatoMoneda(totales.totalPrecioPublico)} large /><MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(totalConDescuento)} highlight large /></div>
            <div style={{ display: "grid", gap: "10px" }}>{productosSeleccionados.map((item, i) => (
              <div key={item.codigo} className="bl-card" style={{ background: `linear-gradient(135deg,rgba(255,250,245,.8),rgba(255,244,234,.6))`, border: `1px solid ${T.cream500}`, borderRadius: T.r.lg, padding: "14px", animation: `blFadeUp .3s ease both`, animationDelay: `${i * .04}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}><div><Badge>{item.codigo}</Badge><div style={{ marginTop: "5px", fontSize: "15px", fontWeight: 700, color: T.textDark, lineHeight: 1.3 }}>{item.producto}</div>{item.contenido && <div style={{ marginTop: "2px", fontSize: "11px", color: T.textMuted }}>{item.contenido}</div>}</div><Btn onClick={() => order.eliminarProducto(item.codigo)} danger style={{ padding: "5px 10px", fontSize: "11px" }}>Quitar</Btn></div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}><Btn onClick={() => order.decrementarProducto(item.codigo)} style={{ width: "38px", height: "38px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>−</Btn><input type="number" min="0" value={item.unidades} onChange={(e) => order.cambiarCantidad(item.codigo, e.target.value)} style={{ width: "70px", padding: "9px", borderRadius: T.r.sm, border: `1.5px solid ${T.cream700}`, backgroundColor: T.white, color: T.black, textAlign: "center", fontWeight: 700, fontSize: "15px", boxShadow: T.s.inner }} /><Btn onClick={() => order.incrementarProducto(item.codigo)} style={{ width: "38px", height: "38px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>+</Btn></div>
                <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "6px" }}><MiniDato label="Sub. pts" value={item.subtotalPuntos} /><MiniDato label="Público" value={formatoMoneda(item.subtotalPrecioPublico)} /><MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(obtenerSubtotal(item))} highlight /></div>
              </div>
            ))}</div></>
          )}
        </SectionCard>

        {/* ══ TABLA MAESTRA ══ */}
        <SectionCard delay={4}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}><div><h2 style={secTitle}>Tabla maestra</h2><p style={secSub}><strong>{filasCalculadas.length}</strong> producto(s){order.categoriaSeleccionada !== "TODAS" ? ` en "${order.categoriaSeleccionada}"` : ""}</p></div><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}><Btn onClick={handlePDF} active style={{ fontSize: "13px", padding: "9px 16px" }}>PDF</Btn><Btn onClick={handlePrint} style={{ fontSize: "13px", padding: "9px 16px" }}>Imprimir</Btn></div></div>
          {esMovil && vistaMovil === "cards" ? (
            <div style={{ display: "grid", gap: "10px" }}>{filasCalculadas.map((item, i) => { const act = order.filaActiva === item.codigo; return (
              <div key={item.codigo} ref={(el) => { order.productRefs.current[item.codigo] = el; }} className="bl-card" onClick={() => order.setFilaActiva(item.codigo)} style={{ background: item.unidades > 0 ? `linear-gradient(135deg,${T.orange50},${T.orange100})` : `linear-gradient(135deg,rgba(255,250,245,.7),rgba(255,244,234,.5))`, border: act ? `2px solid ${T.orange500}` : `1px solid ${T.cream500}`, borderRadius: T.r.lg, padding: "14px", boxShadow: act ? T.s.glow : T.s.xs, animation: `blFadeUp .3s ease both`, animationDelay: `${i * .025}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", alignItems: "flex-start" }}><div><Badge>{item.codigo}</Badge><div style={{ marginTop: "5px", fontSize: "15px", fontWeight: 700, color: T.textDark, lineHeight: 1.3 }}>{item.producto}</div>{item.contenido && <div style={{ marginTop: "2px", fontSize: "11px", color: T.textMuted }}>{item.contenido}</div>}</div><Badge style={{ backgroundColor: T.cream400, color: T.orange800, fontSize: "9px", padding: "3px 7px" }}>{item.categoria}</Badge></div>
                <div style={{ marginTop: "10px" }}><label style={{ display: "block", marginBottom: "5px", fontSize: "11px", fontWeight: 600, color: T.textDark, textTransform: "uppercase", letterSpacing: ".4px" }}>Unidades</label><input type="number" min="0" value={item.unidades} onChange={(e) => order.cambiarCantidad(item.codigo, e.target.value)} onFocus={() => order.setFilaActiva(item.codigo)} style={inp} /></div>
                <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}><MiniDato label="Pts unit." value={item.puntos} /><MiniDato label="Sub. pts" value={item.subtotalPuntos} /><MiniDato label="Público" value={formatoMoneda(item.subtotalPrecioPublico)} /><MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(obtenerSubtotal(item))} highlight /></div>
              </div>); })}</div>
          ) : isCP ? renderTable(
            ["Cat.", "Cód.", "Producto", "Contenido", "Uds.", "Pts", "Sub.pts", "P.púb.", "Sub.púb.", "P.desc.", "Sub.desc."],
            (item, idx) => <tr key={item.codigo} ref={(el) => { order.productRefs.current[item.codigo] = el; }} onClick={() => order.setFilaActiva(item.codigo)} style={{ backgroundColor: rowBg(item, idx), cursor: "pointer", transition: "background-color .18s" }}><td style={tdS}>{item.categoria}</td><td style={tdS}>{item.codigo}</td><td style={{ ...tdS, color: T.textDark, fontWeight: 600 }}>{item.producto}</td><td style={tdS}>{item.contenido}</td><td style={tdS}><input type="number" min="0" value={item.unidades} onChange={(e) => order.cambiarCantidad(item.codigo, e.target.value)} onFocus={() => order.setFilaActiva(item.codigo)} style={inpT} /></td><td style={tdS}>{item.puntos}</td><td style={tdS}>{item.subtotalPuntos}</td><td style={tdS}>{formatoMoneda(item.precioPublico)}</td><td style={tdS}>{formatoMoneda(item.subtotalPrecioPublico)}</td><td style={tdS}>{formatoMoneda(obtenerPrecio(item))}</td><td style={tdS}>{formatoMoneda(obtenerSubtotal(item))}</td></tr>,
            () => <tr style={{ background: `linear-gradient(180deg,${T.cream100},${T.cream300})` }}><td style={tdT} /><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>TOTAL</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>{totales.totalUnidades}</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700, backgroundColor: estado.colorFondo, color: estado.colorTexto, border: `2px solid ${estado.colorBorde}`, borderRadius: "6px" }}>{totales.totalPuntos}</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>{formatoMoneda(totales.totalPrecioPublico)}</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>{formatoMoneda(engine.totalSegunDescuentoCP)}</td></tr>
          ) : renderTable(
            ["Cat.", "Cód.", "Producto", "Contenido", "Uds.", "Pts", "Sub.pts", "P.púb.", "Sub.púb.", "V.com.", "Sub.com."],
            (item, idx) => <tr key={item.codigo} ref={(el) => { order.productRefs.current[item.codigo] = el; }} onClick={() => order.setFilaActiva(item.codigo)} style={{ backgroundColor: rowBg(item, idx), cursor: "pointer", transition: "background-color .18s" }}><td style={tdS}>{item.categoria}</td><td style={tdS}>{item.codigo}</td><td style={{ ...tdS, color: T.textDark, fontWeight: 600 }}>{item.producto}</td><td style={tdS}>{item.contenido}</td><td style={tdS}><input type="number" min="0" value={item.unidades} onChange={(e) => order.cambiarCantidad(item.codigo, e.target.value)} onFocus={() => order.setFilaActiva(item.codigo)} style={inpT} /></td><td style={tdS}>{item.puntos}</td><td style={tdS}>{item.subtotalPuntos}</td><td style={tdS}>{formatoMoneda(item.precioPublico)}</td><td style={tdS}>{formatoMoneda(item.subtotalPrecioPublico)}</td><td style={tdS}>{formatoMoneda(item.valorComisionable)}</td><td style={tdS}>{formatoMoneda(item.subtotalValorComisionable)}</td></tr>,
            () => <tr style={{ background: `linear-gradient(180deg,${T.cream100},${T.cream300})` }}><td style={tdT} /><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>TOTAL</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>{totales.totalUnidades}</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700, backgroundColor: estado.colorFondo, color: estado.colorTexto, border: `2px solid ${estado.colorBorde}`, borderRadius: "6px" }}>{totales.totalPuntos}</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>{formatoMoneda(totales.totalPrecioPublico)}</td><td style={tdT} /><td style={{ ...tdT, fontWeight: 700 }}>{formatoMoneda(totales.totalValorComisionable)}</td></tr>
          )}
        </SectionCard>

        {/* ══ INFO ══ */}
        <SectionCard delay={5}><h2 style={secTitle}>3 formas de adquirir</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px", marginTop: "14px" }}><div className="bl-card" style={{ background: `linear-gradient(135deg,${T.orange50},${T.orange100})`, border: `1px solid ${T.orange300}`, borderRadius: T.r.lg, padding: "16px" }}><Badge>Web</Badge><h3 style={{ margin: "8px 0 6px", color: T.textDark, fontSize: "16px", fontWeight: 700 }}>Sitio web</h3><p style={{ margin: 0, color: T.textMuted, fontSize: "13px" }}>Ingresa a:</p><a href="https://www.bodylogicglobal.com" target="_blank" rel="noreferrer" className="bl-btn-hover" style={{ display: "inline-block", marginTop: "8px", color: T.orange600, fontWeight: 700, textDecoration: "none", padding: "9px 14px", borderRadius: T.r.sm, backgroundColor: T.white, border: `1px solid ${T.cream700}`, fontSize: "13px" }}>bodylogicglobal.com ↗</a></div><div className="bl-card" style={{ background: `linear-gradient(180deg,${T.cream100},${T.cream200})`, border: `1px solid ${T.cream500}`, borderRadius: T.r.lg, padding: "16px" }}><Badge>Teléfono</Badge><h3 style={{ margin: "8px 0 6px", color: T.textDark, fontSize: "16px", fontWeight: 700 }}>Centro de servicio</h3><a href="tel:8007024840" style={{ display: "inline-block", color: T.orange600, fontWeight: 700, textDecoration: "none", fontSize: "17px" }}>800 702 4840</a><p style={{ margin: "4px 0 0", color: T.textMuted, fontSize: "12px", lineHeight: 1.5 }}>L-V 8:00–20:00 · S 9:00–14:00</p></div><div className="bl-card" style={{ background: `linear-gradient(180deg,${T.cream100},${T.cream200})`, border: `1px solid ${T.cream500}`, borderRadius: T.r.lg, padding: "16px" }}><Badge>Presencial</Badge><h3 style={{ margin: "8px 0 6px", color: T.textDark, fontSize: "16px", fontWeight: 700 }}>CAD</h3><p style={{ margin: 0, color: T.textMuted, fontSize: "13px", lineHeight: 1.5 }}>Tu CAD más cercano.</p></div></div></SectionCard>

        {/* ══ LEYENDAS ══ */}
        <SectionCard delay={5} style={{ background: `linear-gradient(180deg,${T.orange50},rgba(255,244,234,.5))`, border: `1px solid ${T.cream700}` }}><h2 style={{ ...secTitle, marginBottom: "12px" }}>Leyendas</h2>{["Los puntos corresponden al valor en puntos de cada producto.", isD && "El valor comisionable = 89% del precio con descuento sin IVA.", "Herramientas de negocio no generan puntos ni V.C.", "Valida siempre con la lista vigente de la empresa."].filter(Boolean).map((t, i) => <div key={i} style={{ padding: "10px 14px", borderRadius: T.r.sm, backgroundColor: "rgba(255,255,255,.65)", border: `1px solid ${T.orange200}`, color: T.orange700, lineHeight: 1.55, fontSize: "13px", marginBottom: i < 3 ? "8px" : 0 }}>{t}</div>)}</SectionCard>

        {/* ══ DOCUMENTOS ══ */}
        <SectionCard delay={6}><h2 style={secTitle}>Documentos</h2><p style={{ ...secSub, marginBottom: "14px" }}>{isCP ? "Para Cliente Preferente." : "Archivos oficiales."}</p><div style={{ display: "grid", gap: "10px" }}>{documentosVisibles.map((doc, i) => { const dl = descargandoArchivo === doc.archivo; return (<div key={doc.archivo} className="bl-card" style={{ background: `linear-gradient(180deg,${T.cream100},${T.cream200})`, border: `1px solid ${T.cream500}`, borderRadius: T.r.lg, padding: "14px", animation: `blFadeUp .3s ease both`, animationDelay: `${i * .05}s` }}><div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}><span style={{ fontSize: "22px", lineHeight: 1 }}>{doc.icono}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "15px", color: T.textDark }}>{doc.nombre}</div><div style={{ marginTop: "3px", color: T.textMuted, fontSize: "12px", lineHeight: 1.5 }}>{doc.descripcion}</div><div style={{ marginTop: "3px", color: T.orange500, fontSize: "11px", fontWeight: 500 }}>{doc.archivo}</div></div></div><Btn onClick={() => handleDescargar(doc.archivo, doc.nombre)} active style={{ marginTop: "10px", fontSize: "12px", padding: "9px 16px", width: "100%" }} disabled={dl}>{dl ? "Descargando..." : doc.tipo === "membresia" ? "Descargar y rellenar" : "Descargar PDF"}</Btn></div>); })}</div></SectionCard>

        {/* ══ RESUMEN FLOTANTE MÓVIL ══ */}
        {esMovil && (
          <div className="bl-float-glass" style={{ position: "fixed", left: "6px", right: "6px", bottom: "6px", zIndex: 999, borderRadius: "18px", padding: "14px 16px", backgroundColor: `${estado.colorFondo}ee`, border: `1.5px solid ${estado.colorBorde}`, boxShadow: `0 -8px 40px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.3)`, color: estado.colorTexto, transition: "all .35s cubic-bezier(.22,.61,.36,1)", paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))" }}>
            <div style={{ width: "32px", height: "3px", borderRadius: "3px", backgroundColor: estado.colorTexto, opacity: .2, margin: "0 auto 10px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                {isCP ? (<><FS l="Perfil" v="CP" c={estado.colorTexto} /><FS l="Acum." v={engine.puntosAcumuladosCP} c={estado.colorTexto} big /><FS l="Desc." v={`${engine.descuentoCP}%`} c={estado.colorTexto} /></>)
                  : modo === "compraInicial" ? (<><FS l="Pts" v={totales.totalPuntos} c={estado.colorTexto} big /><FS l="Paq." v={paqueteActual.nombre.replace("Paquete ", "")} c={estado.colorTexto} /><FS l="Desc." v={`${paqueteActual.descuento}%`} c={estado.colorTexto} /></>)
                    : programaRecompra === "lealtad" ? (<><FS l="Prog." v="Lealtad" c={estado.colorTexto} /><FS l="Mes" v={mesLealtad} c={estado.colorTexto} big /><FS l="Desc." v={`${engine.descuentoLealtadActual}%`} c={estado.colorTexto} /></>)
                      : (<><FS l="Prog." v="Acelerado" c={estado.colorTexto} /><FS l="Acum." v={engine.totalAcumuladoAcelerado} c={estado.colorTexto} big /><FS l="Desc." v={`${engine.descuentoAceleradoActual}%`} c={estado.colorTexto} /></>)}
              </div>
              <button onClick={() => setResumenContraido(!resumenContraido)} style={{ padding: "8px 12px", borderRadius: "10px", border: `1px solid ${estado.colorBorde}`, backgroundColor: "rgba(255,255,255,.50)", color: T.textDark, fontWeight: 700, cursor: "pointer", fontSize: "13px", transition: "transform .25s cubic-bezier(.22,.61,.36,1)", transform: resumenContraido ? "rotate(0)" : "rotate(180deg)", lineHeight: 1 }}>▼</button>
            </div>
            {!resumenContraido && (
              <div className="bl-expand">
                <div style={{ margin: "10px 0 8px", padding: "10px 14px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,.35)", position: "relative", overflow: "hidden", backdropFilter: "blur(4px)" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: `linear-gradient(180deg,${estado.colorSemaforo},${estado.colorBorde})`, borderRadius: "3px 0 0 3px" }} /><div style={{ paddingLeft: "8px" }}><div style={{ fontSize: "17px", fontWeight: 800, lineHeight: 1.15, color: estado.colorTexto, fontFamily: T.fontDisplay }}>{isCP ? "Cliente Preferente" : modo === "compraInicial" ? paqueteActual.nombre : programaRecompra === "lealtad" ? (estado.continuidad ? "Lealtad sostenida" : "Secuencia comprometida") : "Lealtad Acelerado"}</div><div style={{ marginTop: "3px", fontSize: "12px", fontWeight: 700, color: estado.colorTexto, opacity: .80 }}>Descuento actual: {descuentoActual}%</div></div></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                  <FC l={isCP ? "Pts acum." : modo === "compraInicial" ? "Puntos" : programaRecompra === "lealtad" ? "Pts pers." : "Pts periodo"} v={isCP ? engine.puntosAcumuladosCP : modo === "compraInicial" ? totales.totalPuntos : programaRecompra === "lealtad" ? totales.totalPuntos : Number(puntosPersonalesAcelerado || 0) + Number(puntosGrupalesAcelerado || 0)} num e={estado} />
                  <FC l="P. público" v={formatoMoneda(totales.totalPrecioPublico)} e={estado} />
                  <FC l={`Con ${descuentoActual}%`} v={formatoMoneda(totalConDescuento)} e={estado} />
                </div>
                <div style={{ padding: "8px 10px", borderRadius: T.r.sm, backgroundColor: "rgba(255,255,255,.38)", fontSize: "11px", lineHeight: 1.45, marginBottom: "8px" }}><div style={{ fontWeight: 700, color: estado.colorTexto }}>{estado.mensajePrincipal || estado.siguienteMensaje || estado.texto}</div>{estado.mensajeSecundario && <div style={{ fontWeight: 600, color: estado.colorTexto, marginTop: "4px", opacity: .85 }}>{estado.mensajeSecundario}</div>}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <Btn onClick={irAPedidoActual} active style={{ fontSize: "12px", padding: "10px" }}>Ver pedido</Btn>
                  <Btn onClick={handlePDF} style={{ fontSize: "12px", padding: "10px", borderColor: estado.colorBorde, backgroundColor: "rgba(255,255,255,.55)" }}>PDF</Btn>
                  <Btn onClick={handlePrint} style={{ fontSize: "12px", padding: "10px", borderColor: estado.colorBorde, backgroundColor: "rgba(255,255,255,.55)" }}>Imprimir</Btn>
                  <Btn onClick={irArriba} style={{ fontSize: "12px", padding: "10px", borderColor: estado.colorBorde, backgroundColor: "rgba(255,255,255,.25)" }}>↑ Subir</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;