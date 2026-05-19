import { formatoMoneda } from '../../utils/format';
import { Button, Card, MiniDato } from '../shared';

export default function OrderSummary({ filas, totales, resumen, descuentoActivo, perfilUsuario, nombreCliente, onClear, onRemove, onPdf, onPrint, onExport, onImport }) {
  const esVentas = perfilUsuario === 'ventas';

  return (
    <Card id="pedido-actual" className="order-summary">
      <div className="order-head">
        <div>
          <h2>{esVentas ? 'Nota de venta' : 'Pedido actual'}</h2>
          <p className="hint">
            {esVentas
              ? 'Vista de venta. El PDF para el cliente no incluye puntos ni descuentos.'
              : 'Reflejo real del pedido en construcción, producto por producto.'}
          </p>
        </div>
        <div className="order-actions">
          <Button variant="ghost" onClick={onExport}>Exportar</Button>
          <label className="btn btn-ghost file-btn">Importar<input type="file" accept="application/json" onChange={onImport} hidden /></label>
          <Button variant="ghost" onClick={onPrint}>Imprimir</Button>
          <Button variant="primary" onClick={onPdf}>{esVentas ? 'PDF nota' : 'PDF'}</Button>
          <Button variant="danger" onClick={onClear}>Limpiar</Button>
        </div>
      </div>

      <div className="status-panel status-inline" style={{ backgroundColor: resumen.visual.colorFondo, borderColor: resumen.visual.colorBorde, color: resumen.visual.colorTexto }}>
        <strong>{resumen.mensajePrincipal}</strong>
        <span>{resumen.mensajeSecundario}</span>
        {esVentas && <span className="private-note">Dato interno para el distribuidor: esta venta genera {totales.totalPuntos || 0} puntos.</span>}
      </div>

      {esVentas ? (
        <div className="mini-grid">
          <MiniDato label="Cliente" value={nombreCliente?.trim() || 'Sin nombre'} highlight />
          <MiniDato label="Total a pagar" value={formatoMoneda(totales.totalPrecioPublico)} highlight />
          <MiniDato label="Productos distintos" value={filas.length} />
          <MiniDato label="Puntos internos" value={totales.totalPuntos || 0} />
        </div>
      ) : (
        <div className="mini-grid">
          <MiniDato label="Puntos" value={totales.totalPuntos || 0} highlight />
          <MiniDato label="Precio" value={formatoMoneda(totales.totalPrecioPublico)} />
          <MiniDato label={`Con ${descuentoActivo}%`} value={formatoMoneda(totales.totalPrecioActivo)} highlight />
          <MiniDato label="Descuento activo" value={`${descuentoActivo}%`} />
        </div>
      )}

      {filas.length === 0 ? (
        <div className="empty">Agrega unidades en el catálogo para construir el pedido.</div>
      ) : (
        <div className="order-items">
          {filas.map((f) => (
            <div className="order-item" key={f.codigo}>
              <div>
                <strong>{f.producto}</strong>
                <span>{f.codigo} · {f.contenido}</span>
              </div>
              {esVentas ? (
                <div className="order-item-grid order-item-grid-sales">
                  <span>Cant. <b>{f.unidades}</b></span>
                  <span>Precio/u <b>{formatoMoneda(f.precioPublico)}</b></span>
                  <span>Total <b>{formatoMoneda(f.subtotalPrecioPublico)}</b></span>
                </div>
              ) : (
                <div className="order-item-grid">
                  <span>Cant. <b>{f.unidades}</b></span>
                  <span>Pts/u <b>{f.puntosUnitarios}</b></span>
                  <span>Pts total <b>{f.subtotalPuntos}</b></span>
                  <span>Precio/u <b>{formatoMoneda(f.precioPublico)}</b></span>
                  <span>Total <b>{formatoMoneda(f.subtotalPrecioPublico)}</b></span>
                  <span>Desc. <b>{f.descuentoActivo}%</b></span>
                  <span>Total desc. <b>{formatoMoneda(f.subtotalPrecioActivo)}</b></span>
                </div>
              )}
              <Button variant="ghost" onClick={() => onRemove(f.codigo)}>Quitar</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
