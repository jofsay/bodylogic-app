import { useMemo } from "react";
import * as C from "../utils/calculations";

export function useDiscountEngine({
  perfilUsuario, modo,
  paqueteInicial, tiene42, tieneRed, mesActual,
  puntosPersonalesMes,
  puntosPersonalesAcum, puntosGrupalesAcum,
  cumplioQuincenaManual,
  acumuladoPrevioClientePreferente, totales,
}) {
  const { totalPuntos } = totales;
  const dentroPrimeros15 = useMemo(() => C.detectarPrimeros15Dias(), []);

  // Puntos del mes = personales del mes + pedido actual
  // (CP ya incluidos en personales según regla del negocio)
  const puntosMes = Number(puntosPersonalesMes || 0) + totalPuntos;

  // ¿Cumplió la primera quincena?
  const cumplioQuincena = dentroPrimeros15 ? (puntosMes >= 100) : cumplioQuincenaManual;

  // Compra Inicial
  const paqueteActual = useMemo(() => C.obtenerPaqueteCompraInicial(totalPuntos, totales), [totalPuntos, totales]);

  // Cliente Preferente
  const puntosAcumuladosCP = Number(acumuladoPrevioClientePreferente || 0) + totalPuntos;
  const descuentoCP = C.obtenerDescuentoClientePreferente(puntosAcumuladosCP);
  const totalSegunDescuentoCP = C.obtenerTotalSegunDescuentoCP(descuentoCP, totales);
  const siguienteNivelCP = C.obtenerSiguienteNivelCP(puntosAcumuladosCP);

  // Mensajes de puntos
  const mensajesPuntos = useMemo(
    () => C.generarMensajesPuntos(puntosMes, tiene42, dentroPrimeros15, cumplioQuincena),
    [puntosMes, tiene42, dentroPrimeros15, cumplioQuincena]
  );

  // Resolución de descuento según flujo
  const resultado = useMemo(() => {
    if (tiene42) return { ...C.resolverTiene42(puntosMes, cumplioQuincena), modalidad: "tiene42" };
    if (tieneRed) return C.resolverPLA(puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, puntosMes, cumplioQuincena, totalPuntos);
    return C.resolverPL(puntosMes, mesActual || 1, cumplioQuincena);
  }, [tiene42, tieneRed, puntosMes, cumplioQuincena, puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, mesActual, totalPuntos]);

  // Estado unificado
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
    if (tiene42) return `Mantenimiento 42% | ${puntosMes} pts mes`;
    if (tieneRed) return `Lealtad Acelerado | ${resultado.acumulado || 0} pts | ${resultado.descuento}%`;
    return `Programa de Lealtad | Mes ${mesActual} | ${resultado.descuento}%`;
  })();

  return {
    paqueteActual, dentroPrimeros15, cumplioQuincena, puntosMes,
    mensajesPuntos, resultado,
    puntosAcumuladosCP, descuentoCP, totalSegunDescuentoCP, siguienteNivelCP,
    estado, descuentoActual, totalConDescuento, obtenerPrecio, obtenerSubtotal, textoModo,
  };
}