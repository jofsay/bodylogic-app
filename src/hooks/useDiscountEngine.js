import { useMemo } from "react";
import * as C from "../utils/calculations";

export function useDiscountEngine({
  perfilUsuario, modo, programaRecompra, mesLealtad,
  puntosPersonalesAcelerado, puntosGrupalesAcelerado, acumuladoPrevioAcelerado,
  puntosBaseInicial, reiniciadoComunidad,
  acumuladoPrevioClientePreferente, totales,
}) {
  const { totalPuntos } = totales;

  // ── Auto-detect 15-day window ──
  const dentroPrimeros15 = useMemo(() => C.detectarPrimeros15Dias(), []);
  const mensajeVentana = C.mensajeVentana15Dias(dentroPrimeros15);

  // ── Base messages (calificación 100 + mantenimiento 200) ──
  const mensajesBase = useMemo(() => C.obtenerMensajesBase(totalPuntos), [totalPuntos]);

  // ── Compra Inicial ──
  const paqueteActual = useMemo(() => C.obtenerPaqueteCompraInicial(totalPuntos, totales), [totalPuntos, totales]);

  // ── Membresía ──
  const mensajeMembresia = useMemo(
    () => C.obtenerMensajeMembresia(totalPuntos, dentroPrimeros15),
    [totalPuntos, dentroPrimeros15]
  );

  // ── Lealtad (Puntos Personales y CP) ──
  const descuentoLealtadActual = C.obtenerDescuentoLealtad(mesLealtad);
  const totalSegunDescuentoLealtad = C.obtenerTotalSegunDescuento(descuentoLealtadActual, totales);
  const siguienteEscalonLealtad = C.obtenerSiguienteEscalonLealtad(mesLealtad);

  // ── Acelerado (Puntos en Comunidad) ──
  const totalAcumuladoAcelerado = useMemo(
    () => C.calcularAcumuladoComunidad({
      puntosPersonales: puntosPersonalesAcelerado,
      puntosGrupales: puntosGrupalesAcelerado,
      acumuladoPrevio: acumuladoPrevioAcelerado,
      puntosBaseInicial: puntosBaseInicial || 0,
      reiniciado: reiniciadoComunidad || false,
    }),
    [puntosPersonalesAcelerado, puntosGrupalesAcelerado, acumuladoPrevioAcelerado, puntosBaseInicial, reiniciadoComunidad]
  );
  const descuentoAceleradoActual = C.obtenerDescuentoAcelerado(totalAcumuladoAcelerado);
  const totalSegunDescuentoAcelerado = C.obtenerTotalSegunDescuento(descuentoAceleradoActual, totales);
  const siguienteEscalonAcelerado = C.obtenerSiguienteEscalonAcelerado(totalAcumuladoAcelerado);

  // ── Cliente Preferente ──
  const puntosAcumuladosCP = Number(acumuladoPrevioClientePreferente || 0) + Number(totalPuntos || 0);
  const descuentoCP = C.obtenerDescuentoClientePreferente(puntosAcumuladosCP);
  const totalSegunDescuentoCP = C.obtenerTotalSegunDescuentoCP(descuentoCP, totales);
  const siguienteNivelCP = C.obtenerSiguienteNivelCP(puntosAcumuladosCP);

  // ── Unified status ──
  const estado = useMemo(() => {
    if (perfilUsuario === "clientePreferente") return C.obtenerMensajeClientePreferente(puntosAcumuladosCP);
    if (modo === "compraInicial") return C.obtenerMensajeCompraInicial(totalPuntos, paqueteActual);
    if (programaRecompra === "membresia") return mensajeMembresia;
    if (programaRecompra === "lealtad") return C.obtenerMensajeLealtad(totalPuntos, mesLealtad, dentroPrimeros15, descuentoLealtadActual, siguienteEscalonLealtad);
    return C.obtenerMensajeAcelerado(totalAcumuladoAcelerado, descuentoAceleradoActual, siguienteEscalonAcelerado, dentroPrimeros15, totalPuntos);
  }, [perfilUsuario, modo, programaRecompra, totalPuntos, paqueteActual, mensajeMembresia, mesLealtad, dentroPrimeros15, descuentoLealtadActual, siguienteEscalonLealtad, totalAcumuladoAcelerado, descuentoAceleradoActual, siguienteEscalonAcelerado, puntosAcumuladosCP]);

  const descuentoActual =
    perfilUsuario === "clientePreferente" ? descuentoCP
    : modo === "compraInicial" ? paqueteActual.descuento
    : programaRecompra === "membresia" ? 42
    : programaRecompra === "lealtad" ? descuentoLealtadActual
    : descuentoAceleradoActual;

  const totalConDescuento =
    perfilUsuario === "clientePreferente" ? totalSegunDescuentoCP
    : modo === "compraInicial" ? paqueteActual.totalConDescuento
    : programaRecompra === "membresia" ? totales.total42
    : programaRecompra === "lealtad" ? totalSegunDescuentoLealtad
    : totalSegunDescuentoAcelerado;

  const obtenerPrecio = (item) => C.obtenerPrecioActual(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, descuentoLealtadActual, descuentoAceleradoActual, programaRecompra);
  const obtenerSubtotal = (item) => C.obtenerSubtotalPedido(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, descuentoLealtadActual, descuentoAceleradoActual, programaRecompra);

  const textoModo = (() => {
    if (perfilUsuario === "clientePreferente") return `Cliente Preferente | ${descuentoCP}% | Acumulado ${puntosAcumuladosCP}`;
    if (modo === "compraInicial") return `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    if (programaRecompra === "membresia") return `Membresía (Paquete 500) | 42%`;
    if (programaRecompra === "lealtad") return `Pts Personales y CP | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;
    return `Pts en Comunidad | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
  })();

  return {
    paqueteActual, dentroPrimeros15, mensajeVentana, mensajesBase, mensajeMembresia,
    descuentoLealtadActual, totalSegunDescuentoLealtad, siguienteEscalonLealtad,
    totalAcumuladoAcelerado, descuentoAceleradoActual, totalSegunDescuentoAcelerado, siguienteEscalonAcelerado,
    puntosAcumuladosCP, descuentoCP, totalSegunDescuentoCP, siguienteNivelCP,
    estado, descuentoActual, totalConDescuento, obtenerPrecio, obtenerSubtotal, textoModo,
  };
}
