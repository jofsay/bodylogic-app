import { formatoMoneda } from '../../utils/format';
import { Button } from '../shared';

export default function FloatingSummary({ isMobile, resumen, totales, descuentoActivo, perfilUsuario, onPedido, onPdf, onPrint, onTop }) {
  if (!isMobile) return null;
  const v = resumen.visual;
  const esVentas = perfilUsuario === 'ventas';

  return (
    <div className="floating" style={{ backgroundColor: `${v.colorFondo}ee`, borderColor: v.colorBorde, color: v.colorTexto }}>
      <div className="float-row">
        <div><small>{esVentas ? 'Pts internos' : 'Puntos'}</small><strong>{totales.totalPuntos || 0}</strong></div>
        <div><small>{esVentas ? 'Modo' : 'Desc.'}</small><strong>{esVentas ? 'Venta' : `${descuentoActivo}%`}</strong></div>
        <div><small>Total</small><strong>{formatoMoneda(esVentas ? totales.totalPrecioPublico : totales.totalPrecioActivo)}</strong></div>
      </div>
      <p>{resumen.mensajePrincipal}</p>
      <div className="float-actions"><Button onClick={onPedido}>{esVentas ? 'Nota' : 'Pedido'}</Button><Button variant="ghost" onClick={onPdf}>PDF</Button><Button variant="ghost" onClick={onPrint}>Imprimir</Button><Button variant="ghost" onClick={onTop}>↑</Button></div>
    </div>
  );
}
