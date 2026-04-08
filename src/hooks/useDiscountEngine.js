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

  // BYPASS SEGURO: Si es Simulador, retorna un objeto limpio para evitar colisiones
  if (perfilUsuario === "simulador") {
    return {
      estado: { texto: "Perfil Simulador activo. Agrega productos para ver la corrida financiera con todos los porcentajes de descuento.", colorFondo: "#f0fdf4", colorTexto: "#14532d", colorBorde: "#22c55e", colorSemaforo: "#16a34a", mensajePrincipal: "Herramienta de Simulación Múltiple", mensajeSecundario: "Visualiza precio público y descuentos desde 10% hasta 42% en un solo lugar." },
      descuentoActual: 0,
      totalConDescuento: totales ? totales.totalPrecioPublico : 0,
      obtenerPrecio: (item) => item.precioPublico || 0,
      obtenerSubtotal: (item) => item.subtotalPrecioPublico || 0,
      textoModo: "Simulador Múltiple",
      paqueteActual: {nombre: ""},
      dentroPrimeros15: true,
      cumplioQuincena: true,
      puntosMes: totales ? totales.totalPuntos : 0,
      mensajesPuntos: [],
      resultado: {},
      puntosAcumuladosCP: 0,
      descuentoCP: 0,
      totalSegunDescuentoCP: 0,
      siguienteNivelCP: null
    };
  }

  const dentroPrimeros15 = useMemo(() => C.detectarPrimeros15Dias(), []);
  const puntosMes = Number(puntosPersonalesMes || 0) + totalPuntos;
  const cumplioQuincena = dentroPrimeros15 ? (puntosMes >= 100) : cumplioQuincenaManual;
  const paqueteActual = useMemo(() => C.obtenerPaqueteCompraInicial(totalPuntos, totales), [totalPuntos, totales]);

  // Cliente Preferente
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
    if (tieneRed) return C.resolverPLA(puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, puntosMes, cumplioQuincena, totalPuntos);
    return C.resolverPL(puntosMes, mesActual || 1, cumplioQuincena);
  }, [tiene42, tieneRed, puntosMes, cumplioQuincena, puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, mesActual, totalPuntos]);

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