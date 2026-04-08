/**
 * BodyLogic — Motor de Cálculo del Programa de Lealtad.
 */

// ─── Fecha ───────────────────────────────────────────────────
export const detectarPrimeros15Dias = () => new Date().getDate() <= 15;

// ─── Mensajes dinámicos de puntos ────────────────────────────
export const generarMensajesPuntos = (puntosMes, tiene42, dentroPrimeros15, cumplioQuincena) => {
  const msgs = [];
  if (dentroPrimeros15) {
    if (puntosMes >= 100) {
      msgs.push({ cumple: true, texto: "✔ Ya cumpliste los primeros 100 puntos requeridos en esta primera quincena." });
    } else {
      msgs.push({ cumple: false, texto: `Te faltan ${100 - puntosMes} puntos para alcanzar los 100 puntos requeridos en esta primera quincena.` });
    }
  } else {
    if (cumplioQuincena) {
      msgs.push({ cumple: true, texto: "✔ Cumpliste los 100 puntos de la primera quincena." });
    } else {
      msgs.push({ cumple: false, texto: "No cumpliste los 100 puntos en la primera quincena. No conservas el beneficio del Programa de Lealtad para este periodo." });
    }
  }

  if (tiene42) {
    if (puntosMes >= 200) {
      msgs.push({ cumple: true, texto: "✔ ¡Ya completaste los 200 puntos mensuales para mantener tu descuento!" });
    } else {
      msgs.push({ cumple: false, texto: `Te faltan ${200 - puntosMes} puntos para completar los 200 puntos mensuales y mantener tu descuento.` });
    }
  }
  return msgs;
};

// ─── Row-level calculations (A prueba de fallos NaN) ─────────
export const mapearFila = (item, cantidades) => {
  const u = Number(cantidades[item.codigo] || 0);
  const p = Number(item.precioPublico || 0);
  
  return {
    ...item,
    unidades: u,
    subtotalPuntos: u * Number(item.puntos || 0),
    subtotalPrecioPublico: u * p,
    subtotalValorComisionable: u * Number(item.valorComisionable || 0),
    // Si no existe el precio exacto en la BD, lo calcula matemáticamente para evitar que la pantalla se quede en blanco
    subtotal10: item.precioCP10 !== undefined ? u * item.precioCP10 : u * p * 0.9,
    subtotal20: item.precio20 !== undefined ? u * item.precio20 : u * p * 0.8,
    subtotal30: item.precio30 !== undefined ? u * item.precio30 : u * p * 0.7,
    subtotal33: item.precio33 !== undefined ? u * item.precio33 : u * p * 0.67,
    subtotal35: item.precio35 !== undefined ? u * item.precio35 : u * p * 0.65,
    subtotal37: item.precio37 !== undefined ? u * item.precio37 : u * p * 0.63,
    subtotal40: item.precio40 !== undefined ? u * item.precio40 : u * p * 0.60,
    subtotal42: item.precio42 !== undefined ? u * item.precio42 : u * p * 0.58,
  };
};

export const calcularTotales = (filas) => {
  const s = (k) => filas.reduce((a, i) => a + (Number(i[k]) || 0), 0);
  return {
    totalUnidades: s("unidades"), totalPuntos: s("subtotalPuntos"),
    totalPrecioPublico: s("subtotalPrecioPublico"), totalValorComisionable: s("subtotalValorComisionable"),
    total10: s("subtotal10"), total20: s("subtotal20"),
    total30: s("subtotal30"), total33: s("subtotal33"), total35: s("subtotal35"),
    total37: s("subtotal37"), total40: s("subtotal40"), total42: s("subtotal42"),
  };
};

