import { useEffect, useMemo, useRef, useState } from "react";
import { productos } from "./data/productos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ══════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════ */
const C = {
  brand:       "#c2410c",
  brandLight:  "#ea580c",
  brandMid:    "#f97316",
  brandSoft:   "#fb923c",
  brandPale:   "#fed7aa",
  brandGhost:  "#fff7ed",
  brandCream:  "#fffaf5",
  brandBorder: "#fde4d3",
  dark:        "#431407",
  darkMid:     "#7c2d12",
  darkSub:     "#9a3412",
  muted:       "#78716c",
  mutedLight:  "#a8a29e",
  white:       "#ffffff",
};

const FONT = {
  display: "'Georgia', 'Times New Roman', serif",
  body:    "'system-ui', '-apple-system', 'Segoe UI', sans-serif",
};

const SHADOW = {
  card:  "0 2px 8px rgba(124,45,18,0.07), 0 8px 24px rgba(124,45,18,0.06)",
  panel: "0 4px 16px rgba(124,45,18,0.07), 0 20px 48px rgba(124,45,18,0.07)",
  hero:  "0 24px 72px rgba(124,45,18,0.28)",
  float: "0 8px 32px rgba(124,45,18,0.2), 0 32px 64px rgba(124,45,18,0.14)",
};

