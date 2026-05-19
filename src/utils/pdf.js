import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatoMoneda } from "./format";

const NOMBRE_JORGE = "Jorge Francisco Sánchez Yerenas";
const MARCA_NUTRI = "NutriConCiencia";

const LEYENDA_JORGE_PREFIJO = "Este material ha sido creado por el Líder ";
const LEYENDA_JORGE_SUFIJO = " para el apoyo de su comunidad empresarial Bodylogic.";

const MSJ_GRACIAS_PREFIJO = "Gracias por su compra y preferencia. En ";
const MSJ_GRACIAS_SUFIJO =
  " nos honra acompañarle en el cuidado de su salud y bienestar con fórmulas nutricionales y avanzadas, creadas con ciencia, conciencia y compromiso. ¡Hasta pronto!";

const MSJ_GRACIAS_HTML =
  MSJ_GRACIAS_PREFIJO + "<strong>" + MARCA_NUTRI + "</strong>" + MSJ_GRACIAS_SUFIJO;

const LEYENDA_JORGE_HTML =
  LEYENDA_JORGE_PREFIJO + "<strong>" + NOMBRE_JORGE + "</strong>" + LEYENDA_JORGE_SUFIJO;

const ESTILOS_TABLA_PDF = {
  theme: "grid",
  headStyles: {
    fillColor: [234, 88, 12],
    textColor: [255, 255, 255],
    fontStyle: "bold",
    halign: "center",
    valign: "middle",
  },
  styles: {
    halign: "center",
    valign: "middle",
    textColor: [40, 40, 40],
  },
  alternateRowStyles: { fillColor: [255, 250, 245] },
};

const nombreArchivoVentas = (nombreCliente) => {
  const base = (nombreCliente || "").trim();
  if (!base) return "Nota-BodyLogic.pdf";
  const seguro = base.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ-]/gi, "").trim().replace(/\s+/g, "-").slice(0, 40);
  return seguro ? `Nota-${seguro}.pdf` : "Nota-BodyLogic.pdf";
};

const alertSinProductos = () => {
  alert("Primero captura al menos un producto con unidades mayores a 0.");
};

function abrirVentanaImpresion() {
  const w = window.open("", "_blank", "width=1200,height=900");
  if (!w) {
    alert("Permite pop-ups e inténtalo de nuevo.");
    return null;
  }
  return w;
}

/** Partes de texto para dibujar una frase con un segmento en negritas y salto de línea. */
function tokenizarConNegrita(texto, palabraNegrita) {
  const partes = texto.split(palabraNegrita);
  const tokens = [];
  partes.forEach((parte, i) => {
    if (parte) tokens.push({ text: parte, bold: false });
    if (i < partes.length - 1) tokens.push({ text: palabraNegrita, bold: true });
  });
  return tokens;
}

/** Envuelve tokens en líneas según el ancho máximo. */
function envolverTokens(doc, tokens, maxWidth, estiloBase, estiloNegrita) {
  const lineas = [];
  let linea = [];
  let anchoLinea = 0;

  const medir = (texto, negrita) => {
    doc.setFont("helvetica", negrita ? estiloNegrita : estiloBase);
    return doc.getTextWidth(texto);
  };

  for (const token of tokens) {
    const fragmentos = token.text.match(/\S+\s*|\s+/g) || [];
    for (const frag of fragmentos) {
      const w = medir(frag, token.bold);
      if (anchoLinea + w > maxWidth && linea.length > 0) {
        lineas.push(linea);
        linea = [];
        anchoLinea = 0;
      }
      linea.push({ text: frag, bold: token.bold });
      anchoLinea += w;
    }
  }
  if (linea.length) lineas.push(linea);
  return lineas;
}

/** Dibuja líneas con segmentos normales y en negrita; devuelve la Y final. */
function dibujarLineasConNegrita(doc, x, y, lineas, fontSize, estiloBase, estiloNegrita, color, lineHeight) {
  doc.setFontSize(fontSize);
  doc.setTextColor(color[0], color[1], color[2]);
  let cy = y;
  for (const linea of lineas) {
    let cx = x;
    for (const seg of linea) {
      doc.setFont("helvetica", seg.bold ? estiloNegrita : estiloBase);
      doc.text(seg.text, cx, cy);
      cx += doc.getTextWidth(seg.text);
    }
    cy += lineHeight;
  }
  return cy;
}

function dibujarParrafoConPalabraNegrita(doc, {
  x,
  y,
  maxWidth,
  texto,
  palabraNegrita,
  fontSize = 9,
  estiloBase = "italic",
  estiloNegrita = "bold",
  color = [80, 80, 80],
}) {
  const tokens = tokenizarConNegrita(texto, palabraNegrita);
  const lineas = envolverTokens(doc, tokens, maxWidth, estiloBase, estiloNegrita);
  return dibujarLineasConNegrita(
    doc,
    x,
    y,
    lineas,
    fontSize,
    estiloBase,
    estiloNegrita,
    color,
    fontSize * 1.4
  );
}