// ─── Compra Inicial ──────────────────────────────────────────
export const obtenerPaqueteCompraInicial = (puntos, totales) => {
  const { total42, total33, total30 } = totales;
  if (puntos >= 500) return { nombre: "Paquete 500", descuento: 42, totalConDescuento: total42, siguientePaquete: null, siguienteObjetivo: null };
  if (puntos >= 400) return { nombre: "Paquete 400", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 500", siguienteObjetivo: 500 };
  if (puntos >= 300) return { nombre: "Paquete 300", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 400", siguienteObjetivo: 400 };
  if (puntos >= 200) return { nombre: "Paquete 200", descuento: 33, totalConDescuento: total33, siguientePaquete: "Paquete 300", siguienteObjetivo: 300 };
  if (puntos >= 100) return { nombre: "Paquete 100", descuento: 30, totalConDescuento: total30, siguientePaquete: "Paquete 200", siguienteObjetivo: 200 };
  return { nombre: "Aún no calificas", descuento: 0, totalConDescuento: 0, siguientePaquete: "Paquete 100", siguienteObjetivo: 100 };
};

export const obtenerMensajeCompraInicial = (totalPuntos, paquete) => {
  const st = (cf, ct, cb, cs) => ({ colorFondo: cf, colorTexto: ct, colorBorde: cb, colorSemaforo: cs });
  if (totalPuntos < 100) { const f = 100 - totalPuntos; return { texto: `Te faltan ${f} puntos para iniciar con el paquete de 100 puntos.`, ...st("#fee2e2","#991b1b","#ef4444","#dc2626"), siguienteMensaje: `Te faltan ${f} puntos para iniciar (${paquete.siguientePaquete}).` }; }
  if (totalPuntos >= 500) return { texto: "Ya alcanzaste el paquete de 500 puntos y el 42% de descuento. ¡Nivel más alto!", ...st("#ecfccb","#3f6212","#84cc16","#65a30d"), siguienteMensaje: "Paquete más alto de compra inicial." };
  const f = paquete.siguienteObjetivo - totalPuntos;
  return { texto: `${paquete.nombre} con ${paquete.descuento}%. Te faltan ${f} pts para ${paquete.siguientePaquete}.`, ...st("#fef3c7","#92400e","#f59e0b","#d97706"), siguienteMensaje: `Te faltan ${f} pts para ${paquete.siguientePaquete}.` };
};

// ─── Escalas ─────────────────────────────────────────────────
export const obtenerDescuentoPL = (mes) => {
  if (mes <= 1) return 30; if (mes <= 3) return 33; if (mes <= 5) return 35;
  if (mes <= 11) return 37; if (mes <= 17) return 40; return 42;
};

export const obtenerDescuentoPLA = (acum) => {
  if (acum >= 3001) return 42; if (acum >= 1501) return 40;
  if (acum >= 501) return 35; if (acum >= 1) return 30; return 0;
};

export const obtenerTotalSegunDescuento = (desc, tot) => {
  const m = { 30: "total30", 33: "total33", 35: "total35", 37: "total37", 40: "total40", 42: "total42" };
  return tot[m[desc]] || 0;
};

export const siguienteEscalonPL = (mes) => {
  if (mes < 2) return { etiqueta: "33%", faltan: 2 - mes };
  if (mes < 4) return { etiqueta: "35%", faltan: 4 - mes };
  if (mes < 6) return { etiqueta: "37%", faltan: 6 - mes };
  if (mes < 12) return { etiqueta: "40%", faltan: 12 - mes };
  if (mes < 18) return { etiqueta: "42%", faltan: 18 - mes };
  return null;
};

export const siguienteEscalonPLA = (acum) => {
  if (acum < 501) return { meta: 501, etiqueta: "35%" };
  if (acum < 1501) return { meta: 1501, etiqueta: "40%" };
  if (acum < 3001) return { meta: 3001, etiqueta: "42%" };
  return null;
};

// ═══════════════════════════════════════════════════════════════
// RESOLUCIÓN DE DESCUENTOS - DI
// ═══════════════════════════════════════════════════════════════
const ok = (t, m1, m2) => ({ texto: t, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: m1, mensajeSecundario: m2 });
const warn = (t, m1, m2) => ({ texto: t, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: m1, mensajeSecundario: m2 });
const bad = (t, m1, m2) => ({ texto: t, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: m1, mensajeSecundario: m2 });

export const resolverTiene42 = (puntosMes, cumplioQuincena) => {
  if (!cumplioQuincena) {
    return { descuento: 42, mantiene: false, ...bad("No cumpliste los 100 pts en la primera quincena. No conservas el 42% este mes.", "No se cumplió el requisito de primera quincena.", "Necesitas al menos 100 pts en los primeros 15 días.")};
  }
  if (puntosMes >= 200) {
    return { descuento: 42, mantiene: true, ...ok("Mantienes tu 42% de descuento.", "✔ 42% de descuento activo.", `Has completado ${puntosMes} pts este mes. Requisito de 200 pts cubierto.`)};
  }
  if (puntosMes >= 100) {
    return { descuento: 42, mantiene: false, ...warn("Primera quincena cubierta. Faltan puntos para completar los 200 mensuales.", "✔ Primera quincena cubierta (100+ pts).", `Te faltan ${200 - puntosMes} pts para completar los 200 mensuales y mantener el 42%.`)};
  }
  return { descuento: 42, mantiene: false, ...bad(`Te faltan ${100 - puntosMes} pts para los primeros 100 pts requeridos.`, `Te faltan ${100 - puntosMes} pts para la calificación quincenal.`, "Necesitas 100 pts en la primera quincena y 200 pts totales en el mes.")};
};

export const resolverPL = (puntosMes, mesActual, cumplioQuincena) => {
  const desc = obtenerDescuentoPL(mesActual);
  const sig = siguienteEscalonPL(mesActual);

  if (!cumplioQuincena) {
    return { descuento: desc, modalidad: "PL", ...bad("No se cumplieron los 100 pts en la primera quincena. Se reinicia la secuencia.", "No conservas tu avance en el Programa de Lealtad.", "Necesitas al menos 100 pts en los primeros 15 días de cada mes.")};
  }
  if (mesActual >= 18) {
    if (puntosMes >= 200) {
      return { descuento: 42, modalidad: "PL", ...ok(`Mes ${mesActual} — ¡42% de descuento mantenido!`, "✔ Calificación cubierta y 42% mantenido.", `Has completado ${puntosMes} pts este mes.`)};
    }
    return { descuento: 42, modalidad: "PL", ...warn(`Mes ${mesActual} — Primera quincena cubierta, faltan pts para mantener el 42%.`, "✔ Primera quincena cubierta.", `Te faltan ${200 - puntosMes} pts para completar los 200 mensuales.`)};
  }
  if (puntosMes < 100) {
    return { descuento: desc, modalidad: "PL", ...bad(`Te faltan ${100 - puntosMes} pts para calificar este mes.`, `Mes ${mesActual} — ${desc}% de descuento.`, `Te faltan ${100 - puntosMes} pts para la calificación mensual.`)};
  }
  if (sig) {
    const p = sig.faltan === 1 ? "mes" : "meses";
    return { descuento: desc, modalidad: "PL", ...ok(`Mes ${mesActual} — ${desc}% de descuento.`, `✔ Calificación cubierta. Descuento actual: ${desc}%.`, `Te faltan ${sig.faltan} ${p} consecutivos para llegar al ${sig.etiqueta}.`)};
  }
  return { descuento: desc, modalidad: "PL", ...ok(`Mes ${mesActual} — ${desc}%.`, `✔ ${desc}% de descuento.`, "")};
};

// REGLA CRÍTICA DE PLA ESTRICTA: Base + Personales + Grupales + Pedido Actual
export const resolverPLA = (puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, puntosMes, cumplioQuincena, totalPuntosPedidoActual) => {
  const basePaquete = Number(paqueteInicial) || 0;
  const personalesAcum = Number(puntosPersonalesAcum) || 0;
  const grupalesAcum = Number(puntosGrupalesAcum) || 0;
  const pedidoActual = Number(totalPuntosPedidoActual) || 0;

  // Suma matemática directa garantizada
  const acum = basePaquete + personalesAcum + grupalesAcum + pedidoActual;
  
  const desc = obtenerDescuentoPLA(acum);
  const sig = siguienteEscalonPLA(acum);

  if (!cumplioQuincena) {
    return { descuento: desc, modalidad: "PLA", acumulado: acum, base: basePaquete, ...bad(
      "No se cumplieron los 100 pts en la primera quincena.",
      `Base: ${basePaquete} pts. Acumulado total: ${acum} pts → ${desc}%.`,
      "Se requieren 100 pts en la primera quincena para calificar."
    )};
  }

  if (acum >= 3001) {
    if (puntosMes >= 200) {
      return { descuento: 42, modalidad: "PLA", acumulado: acum, base: basePaquete, ...ok(
        `¡42% de descuento activo! Acumulado total: ${acum} pts.`,
        `✔ Acumulado: ${acum} pts → 42%. Mantenimiento cubierto.`,
        `Has completado ${puntosMes} pts este mes.`
      )};
    }
    return { descuento: 42, modalidad: "PLA", acumulado: acum, base: basePaquete, ...warn(
      `Acumulado total: ${acum} pts → 42%. Faltan pts para los 200 mensuales.`,
      `✔ Primera quincena cubierta. Acumulado: ${acum} pts → 42%.`,
      `Te faltan ${200 - puntosMes} pts para completar los 200 mensuales.`
    )};
  }

  if (puntosMes < 100) {
    return { descuento: desc, modalidad: "PLA", acumulado: acum, base: basePaquete, ...bad(
      `Acumulado total: ${acum} pts → ${desc}%. No calificas este mes.`,
      `Acumulado total: ${acum} pts → ${desc}% de descuento.`,
      `Te faltan ${100 - puntosMes} pts para calificar.`
    )};
  }

  if (sig) {
    const f = sig.meta - acum;
    return { descuento: desc, modalidad: "PLA", acumulado: acum, base: basePaquete, ...(desc >= 35 ? warn : ok)(
      `Acumulado total: ${acum} pts → ${desc}% de descuento.`,
      `✔ Calificación cubierta. Acumulado total: ${acum} pts → ${desc}%.`,
      `Te faltan ${f} pts para alcanzar el ${sig.etiqueta}.`
    )};
  }

  return { descuento: desc, modalidad: "PLA", acumulado: acum, base: basePaquete, ...ok(
    `${acum} pts → ${desc}%.`, `✔ ${desc}% de descuento.`, ""
  )};
};

// ─── Cliente Preferente (Nueva Estructura 10%, 20%, 30%) ─────
export const obtenerDescuentoClientePreferente = (p) => { if (p >= 650) return 30; if (p >= 150) return 20; return 10; };
export const obtenerSiguienteNivelCP = (p) => { if (p < 150) return { meta: 150, etiqueta: "20%" }; if (p < 650) return { meta: 650, etiqueta: "30%" }; return null; };
export const obtenerTotalSegunDescuentoCP = (d, t) => d === 10 ? t.total10 : d === 20 ? t.total20 : t.total30;

export const obtenerMensajeClientePreferente = (acum) => {
  if (acum < 150) { const f = 150 - acum; return { texto: `Puntos acumulados: ${acum}. Descuento actual: 10%. Te faltan ${f} puntos para alcanzar el 20%.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: `Puntos acumulados: ${acum} — Descuento actual: 10%.`, mensajeSecundario: `Te faltan ${f} puntos para alcanzar el 20% de descuento.` }; }
  if (acum < 650) { const f = 650 - acum; return { texto: `Puntos acumulados: ${acum}. Descuento actual: 20%. Te faltan ${f} puntos para alcanzar el 30%.`, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: `Puntos acumulados: ${acum} — Descuento actual: 20%.`, mensajeSecundario: `Te faltan ${f} puntos para alcanzar el 30% de descuento.` }; }
  return { texto: `Puntos acumulados: ${acum}. ¡Descuento actual: 30%! Nivel máximo.`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: `Puntos acumulados: ${acum} — ¡Descuento actual: 30%!`, mensajeSecundario: "Nivel máximo de Cliente Preferente." };
};

// ─── Price resolution (A prueba de fallos) ───────────────────
export const obtenerPrecioActual = (item, perfil, descCP, descPaq, modo, descFinal) => {
  const p = Number(item.precioPublico || 0);
  if (perfil === "clientePreferente") {
    if (descCP === 10) return item.precioCP10 !== undefined ? item.precioCP10 : p * 0.9;
    if (descCP === 20) return item.precio20 !== undefined ? item.precio20 : p * 0.8;
    return item.precio30 !== undefined ? item.precio30 : p * 0.7;
  }
  if (modo === "compraInicial") { 
    if (descPaq === 30) return item.precio30 !== undefined ? item.precio30 : p * 0.7; 
    if (descPaq === 33) return item.precio33 !== undefined ? item.precio33 : p * 0.67; 
    if (descPaq === 42) return item.precio42 !== undefined ? item.precio42 : p * 0.58; 
    return p; 
  }
  
  const mapa = {
    30: item.precio30 !== undefined ? item.precio30 : p * 0.7,
    33: item.precio33 !== undefined ? item.precio33 : p * 0.67,
    35: item.precio35 !== undefined ? item.precio35 : p * 0.65,
    37: item.precio37 !== undefined ? item.precio37 : p * 0.63,
    40: item.precio40 !== undefined ? item.precio40 : p * 0.60,
    42: item.precio42 !== undefined ? item.precio42 : p * 0.58,
  };
  return mapa[descFinal] !== undefined ? mapa[descFinal] : p;
};

export const obtenerSubtotalPedido = (item, perfil, descCP, descPaq, modo, descFinal) => {
  if (perfil === "clientePreferente") {
    if (descCP === 10) return item.subtotal10 || 0;
    if (descCP === 20) return item.subtotal20 || 0;
    return item.subtotal30 || 0;
  }
  if (modo === "compraInicial") { 
    if (descPaq === 30) return item.subtotal30 || 0; 
    if (descPaq === 33) return item.subtotal33 || 0; 
    if (descPaq === 42) return item.subtotal42 || 0; 
    return 0; 
  }
  const m = { 30: "subtotal30", 33: "subtotal33", 35: "subtotal35", 37: "subtotal37", 40: "subtotal40", 42: "subtotal42" };
  return item[m[descFinal]] || 0;
};