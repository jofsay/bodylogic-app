import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatoMoneda } from './format';

function nombreArchivoSeguro(texto) {
  const base = (texto || 'Cliente').trim().replace(/[^a-z0-9áéíóúñü\s-]/gi, '').replace(/\s+/g, '-');
  return base || 'Cliente';
}

export function generarPedidoPDF({ filas, totales, perfil, modo, resumen, descuentoActivo, nombreCliente }) {
  if (perfil === 'ventas') {
    return generarNotaVentaPDF({ filas, totales, nombreCliente });
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BodyLogic — Pedido / Simulación', 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Perfil: ${perfil} · Modo: ${modo} · Descuento activo: ${descuentoActivo}%`, 40, 58);
  doc.text(`Puntos: ${totales.totalPuntos || 0} · ${resumen?.mensajePrincipal || ''}`, 40, 74);

  const body = filas.map((f) => [
    f.codigo,
    f.producto,
    f.contenido,
    f.unidades,
    f.puntosUnitarios,
    f.subtotalPuntos,
    formatoMoneda(f.precioPublico),
    formatoMoneda(f.subtotalPrecioPublico),
    `${descuentoActivo}%`,
    formatoMoneda(f.subtotalPrecioActivo),
  ]);

  autoTable(doc, {
    startY: 92,
    head: [['Código', 'Producto', 'Contenido', 'Unid.', 'Pts/u', 'Pts tot.', 'Público/u', 'Público total', 'Desc.', 'Total desc.']],
    body,
    styles: { fontSize: 7, cellPadding: 3 },
    headStyles: { fillColor: [234, 88, 12] },
  });

  const y = doc.lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total precio público: ${formatoMoneda(totales.totalPrecioPublico)}   Total con descuento: ${formatoMoneda(totales.totalPrecioActivo)}   Total puntos: ${totales.totalPuntos || 0}`, 40, y);
  doc.save(`Pedido-BodyLogic-${Date.now()}.pdf`);
}

export function generarNotaVentaPDF({ filas, totales, nombreCliente }) {
  const cliente = nombreCliente?.trim() || 'Cliente';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BodyLogic — Nota de venta', 40, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Cliente: ${cliente}`, 40, 66);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 40, 82);

  const body = filas.map((f) => [
    f.producto,
    f.contenido || '',
    formatoMoneda(f.precioPublico),
    f.unidades,
    formatoMoneda(f.subtotalPrecioPublico),
  ]);

  autoTable(doc, {
    startY: 104,
    head: [['Producto', 'Contenido', 'Precio unitario', 'Unidades', 'Subtotal']],
    body,
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [234, 88, 12] },
    columnStyles: {
      0: { cellWidth: 210 },
      1: { cellWidth: 105 },
      2: { halign: 'right', cellWidth: 95 },
      3: { halign: 'center', cellWidth: 65 },
      4: { halign: 'right', cellWidth: 95 },
    },
  });

  const y = doc.lastAutoTable.finalY + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Total a pagar: ${formatoMoneda(totales.totalPrecioPublico)}`, 40, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Gracias por tu compra.', 40, y + 20);
  doc.text('Esta nota muestra únicamente el precio y el total de la compra. No incluye puntos ni descuentos internos.', 40, y + 34);

  doc.save(`Nota-BodyLogic-${nombreArchivoSeguro(cliente)}-${Date.now()}.pdf`);
}