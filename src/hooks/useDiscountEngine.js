import { useMemo } from "react";
import * as C from "../utils/calculations";

/**
 * Computes the active discount, status message, and price resolvers
 * based on the current profile, mode, and totals.
 *
 * This is the single point where profile logic converges.
 */
export function useDiscountEngine({
  perfilUsuario,
  modo,
  programaRecompra,
  mesLealtad,
  dentroPrimeros15,
  puntosPersonalesAcelerado,
  puntosGrupalesAcelerado,
  acumuladoPrevioAcelerado,
  acumuladoPrevioClientePreferente,
  totales,
}) {
  const { totalPuntos } = totales;

  // ── Compra Inicial ──
  const paqueteActual = useMemo(
    () => C.obtenerPaqueteCompraInicial(totalPuntos, totales),
    [totalPuntos, totales]
  );

  // ── Lealtad ──
  const descuentoLealtadActual = C.obtenerDescuentoLealtad(mesLealtad);
  const totalSegunDescuentoLealtad = C.obtenerTotalSegunDescuento(descuentoLealtadActual, totales);
  const siguienteEscalonLealtad = C.obtenerSiguienteEscalonLealtad(mesLealtad);

  // ── Acelerado ──
  const totalAcumuladoAcelerado =
    Number(puntosPersonalesAcelerado || 0) +
    Number(puntosGrupalesAcelerado || 0) +
    Number(acumuladoPrevioAcelerado || 0);
  const descuentoAceleradoActual = C.obtenerDescuentoAcelerado(totalAcumuladoAcelerado);
  const totalSegunDescuentoAcelerado = C.obtenerTotalSegunDescuento(descuentoAceleradoActual, totales);
  const siguienteEscalonAcelerado = C.obtenerSiguienteEscalonAcelerado(totalAcumuladoAcelerado);

  // ── Cliente Preferente ──
  const puntosAcumuladosCP =
    Number(acumuladoPrevioClientePreferente || 0) + Number(totalPuntos || 0);
  const descuentoCP = C.obtenerDescuentoClientePreferente(puntosAcumuladosCP);
  const totalSegunDescuentoCP = C.obtenerTotalSegunDescuentoCP(descuentoCP, totales);
  const siguienteNivelCP = C.obtenerSiguienteNivelCP(puntosAcumuladosCP);

  // ── Unified status message ──
  const estado = useMemo(() => {
    if (perfilUsuario === "clientePreferente")
      return C.obtenerMensajeClientePreferente(puntosAcumuladosCP);
    if (modo === "compraInicial")
      return C.obtenerMensajeCompraInicial(totalPuntos, paqueteActual);
    if (programaRecompra === "lealtad")
      return C.obtenerMensajeLealtad(totalPuntos, mesLealtad, dentroPrimeros15, descuentoLealtadActual, siguienteEscalonLealtad);
    return C.obtenerMensajeAcelerado(totalAcumuladoAcelerado, descuentoAceleradoActual, siguienteEscalonAcelerado);
  }, [
    perfilUsuario, modo, programaRecompra, totalPuntos, paqueteActual,
    mesLealtad, dentroPrimeros15, descuentoLealtadActual, siguienteEscalonLealtad,
    totalAcumuladoAcelerado, descuentoAceleradoActual, siguienteEscalonAcelerado,
    puntosAcumuladosCP,
  ]);

  // ── Unified current discount % ──
  const descuentoActual =
    perfilUsuario === "clientePreferente" ? descuentoCP
    : modo === "compraInicial" ? paqueteActual.descuento
    : programaRecompra === "lealtad" ? descuentoLealtadActual
    : descuentoAceleradoActual;

  // ── Unified total with discount ──
  const totalConDescuento =
    perfilUsuario === "clientePreferente" ? totalSegunDescuentoCP
    : modo === "compraInicial" ? paqueteActual.totalConDescuento
    : programaRecompra === "lealtad" ? totalSegunDescuentoLealtad
    : totalSegunDescuentoAcelerado;

  // ── Price resolver for a single item ──
  const obtenerPrecio = (item) =>
    C.obtenerPrecioActual(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, descuentoLealtadActual, descuentoAceleradoActual, programaRecompra);

  const obtenerSubtotal = (item) =>
    C.obtenerSubtotalPedido(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, descuentoLealtadActual, descuentoAceleradoActual, programaRecompra);

  // ── Mode label for PDF/print ──
  const textoModo = (() => {
    if (perfilUsuario === "clientePreferente")
      return `Cliente Preferente | ${descuentoCP}% | Acumulado ${puntosAcumuladosCP}`;
    if (modo === "compraInicial")
      return `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    if (programaRecompra === "lealtad")
      return `Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;
    return `Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
  })();

  return {
    // Compra inicial
    paqueteActual,

    // Lealtad
    descuentoLealtadActual,
    totalSegunDescuentoLealtad,
    siguienteEscalonLealtad,

    // Acelerado
    totalAcumuladoAcelerado,
    descuentoAceleradoActual,
    totalSegunDescuentoAcelerado,
    siguienteEscalonAcelerado,

    // Cliente Preferente
    puntosAcumuladosCP,
    descuentoCP,
    totalSegunDescuentoCP,
    siguienteNivelCP,

    // Unified
    estado,
    descuentoActual,
    totalConDescuento,
    obtenerPrecio,
    obtenerSubtotal,
    textoModo,
  };
}
