import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatoMoneda } from "./format";

/**
 * Generate and download a PDF order summary.
 */
export const generarPDFPedido = ({
  perfilUsuario,
  nombrePedido,
  productosSeleccionados,
  descuentoActual,
  totalUnidades,
  totalPuntos,
  totalPrecioPublico,
  totalConDescuento,
  obtenerSubtotal,
  textoModo,
  estadoTexto,
}) => {
  if (productosSeleccionados.length === 0) {
    alert("Primero captura al menos un producto con unidades mayores a 0.");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const fecha = new Date().toLocaleString("es-MX");

  const nombreLimpio = String(nombrePedido || "").trim();

  if (perfilUsuario === "ventas") {
    const docVenta = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    docVenta.setFillColor(234, 88, 12);
    docVenta.rect(0, 0, 595, 82, "F");
    docVenta.setTextColor(255, 255, 255);
    docVenta.setFont("helvetica", "bold");
    docVenta.setFontSize(22);
    docVenta.text("BodyLogic - Nota de venta", 40, 36);
    docVenta.setFont("helvetica", "normal");
    docVenta.setFontSize(10);
    docVenta.text(`Fecha: ${fecha}`, 40, 58);

    docVenta.setTextColor(80, 80, 80);
    docVenta.setFont("helvetica", "bold");
    docVenta.setFontSize(11);
    docVenta.text("Nombre del cliente:", 40, 112);
    docVenta.setFont("helvetica", "normal");
    docVenta.text(nombreLimpio || "Cliente", 158, 112);

    const bodyVenta = productosSeleccionados.map((i) => [
      i.producto,
      i.contenido || "",
      formatoMoneda(i.precioPublico),
      String(i.unidades),
      formatoMoneda(i.subtotalPrecioPublico),
    ]);

    autoTable(docVenta, {
      startY: 138,
      head: [["Producto", "Contenido", "Precio unitario", "Unidades", "Subtotal"]],
      body: bodyVenta,
      theme: "grid",
      headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      styles: { fontSize: 9, cellPadding: 6, textColor: [40, 40, 40], valign: "middle" },
      alternateRowStyles: { fillColor: [255, 250, 245] },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "center" },
        4: { halign: "right" },
      },
      margin: { left: 40, right: 40 },
    });

    const fyVenta = docVenta.lastAutoTable.finalY + 24;
    docVenta.setDrawColor(234, 88, 12);
    docVenta.setLineWidth(1);
    docVenta.line(40, fyVenta, 555, fyVenta);
    docVenta.setFont("helvetica", "bold");
    docVenta.setFontSize(14);
    docVenta.setTextColor(124, 45, 18);
    docVenta.text(`Total a pagar: ${formatoMoneda(totalPrecioPublico)}`, 40, fyVenta + 28);

    const nombreArchivo = nombreLimpio
      ? `Nota-Venta-BodyLogic-${nombreLimpio.replace(/[^\wáéíóúÁÉÍÓÚñÑ-]+/g, "-")}.pdf`
      : "Nota-Venta-BodyLogic.pdf";
    docVenta.save(nombreArchivo);
    return;
  }


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
  doc.text(`Fecha: ${fecha}`, 40, 108);
  doc.text(`Nombre: ${nombreLimpio || "Sin especificar"}`, 40, 124);
  doc.text(`Estado: ${estadoTexto}`, 40, 140);

  const body = productosSeleccionados.map((i) => [
    i.producto,
    String(i.unidades),
    String(i.subtotalPuntos),
    formatoMoneda(i.subtotalPrecioPublico),
    formatoMoneda(obtenerSubtotal(i)),
  ]);

  autoTable(doc, {
    startY: 160,
    head: [["Producto", "Uds", "Sub. pts", "Sub. público", `Sub. ${descuentoActual}%`]],
    body,
    theme: "grid",
    headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
    styles: { fontSize: 9, cellPadding: 6, textColor: [40, 40, 40], valign: "middle" },
    alternateRowStyles: { fillColor: [255, 250, 245] },
    margin: { left: 40, right: 40 },
  });

  const fy = doc.lastAutoTable.finalY + 22;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.line(40, fy, 802, fy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(124, 45, 18);
  doc.text(`Total unidades: ${totalUnidades}`, 40, fy + 22);
  doc.text(`Total puntos: ${totalPuntos}`, 190, fy + 22);
  doc.text(`Total público: ${formatoMoneda(totalPrecioPublico)}`, 330, fy + 22);
  doc.text(`Total descuento: ${formatoMoneda(totalConDescuento)}`, 40, fy + 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.",
    40, fy + 70
  );

  doc.save("Resumen-Pedido-BodyLogic.pdf");
};

