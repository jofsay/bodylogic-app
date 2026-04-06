/**
 * BodyLogic — Motor de Cálculo Unificado del Programa de Lealtad.
 *
 * LÓGICA UNIFICADA — el sistema detecta automáticamente qué aplica:
 *
 *   Prioridad 1: Membresía (paquete 500) → 42% si mantiene 200 pts/mes
 *   Prioridad 2: Comunidad (con red)     → escala por acumulado, 42% en 3001+
 *   Prioridad 3: Progresiva (sin red)    → escala por meses consecutivos
 *
 * REGLA DE CALIFICACIÓN QUINCENAL:
 *   - Primera quincena (días 1-15): debe hacer ≥100 pts
 *   - Todo el mes: debe completar ≥200 pts (solo si ya tiene 42%)
 *   - Los 200 pts pueden venir de: personales + CP del mes
 *   - Si ya pasó el día 15, se pregunta manualmente si cumplió la 1ra quincena
 *
 * ESCALAS:
 *   Comunidad: 1-500→30% | 501-1500→35% | 1501-3000→40% | 3001+→42%
 *   Progresiva: M1→30% | M2-3→33% | M4-5→35% | M6-11→37% | M12-17→40% | M18+→42%
 *   CP: 0-149→10% | 150-649→15% | 650+→20%
 */

// ─── Fecha ───────────────────────────────────────────────────
export const detectarPrimeros15Dias = () => new Date().getDate() <= 15;

// ─── Mensajes de primera quincena y puntos mensuales ─────────
export const generarMensajesQuincenales = (puntosMes, cumplioQuincena, ya42) => {
  const msgs = [];

  // 100 pts primera quincena
  if (cumplioQuincena) {
    msgs.push({ tipo: "quincena", cumple: true, texto: "✔ Ya cumpliste los primeros 100 puntos requeridos por el Programa de Lealtad en esta primera quincena." });
  } else {
    if (puntosMes < 100) {
      msgs.push({ tipo: "quincena", cumple: false, texto: `Te faltan ${100 - puntosMes} puntos para alcanzar los primeros 100 puntos requeridos en esta primera quincena.` });
    } else {
      msgs.push({ tipo: "quincena", cumple: true, texto: "✔ Ya cumpliste los primeros 100 puntos requeridos por el Programa de Lealtad en esta primera quincena." });
    }
  }

  // 200 pts mensuales — solo si ya tiene 42%
  if (ya42) {
    if (puntosMes < 200) {
      msgs.push({ tipo: "mensual", cumple: false, texto: `Te faltan ${200 - puntosMes} puntos para completar los 200 puntos mensuales requeridos para mantener tu descuento.` });
    } else {
      msgs.push({ tipo: "mensual", cumple: true, texto: "✔ ¡Ya completaste los 200 puntos mensuales requeridos para mantener tu descuento!" });
    }
  }

  return msgs;
};

// ─── Row-level calculations ──────────────────────────────────
export const mapearFila = (item, cantidades) => {
  const u = Number(cantidades[item.codigo] || 0);
  return {
    ...item, unidades: u,
    subtotalPuntos: u * item.puntos,
    subtotalPrecioPublico: u * item.precioPublico,
    subtotalValorComisionable: u * item.valorComisionable,
    subtotal10: item.precioCP10 !== undefined ? u * item.precioCP10 : u * item.precioPublico * 0.9,
    subtotal15: u * item.precioPublico * 0.85,
    subtotal20: item.precio20 !== undefined ? u * item.precio20 : u * item.precioPublico * 0.8,
    subtotal30: u * item.precio30, subtotal33: u * item.precio33, subtotal35: u * item.precio35,
    subtotal37: u * item.precio37, subtotal40: u * item.precio40, subtotal42: u * item.precio42,
  };
};

