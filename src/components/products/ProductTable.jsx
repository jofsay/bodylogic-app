import { formatoMoneda } from '../../utils/format';
import { NumberInput } from '../shared';

export default function ProductTable({ filas, totales, onCantidad, descuentoActivo, esVentas = false }) {
  if (esVentas) {
    return (
      <div className="table-wrap">
        <table className="product-table product-table-sales">
          <thead><tr><th>Código</th><th>Producto</th><th>Contenido</th><th>Unid.</th><th>Precio/u</th><th>Total</th></tr></thead>
          <tbody>{filas.map((p) => <tr key={p.codigo}><td>{p.codigo}</td><td><b>{p.producto}</b><small>{p.categoria}</small></td><td>{p.contenido}</td><td><NumberInput value={p.unidades} onChange={(v) => onCantidad(p.codigo, v)} /></td><td>{formatoMoneda(p.precioPublico)}</td><td className="bold">{formatoMoneda(p.subtotalPrecioPublico)}</td></tr>)}</tbody>
          <tfoot><tr><td colSpan="3">TOTAL</td><td>{totales.totalUnidades || 0}</td><td></td><td className="bold">{formatoMoneda(totales.totalPrecioPublico)}</td></tr></tfoot>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead><tr><th>Código</th><th>Producto</th><th>Contenido</th><th>Unid.</th><th>Pts/u</th><th>Subtotal pts</th><th>Público/u</th><th>Total público</th><th>Desc.</th><th>Total desc.</th></tr></thead>
        <tbody>{filas.map((p) => <tr key={p.codigo}><td>{p.codigo}</td><td><b>{p.producto}</b><small>{p.categoria}</small></td><td>{p.contenido}</td><td><NumberInput value={p.unidades} onChange={(v) => onCantidad(p.codigo, v)} /></td><td>{p.puntosUnitarios}</td><td className="bold">{p.subtotalPuntos}</td><td>{formatoMoneda(p.precioPublico)}</td><td>{formatoMoneda(p.subtotalPrecioPublico)}</td><td>{descuentoActivo}%</td><td className="bold">{formatoMoneda(p.subtotalPrecioActivo)}</td></tr>)}</tbody>
        <tfoot><tr><td colSpan="3">TOTAL</td><td>{totales.totalUnidades || 0}</td><td></td><td className="bold">{totales.totalPuntos || 0}</td><td></td><td className="bold">{formatoMoneda(totales.totalPrecioPublico)}</td><td>{descuentoActivo}%</td><td className="bold">{formatoMoneda(totales.totalPrecioActivo)}</td></tr></tfoot>
      </table>
    </div>
  );
}
