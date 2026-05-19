import { numeroSeguro } from './format';

export const INITIAL_PACKAGE_RULES = [
  { min: 500, max: Infinity, nombre: 'Paquete 500', puntosBase: 500, descuento: 42, siguiente: null },
  { min: 400, max: 499, nombre: 'Paquete 400', puntosBase: 400, descuento: 33, siguiente: 500 },
  { min: 300, max: 399, nombre: 'Paquete 300', puntosBase: 300, descuento: 33, siguiente: 400 },
  { min: 200, max: 299, nombre: 'Paquete 200', puntosBase: 200, descuento: 33, siguiente: 300 },
  { min: 100, max: 199, nombre: 'Paquete 100', puntosBase: 100, descuento: 30, siguiente: 200 },
];
const DISCOUNT_FIELD = { 10: 'precioCP10', 20: 'precio20', 30: 'precio30', 33: 'precio33', 35: 'precio35', 37: 'precio37', 40: 'precio40', 42: 'precio42' };
const TOTAL_FIELD = { 10: 'totalCP10', 20: 'total20', 30: 'total30', 33: 'total33', 35: 'total35', 37: 'total37', 40: 'total40', 42: 'total42' };

export function precioUnitarioPorDescuento(producto, descuento) {
  const d = Number(descuento) || 0;
  const precioPublico = numeroSeguro(producto.precioPublico);
  if (!d) return precioPublico;
  const campo = DISCOUNT_FIELD[d];
  return campo ? numeroSeguro(producto[campo]) || precioPublico : precioPublico * (1 - d / 100);
}
export function totalPorDescuento(totales, descuento) {
  const d = Number(descuento) || 0;
  const publico = numeroSeguro(totales.totalPrecioPublico);
  if (!d) return publico;
  const campo = TOTAL_FIELD[d];
  return campo ? numeroSeguro(totales[campo]) || publico : publico * (1 - d / 100);
}

