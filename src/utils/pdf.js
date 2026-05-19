import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatoMoneda } from "./format";

const nombreArchivo = (nombreCliente) => {
  const base = (nombreCliente || "").trim();
  if (!base) return "Nota-BodyLogic.pdf";
  const seguro = base.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ-]/gi, "").trim().replace(/\s+/g, "-").slice(0, 40);
  return seguro ? `Nota-${seguro}.pdf` : "Nota-BodyLogic.pdf";
};

/**
 * Nota de compra para el cliente: solo nombre, productos y precios al público.
 */
export const generarPDFPedido = ({
  productosSeleccionados,
  nombreCliente = "",
  totalPrecioPublico,
}) => {
  if (productosSeleccionados.length === 0) {
    alert("Primero captura al menos un producto con unidades mayores a 0.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const fecha = new Date().toLocaleString("es-MX");
  const cliente = (nombreCliente || "").trim();

  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 595, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BodyLogic", 40, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Nota de compra", 40, 52);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  let y = 96;
  if (cliente) {
    doc.setFont("helvetica", "bold");
    doc.text(`Cliente: ${cliente}`, 40, y);
    doc.setFont("helvetica", "normal");
    y += 18;
  }
  doc.text(`Fecha: ${fecha}`, 40, y);

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
    theme: "grid",
    headStyles: {
      fillColor: [234, 88, 12],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    styles: { fontSize: 9, cellPadding: 6, textColor: [40, 40, 40], valign: "middle" },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 95 },
      2: { halign: "right", cellWidth: 72 },
      3: { halign: "center", cellWidth: 52 },
      4: { halign: "right", cellWidth: 72 },
    },
    alternateRowStyles: { fillColor: [255, 250, 245] },
    margin: { left: 40, right: 40 },
  });

  const fy = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.line(40, fy, 555, fy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(124, 45, 18);
  doc.text(`Total a pagar: ${formatoMoneda(totalPrecioPublico)}`, 40, fy + 24);

  doc.save(nombreArchivo(cliente));
};

/**
 * Vista de impresión con el mismo formato que la nota para el cliente.
 */
export const imprimirFormulario = ({
  productosSeleccionados,
  nombreCliente = "",
  totalPrecioPublico,
}) => {
  if (productosSeleccionados.length === 0) {
    alert("Primero captura al menos un producto con unidades mayores a 0.");
    return;
  }

  const cliente = (nombreCliente || "").trim();
  const filasHTML = productosSeleccionados
    .map(
      (i) =>
        "<tr>" +
        `<td>${i.producto}</td>` +
        `<td>${i.contenido || "—"}</td>` +
        `<td style="text-align:right">${formatoMoneda(i.precioPublico)}</td>` +
        `<td style="text-align:center">${i.unidades}</td>` +
        `<td style="text-align:right">${formatoMoneda(i.subtotalPrecioPublico)}</td>` +
        "</tr>"
    )
    .join("");

  const w = window.open("", "_blank", "width=900,height=900");
  if (!w) {
    alert("Permite pop-ups e inténtalo de nuevo.");
    return;
  }

  const clienteLinea = cliente
    ? `<div><strong>Cliente:</strong> ${cliente}</div>`
    : "";

  const html = [
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>BodyLogic</title>",
    "<style>",
    "body{font-family:Arial,sans-serif;margin:28px;color:#222}",
    ".enc{background:linear-gradient(135deg,#c2410c,#fb923c);color:#fff;padding:16px 20px;border-radius:12px;margin-bottom:20px}",
    "h1{margin:0 0 4px;font-size:24px}.sub{font-size:13px;opacity:.95}",
    ".meta{margin:12px 0 16px;font-size:13px;line-height:1.6}",
    "table{width:100%;border-collapse:collapse}th{background:#ea580c;color:#fff;padding:9px;font-size:12px}",
    "td{border:1px solid #e5e7eb;padding:9px;font-size:12px}tr:nth-child(even){background:#fffaf5}",
    ".tot{margin-top:20px;padding:14px;border:2px solid #ea580c;border-radius:10px;background:#fff7ed;font-size:16px;font-weight:700}",
    "</style></head><body>",
    '<div class="enc"><h1>BodyLogic</h1><div class="sub">Nota de compra</div></div>',
    '<div class="meta">',
    clienteLinea,
    "<div><strong>Fecha:</strong> ",
    new Date().toLocaleString("es-MX"),
    "</div></div>",
    "<table><thead><tr><th>Producto</th><th>Contenido</th><th>Precio unitario</th><th>Unidades</th><th>Subtotal</th></tr></thead><tbody>",
    filasHTML,
    "</tbody></table>",
    '<div class="tot">Total a pagar: ',
    formatoMoneda(totalPrecioPublico),
    "</div>",
    "<script>window.onload=function(){window.print();};</script></body></html>",
  ].join("");

  w.document.write(html);
  w.document.close();
};