/* ══════════════════════════════════════════════════
   ESTILOS CSS GLOBALES
══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bl-section {
    opacity: 0;
    animation: fadeUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.18); opacity: 0.82; }
  }
  .bl-dot-pulse { animation: pulse 2.2s ease-in-out infinite; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bl-float-enter { animation: slideUp 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  @keyframes expandDown {
    from { opacity: 0; transform: scaleY(0.92); transform-origin: top; }
    to   { opacity: 1; transform: scaleY(1);    transform-origin: top; }
  }
  .bl-expand { animation: expandDown 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  .bl-prod-card { transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease; }
  .bl-prod-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(124,45,18,0.12); }
  .bl-prod-card.active { border: 2px solid #ea580c !important; box-shadow: 0 0 0 3px rgba(234,88,12,0.14) !important; }

  .bl-tr { transition: background 0.15s ease; cursor: pointer; }
  .bl-tr:hover { background: #fff3e8 !important; }

  .bl-btn { transition: opacity 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease; }
  .bl-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .bl-btn:active:not(:disabled) { transform: translateY(0); }

  .bl-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237c2d12' stroke-width='2.2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 11px center;
    padding-right: 34px !important;
    cursor: pointer;
  }

  .bl-input:focus, .bl-select:focus {
    outline: none;
    border-color: #ea580c !important;
    box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
  }

  .bl-scroll::-webkit-scrollbar { height: 6px; }
  .bl-scroll::-webkit-scrollbar-track { background: #fff7ed; }
  .bl-scroll::-webkit-scrollbar-thumb { background: #fdba74; border-radius: 99px; }

  @keyframes fillBar {
    from { width: 0%; }
    to   { width: var(--pct); }
  }
  .bl-bar-fill { animation: fillBar 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  @media (max-width: 640px) {
    .bl-hero-title { font-size: 34px !important; }
    .bl-hide-sm { display: none !important; }
  }
`;

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById("bl-styles")) return;
    const el = document.createElement("style");
    el.id = "bl-styles";
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
  }, []);
}

function useReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${delay}ms`;
          el.classList.add("bl-section");
          obs.disconnect();
        }
      },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* ══════════════════════════════════════════════════
   ÁTOMOS
══════════════════════════════════════════════════ */
function Badge({ children, variant = "default", style: extra = {} }) {
  const map = {
    default: { background: C.brandPale,                 color: C.darkSub },
    brand:   { background: C.brandLight,                color: C.white },
    ghost:   { background: "rgba(255,255,255,0.18)",    color: C.white, border: "1px solid rgba(255,255,255,0.28)" },
  };
  return (
    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: FONT.body, ...map[variant], ...extra }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "ghost", disabled = false, size = "md", style: extra = {}, className = "" }) {
  const sizes = {
    xs: { padding: "6px 11px",  borderRadius: "9px",  fontSize: "11px" },
    sm: { padding: "8px 14px",  borderRadius: "10px", fontSize: "12px" },
    md: { padding: "11px 18px", borderRadius: "13px", fontSize: "13px" },
    lg: { padding: "13px 22px", borderRadius: "14px", fontSize: "14px" },
  };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${C.brandMid}, ${C.brand})`,    color: C.white,   border: "none",                          boxShadow: "0 4px 14px rgba(194,65,12,0.30)" },
    active:  { background: `linear-gradient(135deg, ${C.brandSoft}, ${C.brandMid})`, color: C.white,  border: `2px solid ${C.brand}`,           boxShadow: "0 4px 14px rgba(234,88,12,0.25)" },
    ghost:   { background: C.white,      color: C.darkMid, border: `1px solid ${C.brandBorder}` },
    danger:  { background: "#fff1f2",    color: "#b91c1c", border: "1px solid #fecaca" },
    soft:    { background: C.brandGhost, color: C.darkMid, border: `1px solid ${C.brandPale}` },
    orange:  { background: `linear-gradient(135deg, ${C.brandPale}, ${C.brandSoft})`, color: C.darkMid, border: `1px solid ${C.brandSoft}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bl-btn ${className}`}
      style={{
        cursor: disabled ? "default" : "pointer",
        fontWeight: "700", fontFamily: FONT.body,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
        opacity: disabled ? 0.52 : 1, whiteSpace: "nowrap",
        ...sizes[size], ...(variants[variant] || variants.ghost), ...extra,
      }}
    >{children}</button>
  );
}

/* Panel — CORREGIDO: acepta id */
function Panel({ children, style = {}, id }) {
  return (
    <div id={id} style={{
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
      borderRadius: "24px", padding: "24px", boxShadow: SHADOW.panel,
      border: `1px solid ${C.brandBorder}`, marginBottom: "16px", ...style,
    }}>{children}</div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "21px", fontWeight: "700", color: C.darkMid, fontFamily: FONT.display, letterSpacing: "-0.3px" }}>{title}</h2>
        {subtitle && <p style={{ margin: "5px 0 0", color: C.muted, fontSize: "14px", lineHeight: 1.5 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

function MiniDato({ label, value, accent = false }) {
  return (
    <div style={{ background: accent ? `linear-gradient(135deg, ${C.brandGhost}, ${C.brandCream})` : C.white, border: `1px solid ${accent ? C.brandBorder : "#f0ebe6"}`, borderRadius: "13px", padding: "10px 12px" }}>
      <div style={{ fontSize: "10px", color: C.muted, fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "13px", fontWeight: "700", color: C.darkMid, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

function ControlCard({ label, children }) {
  return (
    <div style={{ background: `linear-gradient(180deg, ${C.brandCream}, ${C.brandGhost})`, border: `1px solid ${C.brandBorder}`, borderRadius: "18px", padding: "15px" }}>
      <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "11px", color: C.darkSub, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

function InfoStatCard({ value, label, accent = false }) {
  return (
    <div style={{ background: accent ? `linear-gradient(135deg, #fff7ed, ${C.brandPale})` : `linear-gradient(135deg, ${C.brandGhost}, #ffedd5)`, border: `1px solid ${accent ? C.brandSoft : C.brandPale}`, borderRadius: "18px", padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: "22px", fontWeight: "800", color: C.darkSub, wordBreak: "break-word", fontFamily: FONT.display, lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: "6px", color: C.muted, fontSize: "13px", lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bl-select bl-input"
      style={{ width: "100%", padding: "11px 13px", borderRadius: "12px", border: `1px solid ${C.brandBorder}`, backgroundColor: C.white, color: C.darkMid, fontWeight: "600", fontSize: "14px", fontFamily: FONT.body, boxSizing: "border-box" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function InputField({ value, onChange, placeholder, type = "text", min, onFocus }) {
  return (
    <input type={type} min={min} value={value} onChange={onChange} placeholder={placeholder} onFocus={onFocus} className="bl-input"
      style={{ width: "100%", padding: "11px 13px", borderRadius: "12px", border: `1px solid ${C.brandBorder}`, backgroundColor: C.white, color: "#1c1917", fontFamily: FONT.body, fontSize: "14px", fontWeight: "500", boxSizing: "border-box" }} />
  );
}

function ProgressBar({ pct, label, labelRight }) {
  const p = Math.min(100, Math.max(0, pct));
  return (
    <div>
      {(label || labelRight) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          {label     && <span style={{ fontSize: "12px", fontWeight: "600", color: C.muted }}>{label}</span>}
          {labelRight && <span style={{ fontSize: "12px", fontWeight: "700", color: C.brand }}>{labelRight}</span>}
        </div>
      )}
      <div style={{ height: "8px", borderRadius: "99px", background: C.brandPale, overflow: "hidden" }}>
        <div className="bl-bar-fill" style={{ "--pct": `${p}%`, height: "100%", borderRadius: "99px", background: `linear-gradient(90deg, ${C.brandSoft}, ${C.brand})` }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TABLA DE PRODUCTOS
══════════════════════════════════════════════════ */
const tdBase  = { padding: "11px 12px", borderBottom: "1px solid #fdf0e7", color: "#5b4d43", fontSize: "13px", whiteSpace: "nowrap" };
const tdTot   = { padding: "13px 12px", borderTop: `2px solid ${C.brandBorder}`, color: C.darkMid, fontSize: "13px", whiteSpace: "nowrap" };

function TablaProductos({ filas, filaActiva, setFilaActiva, cambiarCantidad, formatoMoneda, obtenerPrecioActualPorPerfil, obtenerTotalPedidoActual, obtenerDescuentoActualGeneral, totalUnidades, totalPuntos, totalPrecioPublico, totalFinal, estado, modoCP }) {
  const desc = obtenerDescuentoActualGeneral();
  const headers = ["Categoría","Código","Producto","Contenido","Uds.","Pts.","Sub. pts.","Precio público","Sub. público", modoCP ? `Precio ${desc}%` : "Valor com.", modoCP ? `Sub. ${desc}%` : "Sub. com."];
  return (
    <div className="bl-scroll" style={{ overflowX: "auto", borderTop: `1px solid ${C.brandBorder}` }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: "1520px", backgroundColor: C.white }}>
        <thead>
          <tr style={{ background: "linear-gradient(180deg, #fff1e6, #ffe4cf)" }}>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "12px", borderBottom: `2px solid ${C.brandBorder}`, color: C.darkMid, fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap", position: "sticky", top: 0, background: "linear-gradient(180deg, #fff1e6, #ffe4cf)", zIndex: 1 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((item, idx) => {
            const activa = filaActiva === item.codigo;
            const bg = activa ? C.brandPale : item.unidades > 0 ? "#fff3e8" : idx % 2 === 0 ? C.white : C.brandCream;
            return (
              <tr key={item.codigo} className="bl-tr" onClick={() => setFilaActiva(item.codigo)} style={{ backgroundColor: bg }}>
                <td style={tdBase}><Badge>{item.categoria}</Badge></td>
                <td style={{ ...tdBase, fontFamily: "monospace", fontSize: "12px", color: C.muted }}>{item.codigo}</td>
                <td style={{ ...tdBase, color: C.darkMid, fontWeight: "600", minWidth: "160px" }}>{item.producto}</td>
                <td style={{ ...tdBase, color: C.muted }}>{item.contenido}</td>
                <td style={tdBase}>
                  <input type="number" min="0" value={item.unidades} onChange={(e) => cambiarCantidad(item.codigo, e.target.value)} onFocus={() => setFilaActiva(item.codigo)} className="bl-input"
                    style={{ width: "76px", padding: "8px 9px", borderRadius: "10px", border: `1px solid ${C.brandBorder}`, background: C.white, color: "#1c1917", textAlign: "center", fontWeight: "600" }} />
                </td>
                <td style={{ ...tdBase, textAlign: "center", fontWeight: "600" }}>{item.puntos}</td>
                <td style={{ ...tdBase, textAlign: "center", fontWeight: "700", color: item.subtotalPuntos > 0 ? C.brand : C.mutedLight }}>{item.subtotalPuntos}</td>
                <td style={tdBase}>{formatoMoneda(item.precioPublico)}</td>
                <td style={tdBase}>{formatoMoneda(item.subtotalPrecioPublico)}</td>
                <td style={{ ...tdBase, color: C.brand, fontWeight: "600" }}>{formatoMoneda(modoCP ? obtenerPrecioActualPorPerfil(item) : item.valorComisionable)}</td>
                <td style={{ ...tdBase, fontWeight: "700", color: C.darkMid }}>{formatoMoneda(modoCP ? obtenerTotalPedidoActual(item) : item.subtotalValorComisionable)}</td>
              </tr>
            );
          })}
          <tr style={{ background: `linear-gradient(180deg, ${C.brandCream}, #fff1e6)` }}>
            <td style={tdTot} colSpan={4}><strong>TOTAL GENERAL</strong></td>
            <td style={{ ...tdTot, textAlign: "center", fontWeight: "800", color: C.brand }}>{totalUnidades}</td>
            <td style={tdTot} />
            <td style={{ ...tdTot, textAlign: "center" }}>
              <span style={{ background: estado.colorFondo, color: estado.colorTexto, border: `1.5px solid ${estado.colorBorde}`, borderRadius: "8px", padding: "3px 10px", fontWeight: "800", fontSize: "13px" }}>{totalPuntos}</span>
            </td>
            <td style={tdTot} />
            <td style={{ ...tdTot, fontWeight: "700" }}>{formatoMoneda(totalPrecioPublico)}</td>
            <td style={tdTot} />
            <td style={{ ...tdTot, fontWeight: "800", color: C.brand }}>{formatoMoneda(totalFinal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   RESUMEN FLOTANTE MÓVIL
══════════════════════════════════════════════════ */
function ResumenFlotante({ estado, perfilUsuario, modo, programaRecompra, resumenContraido, setResumenContraido, descuentoClientePreferenteActual, puntosAcumuladosClientePreferente, totalSegunDescuentoClientePreferente, paqueteActual, totalPuntos, totalPrecioPublico, mesLealtad, descuentoLealtadActual, totalSegunDescuentoLealtad, totalAcumuladoAcelerado, descuentoAceleradoActual, totalSegunDescuentoAcelerado, irAPedidoActual, descargarPDFPedido, imprimirFormulario, irArriba, formatoMoneda }) {

  const ctx = useMemo(() => {
    if (perfilUsuario === "clientePreferente") return {
      chips: [{ label: "Perfil", val: "CP" }, { label: "Acumulado", val: puntosAcumuladosClientePreferente }, { label: "Descuento", val: `${descuentoClientePreferenteActual}%` }],
      titulo: "Cliente Preferente", subtitulo: `Descuento: ${descuentoClientePreferenteActual}%`,
      total: totalSegunDescuentoClientePreferente, msg1: estado.mensajePrincipal, msg2: estado.mensajeSecundario,
    };
    if (modo === "compraInicial") return {
      chips: [{ label: "Puntos", val: totalPuntos }, { label: "Paquete", val: paqueteActual.nombre.replace("Paquete ", "P.") }, { label: "Descuento", val: `${paqueteActual.descuento}%` }],
      titulo: paqueteActual.nombre, subtitulo: `Descuento: ${paqueteActual.descuento}%`,
      total: paqueteActual.totalConDescuento, msg1: estado.siguienteMensaje, msg2: null,
    };
    if (programaRecompra === "lealtad") return {
      chips: [{ label: "Programa", val: "Lealtad" }, { label: "Mes", val: mesLealtad }, { label: "Descuento", val: `${descuentoLealtadActual}%` }],
      titulo: estado.continuidad ? "Lealtad sostenida" : "Secuencia comprometida",
      subtitulo: `Descuento: ${descuentoLealtadActual}%`,
      total: totalSegunDescuentoLealtad, msg1: estado.mensajePrincipal, msg2: estado.mensajeSecundario,
    };
    return {
      chips: [{ label: "Programa", val: "Acelerado" }, { label: "Acumulado", val: totalAcumuladoAcelerado }, { label: "Descuento", val: `${descuentoAceleradoActual}%` }],
      titulo: "Lealtad Acelerado", subtitulo: `Descuento: ${descuentoAceleradoActual}%`,
      total: totalSegunDescuentoAcelerado, msg1: estado.mensajePrincipal, msg2: estado.mensajeSecundario,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilUsuario, modo, programaRecompra, paqueteActual, descuentoClientePreferenteActual, puntosAcumuladosClientePreferente, totalSegunDescuentoClientePreferente, totalPuntos, mesLealtad, descuentoLealtadActual, totalSegunDescuentoLealtad, totalAcumuladoAcelerado, descuentoAceleradoActual, totalSegunDescuentoAcelerado, estado]);

  return (
    <div className="bl-float-enter" style={{ position: "fixed", left: "10px", right: "10px", bottom: "10px", zIndex: 999, backgroundColor: estado.colorFondo, border: `1.5px solid ${estado.colorBorde}`, borderRadius: "22px", padding: "12px", boxShadow: SHADOW.float, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {ctx.chips.map((c, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", color: estado.colorTexto, opacity: 0.72, fontWeight: "600", letterSpacing: "0.3px", textTransform: "uppercase" }}>{c.label}</span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: estado.colorTexto, lineHeight: 1.1 }}>{c.val}</span>
            </div>
          ))}
        </div>
        <Btn size="xs" onClick={() => setResumenContraido(!resumenContraido)} style={{ background: "rgba(255,255,255,0.68)", color: C.darkMid, border: "1px solid rgba(255,255,255,0.35)", borderRadius: "9px" }}>
          {resumenContraido ? "▼ Ver" : "▲ Ocultar"}
        </Btn>
      </div>

      {!resumenContraido && (
        <div className="bl-expand">
          <div style={{ margin: "10px 0 8px", background: "rgba(255,255,255,0.52)", borderRadius: "14px", padding: "10px 13px" }}>
            <div style={{ fontSize: "17px", fontWeight: "800", color: estado.colorTexto, lineHeight: 1.2 }}>{ctx.titulo}</div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: estado.colorTexto, marginTop: "2px", opacity: 0.88 }}>{ctx.subtitulo}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "7px", marginBottom: "8px" }}>
            {[{ label: "Precio público", val: formatoMoneda(totalPrecioPublico) }, { label: "Total con dto.", val: formatoMoneda(ctx.total) }, { label: "Puntos pedido", val: totalPuntos }].map((d, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.52)", borderRadius: "12px", padding: "8px 9px", border: `1px solid ${estado.colorBorde}` }}>
                <div style={{ fontSize: "9px", color: estado.colorTexto, opacity: 0.78, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.3px" }}>{d.label}</div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: estado.colorTexto, lineHeight: 1.2, marginTop: "2px" }}>{d.val}</div>
              </div>
            ))}
          </div>

          {(ctx.msg1 || ctx.msg2) && (
            <div style={{ background: "rgba(255,255,255,0.45)", borderRadius: "12px", padding: "9px 11px", marginBottom: "8px", fontSize: "11px", lineHeight: 1.55, color: estado.colorTexto, fontWeight: "600" }}>
              {ctx.msg1}{ctx.msg2 && <><br />{ctx.msg2}</>}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            <Btn variant="primary" onClick={irAPedidoActual} style={{ justifyContent: "center" }}>📋 Ver pedido</Btn>
            <Btn onClick={irArriba} style={{ background: "rgba(255,255,255,0.68)", color: C.darkMid, border: "none" }}>↑ Subir</Btn>
            <Btn onClick={descargarPDFPedido} style={{ background: "rgba(255,255,255,0.68)", color: C.darkMid, border: "none" }}>↓ PDF</Btn>
            <Btn onClick={imprimirFormulario} style={{ background: "rgba(255,255,255,0.68)", color: C.darkMid, border: "none" }}>⎙ Imprimir</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   APP PRINCIPAL
══════════════════════════════════════════════════ */
function App() {
  useGlobalStyles();

  /* ── Estado (idéntico al original) ── */
  const [perfilUsuario,   setPerfilUsuario]   = useState("distribuidor");
  const [cantidades,      setCantidades]       = useState({});
  const [modo,            setModo]             = useState("compraInicial");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODAS");
  const [filaActiva,      setFilaActiva]       = useState("");
  const [busqueda,        setBusqueda]         = useState("");
  const [esMovil,         setEsMovil]          = useState(window.innerWidth <= 768);
  const [vistaMovil,      setVistaMovil]       = useState(window.innerWidth <= 768 ? "tarjetas" : "tabla");
  const [resumenContraido, setResumenContraido] = useState(false);
  const [descargandoArchivo, setDescargandoArchivo] = useState("");

  const [programaRecompra,              setProgramaRecompra]              = useState("lealtad");
  const [mesLealtad,                    setMesLealtad]                    = useState(1);
  const [dentroPrimeros15,              setDentroPrimeros15]              = useState(true);
  const [puntosPersonalesAcelerado,     setPuntosPersonalesAcelerado]     = useState(0);
  const [puntosGrupalesAcelerado,       setPuntosGrupalesAcelerado]       = useState(0);
  const [acumuladoPrevioAcelerado,      setAcumuladoPrevioAcelerado]      = useState(0);
  const [acumuladoPrevioClientePreferente, setAcumuladoPrevioClientePreferente] = useState(0);

  /* Reveal refs por sección */
  const refPanel    = useReveal(0);
  const refSemaforo = useReveal(60);
  const refPedido   = useReveal(100);
  const refTabla    = useReveal(140);
  const refInfo     = useReveal(180);
  const refDocs     = useReveal(220);

  useEffect(() => {
    const handle = () => { const m = window.innerWidth <= 768; setEsMovil(m); if (!m) setVistaMovil("tabla"); };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* ── Catálogos ── */
  const categorias = useMemo(() => ["TODAS", ...new Set(productos.map((i) => i.categoria))], []);

  const documentos = [
    { nombre: "Catálogo Bodylogic 2026",     archivo: "CATALOGO-BODYLOGIC-2026.pdf",   descripcion: "Consulta visual del catálogo general.",                      tipo: "normal"    },
    { nombre: "Lista de Precios CP Marzo 26", archivo: "LISTA-PRECIOS-CP-MARZO-26.pdf", descripcion: "Precios para Cliente Preferente.",                          tipo: "normal"    },
    { nombre: "Lista de Precios DI Marzo 26", archivo: "LISTA-PRECIOS-DI-MARZO-26.pdf", descripcion: "Precios para Distribuidor Independiente.",                  tipo: "normal"    },
    { nombre: "Solicitud de Membresía",       archivo: "SOLICITUD-DE-MEMBRESIA.pdf",    descripcion: "Formato oficial editable para alta de nuevos asociados.",   tipo: "membresia" },
  ];

  const documentosVisibles = perfilUsuario === "clientePreferente"
    ? documentos.filter((d) => d.archivo !== "LISTA-PRECIOS-DI-MARZO-26.pdf" && d.archivo !== "SOLICITUD-DE-MEMBRESIA.pdf")
    : documentos;

  /* ── Descarga robusta ── */
  const descargarArchivoRobusto = async (archivo, nombre) => {
    setDescargandoArchivo(archivo);
    try {
      const r = await fetch(`/archivos/${archivo}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`${r.status}`);
      const url = window.URL.createObjectURL(await r.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: archivo });
      a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    } catch {
      alert(`No se pudo descargar "${nombre}". Se intentará abrir directamente.`);
      window.open(`/archivos/${archivo}`, "_blank", "noopener,noreferrer");
    } finally { setDescargandoArchivo(""); }
  };

  /* ── Cantidades ── */
  const cambiarCantidad = (codigo, valor) => { const n = Number(valor); setCantidades((p) => ({ ...p, [codigo]: n >= 0 ? n : 0 })); setFilaActiva(codigo); };
  const incrementar     = (c) => { setCantidades((p) => ({ ...p, [c]: (p[c] || 0) + 1 })); setFilaActiva(c); };
  const decrementar     = (c) => { setCantidades((p) => ({ ...p, [c]: Math.max((p[c] || 0) - 1, 0) })); setFilaActiva(c); };
  const eliminar        = (c) => { setCantidades((p) => ({ ...p, [c]: 0 })); if (filaActiva === c) setFilaActiva(""); };
  const limpiar         = ()  => { setCantidades({}); setFilaActiva(""); };

  /* CORREGIDO: id="pedido-actual" en div wrapeador, no en Panel */
  const irAPedidoActual = () => document.getElementById("pedido-actual")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const irArriba        = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ── Filtrado ── */
  const productosFiltradosBase = categoriaSeleccionada === "TODAS" ? productos : productos.filter((i) => i.categoria === categoriaSeleccionada);
  const txt = busqueda.trim().toLowerCase();
  const productosFiltrados = productosFiltradosBase.filter((i) => !txt || i.producto.toLowerCase().includes(txt) || i.codigo.toLowerCase().includes(txt) || i.categoria.toLowerCase().includes(txt));

  /* ── Cálculo de filas ── */
  const mapearFila = (item) => {
    const u = Number(cantidades[item.codigo] || 0);
    return {
      ...item, unidades: u,
      subtotalPuntos:            u * item.puntos,
      subtotalPrecioPublico:     u * item.precioPublico,
      subtotalValorComisionable: u * item.valorComisionable,
      subtotal10: item.precioCP10 !== undefined ? u * item.precioCP10 : u * item.precioPublico * 0.9,
      subtotal15: u * item.precioPublico * 0.85,
      subtotal20: item.precio20   !== undefined ? u * item.precio20   : u * item.precioPublico * 0.8,
      subtotal30: u * item.precio30,
      subtotal33: u * item.precio33,
      subtotal35: u * item.precio35,
      subtotal37: u * item.precio37,
      subtotal40: u * item.precio40,
      subtotal42: u * item.precio42,
    };
  };

  const filasCalculadas        = productosFiltrados.map(mapearFila);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filasTotales           = useMemo(() => productos.map(mapearFila), [cantidades]);
  const productosSeleccionados = filasTotales.filter((i) => i.unidades > 0);

  const totalUnidades            = filasTotales.reduce((a, i) => a + i.unidades, 0);
  const totalPuntos              = filasTotales.reduce((a, i) => a + i.subtotalPuntos, 0);
  const totalPrecioPublico       = filasTotales.reduce((a, i) => a + i.subtotalPrecioPublico, 0);
  const totalValorComisionable   = filasTotales.reduce((a, i) => a + i.subtotalValorComisionable, 0);
  const total10 = filasTotales.reduce((a, i) => a + i.subtotal10, 0);
  const total15 = filasTotales.reduce((a, i) => a + i.subtotal15, 0);
  const total20 = filasTotales.reduce((a, i) => a + i.subtotal20, 0);
  const total30 = filasTotales.reduce((a, i) => a + i.subtotal30, 0);
  const total33 = filasTotales.reduce((a, i) => a + i.subtotal33, 0);
  const total35 = filasTotales.reduce((a, i) => a + i.subtotal35, 0);
  const total37 = filasTotales.reduce((a, i) => a + i.subtotal37, 0);
  const total40 = filasTotales.reduce((a, i) => a + i.subtotal40, 0);
  const total42 = filasTotales.reduce((a, i) => a + i.subtotal42, 0);

  /* CORREGIDO: lookup directo, sin indexOf frágil */
  const mapDescuento = useMemo(() => ({ 30: total30, 33: total33, 35: total35, 37: total37, 40: total40, 42: total42 }), [total30, total33, total35, total37, total40, total42]);

  /* ── Lógica: Compra Inicial ── */
  const obtenerPaqueteCompraInicial = (pts) => {
    if (pts >= 500) return { nombre: "Paquete 500", descuento: 42, totalConDescuento: total42, siguientePaquete: null,          siguienteObjetivo: null };
    if (pts >= 400) return { nombre: "Paquete 400", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 500", siguienteObjetivo: 500 };
    if (pts >= 300) return { nombre: "Paquete 300", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 400", siguienteObjetivo: 400 };
    if (pts >= 200) return { nombre: "Paquete 200", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 300", siguienteObjetivo: 300 };
    if (pts >= 100) return { nombre: "Paquete 100", descuento: 30, totalConDescuento: total30, siguientePaquete: "Paquete 200", siguienteObjetivo: 200 };
    return            { nombre: "Aún no calificas", descuento: 0,  totalConDescuento: 0,       siguientePaquete: "Paquete 100", siguienteObjetivo: 100 };
  };
  const paqueteActual = obtenerPaqueteCompraInicial(totalPuntos);

  const obtenerMensajeCompraInicial = () => {
    if (totalPuntos < 100) { const f = 100 - totalPuntos; return { texto: `Te faltan ${f} puntos para iniciar con el paquete de 100 puntos.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", siguienteMensaje: `Te faltan ${f} puntos para iniciar (${paqueteActual.siguientePaquete}).` }; }
    if (totalPuntos >= 500) return { texto: "Ya alcanzaste el paquete de 500 puntos y el 42% de descuento. ¡Estás en el nivel más alto!", colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", siguienteMensaje: "Ya estás en el paquete más alto de compra inicial." };
    const f = paqueteActual.siguienteObjetivo - totalPuntos;
    return { texto: `Ya estás dentro del ${paqueteActual.nombre} con ${paqueteActual.descuento}% de descuento. Te faltan ${f} puntos para alcanzar ${paqueteActual.siguientePaquete}.`, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", siguienteMensaje: `Te faltan ${f} puntos para llegar a ${paqueteActual.siguientePaquete}.` };
  };

  /* ── Lógica: Lealtad ── */
  const obtenerDescuentoLealtad  = (mes) => { if (mes <= 1) return 30; if (mes <= 3) return 33; if (mes <= 5) return 35; if (mes <= 11) return 37; if (mes <= 17) return 40; return 42; };
  const descuentoLealtadActual   = obtenerDescuentoLealtad(mesLealtad);
  const totalSegunDescuentoLealtad = mapDescuento[descuentoLealtadActual] ?? total42;

  const obtenerSiguienteEscalonLealtad = (mes) => { if (mes < 2) return { etiqueta: "33%", mesesFaltantes: 2 - mes }; if (mes < 4) return { etiqueta: "35%", mesesFaltantes: 4 - mes }; if (mes < 6) return { etiqueta: "37%", mesesFaltantes: 6 - mes }; if (mes < 12) return { etiqueta: "40%", mesesFaltantes: 12 - mes }; if (mes < 18) return { etiqueta: "42%", mesesFaltantes: 18 - mes }; return null; };
  const siguienteEscalonLealtad  = obtenerSiguienteEscalonLealtad(mesLealtad);

  const obtenerMensajeLealtad = () => {
    const ok100 = totalPuntos >= 100;
    if (!dentroPrimeros15) return { texto: "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.", colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.", mensajeSecundario: ok100 ? "Aunque cubriste 100 puntos, al no comprar en los primeros 15 días no conservas continuidad." : `Además, te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`, continuidad: false };
    if (!ok100) return { texto: `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`, mensajeSecundario: "Necesitas mínimo 100 puntos personales en los primeros 15 días.", continuidad: false };
    if (siguienteEscalonLealtad) { const pl = siguienteEscalonLealtad.mesesFaltantes === 1 ? "mes" : "meses"; return { texto: `¡Felicidades! Ya sostienes tu mes ${mesLealtad} en Lealtad con ${descuentoLealtadActual}% de descuento.`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.", mensajeSecundario: `Te faltan ${siguienteEscalonLealtad.mesesFaltantes} ${pl} consecutivos para llegar al ${siguienteEscalonLealtad.etiqueta}.`, continuidad: true }; }
    return { texto: `¡Felicidades! Ya estás en el tramo máximo del Programa de Lealtad con ${descuentoLealtadActual}% de descuento.`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.", mensajeSecundario: "Ya te encuentras en el tramo más alto del Programa de Lealtad.", continuidad: true };
  };

  /* ── Lógica: Acelerado ── */
  const totalAcumuladoAcelerado    = Number(puntosPersonalesAcelerado || 0) + Number(puntosGrupalesAcelerado || 0) + Number(acumuladoPrevioAcelerado || 0);
  const obtenerDescuentoAcelerado  = (a) => { if (a >= 3001) return 42; if (a >= 1501) return 40; if (a >= 501) return 35; if (a >= 1) return 30; return 0; };
  const descuentoAceleradoActual   = obtenerDescuentoAcelerado(totalAcumuladoAcelerado);
  const totalSegunDescuentoAcelerado = mapDescuento[descuentoAceleradoActual] ?? 0;
  const obtenerSiguienteEscalonAcelerado = (a) => { if (a < 501) return { meta: 501, etiqueta: "35%" }; if (a < 1501) return { meta: 1501, etiqueta: "40%" }; if (a < 3001) return { meta: 3001, etiqueta: "42%" }; return null; };
  const siguienteEscalonAcelerado  = obtenerSiguienteEscalonAcelerado(totalAcumuladoAcelerado);
  const obtenerMensajeAcelerado    = () => {
    if (totalAcumuladoAcelerado <= 0) return { texto: "Captura puntos personales, grupales y acumulado previo para evaluar tu Lealtad Acelerado.", colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: "Aún no has capturado puntos suficientes.", mensajeSecundario: "Ingresa tus puntos personales, grupales y acumulado previo." };
    if (siguienteEscalonAcelerado) { const f = siguienteEscalonAcelerado.meta - totalAcumuladoAcelerado; return { texto: `Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y te coloca en ${descuentoAceleradoActual}% dentro del Programa de Lealtad Acelerado.`, colorFondo: descuentoAceleradoActual >= 35 ? "#fef3c7" : "#fee2e2", colorTexto: descuentoAceleradoActual >= 35 ? "#92400e" : "#991b1b", colorBorde: descuentoAceleradoActual >= 35 ? "#f59e0b" : "#ef4444", colorSemaforo: descuentoAceleradoActual >= 35 ? "#d97706" : "#dc2626", mensajePrincipal: `Acumulado: ${totalAcumuladoAcelerado} puntos → ${descuentoAceleradoActual}% de descuento.`, mensajeSecundario: `Te faltan ${f} puntos para llegar al ${siguienteEscalonAcelerado.etiqueta}.` }; }
    return { texto: `¡Felicidades! Ya alcanzaste ${totalAcumuladoAcelerado} puntos acumulados y entras al 42% en Lealtad Acelerado.`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: "¡Felicidades! Ya alcanzaste el tramo máximo del Programa de Lealtad Acelerado.", mensajeSecundario: "Ya estás en 42% de descuento por acumulado." };
  };

  /* ── Lógica: Cliente Preferente ── */
  const puntosAcumuladosClientePreferente  = Number(acumuladoPrevioClientePreferente || 0) + Number(totalPuntos || 0);
  const obtenerDescuentoCP                 = (pts) => { if (pts >= 650) return 20; if (pts >= 150) return 15; return 10; };
  const descuentoClientePreferenteActual   = obtenerDescuentoCP(puntosAcumuladosClientePreferente);
  const totalSegunDescuentoClientePreferente = descuentoClientePreferenteActual === 10 ? total10 : descuentoClientePreferenteActual === 15 ? total15 : total20;
  const obtenerSiguienteNivelCP            = (pts) => { if (pts < 150) return { meta: 150, etiqueta: "15%" }; if (pts < 650) return { meta: 650, etiqueta: "20%" }; return null; };
  const siguienteNivelCP                   = obtenerSiguienteNivelCP(puntosAcumuladosClientePreferente);
  const obtenerMensajeCP = () => {
    if (puntosAcumuladosClientePreferente < 150) { const f = 150 - puntosAcumuladosClientePreferente; return { texto: `Actualmente estás en 10% de descuento. Te faltan ${f} puntos acumulados para llegar al 15%.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: "Tu descuento actual como Cliente Preferente es 10%.", mensajeSecundario: `Te faltan ${f} puntos acumulados para llegar al 15%.` }; }
    if (puntosAcumuladosClientePreferente < 650) { const f = 650 - puntosAcumuladosClientePreferente; return { texto: `Actualmente estás en 15% de descuento. Te faltan ${f} puntos acumulados para llegar al 20%.`, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: "Tu descuento actual como Cliente Preferente es 15%.", mensajeSecundario: `Te faltan ${f} puntos acumulados para llegar al 20%.` }; }
    return { texto: "¡Felicidades! Ya alcanzaste el 20% de descuento como Cliente Preferente.", colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: "Tu descuento actual como Cliente Preferente es 20%.", mensajeSecundario: "Ya estás en el nivel máximo de Cliente Preferente." };
  };

  /* Estado semáforo */
  const esDist = perfilUsuario === "distribuidor";
  const esCP   = perfilUsuario === "clientePreferente";
  const estado = esCP ? obtenerMensajeCP()
    : modo === "compraInicial" ? obtenerMensajeCompraInicial()
    : programaRecompra === "lealtad" ? obtenerMensajeLealtad()
    : obtenerMensajeAcelerado();

  const formatoMoneda = (n) => Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  /* ── Precios según perfil ── */
  const obtenerPrecioActualPorPerfil = (item) => {
    if (esCP) {
      if (descuentoClientePreferenteActual === 10) return item.precioCP10 !== undefined ? item.precioCP10 : item.precioPublico * 0.9;
      if (descuentoClientePreferenteActual === 15) return item.precioPublico * 0.85;
      return item.precio20 !== undefined ? item.precio20 : item.precioPublico * 0.8;
    }
    if (modo === "compraInicial") { if (paqueteActual.descuento === 30) return item.precio30; if (paqueteActual.descuento === 33) return item.precio33; if (paqueteActual.descuento === 42) return item.precio42; return item.precioPublico; }
    if (programaRecompra === "lealtad") { if (descuentoLealtadActual === 30) return item.precio30; if (descuentoLealtadActual === 33) return item.precio33; if (descuentoLealtadActual === 35) return item.precio35; if (descuentoLealtadActual === 37) return item.precio37; if (descuentoLealtadActual === 40) return item.precio40; return item.precio42; }
    if (descuentoAceleradoActual === 30) return item.precio30; if (descuentoAceleradoActual === 35) return item.precio35; if (descuentoAceleradoActual === 40) return item.precio40; if (descuentoAceleradoActual === 42) return item.precio42;
    return item.precioPublico;
  };

  const obtenerTotalPedidoActual = (item) => {
    if (esCP) { if (descuentoClientePreferenteActual === 10) return item.subtotal10; if (descuentoClientePreferenteActual === 15) return item.subtotal15; return item.subtotal20; }
    if (modo === "compraInicial") { if (paqueteActual.descuento === 30) return item.subtotal30; if (paqueteActual.descuento === 33) return item.subtotal33; if (paqueteActual.descuento === 42) return item.subtotal42; return 0; }
    if (programaRecompra === "lealtad") { if (descuentoLealtadActual === 30) return item.subtotal30; if (descuentoLealtadActual === 33) return item.subtotal33; if (descuentoLealtadActual === 35) return item.subtotal35; if (descuentoLealtadActual === 37) return item.subtotal37; if (descuentoLealtadActual === 40) return item.subtotal40; return item.subtotal42; }
    if (descuentoAceleradoActual === 30) return item.subtotal30; if (descuentoAceleradoActual === 35) return item.subtotal35; if (descuentoAceleradoActual === 40) return item.subtotal40; if (descuentoAceleradoActual === 42) return item.subtotal42;
    return 0;
  };

  const obtenerDescuentoActualGeneral  = () => { if (esCP) return descuentoClientePreferenteActual; if (modo === "compraInicial") return paqueteActual.descuento; if (programaRecompra === "lealtad") return descuentoLealtadActual; return descuentoAceleradoActual; };
  const obtenerTotalConDescuentoGeneral = () => { if (esCP) return totalSegunDescuentoClientePreferente; if (modo === "compraInicial") return paqueteActual.totalConDescuento; if (programaRecompra === "lealtad") return totalSegunDescuentoLealtad; return totalSegunDescuentoAcelerado; };

  /* ── PDF ── */
  const descargarPDFPedido = () => {
    if (!productosSeleccionados.length) { alert("Primero captura al menos un producto con unidades mayores a 0."); return; }
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFillColor(194, 65, 12); doc.rect(0, 0, 842, 84, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(24);
    doc.text("BodyLogic - Resumen de pedido", 40, 38);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    let textoModo = esCP ? `Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}` : modo === "compraInicial" ? `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%` : programaRecompra === "lealtad" ? `Recompra mensual | Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%` : `Recompra mensual | Lealtad Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
    doc.text(textoModo, 40, 60);
    doc.setTextColor(80, 80, 80); doc.text(`Fecha: ${new Date().toLocaleString("es-MX")}`, 40, 108); doc.text(`Estado: ${estado.texto}`, 40, 124);
    const descPDF = obtenerDescuentoActualGeneral();
    autoTable(doc, { startY: 145, head: [["Producto","Unidades","Sub. puntos","Sub. público",`Sub. ${descPDF}%`]], body: productosSeleccionados.map((i) => [i.producto, String(i.unidades), String(i.subtotalPuntos), formatoMoneda(i.subtotalPrecioPublico), formatoMoneda(obtenerTotalPedidoActual(i))]), theme: "grid", headStyles: { fillColor: [194,65,12], textColor: [255,255,255], fontStyle: "bold", halign: "center" }, styles: { fontSize: 9, cellPadding: 6, textColor: [40,40,40], valign: "middle" }, alternateRowStyles: { fillColor: [255,250,245] }, margin: { left: 40, right: 40 } });
    const fy = doc.lastAutoTable.finalY + 22;
    doc.setDrawColor(194,65,12); doc.setLineWidth(1); doc.line(40, fy, 802, fy);
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(124,45,18);
    doc.text(`Total unidades: ${totalUnidades}`, 40, fy+22); doc.text(`Total puntos: ${totalPuntos}`, 200, fy+22); doc.text(`Total público: ${formatoMoneda(totalPrecioPublico)}`, 340, fy+22);
    doc.text(`Total con descuento: ${formatoMoneda(obtenerTotalConDescuentoGeneral())}`, 40, fy+44);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(90,90,90);
    doc.text("Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.", 40, fy+70);
    doc.save("Resumen-Pedido-BodyLogic.pdf");
  };

  /* ── Impresión ── */
  const imprimirFormulario = () => {
    if (!productosSeleccionados.length) { alert("Primero captura al menos un producto con unidades mayores a 0."); return; }
    const descImp = obtenerDescuentoActualGeneral();
    const sub = esCP ? `Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}` : modo === "compraInicial" ? `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%` : programaRecompra === "lealtad" ? `Recompra mensual | Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%` : `Recompra mensual | Lealtad Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
    const ventana = window.open("","_blank","width=1200,height=900");
    if (!ventana) { alert("Tu navegador bloqueó la ventana de impresión."); return; }
    const filas = productosSeleccionados.map((i) => `<tr><td>${i.producto}</td><td style="text-align:center">${i.unidades}</td><td style="text-align:center">${i.subtotalPuntos}</td><td style="text-align:right">${formatoMoneda(i.subtotalPrecioPublico)}</td><td style="text-align:right">${formatoMoneda(obtenerTotalPedidoActual(i))}</td></tr>`).join("");
    ventana.document.write(`<html><head><title>Formulario BodyLogic</title><style>body{font-family:Arial,sans-serif;margin:30px;color:#222}.h{background:linear-gradient(135deg,#c2410c,#fb923c);color:#fff;padding:18px 22px;border-radius:16px;margin-bottom:24px}h1{margin:0 0 6px;font-size:26px}.s{font-size:13px;opacity:.95}.m{margin:14px 0 20px;font-size:13px;line-height:1.7}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#ea580c;color:#fff;padding:10px;border:1px solid #d6d3d1;font-size:13px}td{border:1px solid #e5e7eb;padding:10px;font-size:13px}tr:nth-child(even){background:#fffaf5}.t{margin-top:24px;padding:16px;border:1px solid #fdba74;border-radius:14px;background:#fff7ed;line-height:1.8;font-size:14px}.f{margin-top:40px;font-size:12px;color:#666}</style></head><body><div class="h"><h1>BodyLogic - Formulario de compra</h1><div class="s">${sub}</div></div><div class="m"><div><b>Fecha:</b> ${new Date().toLocaleString("es-MX")}</div><div><b>Estado:</b> ${estado.texto}</div></div><table><thead><tr><th>Producto</th><th>Unidades</th><th>Sub. puntos</th><th>Sub. público</th><th>Sub. ${descImp}%</th></tr></thead><tbody>${filas}</tbody></table><div class="t"><div><b>Total unidades:</b> ${totalUnidades}</div><div><b>Total puntos:</b> ${totalPuntos}</div><div><b>Total público:</b> ${formatoMoneda(totalPrecioPublico)}</div><div><b>Total con descuento:</b> ${formatoMoneda(obtenerTotalConDescuentoGeneral())}</div></div><div class="f">Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.</div><script>window.onload=function(){window.print()}<\/script></body></html>`);
    ventana.document.close();
  };

  /* ── Barra de progreso compra inicial ── */
  const progresoPaquete = (() => {
    if (totalPuntos >= 500) return { pct: 100, label: `${totalPuntos} pts`, right: "¡Nivel máximo!" };
    const escalones = [0,100,200,300,400,500];
    const idx = Math.max(0, escalones.findIndex((e) => e > totalPuntos) - 1);
    const desde = escalones[idx]; const hasta = escalones[Math.min(5, idx + 1)];
    const pct = hasta === desde ? 100 : ((totalPuntos - desde) / (hasta - desde)) * 100;
    return { pct, label: `Puntos: ${totalPuntos}`, right: paqueteActual.siguienteObjetivo ? `Siguiente: ${paqueteActual.siguienteObjetivo} pts` : "¡Nivel máximo!" };
  })();

  /* ── Barra de progreso CP ── */
  const progresoCP = (() => {
    const pts = puntosAcumuladosClientePreferente;
    if (pts >= 650) return { pct: 100, label: `${pts} pts acumulados`, right: "¡Nivel máximo 20%!" };
    if (pts >= 150) return { pct: ((pts - 150) / 500) * 100, label: `${pts} pts acumulados`, right: `Siguiente nivel: 20% (${650 - pts} pts más)` };
    return { pct: (pts / 150) * 100, label: `${pts} pts acumulados`, right: `Siguiente nivel: 15% (${150 - pts} pts más)` };
  })();

  const telefonoCentroServicio = "8007024840";

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 12% 0%, rgba(255,237,213,0.92) 0%, rgba(255,247,237,0.85) 22%, #fffaf5 52%, #fffdf9 100%)", padding: "16px", paddingBottom: "180px", fontFamily: FONT.body, position: "relative", overflow: "hidden" }}>

      {/* Auras */}
      <div style={{ position: "fixed", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "200px", left: "-80px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 72%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "1880px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ─── HERO ─── */}
        <header style={{ borderRadius: "26px", overflow: "hidden", background: "linear-gradient(135deg, #431407 0%, #7c2d12 20%, #c2410c 50%, #ea580c 78%, #fb923c 100%)", boxShadow: SHADOW.hero, marginBottom: "16px" }}>
          <div style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(255,255,255,0.07), transparent 30%)" }}>
            <div style={{ padding: "clamp(22px,5vw,44px)", color: C.white }}>
              <Badge variant="ghost">Plataforma de Apoyo Comercial</Badge>
              <h1 className="bl-hero-title" style={{ margin: "14px 0 0", fontSize: "clamp(34px,6vw,58px)", lineHeight: 1, color: C.white, fontWeight: "800", fontFamily: FONT.display, letterSpacing: "-1px", textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>BodyLogic</h1>
              <p style={{ marginTop: "12px", maxWidth: "860px", fontSize: "clamp(13px,2vw,16px)", lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>Centro avanzado de cálculo de puntos, validación comercial, documentos oficiales y gestión operativa para asociados.</p>
              <div style={{ marginTop: "16px", display: "inline-block", padding: "11px 15px", borderRadius: "15px", background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff7ed", fontSize: "13px", lineHeight: 1.6, backdropFilter: "blur(6px)", maxWidth: "820px" }}>
                Este material ha sido creado por el líder <strong>Jorge Francisco Sánchez Yerenas</strong> para el apoyo de su comunidad empresarial BodyLogic.
              </div>
            </div>
          </div>
        </header>

        {/* ─── PANEL DE CONTROL ─── */}
        <div ref={refPanel}>
          <Panel>
            <SectionHeader title="Panel de control" subtitle="Selecciona tu perfil, configura el modo de compra y filtra productos." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
              <ControlCard label="Perfil de usuario">
                <SelectField value={perfilUsuario} onChange={setPerfilUsuario} options={[{ value: "distribuidor", label: "Distribuidor Independiente" }, { value: "clientePreferente", label: "Cliente Preferente" }]} />
              </ControlCard>
              <ControlCard label="Filtrar por categoría">
                <SelectField value={categoriaSeleccionada} onChange={setCategoriaSeleccionada} options={categorias.map((c) => ({ value: c, label: c }))} />
              </ControlCard>
              <ControlCard label="Buscar producto o código">
                <InputField value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ej. Omega 3 o código" />
              </ControlCard>
              <InfoStatCard value={esDist ? "Distribuidor" : "Cliente Preferente"} label={esDist ? "Flujo completo de ingreso y recompra" : "Flujo simplificado con descuento progresivo"} />
            </div>

            {/* Distribuidor */}
            {esDist && (
              <>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px", marginBottom: "14px" }}>
                  <Btn variant={modo === "compraInicial"   ? "active" : "ghost"} onClick={() => setModo("compraInicial")}>Compra inicial</Btn>
                  <Btn variant={modo === "recompraMensual" ? "active" : "ghost"} onClick={() => setModo("recompraMensual")}>Recompra mensual</Btn>
                  <Btn variant="danger" onClick={limpiar}>Limpiar cantidades</Btn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
                  {modo === "compraInicial" ? (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <InfoStatCard value={paqueteActual.nombre} label="Paquete detectado automáticamente" accent />
                      <div style={{ marginTop: "10px", background: C.brandGhost, borderRadius: "16px", padding: "14px 16px", border: `1px solid ${C.brandBorder}` }}>
                        <ProgressBar pct={progresoPaquete.pct} label={progresoPaquete.label} labelRight={progresoPaquete.right} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <ControlCard label="Programa de recompra">
                        <SelectField value={programaRecompra} onChange={setProgramaRecompra} options={[{ value: "lealtad", label: "Programa de Lealtad" }, { value: "acelerado", label: "Lealtad Acelerado" }]} />
                      </ControlCard>
                      {programaRecompra === "lealtad" ? (
                        <>
                          <ControlCard label="Mes actual del programa">
                            <SelectField value={mesLealtad} onChange={(v) => setMesLealtad(Number(v))} options={Array.from({ length: 18 }, (_, i) => ({ value: i + 1, label: i + 1 === 18 ? "Mes 18 o más" : `Mes ${i + 1}` }))} />
                          </ControlCard>
                          <ControlCard label="¿Compras dentro de los primeros 15 días?">
                            <SelectField value={dentroPrimeros15 ? "si" : "no"} onChange={(v) => setDentroPrimeros15(v === "si")} options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]} />
                          </ControlCard>
                        </>
                      ) : (
                        <>
                          <ControlCard label="Puntos personales del periodo"><InputField type="number" min="0" value={puntosPersonalesAcelerado} onChange={(e) => setPuntosPersonalesAcelerado(Number(e.target.value || 0))} /></ControlCard>
                          <ControlCard label="Puntos grupales del periodo"><InputField type="number" min="0" value={puntosGrupalesAcelerado} onChange={(e) => setPuntosGrupalesAcelerado(Number(e.target.value || 0))} /></ControlCard>
                          <ControlCard label="Acumulado previo"><InputField type="number" min="0" value={acumuladoPrevioAcelerado} onChange={(e) => setAcumuladoPrevioAcelerado(Number(e.target.value || 0))} /></ControlCard>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Cliente Preferente */}
            {esCP && (
              <>
                <div style={{ display: "flex", gap: "10px", marginTop: "18px", marginBottom: "14px" }}>
                  <Btn variant="danger" onClick={limpiar}>Limpiar cantidades</Btn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
                  <ControlCard label="Puntos acumulados previos"><InputField type="number" min="0" value={acumuladoPrevioClientePreferente} onChange={(e) => setAcumuladoPrevioClientePreferente(Number(e.target.value || 0))} /></ControlCard>
                  <InfoStatCard value={`${descuentoClientePreferenteActual}%`} label="Descuento actual de Cliente Preferente" accent />
                  <InfoStatCard value={puntosAcumuladosClientePreferente} label="Puntos acumulados totales" />
                  <InfoStatCard value={siguienteNivelCP ? `${siguienteNivelCP.meta - puntosAcumuladosClientePreferente} pts` : "Nivel máximo"} label={siguienteNivelCP ? `Faltan para llegar al ${siguienteNivelCP.etiqueta}` : "Ya alcanzaste el 20%"} />
                </div>
                <div style={{ marginTop: "10px", background: C.brandGhost, borderRadius: "16px", padding: "14px 16px", border: `1px solid ${C.brandBorder}` }}>
                  <ProgressBar pct={progresoCP.pct} label={progresoCP.label} labelRight={progresoCP.right} />
                </div>
              </>
            )}

            {esMovil && (
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <Btn variant={vistaMovil === "tarjetas" ? "active" : "ghost"} onClick={() => setVistaMovil("tarjetas")}>Tarjetas</Btn>
                <Btn variant={vistaMovil === "tabla" ? "active" : "ghost"} onClick={() => setVistaMovil("tabla")}>Tabla</Btn>
              </div>
            )}
          </Panel>
        </div>

        {/* ─── SEMÁFORO ─── */}
        <div ref={refSemaforo}>
          <div style={{ backgroundColor: estado.colorFondo, border: `1.5px solid ${estado.colorBorde}`, borderRadius: "20px", padding: "18px 22px", marginBottom: "16px", boxShadow: SHADOW.card, display: "flex", alignItems: "center", gap: "14px" }}>
            <span className="bl-dot-pulse" style={{ display: "inline-block", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: estado.colorSemaforo, flexShrink: 0, boxShadow: `0 0 0 5px ${estado.colorFondo}, 0 0 0 7px ${estado.colorBorde}55` }} />
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: estado.colorTexto, marginBottom: "3px" }}>
                {esCP ? "Lectura de Cliente Preferente" : modo === "compraInicial" ? "Lectura automática de compra inicial" : programaRecompra === "lealtad" ? "Lectura de recompra mensual — Lealtad" : "Lectura de recompra mensual — Lealtad Acelerado"}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.55, color: estado.colorTexto }}>{estado.texto}</div>
            </div>
          </div>
        </div>

        {/* ─── PEDIDO ACTUAL ─── */}
        {/* CORREGIDO: id en div wrapper para que irAPedidoActual funcione */}
        <div ref={refPedido} id="pedido-actual">
          <Panel>
            <SectionHeader title="Pedido actual" subtitle="Aquí aparecen únicamente los productos que ya capturaste." action={productosSeleccionados.length > 0 && <Btn variant="danger" onClick={limpiar}>Vaciar pedido</Btn>} />
            {productosSeleccionados.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 18px", borderRadius: "16px", background: C.brandCream, border: `1.5px dashed ${C.brandPale}` }}>
                <span style={{ fontSize: "26px" }}>🛒</span>
                <span style={{ color: C.muted, fontSize: "14px" }}>Aún no has agregado productos al pedido.</span>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {productosSeleccionados.map((item) => (
                  <div key={item.codigo} className="bl-prod-card" style={{ background: `linear-gradient(180deg, ${C.brandCream}, #fff4ea)`, border: `1px solid ${C.brandBorder}`, borderRadius: "20px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: "inline-block", fontSize: "11px", fontWeight: "700", color: C.darkSub, background: C.brandGhost, border: `1px solid ${C.brandPale}`, borderRadius: "6px", padding: "2px 7px", letterSpacing: "0.3px" }}>{item.codigo}</span>
                        <div style={{ marginTop: "6px", fontSize: "15px", fontWeight: "700", color: C.darkMid, lineHeight: 1.3 }}>{item.producto}</div>
                        {item.contenido && <div style={{ marginTop: "3px", fontSize: "12px", color: C.muted }}>{item.contenido}</div>}
                      </div>
                      <Btn variant="danger" size="sm" onClick={() => eliminar(item.codigo)}>✕</Btn>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
                      <button onClick={() => decrementar(item.codigo)} className="bl-btn" style={{ width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${C.brandPale}`, background: C.white, color: C.darkSub, fontWeight: "700", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <input type="number" min="0" value={item.unidades} onChange={(e) => cambiarCantidad(item.codigo, e.target.value)} className="bl-input" style={{ width: "84px", padding: "10px", borderRadius: "11px", border: `1px solid ${C.brandBorder}`, background: C.white, color: "#1c1917", textAlign: "center", fontWeight: "700", fontSize: "15px" }} />
                      <button onClick={() => incrementar(item.codigo)} className="bl-btn" style={{ width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${C.brandPale}`, background: C.white, color: C.darkSub, fontWeight: "700", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <div style={{ marginTop: "13px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "9px" }}>
                      <MiniDato label="Subtotal puntos" value={item.subtotalPuntos} />
                      <MiniDato label="Precio público"  value={formatoMoneda(item.subtotalPrecioPublico)} />
                      <MiniDato label={`Con ${obtenerDescuentoActualGeneral()}%`} value={formatoMoneda(obtenerTotalPedidoActual(item))} accent />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* ─── TABLA MAESTRA ─── */}
        <div ref={refTabla}>
          <Panel style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 16px" }}>
              <SectionHeader
                title="Tabla maestra de productos"
                subtitle={`Mostrando ${filasCalculadas.length} producto(s)${categoriaSeleccionada !== "TODAS" ? ` en "${categoriaSeleccionada}"` : ""}.`}
                action={<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}><Btn variant="primary" size="sm" onClick={descargarPDFPedido}>↓ PDF del pedido</Btn><Btn variant="orange" size="sm" onClick={imprimirFormulario}>⎙ Imprimir</Btn></div>}
              />
            </div>
            {esMovil && vistaMovil === "tarjetas" ? (
              <div style={{ padding: "0 14px 14px", display: "grid", gap: "11px" }}>
                {filasCalculadas.map((item) => {
                  const activa = filaActiva === item.codigo;
                  return (
                    <div key={item.codigo} onClick={() => setFilaActiva(item.codigo)} className={`bl-prod-card${activa ? " active" : ""}`}
                      style={{ background: activa ? C.brandPale : item.unidades > 0 ? `linear-gradient(180deg, #fff7ed, #ffedd5)` : `linear-gradient(180deg, ${C.brandCream}, #fff4ea)`, border: `1px solid ${C.brandBorder}`, borderRadius: "18px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: C.darkSub, background: C.brandGhost, border: `1px solid ${C.brandPale}`, borderRadius: "6px", padding: "2px 7px" }}>{item.codigo}</span>
                          <div style={{ marginTop: "6px", fontSize: "15px", fontWeight: "700", color: C.darkMid, lineHeight: 1.3 }}>{item.producto}</div>
                          {item.contenido && <div style={{ marginTop: "2px", fontSize: "12px", color: C.muted }}>{item.contenido}</div>}
                        </div>
                        <Badge>{item.categoria}</Badge>
                      </div>
                      <div style={{ marginTop: "12px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: "700", color: C.darkSub, letterSpacing: "0.4px", textTransform: "uppercase" }}>Unidades</label>
                        <InputField type="number" min="0" value={item.unidades} onChange={(e) => cambiarCantidad(item.codigo, e.target.value)} onFocus={() => setFilaActiva(item.codigo)} />
                      </div>
                      <div style={{ marginTop: "11px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <MiniDato label="Puntos unit." value={item.puntos} />
                        <MiniDato label="Sub. puntos"  value={item.subtotalPuntos} />
                        <MiniDato label="Público"      value={formatoMoneda(item.subtotalPrecioPublico)} />
                        <MiniDato label={`Con ${obtenerDescuentoActualGeneral()}%`} value={formatoMoneda(obtenerTotalPedidoActual(item))} accent />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <TablaProductos
                filas={filasCalculadas} filaActiva={filaActiva} setFilaActiva={setFilaActiva} cambiarCantidad={cambiarCantidad}
                formatoMoneda={formatoMoneda} obtenerPrecioActualPorPerfil={obtenerPrecioActualPorPerfil} obtenerTotalPedidoActual={obtenerTotalPedidoActual} obtenerDescuentoActualGeneral={obtenerDescuentoActualGeneral}
                totalUnidades={totalUnidades} totalPuntos={totalPuntos} totalPrecioPublico={totalPrecioPublico}
                totalFinal={esCP ? totalSegunDescuentoClientePreferente : totalValorComisionable}
                estado={estado} modoCP={esCP}
              />
            )}
          </Panel>
        </div>

        {/* ─── INFO + LEYENDAS ─── */}
        <div ref={refInfo} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "0" }}>
          <Panel>
            <SectionHeader title="3 formas de adquirir producto" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {[
                { badge: "Web",        titulo: "Sitio web",          accent: true,  content: <><p style={{ margin: "5px 0", color: C.muted, fontSize: "14px" }}>Ingresa directamente a:</p><a href="https://www.bodylogicglobal.com" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px", color: C.brand, fontWeight: "700", textDecoration: "none", padding: "9px 13px", borderRadius: "11px", background: C.white, border: `1px solid ${C.brandPale}`, fontSize: "13px" }}>www.bodylogicglobal.com ↗</a></> },
                { badge: "Teléfono",  titulo: "Centro de servicio", accent: false, content: <><a href={`tel:${telefonoCentroServicio}`} style={{ display: "inline-block", margin: "4px 0 6px", color: C.brand, fontWeight: "700", textDecoration: "none", fontSize: "20px" }}>800 702 4840</a><p style={{ margin: "5px 0", color: C.muted, fontSize: "13px" }}>Lun – Vie: 8:00 a 20:00 hrs.</p><p style={{ margin: "3px 0", color: C.muted, fontSize: "13px" }}>Sáb: 9:00 a 14:00 hrs.</p></> },
                { badge: "Presencial", titulo: "CAD",                accent: false, content: <p style={{ margin: "5px 0", color: C.muted, fontSize: "14px" }}>Adquiere tus productos en tu CAD más cercano.</p> },
              ].map(({ badge, titulo, content, accent }) => (
                <div key={badge} style={{ background: accent ? `linear-gradient(135deg, ${C.brandGhost}, #ffedd5)` : C.white, border: `1px solid ${accent ? C.brandPale : "#f0ebe6"}`, borderRadius: "18px", padding: "16px" }}>
                  <Badge>{badge}</Badge>
                  <h3 style={{ margin: "10px 0 6px", color: C.darkMid, fontSize: "14px", fontWeight: "700" }}>{titulo}</h3>
                  {content}
                </div>
              ))}
            </div>
          </Panel>
          <Panel style={{ background: `linear-gradient(160deg, ${C.brandGhost}, ${C.brandCream})`, border: `1px solid ${C.brandPale}` }}>
            <SectionHeader title="Leyendas importantes" />
            {["Los puntos mostrados corresponden al valor en puntos de cada producto.", esDist ? "El valor comisionable corresponde al 89% del precio con descuento sin IVA." : null, "Las herramientas de negocio no generan puntos ni valor comisionable.", "La información debe validarse siempre con la lista vigente de la empresa."].filter(Boolean).map((t, i) => (
              <div key={i} style={{ padding: "11px 14px", borderRadius: "13px", background: "rgba(255,255,255,0.68)", border: `1px solid ${C.brandPale}`, color: C.darkSub, lineHeight: 1.6, marginBottom: "9px", fontSize: "13px" }}>
                <span style={{ color: C.brandLight, marginRight: "8px" }}>●</span>{t}
              </div>
            ))}
          </Panel>
        </div>

        {/* ─── DOCUMENTOS ─── */}
        <div ref={refDocs}>
          <Panel style={{ marginTop: "16px" }}>
            <SectionHeader title="Documentos importantes" subtitle={esCP ? "Aquí solo se muestran los documentos más útiles para Cliente Preferente." : "Descarga los archivos oficiales desde la misma plataforma."} />
            <div style={{ display: "grid", gap: "10px" }}>
              {documentosVisibles.map((doc) => {
                const descargando = descargandoArchivo === doc.archivo;
                return (
                  <div key={doc.archivo} style={{ background: `linear-gradient(180deg, ${C.brandCream}, #fff4ea)`, borderRadius: "18px", padding: "15px", border: `1px solid ${C.brandBorder}`, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: C.darkMid }}>{doc.nombre}</div>
                    <div style={{ marginTop: "5px", color: C.muted, lineHeight: 1.5, fontSize: "13px" }}>{doc.descripcion}</div>
                    <div style={{ marginTop: "4px", color: C.brandLight, fontSize: "12px", fontFamily: "monospace" }}>{doc.archivo}</div>
                    <Btn variant="orange" size="sm" disabled={descargando} onClick={() => descargarArchivoRobusto(doc.archivo, doc.nombre)} style={{ marginTop: "11px", alignSelf: "flex-start" }}>
                      {descargando ? "Descargando…" : doc.tipo === "membresia" ? "↓ Descargar y rellenar" : "↓ Descargar PDF"}
                    </Btn>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

      </div>

      {/* ─── RESUMEN FLOTANTE ─── */}
      {esMovil && (
        <ResumenFlotante
          estado={estado} perfilUsuario={perfilUsuario} modo={modo} programaRecompra={programaRecompra}
          resumenContraido={resumenContraido} setResumenContraido={setResumenContraido}
          descuentoClientePreferenteActual={descuentoClientePreferenteActual}
          puntosAcumuladosClientePreferente={puntosAcumuladosClientePreferente}
          totalSegunDescuentoClientePreferente={totalSegunDescuentoClientePreferente}
          paqueteActual={paqueteActual} totalPuntos={totalPuntos} totalPrecioPublico={totalPrecioPublico}
          mesLealtad={mesLealtad} descuentoLealtadActual={descuentoLealtadActual} totalSegunDescuentoLealtad={totalSegunDescuentoLealtad}
          totalAcumuladoAcelerado={totalAcumuladoAcelerado} descuentoAceleradoActual={descuentoAceleradoActual} totalSegunDescuentoAcelerado={totalSegunDescuentoAcelerado}
          irAPedidoActual={irAPedidoActual} descargarPDFPedido={descargarPDFPedido} imprimirFormulario={imprimirFormulario} irArriba={irArriba}
          formatoMoneda={formatoMoneda}
        />
      )}
    </div>
  );
}

export default App;