export function calcularFilas(productos, cantidades, descuentoActivo = 0) {
  return productos.map((p) => {
    const unidades = numeroSeguro(cantidades[p.codigo]);
    const mul = (campo) => unidades * numeroSeguro(p[campo]);
    const precioActivoUnitario = descuentoActivo > 0 ? precioUnitarioPorDescuento(p, descuentoActivo) : numeroSeguro(p.precioPublico);
    return {
      ...p,
      unidades,
      puntosUnitarios: numeroSeguro(p.puntos),
      subtotalPuntos: unidades * numeroSeguro(p.puntos),
      subtotalPrecioPublico: mul('precioPublico'),
      subtotalValorComisionable: mul('valorComisionable'),
      subtotalCP10: mul('precioCP10'), subtotal20: mul('precio20'), subtotal30: mul('precio30'), subtotal33: mul('precio33'), subtotal35: mul('precio35'), subtotal37: mul('precio37'), subtotal40: mul('precio40'), subtotal42: mul('precio42'),
      descuentoActivo,
      precioActivoUnitario,
      subtotalPrecioActivo: unidades * precioActivoUnitario,
    };
  });
}
export function sumarTotales(filas) {
  const campos = ['unidades', 'subtotalPuntos', 'subtotalPrecioPublico', 'subtotalValorComisionable', 'subtotalCP10', 'subtotal20', 'subtotal30', 'subtotal33', 'subtotal35', 'subtotal37', 'subtotal40', 'subtotal42', 'subtotalPrecioActivo'];
  return campos.reduce((acc, campo) => {
    const key = campo === 'unidades' ? 'totalUnidades' : campo.replace('subtotal', 'total');
    return { ...acc, [key]: filas.reduce((s, f) => s + numeroSeguro(f[campo]), 0) };
  }, {});
}
export function obtenerCompraInicial(puntos, totales) {
  const regla = INITIAL_PACKAGE_RULES.find((r) => puntos >= r.min && puntos <= r.max);
  if (!regla) return { nombre: 'Aún no calificas', puntosBase: 0, descuento: 0, precioAplicable: 0, siguienteObjetivo: 100, siguientePaquete: 'Paquete 100', faltan: Math.max(0, 100 - puntos), estado: 'red', mensajePrincipal: 'Agrega productos hasta llegar a 100 puntos.', mensajeSecundario: `Faltan ${Math.max(0, 100 - puntos)} puntos para Paquete 100.` };
  const precioAplicable = totalPorDescuento(totales, regla.descuento);
  return { ...regla, precioAplicable, siguienteObjetivo: regla.siguiente, siguientePaquete: regla.siguiente ? `Paquete ${regla.siguiente}` : null, faltan: regla.siguiente ? Math.max(0, regla.siguiente - puntos) : 0, estado: regla.min >= 500 ? 'green' : 'orange', mensajePrincipal: `${regla.nombre} alcanzado con ${regla.descuento}% de descuento.`, mensajeSecundario: regla.siguiente ? `Faltan ${Math.max(0, regla.siguiente - puntos)} puntos para ${regla.siguiente} puntos.` : 'Ya estás en el paquete máximo de compra inicial.' };
}
export function descuentoPorMesLealtad(mes) { const m = Math.max(1, Number(mes) || 1); if (m >= 18) return 42; if (m >= 12) return 40; if (m >= 6) return 37; if (m >= 4) return 35; if (m >= 2) return 33; return 30; }
export function calcularLealtad({ mes, dentroPrimeros15, puntosPersonales, descuentoActualDeclarado }) {
  const puntos = numeroSeguro(puntosPersonales);
  const califica100 = dentroPrimeros15 && puntos >= 100;
  const descuentoEscala = califica100 ? descuentoPorMesLealtad(mes) : 30;
  const descuentoBase = descuentoActualDeclarado ? Number(descuentoActualDeclarado) : descuentoEscala;
  const requiere200 = descuentoBase === 42 || descuentoEscala === 42;
  const mantiene42 = dentroPrimeros15 && puntos >= 200;
  const descuento = requiere200 ? (mantiene42 ? 42 : Math.min(descuentoEscala, 40)) : descuentoEscala;
  return { modalidad: 'PL', puntos, descuento, califica100, mantiene42, requiere200, faltan100: Math.max(0, 100 - puntos), faltan200: Math.max(0, 200 - puntos), estado: !califica100 ? 'red' : requiere200 && !mantiene42 ? 'orange' : 'green', mensajePrincipal: !califica100 ? 'Todavía no calificas para comisiones del mes.' : requiere200 && !mantiene42 ? 'Calificas, pero no mantienes 42% porque faltan puntos para 200.' : 'Recompra mensual correcta.', mensajeSecundario: !califica100 ? `Faltan ${Math.max(0, 100 - puntos)} puntos para calificar.` : requiere200 && !mantiene42 ? `Faltan ${Math.max(0, 200 - puntos)} puntos para mantener 42%.` : `Descuento operativo: ${descuento}%.` };
}
export function calcularAcelerado({ puntosPersonales, puntosGrupales, acumuladoPrevio, ingreso500 }) {
  const base = ingreso500 ? Math.max(500, numeroSeguro(acumuladoPrevio)) : numeroSeguro(acumuladoPrevio);
  const total = base + numeroSeguro(puntosPersonales) + numeroSeguro(puntosGrupales);
  let descuento = 0, siguiente = 1;
  if (total >= 3001) { descuento = 42; siguiente = null; }
  else if (total >= 1501) { descuento = 40; siguiente = 3001; }
  else if (total >= 501) { descuento = 35; siguiente = 1501; }
  else if (total >= 1) { descuento = 30; siguiente = 501; }
  return { modalidad: 'PLA', acumuladoTotal: total, descuento, siguienteObjetivo: siguiente, faltan: siguiente ? Math.max(0, siguiente - total) : 0, estado: total >= 3001 ? 'green' : total >= 1 ? 'orange' : 'red', mensajePrincipal: total >= 3001 ? 'Lealtad acelerada al 42%.' : total > 0 ? `Lealtad acelerada al ${descuento}%.` : 'Sin puntos acumulados aún.', mensajeSecundario: siguiente ? `Faltan ${Math.max(0, siguiente - total)} puntos para el siguiente escalón.` : 'Ya estás en el escalón máximo.' };
}
export function calcularClientePreferente(puntosAcumulados) {
  const puntos = numeroSeguro(puntosAcumulados);
  if (puntos >= 650) return { descuento: 20, siguiente: null, faltan: 0, estado: 'green', mensajePrincipal: 'Cliente Preferente en 20%.', mensajeSecundario: 'Ya alcanzó el nivel máximo de Cliente Preferente.' };
  if (puntos >= 150) return { descuento: 15, siguiente: 650, faltan: 650 - puntos, estado: 'orange', mensajePrincipal: 'Cliente Preferente en 15%.', mensajeSecundario: `Faltan ${650 - puntos} puntos para subir al 20%.` };
  return { descuento: 10, siguiente: 150, faltan: Math.max(0, 150 - puntos), estado: puntos > 0 ? 'orange' : 'red', mensajePrincipal: 'Cliente Preferente en 10%.', mensajeSecundario: `Faltan ${Math.max(0, 150 - puntos)} puntos para subir al 15%.` };
}
export function estadoVisual(status) {
  if (status === 'green') return { colorFondo: '#ecfccb', colorTexto: '#3f6212', colorBorde: '#84cc16', colorSemaforo: '#65a30d' };
  if (status === 'orange') return { colorFondo: '#fef3c7', colorTexto: '#92400e', colorBorde: '#f59e0b', colorSemaforo: '#d97706' };
  return { colorFondo: '#fee2e2', colorTexto: '#991b1b', colorBorde: '#ef4444', colorSemaforo: '#dc2626' };
}