export const calcularTotales = (filas) => {
  const s = (k) => filas.reduce((a, i) => a + i[k], 0);
  return {
    totalUnidades: s("unidades"), totalPuntos: s("subtotalPuntos"),
    totalPrecioPublico: s("subtotalPrecioPublico"), totalValorComisionable: s("subtotalValorComisionable"),
    total10: s("subtotal10"), total15: s("subtotal15"), total20: s("subtotal20"),
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

// ─── Escalas de descuento ────────────────────────────────────
export const obtenerDescuentoLealtad = (mes) => {
  if (mes <= 1) return 30; if (mes <= 3) return 33; if (mes <= 5) return 35;
  if (mes <= 11) return 37; if (mes <= 17) return 40; return 42;
};

export const obtenerDescuentoAcelerado = (acum) => {
  if (acum >= 3001) return 42; if (acum >= 1501) return 40;
  if (acum >= 501) return 35; if (acum >= 1) return 30; return 0;
};

export const obtenerTotalSegunDescuento = (desc, tot) => {
  const m = { 30: "total30", 33: "total33", 35: "total35", 37: "total37", 40: "total40", 42: "total42" };
  return tot[m[desc]] || 0;
};

export const obtenerSiguienteEscalonLealtad = (mes) => {
  if (mes < 2) return { etiqueta: "33%", mesesFaltantes: 2 - mes };
  if (mes < 4) return { etiqueta: "35%", mesesFaltantes: 4 - mes };
  if (mes < 6) return { etiqueta: "37%", mesesFaltantes: 6 - mes };
  if (mes < 12) return { etiqueta: "40%", mesesFaltantes: 12 - mes };
  if (mes < 18) return { etiqueta: "42%", mesesFaltantes: 18 - mes };
  return null;
};

export const obtenerSiguienteEscalonAcelerado = (acum) => {
  if (acum < 501) return { meta: 501, etiqueta: "35%" };
  if (acum < 1501) return { meta: 1501, etiqueta: "40%" };
  if (acum < 3001) return { meta: 3001, etiqueta: "42%" };
  return null;
};

export const calcularAcumuladoComunidad = ({ puntosPersonales, puntosGrupales, puntosBaseInicial, puntosPedidoActual }) => {
  return Math.max(0, Number(puntosPersonales || 0) + Number(puntosGrupales || 0) + Number(puntosBaseInicial || 0) + Number(puntosPedidoActual || 0));
};

export const obtenerPaqueteEquivalente = (puntos) => {
  if (puntos >= 500) return 500; if (puntos >= 400) return 400;
  if (puntos >= 300) return 300; if (puntos >= 200) return 200;
  if (puntos >= 100) return 100; return 0;
};

// ═════════════════════════════════════════════════════════════
// RESOLUCIÓN UNIFICADA DE DESCUENTO
// ═════════════════════════════════════════════════════════════
/**
 * Determina el descuento final y mensajes según prioridad:
 *   P1: Membresía 500 → 42% si cumple mantenimiento
 *   P2: Comunidad ≥3001 → 42% automático
 *   P3: Progresiva por meses → según escalera
 *
 * @param {Object} params
 * @param {number} params.paqueteInicial - 100/200/300/400/500
 * @param {boolean} params.tieneRed
 * @param {number} params.puntosMes - personales + CP del mes (incluye pedido)
 * @param {number} params.puntosPersonalesAcum - para comunidad
 * @param {number} params.puntosGrupalesAcum - para comunidad
 * @param {number} params.mesProgresivo - mes actual en modalidad progresiva
 * @param {boolean} params.cumplioQuincena - ¿hizo 100 pts en 1ra quincena?
 * @param {boolean} params.fueReseteado
 */
export const resolverDescuento = ({
  paqueteInicial, tieneRed, puntosMes,
  puntosPersonalesAcum, puntosGrupalesAcum,
  mesProgresivo, cumplioQuincena, fueReseteado,
}) => {
  const ok = (t, m1, m2) => ({ texto: t, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: m1, mensajeSecundario: m2 });
  const warn = (t, m1, m2) => ({ texto: t, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: m1, mensajeSecundario: m2 });
  const bad = (t, m1, m2) => ({ texto: t, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: m1, mensajeSecundario: m2 });

  // ── PRIORIDAD 1: Membresía 500 ──
  if (paqueteInicial === 500 && !fueReseteado) {
    if (!cumplioQuincena) {
      return { descuento: 42, mantiene42: false, modalidad: "membresia", ...bad(
        "No cumpliste los 100 pts en la primera quincena. No conservas el 42% este mes.",
        "No se cumplió el requisito de 100 pts en la primera quincena.",
        "Para conservar el 42%, necesitas al menos 100 pts en los primeros 15 días de cada mes."
      )};
    }
    if (puntosMes >= 200) {
      return { descuento: 42, mantiene42: true, modalidad: "membresia", ...ok(
        "Mantienes tu 42% de descuento por Membresía.",
        "✔ Membresía 500 activa. 42% de descuento mantenido.",
        `Has completado ${puntosMes} pts este mes. Requisito de 200 pts cubierto.`
      )};
    }
    if (puntosMes >= 100) {
      return { descuento: 42, mantiene42: false, modalidad: "membresia", ...warn(
        "Cumpliste los 100 pts de la primera quincena. Aún faltan puntos para completar los 200 mensuales.",
        "✔ Primera quincena cubierta (100+ pts).",
        `Te faltan ${200 - puntosMes} pts para completar los 200 pts mensuales y mantener el 42%.`
      )};
    }
    return { descuento: 42, mantiene42: false, modalidad: "membresia", ...bad(
      `Te faltan ${100 - puntosMes} pts para los primeros 100 pts requeridos.`,
      `Membresía 500 activa. Te faltan ${100 - puntosMes} pts para la calificación quincenal.`,
      "Necesitas al menos 100 pts en la primera quincena y 200 pts totales en el mes."
    )};
  }

  // ── PRIORIDAD 2: Comunidad (con red) ──
  if (tieneRed) {
    const acum = calcularAcumuladoComunidad({ puntosPersonales: puntosPersonalesAcum, puntosGrupales: puntosGrupalesAcum, puntosBaseInicial: paqueteInicial, puntosPedidoActual: puntosMes });
    const desc = obtenerDescuentoAcelerado(acum);
    const sig = obtenerSiguienteEscalonAcelerado(acum);

    if (acum >= 3001) {
      // Ya tiene 42% — validar mantenimiento
      if (!cumplioQuincena) {
        return { descuento: desc, mantiene42: false, modalidad: "comunidad", acumulado: acum, ...bad(
          "Alcanzaste 3001+ pts pero no cumpliste los 100 pts en la primera quincena.",
          `Acumulado: ${acum} pts → 42%. Pero no conservas el beneficio este mes.`,
          "Se requieren 100 pts en la primera quincena para mantener el 42%."
        )};
      }
      if (puntosMes >= 200) {
        return { descuento: desc, mantiene42: true, modalidad: "comunidad", acumulado: acum, ...ok(
          `¡42% de descuento activo! Acumulado: ${acum} pts.`,
          `✔ Acumulado: ${acum} pts → 42% de descuento. Mantenimiento cubierto.`,
          `Has completado ${puntosMes} pts este mes.`
        )};
      }
      return { descuento: desc, mantiene42: false, modalidad: "comunidad", acumulado: acum, ...warn(
        `Acumulado: ${acum} pts → 42%. Faltan pts para completar 200 mensuales.`,
        `✔ Primera quincena cubierta. Acumulado: ${acum} pts → 42%.`,
        `Te faltan ${200 - puntosMes} pts para completar los 200 pts mensuales.`
      )};
    }

    // Aún no tiene 42% — solo necesita 100 pts
    if (!cumplioQuincena && puntosMes < 100) {
      return { descuento: desc, mantiene42: false, modalidad: "comunidad", acumulado: acum, ...bad(
        `Acumulado: ${acum} pts → ${desc}%. No calificas este mes.`,
        `Acumulado comunitario: ${acum} pts → ${desc}% de descuento.`,
        `Te faltan ${100 - puntosMes} pts para calificar.`
      )};
    }

    if (sig) {
      const f = sig.meta - acum;
      return { descuento: desc, mantiene42: false, modalidad: "comunidad", acumulado: acum, ...(desc >= 35 ? warn : ok)(
        `Acumulado: ${acum} pts → ${desc}% de descuento.`,
        `✔ Calificación cubierta. Acumulado: ${acum} pts → ${desc}%.`,
        `Te faltan ${f} pts para alcanzar el ${sig.etiqueta}.`
      )};
    }

    return { descuento: desc, mantiene42: false, modalidad: "comunidad", acumulado: acum, ...ok(
      `Acumulado: ${acum} pts → ${desc}%.`, `✔ ${desc}% de descuento.`, ""
    )};
  }

  // ── PRIORIDAD 3: Progresiva por meses (sin red) ──
  const desc = obtenerDescuentoLealtad(mesProgresivo);
  const sig = obtenerSiguienteEscalonLealtad(mesProgresivo);

  if (!cumplioQuincena) {
    return { descuento: desc, mantiene42: false, modalidad: "progresiva", ...bad(
      "No se cumplió el requisito de 100 pts en la primera quincena. Se reinicia la secuencia.",
      "No conservas tu avance en el Programa de Lealtad.",
      "Necesitas al menos 100 pts en los primeros 15 días de cada mes."
    )};
  }

  // Mes 18+: necesita 200 pts para mantener 42%
  if (mesProgresivo >= 18) {
    if (puntosMes >= 200) {
      return { descuento: 42, mantiene42: true, modalidad: "progresiva", ...ok(
        `Mes ${mesProgresivo} — ¡42% de descuento mantenido!`,
        "✔ Calificación cubierta y 42% mantenido.",
        `Has completado ${puntosMes} pts este mes.`
      )};
    }
    return { descuento: 42, mantiene42: false, modalidad: "progresiva", ...warn(
      `Mes ${mesProgresivo} — Calificaste en la quincena, pero faltan pts para mantener el 42%.`,
      "✔ Primera quincena cubierta.",
      `Te faltan ${200 - puntosMes} pts para completar los 200 pts mensuales.`
    )};
  }

  // Meses 1-17: solo 100 pts
  if (sig) {
    const p = sig.mesesFaltantes === 1 ? "mes" : "meses";
    return { descuento: desc, mantiene42: false, modalidad: "progresiva", ...ok(
      `Mes ${mesProgresivo} — ${desc}% de descuento.`,
      `✔ Calificación cubierta. Tu descuento actual es ${desc}%.`,
      `Te faltan ${sig.mesesFaltantes} ${p} consecutivos para llegar al ${sig.etiqueta}.`
    )};
  }

  return { descuento: desc, mantiene42: false, modalidad: "progresiva", ...ok(
    `Mes ${mesProgresivo} — ${desc}%.`, `✔ ${desc}% de descuento.`, ""
  )};
};

// ─── Cliente Preferente ──────────────────────────────────────
export const obtenerDescuentoClientePreferente = (p) => { if (p >= 650) return 20; if (p >= 150) return 15; return 10; };
export const obtenerSiguienteNivelCP = (p) => { if (p < 150) return { meta: 150, etiqueta: "15%" }; if (p < 650) return { meta: 650, etiqueta: "20%" }; return null; };
export const obtenerTotalSegunDescuentoCP = (d, t) => d === 10 ? t.total10 : d === 15 ? t.total15 : t.total20;

export const obtenerMensajeClientePreferente = (acum) => {
  if (acum < 150) { const f = 150 - acum; return { texto: `Puntos acumulados: ${acum}. Descuento actual: 10%. Te faltan ${f} puntos para alcanzar el 15%.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: `Puntos acumulados: ${acum} — Descuento actual: 10%.`, mensajeSecundario: `Te faltan ${f} puntos para alcanzar el 15% de descuento.` }; }
  if (acum < 650) { const f = 650 - acum; return { texto: `Puntos acumulados: ${acum}. Descuento actual: 15%. Te faltan ${f} puntos para alcanzar el 20%.`, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: `Puntos acumulados: ${acum} — Descuento actual: 15%.`, mensajeSecundario: `Te faltan ${f} puntos para alcanzar el 20% de descuento.` }; }
  return { texto: `Puntos acumulados: ${acum}. ¡Descuento actual: 20%! Nivel máximo.`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: `Puntos acumulados: ${acum} — ¡Descuento actual: 20%!`, mensajeSecundario: "Nivel máximo de Cliente Preferente." };
};

// ─── Price resolution ────────────────────────────────────────
export const obtenerPrecioActual = (item, perfil, descCP, descPaq, modo, descUnificado) => {
  if (perfil === "clientePreferente") { if (descCP === 10) return item.precioCP10 ?? item.precioPublico * 0.9; if (descCP === 15) return item.precioPublico * 0.85; return item.precio20 ?? item.precioPublico * 0.8; }
  if (modo === "compraInicial") { if (descPaq === 30) return item.precio30; if (descPaq === 33) return item.precio33; if (descPaq === 42) return item.precio42; return item.precioPublico; }
  const m = { 30: "precio30", 33: "precio33", 35: "precio35", 37: "precio37", 40: "precio40", 42: "precio42" };
  return item[m[descUnificado]] || item.precioPublico;
};

export const obtenerSubtotalPedido = (item, perfil, descCP, descPaq, modo, descUnificado) => {
  if (perfil === "clientePreferente") { if (descCP === 10) return item.subtotal10; if (descCP === 15) return item.subtotal15; return item.subtotal20; }
  if (modo === "compraInicial") { if (descPaq === 30) return item.subtotal30; if (descPaq === 33) return item.subtotal33; if (descPaq === 42) return item.subtotal42; return 0; }
  const m = { 30: "subtotal30", 33: "subtotal33", 35: "subtotal35", 37: "subtotal37", 40: "subtotal40", 42: "subtotal42" };
  return item[m[descUnificado]] || 0;
};