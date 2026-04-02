import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { productos } from "./data/productos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS INJECTION — premium fonts, transitions, scrollbar
   ═══════════════════════════════════════════════════════════════ */
const injectGlobalStyles = () => {
  if (document.getElementById("bl-global-styles")) return;
  const style = document.createElement("style");
  style.id = "bl-global-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Premium scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #f4c6a0; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: #ea580c; }

    /* Smooth transitions on interactive elements */
    button, select, input {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'DM Sans', sans-serif;
    }
    button:active { transform: scale(0.97); }

    /* Focus rings */
    select:focus, input:focus {
      outline: none;
      border-color: #ea580c !important;
      box-shadow: 0 0 0 3px rgba(234,88,12,0.12) !important;
    }

    /* Number input spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 1;
      height: 28px;
    }

    /* Fade-in animation */
    @keyframes blFadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes blFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes blPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    @keyframes blShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes blSlideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 900px; }
    }

    .bl-fade-in { animation: blFadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both; }
    .bl-fade-in-delay-1 { animation-delay: 0.08s; }
    .bl-fade-in-delay-2 { animation-delay: 0.16s; }
    .bl-fade-in-delay-3 { animation-delay: 0.24s; }

    .bl-card-hover {
      transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1), border-color 0.22s;
    }
    .bl-card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(124,45,18,0.10);
    }

    .bl-expand-content {
      animation: blSlideDown 0.35s cubic-bezier(0.4,0,0.2,1) both;
      overflow: hidden;
    }

    /* Progress bar animation */
    .bl-progress-fill {
      transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
    }

    /* Highlight flash */
    @keyframes blHighlight {
      0% { background-color: rgba(234,88,12,0.18); }
      100% { background-color: transparent; }
    }
    .bl-highlight-flash { animation: blHighlight 1.2s ease-out; }

    @media (max-width: 768px) {
      .bl-desktop-only { display: none !important; }
    }
    @media (min-width: 769px) {
      .bl-mobile-only { display: none !important; }
    }
  `;
  document.head.appendChild(style);
};

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  // Colors
  orange900: "#5f250f",
  orange800: "#7c2d12",
  orange700: "#9a3412",
  orange600: "#c2410c",
  orange500: "#ea580c",
  orange400: "#fb923c",
  orange300: "#fdba74",
  orange200: "#fed7aa",
  orange100: "#ffedd5",
  orange50: "#fff7ed",

  cream50: "#fffdf9",
  cream100: "#fffaf5",
  cream200: "#fff4ea",
  cream300: "#fff1e6",
  cream400: "#ffe4cf",
  cream500: "#fde2cc",
  cream600: "#fde4d3",
  cream700: "#fdc9a3",

  warm600: "#7c6f64",
  warm500: "#8a7e74",
  warm400: "#a39888",

  text: "#5b4d43",
  textDark: "#7c2d12",
  textMuted: "#7c6f64",

  red500: "#dc2626",
  red100: "#fee2e2",
  redBorder: "#ef4444",
  redText: "#991b1b",

  yellow500: "#d97706",
  yellow100: "#fef3c7",
  yellowBorder: "#f59e0b",
  yellowText: "#92400e",

  green500: "#65a30d",
  green100: "#ecfccb",
  greenBorder: "#84cc16",
  greenText: "#3f6212",

  white: "#ffffff",
  black: "#111827",

  // Typography
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",

  // Spacing
  radius: {
    sm: "10px",
    md: "14px",
    lg: "20px",
    xl: "24px",
    xxl: "28px",
    pill: "999px",
  },

  shadow: {
    sm: "0 2px 8px rgba(124,45,18,0.04)",
    md: "0 8px 24px rgba(124,45,18,0.06)",
    lg: "0 18px 42px rgba(124,45,18,0.08)",
    xl: "0 30px 80px rgba(194,65,12,0.18)",
    glow: "0 0 0 3px rgba(234,88,12,0.12)",
  },
};

/* ═══════════════════════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function MiniDato({ label, value, highlight }) {
  return (
    <div
      style={{
        backgroundColor: highlight ? T.orange50 : T.white,
        border: `1px solid ${highlight ? T.orange300 : T.cream500}`,
        borderRadius: T.radius.md,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: "11px", color: T.textMuted, marginBottom: "4px", fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: highlight ? T.orange600 : T.textDark,
          lineHeight: 1.35,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ProgressBar({ current, target, label, colorStart = T.orange400, colorEnd = T.orange500 }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div style={{ marginTop: "8px" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: T.textMuted,
            marginBottom: "6px",
            fontWeight: 500,
          }}
        >
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: T.orange600 }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        style={{
          height: "8px",
          borderRadius: "99px",
          backgroundColor: T.cream400,
          overflow: "hidden",
        }}
      >
        <div
          className="bl-progress-fill"
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "99px",
            background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})`,
          }}
        />
      </div>
    </div>
  );
}

function SectionCard({ children, style: extraStyle, className = "" }) {
  return (
    <section
      className={`bl-fade-in ${className}`}
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: T.radius.xxl,
        padding: "24px",
        boxShadow: T.shadow.lg,
        border: `1px solid ${T.cream600}`,
        marginBottom: "20px",
        backdropFilter: "blur(8px)",
        ...extraStyle,
      }}
    >
      {children}
    </section>
  );
}

