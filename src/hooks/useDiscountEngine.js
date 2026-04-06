import { useMemo } from "react";
import * as C from "../utils/calculations";

export function useDiscountEngine({
  perfilUsuario, modo,
  paqueteInicial, tieneRed, mesProgresivo, fueReseteado,
  puntosPersonalesMes, puntosCPMes,
  puntosPersonalesAcum, puntosGrupalesAcum,
  cumplioQuincenaManual,
  acumuladoPrevioClientePreferente, totales,
}) {
  const { totalPuntos } = totales;

  // ── Auto-detect 15-day window ──
  const dentroPrimeros15 = useMemo(() => C.detectarPrimeros15Dias(), []);

  // ── Total puntos del mes = personales + CP + pedido actual ──
  const puntosMes = useMemo(
    () => Number(puntosPersonalesMes || 0) + Number(puntosCPMes || 0) + totalPuntos,
    [puntosPersonalesMes, puntosCPMes, totalPuntos]
  );

  // ── ¿Cumplió la primera quincena? ──
  // Si estamos en los primeros 15 días: se determina por puntosMes >= 100
  // Si ya pasó el día 15: se usa la respuesta manual del usuario
  const cumplioQuincena = useMemo(() => {
    if (dentroPrimeros15) return puntosMes >= 100;
    return cumplioQuincenaManual;
  }, [dentroPrimeros15, puntosMes, cumplioQuincenaManual]);

  // ── Compra Inicial ──
  const paqueteActual = useMemo(() => C.obtenerPaqueteCompraInicial(totalPuntos, totales), [totalPuntos, totales]);

  // ── Cliente Preferente ──
  const puntosAcumuladosCP = Number(acumuladoPrevioClientePreferente || 0) + totalPuntos;
  const descuentoCP = C.obtenerDescuentoClientePreferente(puntosAcumuladosCP);
  const totalSegunDescuentoCP = C.obtenerTotalSegunDescuentoCP(descuentoCP, totales);
  const siguienteNivelCP = C.obtenerSiguienteNivelCP(puntosAcumuladosCP);

  // ── Resolución unificada de descuento ──
  const resultado = useMemo(() => {
    return C.resolverDescuento({
      paqueteInicial: paqueteInicial || 100,
      tieneRed: tieneRed || false,
      puntosMes,
      puntosPersonalesAcum: puntosPersonalesAcum || 0,
      puntosGrupalesAcum: puntosGrupalesAcum || 0,
      mesProgresivo: mesProgresivo || 1,
      cumplioQuincena,
      fueReseteado: fueReseteado || false,
    });
  }, [paqueteInicial, tieneRed, puntosMes, puntosPersonalesAcum, puntosGrupalesAcum, mesProgresivo, cumplioQuincena, fueReseteado]);

  // ── Mensajes quincenales ──
  const mensajesQuincenales = useMemo(
    () => C.generarMensajesQuincenales(puntosMes, cumplioQuincena, resultado.descuento === 42),
    [puntosMes, cumplioQuincena, resultado.descuento]
  );

  // ── Estado unificado para semáforo ──
  const estado = useMemo(() => {
    if (perfilUsuario === "clientePreferente") return C.obtenerMensajeClientePreferente(puntosAcumuladosCP);
    if (modo === "compraInicial") return C.obtenerMensajeCompraInicial(totalPuntos, paqueteActual);
    return resultado;
  }, [perfilUsuario, modo, totalPuntos, paqueteActual, puntosAcumuladosCP, resultado]);

  const descuentoActual = perfilUsuario === "clientePreferente" ? descuentoCP : modo === "compraInicial" ? paqueteActual.descuento : resultado.descuento;
  const totalConDescuento = perfilUsuario === "clientePreferente" ? totalSegunDescuentoCP : modo === "compraInicial" ? paqueteActual.totalConDescuento : C.obtenerTotalSegunDescuento(resultado.descuento, totales);

  const obtenerPrecio = (item) => C.obtenerPrecioActual(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, resultado.descuento);
  const obtenerSubtotal = (item) => C.obtenerSubtotalPedido(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, resultado.descuento);

  const textoModo = (() => {
    if (perfilUsuario === "clientePreferente") return `Cliente Preferente | ${descuentoCP}% | Acumulado ${puntosAcumuladosCP}`;
    if (modo === "compraInicial") return `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    const mod = resultado.modalidad === "membresia" ? "Membresía" : resultado.modalidad === "comunidad" ? "Comunidad" : "Progresiva";
    return `${mod} | ${resultado.descuento}%${resultado.acumulado ? ` | Acum. ${resultado.acumulado}` : ""}`;
  })();

  return {
    paqueteActual, dentroPrimeros15, cumplioQuincena, puntosMes,
    mensajesQuincenales, resultado,
    puntosAcumuladosCP, descuentoCP, totalSegunDescuentoCP, siguienteNivelCP,
    estado, descuentoActual, totalConDescuento, obtenerPrecio, obtenerSubtotal, textoModo,
  };
}