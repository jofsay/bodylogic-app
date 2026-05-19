import { formatoMoneda } from '../../utils/format';
import { Badge, NumberInput } from '../shared';

export default function ProductCard({ producto, onCantidad, esVentas = false }) {
  return (
    <article className="product-card">
      <div className="product-card-head"><Badge>{producto.categoria}</Badge><strong>{producto.codigo}</strong></div>
      <h3>{producto.producto}</h3>
      <p>{producto.contenido || 'Sin contenido especificado'}</p>
      <div className="product-metrics">
        {!esVentas && <span>Pts/u <b>{producto.puntosUnitarios}</b></span>}
        <span>Precio/u <b>{formatoMoneda(producto.precioPublico)}</b></span>
        {!esVentas && <span>Desc. activo <b>{producto.descuentoActivo}%</b></span>}
        <span>{esVentas ? 'Subtotal' : 'Total desc.'} <b>{formatoMoneda(producto.subtotalPrecioActivo)}</b></span>
      </div>
      <div className="quantity-line"><span>Unidades</span><NumberInput value={producto.unidades} onChange={(v) => onCantidad(producto.codigo, v)} /></div>
      {producto.unidades > 0 && (
        <div className="selected-strip">
          {esVentas
            ? `${producto.unidades} unidad(es) · ${formatoMoneda(producto.subtotalPrecioPublico)} total`
            : `${producto.subtotalPuntos} puntos · ${formatoMoneda(producto.subtotalPrecioPublico)} público · ${formatoMoneda(producto.subtotalPrecioActivo)} con ${producto.descuentoActivo}%`}
        </div>
      )}
    </article>
  );
}
