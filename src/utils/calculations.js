/**
 * BodyLogic Discount & Points Calculation Engine.
 *
 * Pure functions — no React, no side effects.
 * Every function receives data in, returns data out.
 * This file is the SINGLE SOURCE OF TRUTH for all business rules.
 */

// ─── Row-level calculations ───────────────────────────────────
export const mapearFila = (item, cantidades) => {
  const u = Number(cantidades[item.codigo] || 0);
  return {
    ...item,
    unidades: u,
    subtotalPuntos: u * item.puntos,
    subtotalPrecioPublico: u * item.precioPublico,
    subtotalValorComisionable: u * item.valorComisionable,
    subtotal10:
      item.precioCP10 !== undefined
        ? u * item.precioCP10
        : u * item.precioPublico * 0.9,
    subtotal15: u * item.precioPublico * 0.85,
    subtotal20:
      item.precio20 !== undefined
        ? u * item.precio20
        : u * item.precioPublico * 0.8,
    subtotal30: u * item.precio30,
    subtotal33: u * item.precio33,
    subtotal35: u * item.precio35,
    subtotal37: u * item.precio37,
    subtotal40: u * item.precio40,
    subtotal42: u * item.precio42,
  };
};

// ─── Aggregate totals from mapped rows ────────────────────────
export const calcularTotales = (filas) => {
  const sum = (key) => filas.reduce((a, i) => a + i[key], 0);
  return {
    totalUnidades: sum("unidades"),
    totalPuntos: sum("subtotalPuntos"),
    totalPrecioPublico: sum("subtotalPrecioPublico"),
    totalValorComisionable: sum("subtotalValorComisionable"),
    total10: sum("subtotal10"),
    total15: sum("subtotal15"),
    total20: sum("subtotal20"),
    total30: sum("subtotal30"),
    total33: sum("subtotal33"),
    total35: sum("subtotal35"),
    total37: sum("subtotal37"),
    total40: sum("subtotal40"),
    total42: sum("subtotal42"),
  };
};