/**
 * Nota al público — solo perfil Ventas.
 */
export const generarPDFNotaVentas = ({
  productosSeleccionados,
  nombreCliente = "",
  totalPrecioPublico,
}) => {
  if (productosSeleccionados.length === 0) {
    alertSinProductos();
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const fecha = new Date().toLocaleString("es-MX");
  const cliente = (nombreCliente || "").trim();
  const marginX = 40;
  const anchoTexto = 515;
  const textoGracias = MSJ_GRACIAS_PREFIJO + MARCA_NUTRI + MSJ_GRACIAS_SUFIJO;

  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 595, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BodyLogic", marginX, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Nota de compra", marginX, 52);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  let y = 96;
  if (cliente) {
    doc.setFont("helvetica", "bold");
    doc.text(`Cliente: ${cliente}`, marginX, y);
    doc.setFont("helvetica", "normal");
    y += 18;
  }
  doc.text(`Fecha: ${fecha}`, marginX, y);

  const body = productosSeleccionados.map((i) => [
    i.producto,
    i.contenido || "—",
    formatoMoneda(i.precioPublico),
    String(i.unidades),
    formatoMoneda(i.subtotalPrecioPublico),
  ]);

  autoTable(doc, {
    startY: y + 22,
    head: [["Producto", "Contenido", "Precio unitario", "Unidades", "Subtotal"]],
    body,
    ...ESTILOS_TABLA_PDF,
    headStyles: { ...ESTILOS_TABLA_PDF.headStyles, fontSize: 9 },
    styles: { ...ESTILOS_TABLA_PDF.styles, fontSize: 9, cellPadding: 6 },
    margin: { left: marginX, right: marginX },
  });

  const fy = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.line(marginX, fy, marginX + anchoTexto, fy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(124, 45, 18);
  doc.text(`Total a pagar: ${formatoMoneda(totalPrecioPublico)}`, marginX, fy + 24);

  dibujarParrafoConPalabraNegrita(doc, {
    x: marginX,
    y: fy + 48,
    maxWidth: anchoTexto,
    texto: textoGracias,
    palabraNegrita: MARCA_NUTRI,
    fontSize: 9,
    estiloBase: "italic",
    estiloNegrita: "bold",
    color: [80, 80, 80],
  });

  doc.save(nombreArchivoVentas(cliente));
};

/**
 * Resumen completo — Distribuidor, Cliente Preferente y Simulador.
 */
export const generarPDFPedido = ({
  productosSeleccionados,
  nombreCliente = "",
  descuentoActual,
  totalUnidades,
  totalPuntos,
  totalPrecioPublico,
  totalConDescuento,
  obtenerSubtotal,
  obtenerPrecio,
  textoModo,
  estadoTexto,
}) => {
  if (productosSeleccionados.length === 0) {
    alertSinProductos();
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const fecha = new Date().toLocaleString("es-MX");
  const cliente = (nombreCliente || "").trim();
  const ahorro = Math.max(0, totalPrecioPublico - totalConDescuento);
  const descLabel = descuentoActual ?? 0;
  const textoLeyenda = LEYENDA_JORGE_PREFIJO + NOMBRE_JORGE + LEYENDA_JORGE_SUFIJO;

  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 842, 84, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("BodyLogic - Resumen de pedido", 40, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(textoModo, 40, 60);

  doc.setTextColor(80, 80, 80);
  let metaY = 108;
  if (cliente) {
    doc.text(`Cliente: ${cliente}`, 40, metaY);
    metaY += 16;
  }
  doc.text(`Fecha: ${fecha}`, 40, metaY);
  doc.text(`Estado: ${estadoTexto}`, 40, metaY + 16);

  const body = productosSeleccionados.map((i) => [
    i.producto,
    i.contenido || "—",
    String(i.puntos),
    String(i.unidades),
    String(i.subtotalPuntos),
    formatoMoneda(i.precioPublico),
    formatoMoneda(i.subtotalPrecioPublico),
    formatoMoneda(obtenerPrecio(i)),
    formatoMoneda(obtenerSubtotal(i)),
  ]);

  autoTable(doc, {
    startY: metaY + 28,
    head: [[
      "Producto",
      "Contenido",
      "Pts/u",
      "Uds",
      "Sub. pts",
      "P. unit.",
      "Sub. público",
      `P. ${descLabel}%`,
      `Sub. ${descLabel}%`,
    ]],
    body,
    ...ESTILOS_TABLA_PDF,
    headStyles: { ...ESTILOS_TABLA_PDF.headStyles, fontSize: 8 },
    styles: { ...ESTILOS_TABLA_PDF.styles, fontSize: 8, cellPadding: 5 },
    margin: { left: 40, right: 40 },
  });

  const fy = doc.lastAutoTable.finalY + 18;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.line(40, fy, 802, fy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(124, 45, 18);

  const fila1 = fy + 20;
  doc.text(`Total unidades: ${totalUnidades}`, 40, fila1);
  doc.text(`Total puntos: ${totalPuntos}`, 200, fila1);
  doc.text(`Total precio público: ${formatoMoneda(totalPrecioPublico)}`, 360, fila1);
  doc.text(`Total con ${descLabel}%: ${formatoMoneda(totalConDescuento)}`, 560, fila1);

  const fila2 = fila1 + 18;
  doc.text(`Ahorro total: ${formatoMoneda(ahorro)}`, 40, fila2);
  doc.setFontSize(12);
  doc.text(`Total a pagar: ${formatoMoneda(totalConDescuento)}`, 560, fila2);

  dibujarParrafoConPalabraNegrita(doc, {
    x: 40,
    y: fila2 + 28,
    maxWidth: 760,
    texto: textoLeyenda,
    palabraNegrita: NOMBRE_JORGE,
    fontSize: 8,
    estiloBase: "normal",
    estiloNegrita: "bold",
    color: [90, 90, 90],
  });

  const base = nombreArchivoVentas(cliente).replace(".pdf", "");
  doc.save(cliente ? `Resumen-Pedido-${base}.pdf` : "Resumen-Pedido-BodyLogic.pdf");
};

export const imprimirNotaVentas = (args) => {
  if (args.productosSeleccionados.length === 0) {
    alertSinProductos();
    return;
  }
  const w = abrirVentanaImpresion();
  if (!w) return;
  w.document.write(buildHtmlNotaVentas(args));
  w.document.close();
};

export const imprimirFormulario = ({
  productosSeleccionados,
  nombreCliente = "",
  descuentoActual,
  totalUnidades,
  totalPuntos,
  totalPrecioPublico,
  totalConDescuento,
  obtenerSubtotal,
  obtenerPrecio,
  subtitulo,
  estadoTexto,
}) => {
  if (productosSeleccionados.length === 0) {
    alertSinProductos();
    return;
  }

  const w = abrirVentanaImpresion();
  if (!w) return;

  w.document.write(
    buildHtmlResumenPedido({
      productosSeleccionados,
      nombreCliente,
      descuentoActual,
      totalUnidades,
      totalPuntos,
      totalPrecioPublico,
      totalConDescuento,
      obtenerSubtotal,
      obtenerPrecio,
      subtitulo,
      estadoTexto,
    })
  );
  w.document.close();
};

const CSS_TABLA_CENTRADA =
  "table{width:100%;border-collapse:collapse}th,td{text-align:center;vertical-align:middle}";

function buildHtmlNotaVentas({ productosSeleccionados, nombreCliente, totalPrecioPublico }) {
  const cliente = (nombreCliente || "").trim();
  const filas = productosSeleccionados
    .map(
      (i) =>
        "<tr><td>" +
        i.producto +
        "</td><td>" +
        (i.contenido || "—") +
        "</td><td>" +
        formatoMoneda(i.precioPublico) +
        "</td><td>" +
        i.unidades +
        "</td><td>" +
        formatoMoneda(i.subtotalPrecioPublico) +
        "</td></tr>"
    )
    .join("");

  const clienteHtml = cliente ? "<div><strong>Cliente:</strong> " + cliente + "</div>" : "";

  return (
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>BodyLogic</title>" +
    "<style>body{font-family:Arial,sans-serif;margin:28px;color:#222}" +
    ".enc{background:linear-gradient(135deg,#c2410c,#fb923c);color:#fff;padding:16px 20px;border-radius:12px;margin-bottom:20px}" +
    "h1{margin:0 0 4px;font-size:24px}.sub{font-size:13px;opacity:.95}" +
    ".meta{margin:12px 0 16px;font-size:13px;line-height:1.6}" +
    CSS_TABLA_CENTRADA +
    "th{background:#ea580c;color:#fff;padding:9px;font-size:12px}" +
    "td{border:1px solid #e5e7eb;padding:9px;font-size:12px}tr:nth-child(even){background:#fffaf5}" +
    ".tot{margin-top:20px;padding:14px;border:2px solid #ea580c;border-radius:10px;background:#fff7ed;font-size:16px;font-weight:700}" +
    ".gracias{margin-top:14px;font-size:11px;color:#555;font-style:italic;line-height:1.55;max-width:720px}" +
    "</style></head><body>" +
    '<div class="enc"><h1>BodyLogic</h1><div class="sub">Nota de compra</div></div>' +
    '<div class="meta">' +
    clienteHtml +
    "<div><strong>Fecha:</strong> " +
    new Date().toLocaleString("es-MX") +
    "</div></div>" +
    "<table><thead><tr><th>Producto</th><th>Contenido</th><th>Precio unitario</th><th>Unidades</th><th>Subtotal</th></tr></thead><tbody>" +
    filas +
    "</tbody></table>" +
    '<div class="tot">Total a pagar: ' +
    formatoMoneda(totalPrecioPublico) +
    "</div>" +
    '<p class="gracias">' +
    MSJ_GRACIAS_HTML +
    "</p>" +
    "<script>window.onload=function(){window.print();};</script></body></html>"
  );
}

function buildHtmlResumenPedido({
  productosSeleccionados,
  nombreCliente,
  descuentoActual,
  totalUnidades,
  totalPuntos,
  totalPrecioPublico,
  totalConDescuento,
  obtenerSubtotal,
  obtenerPrecio,
  subtitulo,
  estadoTexto,
}) {
  const cliente = (nombreCliente || "").trim();
  const descLabel = descuentoActual ?? 0;
  const ahorro = Math.max(0, totalPrecioPublico - totalConDescuento);

  const filas = productosSeleccionados
    .map(
      (i) =>
        "<tr><td>" +
        i.producto +
        "</td><td>" +
        (i.contenido || "—") +
        "</td><td>" +
        i.puntos +
        "</td><td>" +
        i.unidades +
        "</td><td>" +
        i.subtotalPuntos +
        "</td><td>" +
        formatoMoneda(i.precioPublico) +
        "</td><td>" +
        formatoMoneda(i.subtotalPrecioPublico) +
        "</td><td>" +
        formatoMoneda(obtenerPrecio(i)) +
        "</td><td>" +
        formatoMoneda(obtenerSubtotal(i)) +
        "</td></tr>"
    )
    .join("");

  const clienteHtml = cliente ? "<div><strong>Cliente:</strong> " + cliente + "</div>" : "";

  return (
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>BodyLogic</title>" +
    "<style>body{font-family:'Segoe UI',Arial,sans-serif;margin:24px;color:#222;font-size:12px}" +
    ".enc{background:linear-gradient(135deg,#c2410c,#fb923c);color:#fff;padding:16px 20px;border-radius:12px;margin-bottom:16px}" +
    "h1{margin:0 0 6px;font-size:22px}.sub{font-size:13px;opacity:.95}" +
    ".meta{margin:12px 0 16px;line-height:1.6}" +
    CSS_TABLA_CENTRADA +
    "th{background:#ea580c;color:#fff;padding:8px;border:1px solid #d6d3d1;font-size:11px}" +
    "td{border:1px solid #e5e7eb;padding:8px;font-size:11px}tr:nth-child(even){background:#fffaf5}" +
    ".tot{margin-top:18px;padding:14px;border:1px solid #fdba74;border-radius:12px;background:#fff7ed;line-height:1.7}" +
    ".firm{margin-top:16px;font-size:10px;color:#666;line-height:1.5}" +
    "</style></head><body>" +
    '<div class="enc"><h1>BodyLogic - Resumen de pedido</h1><div class="sub">' +
    subtitulo +
    "</div></div>" +
    '<div class="meta">' +
    clienteHtml +
    "<div><strong>Fecha:</strong> " +
    new Date().toLocaleString("es-MX") +
    "</div><div><strong>Estado:</strong> " +
    estadoTexto +
    "</div></div>" +
    "<table><thead><tr>" +
    "<th>Producto</th><th>Contenido</th><th>Pts/u</th><th>Uds</th><th>Sub. pts</th>" +
    "<th>P. unit.</th><th>Sub. público</th><th>P. " +
    descLabel +
    "%</th><th>Sub. " +
    descLabel +
    "%</th></tr></thead><tbody>" +
    filas +
    "</tbody></table>" +
    '<div class="tot">' +
    "<div><strong>Total unidades:</strong> " +
    totalUnidades +
    "</div>" +
    "<div><strong>Total puntos:</strong> " +
    totalPuntos +
    "</div>" +
    "<div><strong>Total precio público:</strong> " +
    formatoMoneda(totalPrecioPublico) +
    "</div>" +
    "<div><strong>Total con " +
    descLabel +
    "%:</strong> " +
    formatoMoneda(totalConDescuento) +
    "</div>" +
    "<div><strong>Ahorro total:</strong> " +
    formatoMoneda(ahorro) +
    "</div>" +
    '<div style="font-size:15px;margin-top:8px"><strong>Total a pagar:</strong> ' +
    formatoMoneda(totalConDescuento) +
    "</div></div>" +
    '<div class="firm">' +
    LEYENDA_JORGE_HTML +
    "</div>" +
    "<script>window.onload=function(){window.print();};</script></body></html>"
  );
}