function Badge({ children, style: s }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: T.radius.pill,
        backgroundColor: T.orange200,
        color: T.orange700,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.3px",
        ...s,
      }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function App() {
  useEffect(() => { injectGlobalStyles(); }, []);

  const [perfilUsuario, setPerfilUsuario] = useState("distribuidor");
  const [cantidades, setCantidades] = useState({});
  const [modo, setModo] = useState("compraInicial");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODAS");
  const [filaActiva, setFilaActiva] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [vistaMovil, setVistaMovil] = useState(
    window.innerWidth <= 768 ? "cards" : "tabla"
  );
  const [resumenContraido, setResumenContraido] = useState(false);
  const [descargandoArchivo, setDescargandoArchivo] = useState("");

  // Distribuidor Independiente
  const [programaRecompra, setProgramaRecompra] = useState("lealtad");
  const [mesLealtad, setMesLealtad] = useState(1);
  const [dentroPrimeros15, setDentroPrimeros15] = useState(true);

  // Lealtad Acelerado
  const [puntosPersonalesAcelerado, setPuntosPersonalesAcelerado] = useState(0);
  const [puntosGrupalesAcelerado, setPuntosGrupalesAcelerado] = useState(0);
  const [acumuladoPrevioAcelerado, setAcumuladoPrevioAcelerado] = useState(0);

  // Cliente Preferente
  const [acumuladoPrevioClientePreferente, setAcumuladoPrevioClientePreferente] =
    useState(0);

  // Refs for scroll-to-product on search
  const productRefs = useRef({});
  const tablaWrapperRef = useRef(null);

  useEffect(() => {
    const manejarResize = () => {
      const movil = window.innerWidth <= 768;
      setEsMovil(movil);
      if (!movil) setVistaMovil("tabla");
    };
    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);

  // Auto-scroll to first matching product when searching
  useEffect(() => {
    if (!busqueda.trim()) return;
    const timer = setTimeout(() => {
      const textoBusq = busqueda.trim().toLowerCase();
      const match = productos.find(
        (item) =>
          item.producto.toLowerCase().includes(textoBusq) ||
          item.codigo.toLowerCase().includes(textoBusq)
      );
      if (match && productRefs.current[match.codigo]) {
        productRefs.current[match.codigo].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setFilaActiva(match.codigo);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const categorias = useMemo(() => {
    const unicas = [...new Set(productos.map((item) => item.categoria))];
    return ["TODAS", ...unicas];
  }, []);

  const documentos = [
    {
      nombre: "Catálogo Bodylogic 2026",
      archivo: "CATALOGO-BODYLOGIC-2026.pdf",
      descripcion: "Consulta visual del catálogo general.",
      tipo: "normal",
      icono: "📖",
    },
    {
      nombre: "Lista de Precios CP Marzo 26",
      archivo: "LISTA-PRECIOS-CP-MARZO-26.pdf",
      descripcion: "Precios para Cliente Preferente.",
      tipo: "normal",
      icono: "💰",
    },
    {
      nombre: "Lista de Precios DI Marzo 26",
      archivo: "LISTA-PRECIOS-DI-MARZO-26.pdf",
      descripcion: "Precios para Distribuidor Independiente.",
      tipo: "normal",
      icono: "📊",
    },
    {
      nombre: "Solicitud de Membresía",
      archivo: "SOLICITUD-DE-MEMBRESIA.pdf",
      descripcion: "Formato oficial editable para alta de nuevos asociados.",
      tipo: "membresia",
      icono: "📝",
    },
  ];

  const documentosVisibles =
    perfilUsuario === "clientePreferente"
      ? documentos.filter(
          (doc) =>
            doc.archivo !== "LISTA-PRECIOS-DI-MARZO-26.pdf" &&
            doc.archivo !== "SOLICITUD-DE-MEMBRESIA.pdf"
        )
      : documentos;

  const descargarArchivoRobusto = async (archivo, nombreVisible) => {
    const ruta = `/archivos/${archivo}`;
    setDescargandoArchivo(archivo);
    try {
      const respuesta = await fetch(ruta, { cache: "no-store" });
      if (!respuesta.ok) throw new Error(`No se pudo descargar: ${respuesta.status}`);
      const blob = await respuesta.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = urlBlob;
      enlace.download = archivo;
      enlace.style.display = "none";
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      setTimeout(() => window.URL.revokeObjectURL(urlBlob), 1500);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      alert(`No se pudo descargar "${nombreVisible}". Se intentará abrir directamente.`);
      window.open(ruta, "_blank", "noopener,noreferrer");
    } finally {
      setDescargandoArchivo("");
    }
  };

  const cambiarCantidad = (codigo, valor) => {
    const numero = Number(valor);
    setCantidades((prev) => ({ ...prev, [codigo]: numero >= 0 ? numero : 0 }));
    setFilaActiva(codigo);
  };

  const incrementarProducto = (codigo) => {
    setCantidades((prev) => ({ ...prev, [codigo]: (prev[codigo] || 0) + 1 }));
    setFilaActiva(codigo);
  };

  const decrementarProducto = (codigo) => {
    setCantidades((prev) => ({ ...prev, [codigo]: Math.max((prev[codigo] || 0) - 1, 0) }));
    setFilaActiva(codigo);
  };

  const eliminarProducto = (codigo) => {
    setCantidades((prev) => ({ ...prev, [codigo]: 0 }));
    if (filaActiva === codigo) setFilaActiva("");
  };

  const limpiarCantidades = () => {
    setCantidades({});
    setFilaActiva("");
  };

  const vaciarPedidoActual = () => {
    setCantidades({});
    setFilaActiva("");
  };

  const irAPedidoActual = () => {
    const seccion = document.getElementById("pedido-actual");
    if (seccion) seccion.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const irArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ───── PRODUCT FILTERING ─────
  const productosFiltradosBase =
    categoriaSeleccionada === "TODAS"
      ? productos
      : productos.filter((item) => item.categoria === categoriaSeleccionada);

  const textoBusqueda = busqueda.trim().toLowerCase();
  const productosFiltrados = productosFiltradosBase.filter((item) => {
    if (!textoBusqueda) return true;
    return (
      item.producto.toLowerCase().includes(textoBusqueda) ||
      item.codigo.toLowerCase().includes(textoBusqueda) ||
      item.categoria.toLowerCase().includes(textoBusqueda)
    );
  });

  // ───── ROW CALCULATIONS ─────
  const mapearFila = (item) => {
    const unidades = Number(cantidades[item.codigo] || 0);
    const subtotalPuntos = unidades * item.puntos;
    const subtotalPrecioPublico = unidades * item.precioPublico;
    const subtotalValorComisionable = unidades * item.valorComisionable;
    const subtotal10 =
      item.precioCP10 !== undefined
        ? unidades * item.precioCP10
        : unidades * item.precioPublico * 0.9;
    const subtotal15 = unidades * item.precioPublico * 0.85;
    const subtotal20 =
      item.precio20 !== undefined
        ? unidades * item.precio20
        : unidades * item.precioPublico * 0.8;
    const subtotal30 = unidades * item.precio30;
    const subtotal33 = unidades * item.precio33;
    const subtotal35 = unidades * item.precio35;
    const subtotal37 = unidades * item.precio37;
    const subtotal40 = unidades * item.precio40;
    const subtotal42 = unidades * item.precio42;
    return {
      ...item,
      unidades,
      subtotalPuntos,
      subtotalPrecioPublico,
      subtotalValorComisionable,
      subtotal10, subtotal15, subtotal20,
      subtotal30, subtotal33, subtotal35, subtotal37, subtotal40, subtotal42,
    };
  };

  const filasCalculadas = productosFiltrados.map(mapearFila);
  const filasTotales = productos.map(mapearFila);
  const productosSeleccionados = filasTotales.filter((item) => item.unidades > 0);

  const totalUnidades = filasTotales.reduce((acc, i) => acc + i.unidades, 0);
  const totalPuntos = filasTotales.reduce((acc, i) => acc + i.subtotalPuntos, 0);
  const totalPrecioPublico = filasTotales.reduce((acc, i) => acc + i.subtotalPrecioPublico, 0);
  const totalValorComisionable = filasTotales.reduce((acc, i) => acc + i.subtotalValorComisionable, 0);
  const total10 = filasTotales.reduce((acc, i) => acc + i.subtotal10, 0);
  const total15 = filasTotales.reduce((acc, i) => acc + i.subtotal15, 0);
  const total20 = filasTotales.reduce((acc, i) => acc + i.subtotal20, 0);
  const total30 = filasTotales.reduce((acc, i) => acc + i.subtotal30, 0);
  const total33 = filasTotales.reduce((acc, i) => acc + i.subtotal33, 0);
  const total35 = filasTotales.reduce((acc, i) => acc + i.subtotal35, 0);
  const total37 = filasTotales.reduce((acc, i) => acc + i.subtotal37, 0);
  const total40 = filasTotales.reduce((acc, i) => acc + i.subtotal40, 0);
  const total42 = filasTotales.reduce((acc, i) => acc + i.subtotal42, 0);

  // ───── COMPRA INICIAL ─────
  const obtenerPaqueteCompraInicial = (puntos) => {
    if (puntos >= 500) return { nombre: "Paquete 500", descuento: 42, totalConDescuento: total42, siguientePaquete: null, siguienteObjetivo: null };
    if (puntos >= 400) return { nombre: "Paquete 400", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 500", siguienteObjetivo: 500 };
    if (puntos >= 300) return { nombre: "Paquete 300", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 400", siguienteObjetivo: 400 };
    if (puntos >= 200) return { nombre: "Paquete 200", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 300", siguienteObjetivo: 300 };
    if (puntos >= 100) return { nombre: "Paquete 100", descuento: 30, totalConDescuento: total30, siguientePaquete: "Paquete 200", siguienteObjetivo: 200 };
    return { nombre: "Aún no calificas", descuento: 0, totalConDescuento: 0, siguientePaquete: "Paquete 100", siguienteObjetivo: 100 };
  };

  const paqueteActual = obtenerPaqueteCompraInicial(totalPuntos);

  const obtenerMensajeCompraInicial = () => {
    if (totalPuntos < 100) {
      const faltan = 100 - totalPuntos;
      return {
        texto: `Te faltan ${faltan} puntos para iniciar con el paquete de 100 puntos.`,
        colorFondo: T.red100, colorTexto: T.redText, colorBorde: T.redBorder, colorSemaforo: T.red500,
        siguienteMensaje: `Te faltan ${faltan} puntos para iniciar (${paqueteActual.siguientePaquete}).`,
      };
    }
    if (totalPuntos >= 500) {
      return {
        texto: `Ya alcanzaste el paquete de 500 puntos y el 42% de descuento. ¡Estás en el nivel más alto de compra inicial!`,
        colorFondo: T.green100, colorTexto: T.greenText, colorBorde: T.greenBorder, colorSemaforo: T.green500,
        siguienteMensaje: "Ya estás en el paquete más alto de compra inicial.",
      };
    }
    const faltan = paqueteActual.siguienteObjetivo - totalPuntos;
    return {
      texto: `Ya estás dentro del ${paqueteActual.nombre} con ${paqueteActual.descuento}% de descuento. Te faltan ${faltan} puntos para alcanzar ${paqueteActual.siguientePaquete}.`,
      colorFondo: T.yellow100, colorTexto: T.yellowText, colorBorde: T.yellowBorder, colorSemaforo: T.yellow500,
      siguienteMensaje: `Te faltan ${faltan} puntos para llegar a ${paqueteActual.siguientePaquete}.`,
    };
  };

  // ───── LEALTAD ─────
  const obtenerDescuentoLealtad = (mes) => {
    if (mes <= 1) return 30;
    if (mes <= 3) return 33;
    if (mes <= 5) return 35;
    if (mes <= 11) return 37;
    if (mes <= 17) return 40;
    return 42;
  };

  const descuentoLealtadActual = obtenerDescuentoLealtad(mesLealtad);
  const totalSegunDescuentoLealtad =
    descuentoLealtadActual === 30 ? total30 :
    descuentoLealtadActual === 33 ? total33 :
    descuentoLealtadActual === 35 ? total35 :
    descuentoLealtadActual === 37 ? total37 :
    descuentoLealtadActual === 40 ? total40 : total42;

  const obtenerSiguienteEscalonLealtad = (mes) => {
    if (mes < 2) return { etiqueta: "33%", mesesFaltantes: 2 - mes };
    if (mes < 4) return { etiqueta: "35%", mesesFaltantes: 4 - mes };
    if (mes < 6) return { etiqueta: "37%", mesesFaltantes: 6 - mes };
    if (mes < 12) return { etiqueta: "40%", mesesFaltantes: 12 - mes };
    if (mes < 18) return { etiqueta: "42%", mesesFaltantes: 18 - mes };
    return null;
  };

  const siguienteEscalonLealtad = obtenerSiguienteEscalonLealtad(mesLealtad);

  const obtenerMensajeLealtad = () => {
    const califica100 = totalPuntos >= 100;
    if (!dentroPrimeros15) {
      return {
        texto: "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",
        colorFondo: T.red100, colorTexto: T.redText, colorBorde: T.redBorder, colorSemaforo: T.red500,
        mensajePrincipal: "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",
        mensajeSecundario: califica100
          ? "Aunque cubriste 100 puntos, al no comprar dentro de los primeros 15 días no conservas continuidad."
          : `Además, te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
        continuidad: false,
      };
    }
    if (!califica100) {
      return {
        texto: `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
        colorFondo: T.red100, colorTexto: T.redText, colorBorde: T.redBorder, colorSemaforo: T.red500,
        mensajePrincipal: `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
        mensajeSecundario: "Necesitas mínimo 100 puntos personales en los primeros 15 días para sostener tu avance en Lealtad.",
        continuidad: false,
      };
    }
    if (siguienteEscalonLealtad) {
      const plural = siguienteEscalonLealtad.mesesFaltantes === 1 ? "mes" : "meses";
      return {
        texto: `¡Felicidades! Ya sostienes tu mes ${mesLealtad} en Lealtad con ${descuentoLealtadActual}% de descuento.`,
        colorFondo: T.green100, colorTexto: T.greenText, colorBorde: T.greenBorder, colorSemaforo: T.green500,
        mensajePrincipal: "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",
        mensajeSecundario: `Te faltan ${siguienteEscalonLealtad.mesesFaltantes} ${plural} consecutivos para llegar al ${siguienteEscalonLealtad.etiqueta}.`,
        continuidad: true,
      };
    }
    return {
      texto: `¡Felicidades! Ya estás en el tramo máximo del Programa de Lealtad con ${descuentoLealtadActual}% de descuento.`,
      colorFondo: T.green100, colorTexto: T.greenText, colorBorde: T.greenBorder, colorSemaforo: T.green500,
      mensajePrincipal: "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",
      mensajeSecundario: "Ya te encuentras en el tramo más alto del Programa de Lealtad.",
      continuidad: true,
    };
  };

  // ───── ACELERADO ─────
  const totalAcumuladoAcelerado =
    Number(puntosPersonalesAcelerado || 0) +
    Number(puntosGrupalesAcelerado || 0) +
    Number(acumuladoPrevioAcelerado || 0);

  const obtenerDescuentoAcelerado = (acumulado) => {
    if (acumulado >= 3001) return 42;
    if (acumulado >= 1501) return 40;
    if (acumulado >= 501) return 35;
    if (acumulado >= 1) return 30;
    return 0;
  };

  const descuentoAceleradoActual = obtenerDescuentoAcelerado(totalAcumuladoAcelerado);
  const totalSegunDescuentoAcelerado =
    descuentoAceleradoActual === 30 ? total30 :
    descuentoAceleradoActual === 35 ? total35 :
    descuentoAceleradoActual === 40 ? total40 :
    descuentoAceleradoActual === 42 ? total42 : 0;

  const obtenerSiguienteEscalonAcelerado = (acumulado) => {
    if (acumulado < 501) return { meta: 501, etiqueta: "35%" };
    if (acumulado < 1501) return { meta: 1501, etiqueta: "40%" };
    if (acumulado < 3001) return { meta: 3001, etiqueta: "42%" };
    return null;
  };

  const siguienteEscalonAcelerado = obtenerSiguienteEscalonAcelerado(totalAcumuladoAcelerado);

  const obtenerMensajeAcelerado = () => {
    if (totalAcumuladoAcelerado <= 0) {
      return {
        texto: "Captura puntos personales, grupales y acumulado previo para evaluar tu Lealtad Acelerado.",
        colorFondo: T.red100, colorTexto: T.redText, colorBorde: T.redBorder, colorSemaforo: T.red500,
        mensajePrincipal: "Aún no has capturado puntos suficientes para evaluar el Programa de Lealtad Acelerado.",
        mensajeSecundario: "Ingresa tus puntos personales, grupales y acumulado previo.",
      };
    }
    if (siguienteEscalonAcelerado) {
      const faltan = siguienteEscalonAcelerado.meta - totalAcumuladoAcelerado;
      return {
        texto: `Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y te coloca en ${descuentoAceleradoActual}% dentro del Programa de Lealtad Acelerado.`,
        colorFondo: descuentoAceleradoActual >= 35 ? T.yellow100 : T.red100,
        colorTexto: descuentoAceleradoActual >= 35 ? T.yellowText : T.redText,
        colorBorde: descuentoAceleradoActual >= 35 ? T.yellowBorder : T.redBorder,
        colorSemaforo: descuentoAceleradoActual >= 35 ? T.yellow500 : T.red500,
        mensajePrincipal: `Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y ya estás en ${descuentoAceleradoActual}% de descuento.`,
        mensajeSecundario: `Te faltan ${faltan} puntos acumulados para llegar al ${siguienteEscalonAcelerado.etiqueta}.`,
      };
    }
    return {
      texto: `¡Felicidades! Ya alcanzaste ${totalAcumuladoAcelerado} puntos acumulados y entras al 42% en Lealtad Acelerado.`,
      colorFondo: T.green100, colorTexto: T.greenText, colorBorde: T.greenBorder, colorSemaforo: T.green500,
      mensajePrincipal: "¡Felicidades! Ya alcanzaste el tramo máximo del Programa de Lealtad Acelerado.",
      mensajeSecundario: "Ya estás en 42% de descuento por acumulado.",
    };
  };

  // ───── CLIENTE PREFERENTE ─────
  const puntosAcumuladosClientePreferente =
    Number(acumuladoPrevioClientePreferente || 0) + Number(totalPuntos || 0);

  const obtenerDescuentoClientePreferente = (puntos) => {
    if (puntos >= 650) return 20;
    if (puntos >= 150) return 15;
    return 10;
  };

  const descuentoClientePreferenteActual = obtenerDescuentoClientePreferente(puntosAcumuladosClientePreferente);
  const totalSegunDescuentoClientePreferente =
    descuentoClientePreferenteActual === 10 ? total10 :
    descuentoClientePreferenteActual === 15 ? total15 : total20;

  const obtenerSiguienteNivelClientePreferente = (puntos) => {
    if (puntos < 150) return { meta: 150, etiqueta: "15%" };
    if (puntos < 650) return { meta: 650, etiqueta: "20%" };
    return null;
  };

  const siguienteNivelClientePreferente = obtenerSiguienteNivelClientePreferente(puntosAcumuladosClientePreferente);

  const obtenerMensajeClientePreferente = () => {
    if (puntosAcumuladosClientePreferente < 150) {
      const faltan = 150 - puntosAcumuladosClientePreferente;
      return {
        texto: `Actualmente estás en 10% de descuento. Te faltan ${faltan} puntos acumulados para llegar al 15%.`,
        colorFondo: T.red100, colorTexto: T.redText, colorBorde: T.redBorder, colorSemaforo: T.red500,
        mensajePrincipal: "Tu descuento actual como Cliente Preferente es 10%.",
        mensajeSecundario: `Te faltan ${faltan} puntos acumulados para llegar al 15%.`,
      };
    }
    if (puntosAcumuladosClientePreferente < 650) {
      const faltan = 650 - puntosAcumuladosClientePreferente;
      return {
        texto: `Actualmente estás en 15% de descuento. Te faltan ${faltan} puntos acumulados para llegar al 20%.`,
        colorFondo: T.yellow100, colorTexto: T.yellowText, colorBorde: T.yellowBorder, colorSemaforo: T.yellow500,
        mensajePrincipal: "Tu descuento actual como Cliente Preferente es 15%.",
        mensajeSecundario: `Te faltan ${faltan} puntos acumulados para llegar al 20%.`,
      };
    }
    return {
      texto: "¡Felicidades! Ya alcanzaste el 20% de descuento como Cliente Preferente.",
      colorFondo: T.green100, colorTexto: T.greenText, colorBorde: T.greenBorder, colorSemaforo: T.green500,
      mensajePrincipal: "Tu descuento actual como Cliente Preferente es 20%.",
      mensajeSecundario: "Ya estás en el nivel máximo de Cliente Preferente.",
    };
  };

  // ───── ESTADO GENERAL ─────
  const estado =
    perfilUsuario === "clientePreferente"
      ? obtenerMensajeClientePreferente()
      : modo === "compraInicial"
        ? obtenerMensajeCompraInicial()
        : programaRecompra === "lealtad"
          ? obtenerMensajeLealtad()
          : obtenerMensajeAcelerado();

  const formatoMoneda = (numero) =>
    Number(numero || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const obtenerPrecioActualPorPerfil = (item) => {
    if (perfilUsuario === "clientePreferente") {
      if (descuentoClientePreferenteActual === 10) return item.precioCP10 !== undefined ? item.precioCP10 : item.precioPublico * 0.9;
      if (descuentoClientePreferenteActual === 15) return item.precioPublico * 0.85;
      return item.precio20 !== undefined ? item.precio20 : item.precioPublico * 0.8;
    }
    if (modo === "compraInicial") {
      if (paqueteActual.descuento === 30) return item.precio30;
      if (paqueteActual.descuento === 33) return item.precio33;
      if (paqueteActual.descuento === 42) return item.precio42;
      return item.precioPublico;
    }
    if (programaRecompra === "lealtad") {
      if (descuentoLealtadActual === 30) return item.precio30;
      if (descuentoLealtadActual === 33) return item.precio33;
      if (descuentoLealtadActual === 35) return item.precio35;
      if (descuentoLealtadActual === 37) return item.precio37;
      if (descuentoLealtadActual === 40) return item.precio40;
      return item.precio42;
    }
    if (descuentoAceleradoActual === 30) return item.precio30;
    if (descuentoAceleradoActual === 35) return item.precio35;
    if (descuentoAceleradoActual === 40) return item.precio40;
    if (descuentoAceleradoActual === 42) return item.precio42;
    return item.precioPublico;
  };

  const obtenerTotalPedidoActual = (item) => {
    if (perfilUsuario === "clientePreferente") {
      if (descuentoClientePreferenteActual === 10) return item.subtotal10;
      if (descuentoClientePreferenteActual === 15) return item.subtotal15;
      return item.subtotal20;
    }
    if (modo === "compraInicial") {
      if (paqueteActual.descuento === 30) return item.subtotal30;
      if (paqueteActual.descuento === 33) return item.subtotal33;
      if (paqueteActual.descuento === 42) return item.subtotal42;
      return 0;
    }
    if (programaRecompra === "lealtad") {
      if (descuentoLealtadActual === 30) return item.subtotal30;
      if (descuentoLealtadActual === 33) return item.subtotal33;
      if (descuentoLealtadActual === 35) return item.subtotal35;
      if (descuentoLealtadActual === 37) return item.subtotal37;
      if (descuentoLealtadActual === 40) return item.subtotal40;
      return item.subtotal42;
    }
    if (descuentoAceleradoActual === 30) return item.subtotal30;
    if (descuentoAceleradoActual === 35) return item.subtotal35;
    if (descuentoAceleradoActual === 40) return item.subtotal40;
    if (descuentoAceleradoActual === 42) return item.subtotal42;
    return 0;
  };

  const obtenerDescuentoActualGeneral = () => {
    if (perfilUsuario === "clientePreferente") return descuentoClientePreferenteActual;
    if (modo === "compraInicial") return paqueteActual.descuento;
    if (programaRecompra === "lealtad") return descuentoLealtadActual;
    return descuentoAceleradoActual;
  };

  const obtenerTotalConDescuentoGeneral = () => {
    if (perfilUsuario === "clientePreferente") return totalSegunDescuentoClientePreferente;
    if (modo === "compraInicial") return paqueteActual.totalConDescuento;
    if (programaRecompra === "lealtad") return totalSegunDescuentoLealtad;
    return totalSegunDescuentoAcelerado;
  };

  // ───── PDF GENERATION ─────
  const descargarPDFPedido = () => {
    if (productosSeleccionados.length === 0) {
      alert("Primero captura al menos un producto con unidades mayores a 0.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const fechaActual = new Date().toLocaleString("es-MX");
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, 842, 84, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("BodyLogic - Resumen de pedido", 40, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    let textoModo = "";
    if (perfilUsuario === "clientePreferente") {
      textoModo = `Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}`;
    } else if (modo === "compraInicial") {
      textoModo = `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    } else if (programaRecompra === "lealtad") {
      textoModo = `Recompra mensual | Programa de Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;
    } else {
      textoModo = `Recompra mensual | Lealtad Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
    }

    doc.text(textoModo, 40, 60);
    doc.setTextColor(80, 80, 80);
    doc.text(`Fecha: ${fechaActual}`, 40, 108);
    doc.text(`Estado del pedido: ${estado.texto}`, 40, 124);

    const descuentoActualPDF = obtenerDescuentoActualGeneral();
    const body = productosSeleccionados.map((item) => [
      item.producto,
      String(item.unidades),
      String(item.subtotalPuntos),
      formatoMoneda(item.subtotalPrecioPublico),
      formatoMoneda(obtenerTotalPedidoActual(item)),
    ]);

    autoTable(doc, {
      startY: 145,
      head: [["Producto", "Unidades", "Subtotal puntos", "Subtotal precio público", `Subtotal ${descuentoActualPDF}%`]],
      body,
      theme: "grid",
      headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      styles: { fontSize: 9, cellPadding: 6, textColor: [40, 40, 40], valign: "middle" },
      alternateRowStyles: { fillColor: [255, 250, 245] },
      margin: { left: 40, right: 40 },
    });

    const finalY = doc.lastAutoTable.finalY + 22;
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(1);
    doc.line(40, finalY, 802, finalY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(124, 45, 18);
    doc.text(`Total de unidades: ${totalUnidades}`, 40, finalY + 22);
    doc.text(`Total de puntos: ${totalPuntos}`, 190, finalY + 22);
    doc.text(`Total precio público: ${formatoMoneda(totalPrecioPublico)}`, 330, finalY + 22);
    doc.text(`Total con descuento: ${formatoMoneda(obtenerTotalConDescuentoGeneral())}`, 40, finalY + 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.", 40, finalY + 70);
    doc.save("Resumen-Pedido-BodyLogic.pdf");
  };

  const imprimirFormulario = () => {
    if (productosSeleccionados.length === 0) {
      alert("Primero captura al menos un producto con unidades mayores a 0.");
      return;
    }
    const filasHTML = productosSeleccionados.map((item) => `
      <tr>
        <td>${item.producto}</td>
        <td style="text-align:center;">${item.unidades}</td>
        <td style="text-align:center;">${item.subtotalPuntos}</td>
        <td style="text-align:right;">${formatoMoneda(item.subtotalPrecioPublico)}</td>
        <td style="text-align:right;">${formatoMoneda(obtenerTotalPedidoActual(item))}</td>
      </tr>
    `).join("");

    const ventana = window.open("", "_blank", "width=1200,height=900");
    if (!ventana) {
      alert("Tu navegador bloqueó la ventana de impresión. Permite pop-ups e inténtalo de nuevo.");
      return;
    }
    const descuentoActualImpresion = obtenerDescuentoActualGeneral();
    let subtituloImpresion = "";
    if (perfilUsuario === "clientePreferente") {
      subtituloImpresion = `Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}`;
    } else if (modo === "compraInicial") {
      subtituloImpresion = `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    } else if (programaRecompra === "lealtad") {
      subtituloImpresion = `Recompra mensual | Programa de Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;
    } else {
      subtituloImpresion = `Recompra mensual | Lealtad Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
    }

    ventana.document.write(`
      <html><head><title>Formulario de compra BodyLogic</title>
      <style>
        body { font-family: 'DM Sans', Arial, sans-serif; margin: 30px; color: #222; }
        .encabezado { background: linear-gradient(135deg, #c2410c, #fb923c); color: white; padding: 18px 22px; border-radius: 16px; margin-bottom: 24px; }
        h1 { margin: 0 0 6px 0; font-size: 26px; }
        .sub { font-size: 13px; opacity: 0.95; }
        .meta { margin: 14px 0 20px 0; font-size: 13px; line-height: 1.7; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        th { background: #ea580c; color: white; padding: 10px; border: 1px solid #d6d3d1; font-size: 13px; }
        td { border: 1px solid #e5e7eb; padding: 10px; font-size: 13px; }
        tr:nth-child(even) { background: #fffaf5; }
        .totales { margin-top: 24px; padding: 16px; border: 1px solid #fdba74; border-radius: 14px; background: #fff7ed; line-height: 1.8; font-size: 14px; }
        .firma { margin-top: 40px; font-size: 12px; color: #666; }
      </style></head><body>
        <div class="encabezado"><h1>BodyLogic - Formulario de compra</h1><div class="sub">${subtituloImpresion}</div></div>
        <div class="meta"><div><strong>Fecha:</strong> ${new Date().toLocaleString("es-MX")}</div><div><strong>Estado del pedido:</strong> ${estado.texto}</div></div>
        <table><thead><tr><th>Producto</th><th>Unidades</th><th>Subtotal puntos</th><th>Subtotal precio público</th><th>Subtotal con ${descuentoActualImpresion}%</th></tr></thead><tbody>${filasHTML}</tbody></table>
        <div class="totales"><div><strong>Total de unidades:</strong> ${totalUnidades}</div><div><strong>Total de puntos:</strong> ${totalPuntos}</div><div><strong>Total precio público:</strong> ${formatoMoneda(totalPrecioPublico)}</div><div><strong>Total con descuento:</strong> ${formatoMoneda(obtenerTotalConDescuentoGeneral())}</div></div>
        <div class="firma">Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.</div>
        <script>window.onload = function() { window.print(); };</script>
      </body></html>
    `);
    ventana.document.close();
  };

  const telefonoCentroServicio = "8007024840";

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  const isDistribuidor = perfilUsuario === "distribuidor";
  const isCP = perfilUsuario === "clientePreferente";
  const descuentoActual = obtenerDescuentoActualGeneral();
  const totalConDescuento = obtenerTotalConDescuentoGeneral();

  return (
    <div style={styles.pagina}>
      {/* Ambient glow elements */}
      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />

      <div style={styles.contenedor}>
        {/* ════════════ HERO ════════════ */}
        <header className="bl-fade-in" style={styles.hero}>
          <div style={styles.heroOverlay}>
            <div style={styles.heroContent}>
              <Badge style={{ backgroundColor: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.24)" }}>
                Plataforma de Apoyo Comercial
              </Badge>
              <h1 style={styles.heroTitle}>BodyLogic</h1>
              <p style={styles.heroText}>
                Centro avanzado de cálculo de puntos, validación comercial, documentos oficiales y gestión operativa para asociados.
              </p>
              <div style={styles.heroAuthor}>
                Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.
              </div>
            </div>
          </div>
        </header>

        {/* ════════════ PANEL DE CONTROL ════════════ */}
        <SectionCard className="bl-fade-in bl-fade-in-delay-1">
          <div style={{ marginBottom: "20px" }}>
            <h2 style={styles.sectionTitle}>Panel de control</h2>
            <p style={styles.sectionSub}>Selecciona tu perfil, configura el modo de compra y filtra productos.</p>
          </div>

          <div style={styles.grid}>
            {/* Perfil */}
            <div style={styles.controlCard}>
              <label style={styles.label}>Perfil de usuario</label>
              <select value={perfilUsuario} onChange={(e) => setPerfilUsuario(e.target.value)} style={styles.select}>
                <option value="distribuidor">Distribuidor Independiente</option>
                <option value="clientePreferente">Cliente Preferente</option>
              </select>
            </div>

            {/* Categoría */}
            <div style={styles.controlCard}>
              <label style={styles.label}>Filtrar por categoría</label>
              <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} style={styles.select}>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div style={styles.controlCard}>
              <label style={styles.label}>Buscar producto o código</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej. Omega 3, B-Coffee, 4045156..."
                  style={{ ...styles.input, paddingLeft: "38px" }}
                />
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", opacity: 0.4 }}>
                  🔍
                </span>
              </div>
            </div>

            {/* Profile info card */}
            <div style={styles.infoCard}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: T.orange700, wordBreak: "break-word" }}>
                {isDistribuidor ? "Distribuidor" : "Cliente Preferente"}
              </div>
              <div style={{ marginTop: "6px", color: T.textMuted, fontSize: "13px" }}>
                {isDistribuidor ? "Flujo completo de ingreso y recompra" : "Flujo simplificado con descuento progresivo"}
              </div>
            </div>
          </div>

          {/* ─── Distribuidor mode buttons ─── */}
          {isDistribuidor ? (
            <>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "18px 0" }}>
                <button onClick={() => setModo("compraInicial")} style={modo === "compraInicial" ? styles.btnActive : styles.btn}>
                  Compra inicial
                </button>
                <button onClick={() => setModo("recompraMensual")} style={modo === "recompraMensual" ? styles.btnActive : styles.btn}>
                  Recompra mensual
                </button>
                <button onClick={limpiarCantidades} style={styles.btnGhost}>
                  Limpiar cantidades
                </button>
              </div>

              <div style={styles.grid}>
                {modo === "compraInicial" ? (
                  <div style={styles.infoCard}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: T.orange700 }}>{paqueteActual.nombre}</div>
                    <div style={{ marginTop: "6px", color: T.textMuted, fontSize: "13px" }}>Paquete detectado automáticamente</div>
                    {paqueteActual.siguienteObjetivo && (
                      <ProgressBar
                        current={totalPuntos}
                        target={paqueteActual.siguienteObjetivo}
                        label={`${totalPuntos} / ${paqueteActual.siguienteObjetivo} pts → ${paqueteActual.siguientePaquete}`}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div style={styles.controlCard}>
                      <label style={styles.label}>Programa de recompra</label>
                      <select value={programaRecompra} onChange={(e) => setProgramaRecompra(e.target.value)} style={styles.select}>
                        <option value="lealtad">Programa de Lealtad</option>
                        <option value="acelerado">Lealtad Acelerado</option>
                      </select>
                    </div>

                    {programaRecompra === "lealtad" ? (
                      <>
                        <div style={styles.controlCard}>
                          <label style={styles.label}>Mes actual del programa</label>
                          <select value={mesLealtad} onChange={(e) => setMesLealtad(Number(e.target.value))} style={styles.select}>
                            {Array.from({ length: 18 }, (_, i) => i + 1).map((mes) => (
                              <option key={mes} value={mes}>{mes === 18 ? "Mes 18 o más" : `Mes ${mes}`}</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.controlCard}>
                          <label style={styles.label}>¿Compras dentro de los primeros 15 días?</label>
                          <select value={dentroPrimeros15 ? "si" : "no"} onChange={(e) => setDentroPrimeros15(e.target.value === "si")} style={styles.select}>
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={styles.controlCard}>
                          <label style={styles.label}>Puntos personales del periodo</label>
                          <input type="number" min="0" value={puntosPersonalesAcelerado} onChange={(e) => setPuntosPersonalesAcelerado(Number(e.target.value || 0))} style={styles.input} />
                        </div>
                        <div style={styles.controlCard}>
                          <label style={styles.label}>Puntos grupales del periodo</label>
                          <input type="number" min="0" value={puntosGrupalesAcelerado} onChange={(e) => setPuntosGrupalesAcelerado(Number(e.target.value || 0))} style={styles.input} />
                        </div>
                        <div style={styles.controlCard}>
                          <label style={styles.label}>Acumulado previo</label>
                          <input type="number" min="0" value={acumuladoPrevioAcelerado} onChange={(e) => setAcumuladoPrevioAcelerado(Number(e.target.value || 0))} style={styles.input} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            /* ─── Cliente Preferente controls ─── */
            <>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "18px 0" }}>
                <button onClick={limpiarCantidades} style={styles.btnGhost}>Limpiar cantidades</button>
              </div>

              <div style={styles.grid}>
                <div style={styles.controlCard}>
                  <label style={styles.label}>Puntos acumulados previos</label>
                  <input type="number" min="0" value={acumuladoPrevioClientePreferente} onChange={(e) => setAcumuladoPrevioClientePreferente(Number(e.target.value || 0))} style={styles.input} />
                </div>

                <div style={styles.infoCard}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: T.orange600, fontFamily: T.fontDisplay }}>{descuentoClientePreferenteActual}%</div>
                  <div style={{ marginTop: "4px", color: T.textMuted, fontSize: "13px" }}>Descuento actual</div>
                </div>

                <div style={styles.infoCard}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: T.orange600, fontFamily: T.fontDisplay }}>{puntosAcumuladosClientePreferente}</div>
                  <div style={{ marginTop: "4px", color: T.textMuted, fontSize: "13px" }}>Puntos acumulados totales</div>
                  {siguienteNivelClientePreferente && (
                    <ProgressBar
                      current={puntosAcumuladosClientePreferente}
                      target={siguienteNivelClientePreferente.meta}
                      label={`${puntosAcumuladosClientePreferente} / ${siguienteNivelClientePreferente.meta} pts → ${siguienteNivelClientePreferente.etiqueta}`}
                    />
                  )}
                </div>

                <div style={styles.infoCard}>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: T.orange700 }}>
                    {siguienteNivelClientePreferente
                      ? `${siguienteNivelClientePreferente.meta - puntosAcumuladosClientePreferente} pts`
                      : "Nivel máximo"}
                  </div>
                  <div style={{ marginTop: "6px", color: T.textMuted, fontSize: "13px" }}>
                    {siguienteNivelClientePreferente
                      ? `Te faltan para llegar al ${siguienteNivelClientePreferente.etiqueta}`
                      : "Ya alcanzaste el 20%"}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile view toggle */}
          {esMovil && (
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setVistaMovil("cards")} style={vistaMovil === "cards" ? styles.btnActive : styles.btn}>
                Tarjetas
              </button>
              <button onClick={() => setVistaMovil("tabla")} style={vistaMovil === "tabla" ? styles.btnActive : styles.btn}>
                Tabla
              </button>
            </div>
          )}
        </SectionCard>

        {/* ════════════ SEMÁFORO ════════════ */}
        <section
          className="bl-fade-in bl-fade-in-delay-2"
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            borderRadius: T.radius.xl,
            padding: "20px 24px",
            marginBottom: "20px",
            backgroundColor: estado.colorFondo,
            border: `2px solid ${estado.colorBorde}`,
            boxShadow: T.shadow.md,
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: estado.colorSemaforo,
              boxShadow: `0 0 0 6px ${estado.colorFondo}, 0 0 12px ${estado.colorSemaforo}40`,
              animation: "blPulse 2s ease-in-out infinite",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: estado.colorTexto, lineHeight: 1.3 }}>
              {isCP ? "Lectura de Cliente Preferente"
                : modo === "compraInicial" ? "Lectura automática de compra inicial"
                : programaRecompra === "lealtad" ? "Lectura de recompra mensual — Lealtad"
                : "Lectura de recompra mensual — Lealtad Acelerado"}
            </div>
            <div style={{ marginTop: "4px", lineHeight: 1.5, color: estado.colorTexto, fontSize: "14px" }}>
              {estado.texto}
            </div>
          </div>
        </section>

        {/* ════════════ PEDIDO ACTUAL ════════════ */}
        <SectionCard className="bl-fade-in bl-fade-in-delay-3" style={{ }} >
          <div id="pedido-actual" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={styles.sectionTitle}>Pedido actual</h2>
                <p style={styles.sectionSub}>Aquí aparecen únicamente los productos que ya capturaste.</p>
              </div>
              {productosSeleccionados.length > 0 && (
                <button onClick={vaciarPedidoActual} style={styles.btnDanger}>
                  Vaciar todo el pedido
                </button>
              )}
            </div>
          </div>

          {productosSeleccionados.length === 0 ? (
            <div style={{
              padding: "24px",
              borderRadius: T.radius.lg,
              backgroundColor: T.cream100,
              border: `2px dashed ${T.cream700}`,
              color: T.textMuted,
              textAlign: "center",
              fontSize: "15px",
            }}>
              Aún no has agregado productos al pedido.
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "10px",
                marginBottom: "16px",
              }}>
                <MiniDato label="Total unidades" value={totalUnidades} highlight />
                <MiniDato label="Total puntos" value={totalPuntos} highlight />
                <MiniDato label="Precio público" value={formatoMoneda(totalPrecioPublico)} />
                <MiniDato label={`Total con ${descuentoActual}%`} value={formatoMoneda(totalConDescuento)} highlight />
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                {productosSeleccionados.map((item) => (
                  <div key={item.codigo} className="bl-card-hover" style={{
                    background: `linear-gradient(135deg, ${T.cream100} 0%, ${T.cream200} 100%)`,
                    border: `1px solid ${T.cream500}`,
                    borderRadius: T.radius.lg,
                    padding: "16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                      <div>
                        <Badge>{item.codigo}</Badge>
                        <div style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: T.textDark, lineHeight: 1.3 }}>{item.producto}</div>
                        <div style={{ marginTop: "2px", fontSize: "12px", color: T.textMuted }}>{item.contenido}</div>
                      </div>
                      <button onClick={() => eliminarProducto(item.codigo)} style={styles.btnDangerSmall}>Quitar</button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                      <button onClick={() => decrementarProducto(item.codigo)} style={styles.btnQty}>−</button>
                      <input
                        type="number"
                        min="0"
                        value={item.unidades}
                        onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
                        style={styles.inputQty}
                      />
                      <button onClick={() => incrementarProducto(item.codigo)} style={styles.btnQty}>+</button>
                    </div>

                    <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                      <MiniDato label="Subtotal puntos" value={item.subtotalPuntos} />
                      <MiniDato label="Público" value={formatoMoneda(item.subtotalPrecioPublico)} />
                      <MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(obtenerTotalPedidoActual(item))} highlight />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        {/* ════════════ TABLA MAESTRA ════════════ */}
        <SectionCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div>
              <h2 style={styles.sectionTitle}>Tabla maestra de productos</h2>
              <p style={styles.sectionSub}>
                Mostrando <strong>{filasCalculadas.length}</strong> producto(s)
                {categoriaSeleccionada !== "TODAS" ? ` en "${categoriaSeleccionada}".` : " en todas las categorías."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={descargarPDFPedido} style={styles.btnAccent}>Descargar PDF</button>
              <button onClick={imprimirFormulario} style={styles.btn}>Imprimir formulario</button>
            </div>
          </div>

          {esMovil && vistaMovil === "cards" ? (
            /* ─── Mobile card view ─── */
            <div style={{ display: "grid", gap: "12px" }}>
              {filasCalculadas.map((item) => {
                const activa = filaActiva === item.codigo;
                return (
                  <div
                    key={item.codigo}
                    ref={(el) => { productRefs.current[item.codigo] = el; }}
                    className="bl-card-hover"
                    onClick={() => setFilaActiva(item.codigo)}
                    style={{
                      background: item.unidades > 0
                        ? `linear-gradient(135deg, ${T.orange50} 0%, ${T.orange100} 100%)`
                        : `linear-gradient(135deg, ${T.cream100} 0%, ${T.cream200} 100%)`,
                      border: activa ? `2px solid ${T.orange500}` : `1px solid ${T.cream500}`,
                      borderRadius: T.radius.lg,
                      padding: "16px",
                      boxShadow: activa ? T.shadow.glow : T.shadow.sm,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                      <div>
                        <Badge>{item.codigo}</Badge>
                        <div style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: T.textDark, lineHeight: 1.3 }}>
                          {item.producto}
                        </div>
                        <div style={{ marginTop: "2px", fontSize: "12px", color: T.textMuted }}>{item.contenido}</div>
                      </div>
                      <Badge style={{ backgroundColor: T.cream400, color: T.orange800, fontSize: "10px" }}>
                        {item.categoria}
                      </Badge>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, color: T.textDark }}>Unidades</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unidades}
                        onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
                        onFocus={() => setFilaActiva(item.codigo)}
                        style={styles.input}
                      />
                    </div>

                    <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <MiniDato label="Puntos unit." value={item.puntos} />
                      <MiniDato label="Subtotal pts" value={item.subtotalPuntos} />
                      <MiniDato label="Público" value={formatoMoneda(item.subtotalPrecioPublico)} />
                      <MiniDato label={`Con ${descuentoActual}%`} value={formatoMoneda(obtenerTotalPedidoActual(item))} highlight />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isCP ? (
            /* ─── CP table ─── */
            <div ref={tablaWrapperRef} style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Categoría", "Código", "Producto", "Contenido", "Uds.", "Puntos", "Sub. pts", "P. público", "Sub. público", "P. descuento", "Sub. descuento"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filasCalculadas.map((item, idx) => {
                    const activa = filaActiva === item.codigo;
                    return (
                      <tr
                        key={item.codigo}
                        ref={(el) => { productRefs.current[item.codigo] = el; }}
                        onClick={() => setFilaActiva(item.codigo)}
                        style={{
                          backgroundColor: activa ? T.orange200 : item.unidades > 0 ? T.cream300 : idx % 2 === 0 ? T.white : T.cream100,
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                      >
                        <td style={styles.td}>{item.categoria}</td>
                        <td style={styles.td}>{item.codigo}</td>
                        <td style={{ ...styles.td, color: T.textDark, fontWeight: 600 }}>{item.producto}</td>
                        <td style={styles.td}>{item.contenido}</td>
                        <td style={styles.td}>
                          <input type="number" min="0" value={item.unidades} onChange={(e) => cambiarCantidad(item.codigo, e.target.value)} onFocus={() => setFilaActiva(item.codigo)} style={styles.inputTable} />
                        </td>
                        <td style={styles.td}>{item.puntos}</td>
                        <td style={styles.td}>{item.subtotalPuntos}</td>
                        <td style={styles.td}>{formatoMoneda(item.precioPublico)}</td>
                        <td style={styles.td}>{formatoMoneda(item.subtotalPrecioPublico)}</td>
                        <td style={styles.td}>{formatoMoneda(obtenerPrecioActualPorPerfil(item))}</td>
                        <td style={styles.td}>{formatoMoneda(obtenerTotalPedidoActual(item))}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: `linear-gradient(180deg, ${T.cream100}, ${T.cream300})` }}>
                    <td style={styles.tdTotal}></td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>TOTAL GENERAL</td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>{totalUnidades}</td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700, backgroundColor: estado.colorFondo, color: estado.colorTexto, border: `2px solid ${estado.colorBorde}`, borderRadius: "8px" }}>
                      {totalPuntos}
                    </td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>{formatoMoneda(totalPrecioPublico)}</td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>{formatoMoneda(totalSegunDescuentoClientePreferente)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* ─── Distribuidor table ─── */
            <div ref={tablaWrapperRef} style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Categoría", "Código", "Producto", "Contenido", "Uds.", "Puntos", "Sub. pts", "P. público", "Sub. público", "V. comisionable", "Sub. comisionable"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filasCalculadas.map((item, idx) => {
                    const activa = filaActiva === item.codigo;
                    return (
                      <tr
                        key={item.codigo}
                        ref={(el) => { productRefs.current[item.codigo] = el; }}
                        onClick={() => setFilaActiva(item.codigo)}
                        style={{
                          backgroundColor: activa ? T.orange200 : item.unidades > 0 ? T.cream300 : idx % 2 === 0 ? T.white : T.cream100,
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                      >
                        <td style={styles.td}>{item.categoria}</td>
                        <td style={styles.td}>{item.codigo}</td>
                        <td style={{ ...styles.td, color: T.textDark, fontWeight: 600 }}>{item.producto}</td>
                        <td style={styles.td}>{item.contenido}</td>
                        <td style={styles.td}>
                          <input type="number" min="0" value={item.unidades} onChange={(e) => cambiarCantidad(item.codigo, e.target.value)} onFocus={() => setFilaActiva(item.codigo)} style={styles.inputTable} />
                        </td>
                        <td style={styles.td}>{item.puntos}</td>
                        <td style={styles.td}>{item.subtotalPuntos}</td>
                        <td style={styles.td}>{formatoMoneda(item.precioPublico)}</td>
                        <td style={styles.td}>{formatoMoneda(item.subtotalPrecioPublico)}</td>
                        <td style={styles.td}>{formatoMoneda(item.valorComisionable)}</td>
                        <td style={styles.td}>{formatoMoneda(item.subtotalValorComisionable)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: `linear-gradient(180deg, ${T.cream100}, ${T.cream300})` }}>
                    <td style={styles.tdTotal}></td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>TOTAL GENERAL</td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>{totalUnidades}</td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700, backgroundColor: estado.colorFondo, color: estado.colorTexto, border: `2px solid ${estado.colorBorde}`, borderRadius: "8px" }}>
                      {totalPuntos}
                    </td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>{formatoMoneda(totalPrecioPublico)}</td>
                    <td style={styles.tdTotal}></td>
                    <td style={{ ...styles.tdTotal, fontWeight: 700 }}>{formatoMoneda(totalValorComisionable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* ════════════ INFORMACIÓN ════════════ */}
        <SectionCard>
          <h2 style={styles.sectionTitle}>3 formas de adquirir producto</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginTop: "16px" }}>
            <div className="bl-card-hover" style={{ ...styles.miniPanel, background: `linear-gradient(135deg, ${T.orange50}, ${T.orange100})`, border: `1px solid ${T.orange300}` }}>
              <Badge>Web</Badge>
              <h3 style={{ margin: "10px 0 6px", color: T.textDark, fontSize: "17px" }}>Sitio web</h3>
              <p style={{ margin: 0, color: T.textMuted, lineHeight: 1.5, fontSize: "14px" }}>Ingresa directamente a:</p>
              <a href="https://www.bodylogicglobal.com" target="_blank" rel="noreferrer"
                style={{ display: "inline-block", marginTop: "10px", color: T.orange600, fontWeight: 700, textDecoration: "none", padding: "10px 14px", borderRadius: T.radius.md, backgroundColor: T.white, border: `1px solid ${T.cream700}` }}>
                www.bodylogicglobal.com ↗
              </a>
            </div>

            <div className="bl-card-hover" style={styles.miniPanel}>
              <Badge>Teléfono</Badge>
              <h3 style={{ margin: "10px 0 6px", color: T.textDark, fontSize: "17px" }}>Centro de servicio</h3>
              <a href={`tel:${telefonoCentroServicio}`} style={{ display: "inline-block", color: T.orange600, fontWeight: 700, textDecoration: "none", fontSize: "18px" }}>
                800 702 4840
              </a>
              <p style={{ margin: "6px 0 0", color: T.textMuted, lineHeight: 1.5, fontSize: "13px" }}>Lunes a viernes 8:00 – 20:00 hrs.</p>
              <p style={{ margin: "2px 0 0", color: T.textMuted, lineHeight: 1.5, fontSize: "13px" }}>Sábados 9:00 – 14:00 hrs.</p>
            </div>

            <div className="bl-card-hover" style={styles.miniPanel}>
              <Badge>Presencial</Badge>
              <h3 style={{ margin: "10px 0 6px", color: T.textDark, fontSize: "17px" }}>CAD</h3>
              <p style={{ margin: 0, color: T.textMuted, lineHeight: 1.5, fontSize: "14px" }}>Adquiere tus productos en tu CAD más cercano.</p>
            </div>
          </div>
        </SectionCard>

        {/* ════════════ LEYENDAS ════════════ */}
        <SectionCard style={{ background: `linear-gradient(180deg, ${T.orange50}, ${T.cream200})`, border: `1px solid ${T.cream700}` }}>
          <h2 style={styles.sectionTitle}>Leyendas importantes</h2>
          <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
            {[
              "Los puntos mostrados corresponden al valor en puntos de cada producto.",
              isDistribuidor && "El valor comisionable corresponde al 89% del precio con descuento sin IVA.",
              "Las herramientas de negocio no generan puntos ni valor comisionable.",
              "La información debe validarse siempre con la lista vigente de la empresa.",
            ].filter(Boolean).map((text, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: T.radius.md, backgroundColor: "rgba(255,255,255,0.70)", border: `1px solid ${T.orange200}`, color: T.orange700, lineHeight: 1.6, fontSize: "14px" }}>
                {text}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ════════════ DOCUMENTOS ════════════ */}
        <SectionCard>
          <h2 style={styles.sectionTitle}>Documentos importantes</h2>
          <p style={styles.sectionSub}>
            {isCP ? "Solo se muestran los documentos más útiles para Cliente Preferente." : "Descarga los archivos oficiales desde la misma plataforma."}
          </p>
          <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
            {documentosVisibles.map((doc) => {
              const estaDescargando = descargandoArchivo === doc.archivo;
              return (
                <div key={doc.archivo} className="bl-card-hover" style={styles.miniPanel}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "24px" }}>{doc.icono}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "16px", color: T.textDark }}>{doc.nombre}</div>
                      <div style={{ marginTop: "4px", color: T.textMuted, lineHeight: 1.5, fontSize: "13px" }}>{doc.descripcion}</div>
                      <div style={{ marginTop: "4px", color: T.orange500, fontSize: "12px" }}>{doc.archivo}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => descargarArchivoRobusto(doc.archivo, doc.nombre)}
                    disabled={estaDescargando}
                    style={{ ...styles.btnAccent, marginTop: "12px", opacity: estaDescargando ? 0.6 : 1 }}
                  >
                    {estaDescargando ? "Descargando..." : doc.tipo === "membresia" ? "Descargar y rellenar" : "Descargar PDF"}
                  </button>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ════════════ RESUMEN FLOTANTE MÓVIL ════════════ */}
        {esMovil && (
          <div style={{
            position: "fixed",
            left: "10px",
            right: "10px",
            bottom: "10px",
            zIndex: 999,
            borderRadius: T.radius.lg,
            padding: "14px",
            backgroundColor: estado.colorFondo,
            border: `1.5px solid ${estado.colorBorde}`,
            boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
            backdropFilter: "blur(12px)",
            color: estado.colorTexto,
          }}>
            {/* Always visible row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                {isCP ? (
                  <>
                    <FloatStat label="Perfil" value="CP" color={estado.colorTexto} />
                    <FloatStat label="Acum." value={puntosAcumuladosClientePreferente} color={estado.colorTexto} />
                    <FloatStat label="Desc." value={`${descuentoClientePreferenteActual}%`} color={estado.colorTexto} />
                  </>
                ) : modo === "compraInicial" ? (
                  <>
                    <FloatStat label="Puntos" value={totalPuntos} color={estado.colorTexto} large />
                    <FloatStat label="Paquete" value={paqueteActual.nombre.replace("Paquete ", "P")} color={estado.colorTexto} />
                    <FloatStat label="Desc." value={`${paqueteActual.descuento}%`} color={estado.colorTexto} />
                  </>
                ) : programaRecompra === "lealtad" ? (
                  <>
                    <FloatStat label="Programa" value="Lealtad" color={estado.colorTexto} />
                    <FloatStat label="Mes" value={mesLealtad} color={estado.colorTexto} large />
                    <FloatStat label="Desc." value={`${descuentoLealtadActual}%`} color={estado.colorTexto} />
                  </>
                ) : (
                  <>
                    <FloatStat label="Programa" value="Acelerado" color={estado.colorTexto} />
                    <FloatStat label="Acum." value={totalAcumuladoAcelerado} color={estado.colorTexto} large />
                    <FloatStat label="Desc." value={`${descuentoAceleradoActual}%`} color={estado.colorTexto} />
                  </>
                )}
              </div>
              <button
                onClick={() => setResumenContraido(!resumenContraido)}
                style={{
                  padding: "10px 12px",
                  borderRadius: T.radius.md,
                  border: `1px solid ${estado.colorBorde}`,
                  backgroundColor: "rgba(255,255,255,0.65)",
                  color: T.textDark,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontSize: "13px",
                }}
              >
                {resumenContraido ? "▼" : "▲"}
              </button>
            </div>

            {/* Expandable detail */}
            {!resumenContraido && (
              <div className="bl-expand-content">
                {/* Title */}
                <div style={{ margin: "12px 0 10px", padding: "10px 14px", borderRadius: T.radius.md, backgroundColor: "rgba(255,255,255,0.45)" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.2, color: estado.colorTexto }}>
                    {isCP ? "Cliente Preferente"
                      : modo === "compraInicial" ? paqueteActual.nombre
                      : programaRecompra === "lealtad" ? (estado.continuidad ? "Lealtad sostenida" : "Secuencia comprometida")
                      : "Lealtad Acelerado"}
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700, color: estado.colorTexto }}>
                    Descuento actual: {descuentoActual}%
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  <FloatCard label={isCP ? "Pts acum." : modo === "compraInicial" ? "Puntos" : programaRecompra === "lealtad" ? "Pts pers." : "Pts periodo"}
                    value={isCP ? puntosAcumuladosClientePreferente : modo === "compraInicial" ? totalPuntos : programaRecompra === "lealtad" ? totalPuntos : Number(puntosPersonalesAcelerado || 0) + Number(puntosGrupalesAcelerado || 0)}
                    isNumber estado={estado} />
                  <FloatCard label="P. público" value={formatoMoneda(totalPrecioPublico)} estado={estado} />
                  <FloatCard
                    label={`Con ${descuentoActual}%`}
                    value={formatoMoneda(
                      isCP ? totalSegunDescuentoClientePreferente
                        : modo === "compraInicial" ? paqueteActual.totalConDescuento
                        : programaRecompra === "lealtad" ? totalSegunDescuentoLealtad
                        : totalSegunDescuentoAcelerado
                    )}
                    estado={estado}
                  />
                </div>

                {/* Message */}
                <div style={{ padding: "10px 12px", borderRadius: T.radius.md, backgroundColor: "rgba(255,255,255,0.45)", fontSize: "12px", lineHeight: 1.45, marginBottom: "10px" }}>
                  <div style={{ fontWeight: 700, color: estado.colorTexto }}>
                    {estado.mensajePrincipal || estado.siguienteMensaje || estado.texto}
                  </div>
                  {estado.mensajeSecundario && (
                    <div style={{ fontWeight: 600, color: estado.colorTexto, marginTop: "6px" }}>{estado.mensajeSecundario}</div>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button onClick={irAPedidoActual} style={{ ...styles.btnAccent, fontSize: "13px", padding: "11px 12px" }}>Ver pedido</button>
                  <button onClick={descargarPDFPedido} style={{ ...styles.floatBtn, borderColor: estado.colorBorde }}>PDF</button>
                  <button onClick={imprimirFormulario} style={{ ...styles.floatBtn, borderColor: estado.colorBorde }}>Imprimir</button>
                  <button onClick={irArriba} style={{ ...styles.floatBtn, borderColor: estado.colorBorde, backgroundColor: "rgba(255,255,255,0.25)" }}>Subir</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Floating stat helpers ── */
function FloatStat({ label, value, color, large }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "10px", marginBottom: "1px", color, opacity: 0.85 }}>{label}</span>
      <span style={{ fontSize: large ? "18px" : "13px", fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function FloatCard({ label, value, isNumber, estado }) {
  return (
    <div style={{ borderRadius: T.radius.sm, padding: "8px 10px", border: `1px solid ${estado.colorBorde}`, backgroundColor: "rgba(255,255,255,0.50)" }}>
      <div style={{ fontSize: "10px", marginBottom: "3px", color: estado.colorTexto }}>{label}</div>
      <div style={{ fontSize: isNumber ? "18px" : "12px", fontWeight: 700, color: estado.colorTexto, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES (object-based, merged with token system)
   ═══════════════════════════════════════════════════════════════ */
const styles = {
  pagina: {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at top, rgba(255,237,213,0.85) 0%, rgba(255,247,237,0.80) 20%, ${T.cream100} 45%, ${T.cream50} 100%)`,
    padding: "20px",
    paddingBottom: "180px",
    fontFamily: T.fontBody,
    position: "relative",
    overflow: "hidden",
    color: T.text,
  },
  glowTop: {
    position: "absolute",
    top: "-140px",
    right: "-100px",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,146,60,0.22) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glowBottom: {
    position: "absolute",
    bottom: "10%",
    left: "-80px",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 72%)",
    pointerEvents: "none",
  },
  contenedor: {
    maxWidth: "1600px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  // Hero
  hero: {
    borderRadius: "28px",
    overflow: "hidden",
    background: `linear-gradient(135deg, ${T.orange900} 0%, #8f3412 20%, ${T.orange600} 44%, ${T.orange500} 72%, ${T.orange400} 100%)`,
    boxShadow: T.shadow.xl,
    marginBottom: "20px",
  },
  heroOverlay: {
    background: "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 50%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.06))",
  },
  heroContent: {
    padding: "clamp(24px, 5vw, 42px)",
    color: T.white,
  },
  heroTitle: {
    margin: "12px 0 0 0",
    fontSize: "clamp(32px, 7vw, 52px)",
    lineHeight: 1.05,
    fontFamily: T.fontDisplay,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    textShadow: "0 4px 18px rgba(0,0,0,0.16)",
  },
  heroText: {
    marginTop: "12px",
    maxWidth: "680px",
    fontSize: "clamp(14px, 2.5vw, 17px)",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.92)",
  },
  heroAuthor: {
    display: "inline-block",
    marginTop: "16px",
    padding: "12px 16px",
    borderRadius: T.radius.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.20)",
    color: "#fff7ed",
    lineHeight: 1.5,
    fontSize: "13px",
    backdropFilter: "blur(6px)",
    maxWidth: "680px",
  },

  // Section titles
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(20px, 3vw, 26px)",
    color: T.textDark,
    fontFamily: T.fontDisplay,
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
  sectionSub: {
    margin: "6px 0 0 0",
    color: T.textMuted,
    fontSize: "14px",
    lineHeight: 1.5,
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },

  // Controls
  controlCard: {
    background: `linear-gradient(180deg, ${T.cream100}, ${T.orange50})`,
    border: `1px solid ${T.cream500}`,
    borderRadius: T.radius.lg,
    padding: "16px",
  },
  infoCard: {
    background: `linear-gradient(135deg, ${T.orange100}, ${T.orange200})`,
    border: `1px solid ${T.orange300}`,
    borderRadius: T.radius.lg,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
    color: T.textDark,
    fontSize: "13px",
    letterSpacing: "0.2px",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.cream700}`,
    backgroundColor: T.white,
    color: T.textDark,
    fontSize: "14px",
    fontWeight: 500,
    appearance: "auto",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.cream700}`,
    backgroundColor: T.white,
    color: T.black,
    fontSize: "14px",
    fontWeight: 500,
    boxSizing: "border-box",
  },

  // Buttons
  btn: {
    padding: "11px 18px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.cream500}`,
    backgroundColor: T.cream100,
    color: T.textDark,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  },
  btnActive: {
    padding: "11px 18px",
    borderRadius: T.radius.md,
    border: `2px solid ${T.orange500}`,
    background: `linear-gradient(135deg, ${T.orange300}, ${T.orange400})`,
    color: T.white,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    boxShadow: "0 6px 20px rgba(249,115,22,0.22)",
  },
  btnGhost: {
    padding: "11px 18px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.cream500}`,
    backgroundColor: "transparent",
    color: T.textMuted,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  },
  btnAccent: {
    padding: "11px 18px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.orange300}`,
    background: `linear-gradient(135deg, ${T.orange300}, ${T.orange400})`,
    color: T.orange900,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  btnDanger: {
    padding: "10px 14px",
    borderRadius: T.radius.md,
    border: "1px solid #fecaca",
    backgroundColor: "#fff1f2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
  },
  btnDangerSmall: {
    padding: "6px 10px",
    borderRadius: T.radius.sm,
    border: "1px solid #fecaca",
    backgroundColor: "#fff1f2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
  btnQty: {
    width: "40px",
    height: "40px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.cream700}`,
    backgroundColor: T.white,
    color: T.orange700,
    fontWeight: 700,
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputQty: {
    width: "80px",
    padding: "10px",
    borderRadius: T.radius.md,
    border: `1px solid ${T.cream700}`,
    backgroundColor: T.white,
    color: T.black,
    textAlign: "center",
    fontWeight: 700,
    fontSize: "15px",
  },
  floatBtn: {
    padding: "11px 12px",
    borderRadius: T.radius.md,
    border: "1px solid rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.60)",
    color: T.textDark,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
  },

  // Table
  tableWrapper: {
    overflowX: "auto",
    borderRadius: T.radius.lg,
    border: `1px solid ${T.cream500}`,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "1100px",
    backgroundColor: T.white,
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: `2px solid ${T.cream500}`,
    color: T.textDark,
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: `linear-gradient(180deg, ${T.cream300}, ${T.cream400})`,
    zIndex: 1,
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  td: {
    padding: "10px",
    borderBottom: `1px solid ${T.cream200}`,
    color: T.text,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  tdTotal: {
    padding: "12px 10px",
    borderTop: `2px solid ${T.cream500}`,
    color: T.textDark,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  inputTable: {
    width: "72px",
    padding: "8px",
    borderRadius: T.radius.sm,
    border: `1px solid ${T.cream700}`,
    backgroundColor: T.white,
    color: T.black,
    fontSize: "13px",
    fontWeight: 600,
    textAlign: "center",
  },

  // Mini panels
  miniPanel: {
    background: `linear-gradient(180deg, ${T.cream100}, ${T.cream200})`,
    border: `1px solid ${T.cream500}`,
    borderRadius: T.radius.lg,
    padding: "16px",
  },
};

export default App;