/**
 * Open a print-friendly order form in a new window.
 */
export const imprimirFormulario = ({
  perfilUsuario,
  nombrePedido,
  productosSeleccionados,
  descuentoActual,
  totalUnidades,
  totalPuntos,
  totalPrecioPublico,
  totalConDescuento,
  obtenerSubtotal,
  subtitulo,
  estadoTexto,
}) => {
  if (productosSeleccionados.length === 0) {
    alert("Primero captura al menos un producto con unidades mayores a 0.");
    return;
  }

  const nombreLimpio = String(nombrePedido || "").trim();

  const filasHTML = productosSeleccionados
    .map((i) => perfilUsuario === "ventas"
      ? `<tr><td>${i.producto}</td><td>${i.contenido || ""}</td><td style="text-align:right">${formatoMoneda(i.precioPublico)}</td><td style="text-align:center">${i.unidades}</td><td style="text-align:right">${formatoMoneda(i.subtotalPrecioPublico)}</td></tr>`
      : `<tr><td>${i.producto}</td><td style="text-align:center">${i.unidades}</td><td style="text-align:center">${i.subtotalPuntos}</td><td style="text-align:right">${formatoMoneda(i.subtotalPrecioPublico)}</td><td style="text-align:right">${formatoMoneda(obtenerSubtotal(i))}</td></tr>`
    )
    .join("");

  const w = window.open("", "_blank", "width=1200,height=900");
  if (!w) {
    alert("Permite pop-ups e inténtalo de nuevo.");
    return;
  }

  const encabezadoTabla = perfilUsuario === "ventas"
    ? "<tr><th>Producto</th><th>Contenido</th><th>Precio unitario</th><th>Unidades</th><th>Subtotal</th></tr>"
    : `<tr><th>Producto</th><th>Uds</th><th>Sub. pts</th><th>Sub. público</th><th>Sub. ${descuentoActual}%</th></tr>`;

  const bloqueTotales = perfilUsuario === "ventas"
    ? `<div><strong>Total a pagar:</strong> ${formatoMoneda(totalPrecioPublico)}</div>`
    : `<div><strong>Total uds:</strong> ${totalUnidades}</div><div><strong>Total pts:</strong> ${totalPuntos}</div><div><strong>Total público:</strong> ${formatoMoneda(totalPrecioPublico)}</div><div><strong>Total descuento:</strong> ${formatoMoneda(totalConDescuento)}</div>`;

  w.document.write(`<html><head><title>BodyLogic</title><style>body{font-family:'DM Sans',Arial,sans-serif;margin:30px;color:#222}.enc{background:linear-gradient(135deg,#c2410c,#fb923c);color:#fff;padding:18px 22px;border-radius:16px;margin-bottom:24px}h1{margin:0 0 6px;font-size:26px}.sub{font-size:13px;opacity:.95}.meta{margin:14px 0 20px;font-size:13px;line-height:1.7}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#ea580c;color:#fff;padding:10px;border:1px solid #d6d3d1;font-size:13px}td{border:1px solid #e5e7eb;padding:10px;font-size:13px}tr:nth-child(even){background:#fffaf5}.tot{margin-top:24px;padding:16px;border:1px solid #fdba74;border-radius:14px;background:#fff7ed;line-height:1.8;font-size:14px}.firm{margin-top:40px;font-size:12px;color:#666}</style></head><body><div class="enc"><h1>${perfilUsuario === "ventas" ? "BodyLogic - Nota de venta" : "BodyLogic - Formulario"}</h1><div class="sub">${subtitulo}</div></div><div class="meta"><div><strong>Fecha:</strong> ${new Date().toLocaleString("es-MX")}</div><div><strong>Nombre:</strong> ${nombreLimpio || "Sin especificar"}</div>${perfilUsuario === "ventas" ? "" : `<div><strong>Estado:</strong> ${estadoTexto}</div>`}</div><table><thead>${encabezadoTabla}</thead><tbody>${filasHTML}</tbody></table><div class="tot">${bloqueTotales}</div>${perfilUsuario === "ventas" ? "" : `<div class="firm">Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.</div>`}<script>window.onload=function(){window.print();};</script></body></html>`);
  w.document.close();
};