// ─── Compra Inicial ───────────────────────────────────────────
export const obtenerPaqueteCompraInicial = (puntos, totales) => {
  const { total42, total33, total30 } = totales;
  if (puntos >= 500)
    return { nombre: "Paquete 500", descuento: 42, totalConDescuento: total42, siguientePaquete: null, siguienteObjetivo: null };
  if (puntos >= 400)
    return { nombre: "Paquete 400", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 500", siguienteObjetivo: 500 };
  if (puntos >= 300)
    return { nombre: "Paquete 300", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 400", siguienteObjetivo: 400 };
  if (puntos >= 200)
    return { nombre: "Paquete 200", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 300", siguienteObjetivo: 300 };
  if (puntos >= 100)
    return { nombre: "Paquete 100", descuento: 30, totalConDescuento: total30, siguientePaquete: "Paquete 200", siguienteObjetivo: 200 };
  return {
    nombre: "Aún no calificas", descuento: 0, totalConDescuento: 0,
    siguientePaquete: "Paquete 100", siguienteObjetivo: 100,
  };
};

export const obtenerMensajeCompraInicial = (totalPuntos, paquete) => {
  const status = (colorFondo, colorTexto, colorBorde, colorSemaforo) => ({ colorFondo, colorTexto, colorBorde, colorSemaforo });

  if (totalPuntos < 100) {
    const f = 100 - totalPuntos;
    return {
      texto: `Te faltan ${f} puntos para iniciar con el paquete de 100 puntos.`,
      ...status("#fee2e2", "#991b1b", "#ef4444", "#dc2626"),
      siguienteMensaje: `Te faltan ${f} puntos para iniciar (${paquete.siguientePaquete}).`,
    };
  }
  if (totalPuntos >= 500) {
    return {
      texto: "Ya alcanzaste el paquete de 500 puntos y el 42% de descuento. ¡Estás en el nivel más alto de compra inicial!",
      ...status("#ecfccb", "#3f6212", "#84cc16", "#65a30d"),
      siguienteMensaje: "Ya estás en el paquete más alto de compra inicial.",
    };
  }
  const f = paquete.siguienteObjetivo - totalPuntos;
  return {
    texto: `Ya estás dentro del ${paquete.nombre} con ${paquete.descuento}% de descuento. Te faltan ${f} puntos para alcanzar ${paquete.siguientePaquete}.`,
    ...status("#fef3c7", "#92400e", "#f59e0b", "#d97706"),
    siguienteMensaje: `Te faltan ${f} puntos para llegar a ${paquete.siguientePaquete}.`,
  };
};

// ─── Programa de Lealtad ──────────────────────────────────────
export const obtenerDescuentoLealtad = (mes) => {
  if (mes <= 1) return 30;
  if (mes <= 3) return 33;
  if (mes <= 5) return 35;
  if (mes <= 11) return 37;
  if (mes <= 17) return 40;
  return 42;
};

export const obtenerTotalSegunDescuento = (descuento, totales) => {
  const map = { 30: "total30", 33: "total33", 35: "total35", 37: "total37", 40: "total40", 42: "total42" };
  return totales[map[descuento]] || 0;
};

export const obtenerSiguienteEscalonLealtad = (mes) => {
  if (mes < 2) return { etiqueta: "33%", mesesFaltantes: 2 - mes };
  if (mes < 4) return { etiqueta: "35%", mesesFaltantes: 4 - mes };
  if (mes < 6) return { etiqueta: "37%", mesesFaltantes: 6 - mes };
  if (mes < 12) return { etiqueta: "40%", mesesFaltantes: 12 - mes };
  if (mes < 18) return { etiqueta: "42%", mesesFaltantes: 18 - mes };
  return null;
};

export const obtenerMensajeLealtad = (totalPuntos, mesLealtad, dentroPrimeros15, descuento, siguiente) => {
  const ok = (txt, msg1, msg2, cont) => ({
    texto: txt, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d",
    mensajePrincipal: msg1, mensajeSecundario: msg2, continuidad: cont,
  });
  const bad = (txt, msg1, msg2) => ({
    texto: txt, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626",
    mensajePrincipal: msg1, mensajeSecundario: msg2, continuidad: false,
  });
  const c100 = totalPuntos >= 100;

  if (!dentroPrimeros15) {
    return bad(
      "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",
      "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",
      c100
        ? "Aunque cubriste 100 puntos, al no comprar dentro de los primeros 15 días no conservas continuidad."
        : `Además, te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`
    );
  }
  if (!c100) {
    return bad(
      `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
      `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
      "Necesitas mínimo 100 puntos personales en los primeros 15 días para sostener tu avance en Lealtad."
    );
  }
  if (siguiente) {
    const p = siguiente.mesesFaltantes === 1 ? "mes" : "meses";
    return ok(
      `¡Felicidades! Ya sostienes tu mes ${mesLealtad} en Lealtad con ${descuento}% de descuento.`,
      "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",
      `Te faltan ${siguiente.mesesFaltantes} ${p} consecutivos para llegar al ${siguiente.etiqueta}.`,
      true
    );
  }
  return ok(
    `¡Felicidades! Ya estás en el tramo máximo del Programa de Lealtad con ${descuento}% de descuento.`,
    "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",
    "Ya te encuentras en el tramo más alto del Programa de Lealtad.",
    true
  );
};

// ─── Lealtad Acelerado ────────────────────────────────────────
export const obtenerDescuentoAcelerado = (acumulado) => {
  if (acumulado >= 3001) return 42;
  if (acumulado >= 1501) return 40;
  if (acumulado >= 501) return 35;
  if (acumulado >= 1) return 30;
  return 0;
};

export const obtenerSiguienteEscalonAcelerado = (acumulado) => {
  if (acumulado < 501) return { meta: 501, etiqueta: "35%" };
  if (acumulado < 1501) return { meta: 1501, etiqueta: "40%" };
  if (acumulado < 3001) return { meta: 3001, etiqueta: "42%" };
  return null;
};

export const obtenerMensajeAcelerado = (acumulado, descuento, siguiente) => {
  if (acumulado <= 0) {
    return {
      texto: "Captura puntos personales, grupales y acumulado previo para evaluar tu Lealtad Acelerado.",
      colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626",
      mensajePrincipal: "Aún no has capturado puntos suficientes para evaluar el Programa de Lealtad Acelerado.",
      mensajeSecundario: "Ingresa tus puntos personales, grupales y acumulado previo.",
    };
  }
  if (siguiente) {
    const f = siguiente.meta - acumulado;
    return {
      texto: `Tu acumulado actual es de ${acumulado} puntos y te coloca en ${descuento}% dentro del Programa de Lealtad Acelerado.`,
      colorFondo: descuento >= 35 ? "#fef3c7" : "#fee2e2",
      colorTexto: descuento >= 35 ? "#92400e" : "#991b1b",
      colorBorde: descuento >= 35 ? "#f59e0b" : "#ef4444",
      colorSemaforo: descuento >= 35 ? "#d97706" : "#dc2626",
      mensajePrincipal: `Tu acumulado actual es de ${acumulado} puntos y ya estás en ${descuento}% de descuento.`,
      mensajeSecundario: `Te faltan ${f} puntos acumulados para llegar al ${siguiente.etiqueta}.`,
    };
  }
  return {
    texto: `¡Felicidades! Ya alcanzaste ${acumulado} puntos acumulados y entras al 42% en Lealtad Acelerado.`,
    colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d",
    mensajePrincipal: "¡Felicidades! Ya alcanzaste el tramo máximo del Programa de Lealtad Acelerado.",
    mensajeSecundario: "Ya estás en 42% de descuento por acumulado.",
  };
};

// ─── Cliente Preferente ───────────────────────────────────────
export const obtenerDescuentoClientePreferente = (puntos) => {
  if (puntos >= 650) return 20;
  if (puntos >= 150) return 15;
  return 10;
};

export const obtenerSiguienteNivelCP = (puntos) => {
  if (puntos < 150) return { meta: 150, etiqueta: "15%" };
  if (puntos < 650) return { meta: 650, etiqueta: "20%" };
  return null;
};

export const obtenerTotalSegunDescuentoCP = (descuento, totales) => {
  if (descuento === 10) return totales.total10;
  if (descuento === 15) return totales.total15;
  return totales.total20;
};

export const obtenerMensajeClientePreferente = (acumulado) => {
  if (acumulado < 150) {
    const f = 150 - acumulado;
    return {
      texto: `Actualmente estás en 10% de descuento. Te faltan ${f} puntos acumulados para llegar al 15%.`,
      colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626",
      mensajePrincipal: "Tu descuento actual como Cliente Preferente es 10%.",
      mensajeSecundario: `Te faltan ${f} puntos acumulados para llegar al 15%.`,
    };
  }
  if (acumulado < 650) {
    const f = 650 - acumulado;
    return {
      texto: `Actualmente estás en 15% de descuento. Te faltan ${f} puntos acumulados para llegar al 20%.`,
      colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706",
      mensajePrincipal: "Tu descuento actual como Cliente Preferente es 15%.",
      mensajeSecundario: `Te faltan ${f} puntos acumulados para llegar al 20%.`,
    };
  }
  return {
    texto: "¡Felicidades! Ya alcanzaste el 20% de descuento como Cliente Preferente.",
    colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d",
    mensajePrincipal: "Tu descuento actual como Cliente Preferente es 20%.",
    mensajeSecundario: "Ya estás en el nivel máximo de Cliente Preferente.",
  };
};

// ─── Price resolution per profile ─────────────────────────────
export const obtenerPrecioActual = (item, perfil, descuentoCP, descuentoPaquete, modo, descuentoLealtad, descuentoAcelerado, programaRecompra) => {
  if (perfil === "clientePreferente") {
    if (descuentoCP === 10) return item.precioCP10 !== undefined ? item.precioCP10 : item.precioPublico * 0.9;
    if (descuentoCP === 15) return item.precioPublico * 0.85;
    return item.precio20 !== undefined ? item.precio20 : item.precioPublico * 0.8;
  }
  if (modo === "compraInicial") {
    if (descuentoPaquete === 30) return item.precio30;
    if (descuentoPaquete === 33) return item.precio33;
    if (descuentoPaquete === 42) return item.precio42;
    return item.precioPublico;
  }
  if (programaRecompra === "lealtad") {
    const map = { 30: "precio30", 33: "precio33", 35: "precio35", 37: "precio37", 40: "precio40", 42: "precio42" };
    return item[map[descuentoLealtad]] || item.precioPublico;
  }
  const map = { 30: "precio30", 35: "precio35", 40: "precio40", 42: "precio42" };
  return item[map[descuentoAcelerado]] || item.precioPublico;
};

export const obtenerSubtotalPedido = (item, perfil, descuentoCP, descuentoPaquete, modo, descuentoLealtad, descuentoAcelerado, programaRecompra) => {
  if (perfil === "clientePreferente") {
    if (descuentoCP === 10) return item.subtotal10;
    if (descuentoCP === 15) return item.subtotal15;
    return item.subtotal20;
  }
  if (modo === "compraInicial") {
    if (descuentoPaquete === 30) return item.subtotal30;
    if (descuentoPaquete === 33) return item.subtotal33;
    if (descuentoPaquete === 42) return item.subtotal42;
    return 0;
  }
  if (programaRecompra === "lealtad") {
    const map = { 30: "subtotal30", 33: "subtotal33", 35: "subtotal35", 37: "subtotal37", 40: "subtotal40", 42: "subtotal42" };
    return item[map[descuentoLealtad]] || 0;
  }
  const map = { 30: "subtotal30", 35: "subtotal35", 40: "subtotal40", 42: "subtotal42" };
  return item[map[descuentoAcelerado]] || 0;
};
