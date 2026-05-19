import { useMemo } from "react";
import * as C from "../utils/calculations";

export function useDiscountEngine({
  perfilUsuario, modo,
  paqueteInicial, tiene42, tieneRed, mesActual,
  puntosPersonalesMes,
  puntosPersonalesAcum, puntosGrupalesAcum,
  cumplioQuincenaManual, descuentoSimulador,
  acumuladoPrevioClientePreferente, totales,
}) {
  const { totalPuntos } = totales;
  const dentroPrimeros15 = useMemo(() => C.detectarPrimeros15Dias(), []);
  const puntosMes = Number(puntosPersonalesMes || 0) + totalPuntos;
  const cumplioQuincena = dentroPrimeros15 ? (puntosMes >= 100) : cumplioQuincenaManual;

  const paqueteActual = useMemo(() => C.obtenerPaqueteCompraInicial(totalPuntos, totales), [totalPuntos, totales]);

  // CP
  const puntosAcumuladosCP = Number(acumuladoPrevioClientePreferente || 0) + totalPuntos;
  const descuentoCP = C.obtenerDescuentoClientePreferente(puntosAcumuladosCP);
  const totalSegunDescuentoCP = C.obtenerTotalSegunDescuentoCP(descuentoCP, totales);
  const siguienteNivelCP = C.obtenerSiguienteNivelCP(puntosAcumuladosCP);

  const mensajesPuntos = useMemo(
    () => C.generarMensajesPuntos(puntosMes, tiene42, dentroPrimeros15, cumplioQuincena),
    [puntosMes, tiene42, dentroPrimeros15, cumplioQuincena]
  );

  const resultado = useMemo(() => {
    if (tiene42) return { ...C.resolverTiene42(puntosMes, cumplioQuincena), modalidad: "tiene42" };
    if (tieneRed) return C.resolverPLA(puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, puntosMes, cumplioQuincena);
    return C.resolverPL(puntosMes, mesActual || 1, cumplioQuincena);
  }, [tiene42, tieneRed, puntosMes, cumplioQuincena, puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, mesActual]);

  const estado = useMemo(() => {
    if (perfilUsuario === "simulador") return { texto: `Simulador — ${descuentoSimulador || 0}%`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: `Simulador de precios — ${descuentoSimulador || 0}%`, mensajeSecundario: "" };
    if (perfilUsuario === "clientePreferente") return C.obtenerMensajeClientePreferente(puntosAcumuladosCP);
    if (modo === "compraInicial") return C.obtenerMensajeCompraInicial(totalPuntos, paqueteActual);
    return resultado;
  }, [perfilUsuario, modo, totalPuntos, paqueteActual, puntosAcumuladosCP, resultado, descuentoSimulador]);

  const descuentoActual = perfilUsuario === "simulador" ? (descuentoSimulador || 0) : perfilUsuario === "clientePreferente" ? descuentoCP : modo === "compraInicial" ? paqueteActual.descuento : resultado.descuento;
  const totalConDescuento = perfilUsuario === "simulador" ? C.obtenerTotalSegunDescuento(descuentoSimulador || 0, totales) : perfilUsuario === "clientePreferente" ? totalSegunDescuentoCP : modo === "compraInicial" ? paqueteActual.totalConDescuento : C.obtenerTotalSegunDescuento(resultado.descuento, totales);

  const obtenerPrecio = (item) => C.obtenerPrecioActual(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, perfilUsuario === "simulador" ? (descuentoSimulador || 0) : resultado.descuento);
  const obtenerSubtotal = (item) => C.obtenerSubtotalPedido(item, perfilUsuario, descuentoCP, paqueteActual.descuento, modo, perfilUsuario === "simulador" ? (descuentoSimulador || 0) : resultado.descuento);

  const textoModo = (() => {
    if (perfilUsuario === "simulador") return `Simulador | ${descuentoSimulador || 0}%`;
    if (perfilUsuario === "clientePreferente") return `Cliente Preferente | ${descuentoCP}% | ${puntosAcumuladosCP} pts`;
    if (modo === "compraInicial") return `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    if (tiene42) return `Mantenimiento 42% | ${puntosMes} pts`;
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