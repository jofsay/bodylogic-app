import { DISCOUNT_OPTIONS } from '../../config/tokens';
import { Button, Card, Field, NumberInput } from '../shared';

export default function ControlPanel({
  perfilUsuario,
  setPerfilUsuario,
  modo,
  setModo,
  descuentoSimulador,
  setDescuentoSimulador,
  nombreCliente,
  setNombreCliente,
  recompra,
  setRecompra,
  clientePreferente,
  setClientePreferente,
}) {
  return (
    <div className="control-grid">
      <Card>
        <h2>Perfil de cálculo</h2>
        <div className="segmented">
          <Button variant={perfilUsuario === 'distribuidor' ? 'primary' : 'ghost'} onClick={() => setPerfilUsuario('distribuidor')}>Distribuidor Independiente</Button>
          <Button variant={perfilUsuario === 'clientePreferente' ? 'primary' : 'ghost'} onClick={() => setPerfilUsuario('clientePreferente')}>Cliente Preferente</Button>
          <Button variant={perfilUsuario === 'simulador' ? 'primary' : 'ghost'} onClick={() => setPerfilUsuario('simulador')}>Simulador de precios</Button>
          <Button variant={perfilUsuario === 'ventas' ? 'primary' : 'ghost'} onClick={() => setPerfilUsuario('ventas')}>Ventas</Button>
        </div>
      </Card>

      {perfilUsuario === 'ventas' && (
        <Card>
          <h2>Nota de venta</h2>
          <p className="hint">Este perfil no aplica descuentos ni muestra puntos al cliente. La nota PDF sale únicamente con precio y total de la compra.</p>
          <Field label="Nombre del cliente para la nota PDF">
            <input
              className="input"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Ej. María Fernanda López"
            />
          </Field>
        </Card>
      )}

      {perfilUsuario === 'distribuidor' && (
        <Card>
          <h2>Panel de control</h2>
          <div className="segmented">
            <Button variant={modo === 'compraInicial' ? 'primary' : 'ghost'} onClick={() => setModo('compraInicial')}>Compra inicial</Button>
            <Button variant={modo === 'recompra' ? 'primary' : 'ghost'} onClick={() => setModo('recompra')}>Recompra mensual</Button>
          </div>
          <p className="hint">La compra inicial detecta automáticamente el paquete por puntos; ya no se elige manualmente.</p>
        </Card>
      )}

      {perfilUsuario === 'simulador' && (
        <Card>
          <h2>Selector de descuento</h2>
          <div className="discount-row">
            {DISCOUNT_OPTIONS.map((d) => <Button key={d} variant={descuentoSimulador === d ? 'primary' : 'ghost'} onClick={() => setDescuentoSimulador(d)}>{d}%</Button>)}
          </div>
          <p className="hint">Este descuento se refleja en tarjetas, tabla y pedido actual.</p>
        </Card>
      )}

      {perfilUsuario === 'clientePreferente' && (
        <Card>
          <h2>Cliente Preferente</h2>
          <p className="hint">Inicia en 10%. Sube a 15% al acumular 150 puntos y a 20% al acumular 650 puntos.</p>
          <Field label="Puntos acumulados previos">
            <NumberInput value={clientePreferente.acumuladoPrevio} onChange={(v) => setClientePreferente((s) => ({ ...s, acumuladoPrevio: v }))} />
          </Field>
        </Card>
      )}

      {perfilUsuario === 'distribuidor' && modo === 'recompra' && (
        <Card>
          <h2>Recompra mensual</h2>
          <div className="segmented">
            <Button variant={recompra.programa === 'lealtad' ? 'primary' : 'ghost'} onClick={() => setRecompra((s) => ({ ...s, programa: 'lealtad' }))}>Programa de Lealtad</Button>
            <Button variant={recompra.programa === 'acelerado' ? 'primary' : 'ghost'} onClick={() => setRecompra((s) => ({ ...s, programa: 'acelerado' }))}>Lealtad Acelerado</Button>
          </div>
          {recompra.programa === 'lealtad' ? (
            <div className="form-grid">
              <Field label="Mes actual"><NumberInput value={recompra.mesActual} onChange={(v) => setRecompra((s) => ({ ...s, mesActual: v }))} /></Field>
              <Field label="Puntos de CP / personales adicionales"><NumberInput value={recompra.puntosClientesPreferentes} onChange={(v) => setRecompra((s) => ({ ...s, puntosClientesPreferentes: v }))} /></Field>
              <Field label="Descuento actual declarado"><select className="input" value={recompra.descuentoActual} onChange={(e) => setRecompra((s) => ({ ...s, descuentoActual: Number(e.target.value) }))}>{[30, 33, 35, 37, 40, 42].map((d) => <option key={d} value={d}>{d}%</option>)}</select></Field>
              <Field label="Compra dentro de primeros 15 días"><select className="input" value={recompra.dentroPrimeros15 ? 'si' : 'no'} onChange={(e) => setRecompra((s) => ({ ...s, dentroPrimeros15: e.target.value === 'si' }))}><option value="si">Sí</option><option value="no">No</option></select></Field>
            </div>
          ) : (
            <div className="form-grid">
              <Field label="Puntos CP / personales adicionales"><NumberInput value={recompra.puntosClientesPreferentes} onChange={(v) => setRecompra((s) => ({ ...s, puntosClientesPreferentes: v }))} /></Field>
              <Field label="Puntos grupales"><NumberInput value={recompra.puntosGrupales} onChange={(v) => setRecompra((s) => ({ ...s, puntosGrupales: v }))} /></Field>
              <Field label="Acumulado previo"><NumberInput value={recompra.acumuladoPrevio} onChange={(v) => setRecompra((s) => ({ ...s, acumuladoPrevio: v }))} /></Field>
              <Field label="Ingresó originalmente con paquete 500"><select className="input" value={recompra.ingreso500 ? 'si' : 'no'} onChange={(e) => setRecompra((s) => ({ ...s, ingreso500: e.target.value === 'si' }))}><option value="no">No</option><option value="si">Sí</option></select></Field>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
