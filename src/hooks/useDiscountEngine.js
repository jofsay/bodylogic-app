import { useMemo } from "react";
import * as C from "../utils/calculations";

export function useDiscountEngine({
  perfilUsuario, modo, programaRecompra, mesLealtad,
  puntosPersonalesAcelerado, puntosClientesPreferentes, puntosGrupalesAcelerado,
  puntosBaseInicial,
  acumuladoPrevioClientePreferente, totales,
}) {
  const { totalPuntos } = totales;

  const dentroPrimeros15 = useMemo(() => C.detectarPrimeros15Dias(), []);
  const mensajeVentana = C.mensajeVentana15Dias(dentroPrimeros15);

  // ── Compra Inicial ──
  const paqueteActual = useMemo(() => C.obtenerPaqueteCompraInicial(totalPuntos, totales), [totalPuntos, totales]);

  // ── Membresía ──
  const mensajeMembresia = useMemo(() => C.obtenerMensajeMembresia(totalPuntos, dentroPrimeros15), [totalPuntos, dentroPrimeros15]);

  // ── Lealtad (Puntos Personales y CP) ──
  const descuentoLealtadActual = C.obtenerDescuentoLealtad(mesLealtad);
  const totalSegunDescuentoLealtad = C.obtenerTotalSegunDescuento(descuentoLealtadActual, totales);
  const siguienteEscalonLealtad = C.obtenerSiguienteEscalonLealtad(mesLealtad);

  // ── Comunidad: personales + CP + grupales + base + pedido ──
  const totalAcumuladoAcelerado = useMemo(
    () => C.calcularAcumuladoComunidad({
      puntosPersonales: puntosPersonalesAcelerado,
      puntosClientesPreferentes: puntosClientesPreferentes,
      puntosGrupales: puntosGrupalesAcelerado,
      puntosBaseInicial: puntosBaseInicial || 0,
      puntosPedidoActual: totalPuntos,
    }),
    [puntosPersonalesAcelerado, puntosClientesPreferentes, puntosGrupalesAcelerado, puntosBaseInicial, totalPuntos]
  );
  const descuentoAceleradoActual = C.obtenerDescuentoAcelerado(totalAcumuladoAcelerado);
  const totalSegunDescuentoAcelerado = C.obtenerTotalSegunDescuento(descuentoAceleradoActual, totales);
  const siguienteEscalonAcelerado = C.obtenerSiguienteEscalonAcelerado(totalAcumuladoAcelerado);

  // ── Cliente Preferente ──
  const puntosAcumuladosCP = Number(acumuladoPrevioClientePreferente || 0) + Number(totalPuntos || 0);
  const descuentoCP = C.obtenerDescuentoClientePreferente(puntosAcumuladosCP);
  const totalSegunDescuentoCP = C.obtenerTotalSegunDescuentoCP(descuentoCP, totales);
  const siguienteNivelCP = C.obtenerSiguienteNivelCP(puntosAcumuladosCP);

  // ── ya42 flag ──
  const ya42 = useMemo(() => {
    if (programaRecompra === "membresia") return true;
    if (programaRecompra === "lealtad") return mesLealtad >= 18;
    if (programaRecompra === "acelerado") return totalAcumuladoAcelerado >= 3001;
    return false;
  }, [programaRecompra, mesLealtad, totalAcumuladoAcelerado]);

  const mensajesBase = useMemo(() => C.obtenerMensajesBase(totalPuntos, ya42), [totalPuntos, ya42]);

  // ── Unified status ──
  const estado = useMemo(() => {
    if (perfilUsuario === "clientePreferente") return C.obtenerMensajeClientePreferente(puntosAcumuladosCP);
    if (modo === "compraInicial") return C.obtenerMensajeCompraInicial(totalPuntos, paqueteActual);
    if (programaRecompra === "membresia") return mensajeMembresia;
    if (programaRecompra === "lealtad") return C.obtenerMensajeLealtad(totalPuntos, mesLealtad, dentroPrimeros15, descuentoLealtadActual, siguienteEscalonLealtad);
    return C.obtenerMensajeAcelerado(totalAcumuladoAcelerado, descuentoAceleradoActual, siguienteEscalonAcelerado, dentroPrimeros15, totalPuntos, puntosBaseInicial || 0);
  }, [perfilUsuario, modo, programaRecompra, totalPuntos, paqueteActual, mensajeMembresia,
      mesLealtad, dentroPrimeros15, descuentoLealtadActual, siguienteEscalonLealtad,
      totalAcumuladoAcelerado, descuentoAceleradoActual, siguienteEscalonAcelerado,
      puntosAcumuladosCP, puntosBaseInicial]);

  const descuentoActual = perfilUsuario === "clientePreferente" ? descuentoCP : modo === "compraInicial" ? paqueteActual.descuento : programaRecompra === "membresia" ? 42 : programaRecompra === "lealtad" ? descuentoLealtadActual : descuentoAceleradoActual;
  const totalConDescuento = perfilUsuario === "clientePreferente" ? totalSegunDescuentoCP : modo === "compraInicial" ? paqueteActual.totalConDescuento : programaRecompra === "membresia" ? totales.total42 : programaRecompra === "lealtad" ? totalSegunDescuentoLealtad : totalSegunDescuentoAcelerado;

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
    paqueteActual, dentroPrimeros15, mensajeVentana, mensajesBase, mensajeMembresia, ya42,
    descuentoLealtadActual, totalSegunDescuentoLealtad, siguienteEscalonLealtad,
    totalAcumuladoAcelerado, descuentoAceleradoActual, totalSegunDescuentoAcelerado, siguienteEscalonAcelerado,
    puntosAcumuladosCP, descuentoCP, totalSegunDescuentoCP, siguienteNivelCP,
    estado, descuentoActual, totalConDescuento, obtenerPrecio, obtenerSubtotal, textoModo,
  };
}