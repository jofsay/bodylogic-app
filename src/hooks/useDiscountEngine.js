import { useMemo } from 'react';
import { obtenerCompraInicial, calcularLealtad, calcularAcelerado, calcularClientePreferente, totalPorDescuento, estadoVisual } from '../utils/calculations';

export function useDiscountEngine({ perfilUsuario, modo, totales, recompra, clientePreferente, descuentoSimulador }) {
  return useMemo(() => {
    const totalPuntos = totales.totalPuntos || 0;
    const compraInicial = obtenerCompraInicial(totalPuntos, totales);
    const puntosPersonalesMes = totalPuntos + Number(recompra.puntosClientesPreferentes || 0);
    const lealtad = calcularLealtad({
      mes: recompra.mesActual,
      dentroPrimeros15: recompra.dentroPrimeros15,
      puntosPersonales: puntosPersonalesMes,
      descuentoActualDeclarado: recompra.descuentoActual,
    });
    const acelerado = calcularAcelerado({
      puntosPersonales: puntosPersonalesMes + Number(recompra.puntosPersonalesExtra || 0),
      puntosGrupales: recompra.puntosGrupales,
      acumuladoPrevio: recompra.acumuladoPrevio,
      ingreso500: recompra.ingreso500,
    });
    const cliente = calcularClientePreferente(totalPuntos + Number(clientePreferente.acumuladoPrevio || 0));

    let resumen;
    if (perfilUsuario === 'ventas') {
      resumen = {
        tipo: 'ventas',
        descuento: 0,
        precioAplicable: totales.totalPrecioPublico || 0,
        estado: totalPuntos > 0 ? 'green' : 'orange',
        mensajePrincipal: 'Nota de venta activa.',
        mensajeSecundario: 'El PDF del cliente no mostrará puntos ni descuentos; los puntos quedan solo como dato interno.',
      };
    } else if (perfilUsuario === 'simulador') {
      resumen = {
        tipo: 'simulador',
        descuento: descuentoSimulador,
        precioAplicable: totalPorDescuento(totales, descuentoSimulador),
        estado: 'green',
        mensajePrincipal: `Simulación activa al ${descuentoSimulador}%.`,
        mensajeSecundario: 'El selector de descuento controla todos los precios visibles.',
      };
    } else if (perfilUsuario === 'clientePreferente') {
      resumen = { tipo: 'clientePreferente', ...cliente, precioAplicable: totalPorDescuento(totales, cliente.descuento) };
    } else if (modo === 'compraInicial') {
      resumen = { tipo: 'compraInicial', ...compraInicial };
    } else if (recompra.programa === 'acelerado') {
      resumen = { tipo: 'acelerado', ...acelerado, precioAplicable: totalPorDescuento(totales, acelerado.descuento) };
    } else {
      resumen = { tipo: 'lealtad', ...lealtad, precioAplicable: totalPorDescuento(totales, lealtad.descuento) };
    }

    return {
      compraInicial,
      lealtad,
      acelerado,
      cliente,
      resumen: { ...resumen, visual: estadoVisual(resumen.estado) },
      descuentoActivo: resumen.descuento || 0,
      puntosPersonalesMes,
    };
  }, [perfilUsuario, modo, totales, recompra, clientePreferente, descuentoSimulador]);
}