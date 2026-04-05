/**
 * BodyLogic Discount & Points Calculation Engine.
 *
 * REGLA UNIVERSAL:
 *   ANTES de 42%  → calificar con 100 pts (primeros 15 días)
 *   DESPUÉS de 42% → calificar con 200 pts para mantenerlo
 *
 * ¿Cuándo se alcanza el 42%?
 *   Membresía:           siempre (Paquete 500)
 *   Pts Personales y CP: mes 18+
 *   Pts en Comunidad:    acumulado total >= 3001
 *
 * COMUNIDAD — suma:
 *   personales + clientesPreferentes + grupales + paqueteInicial + pedidoActual
 *   Escala: 1-500→30% | 501-1500→35% | 1501-3000→40% | 3001+→42%
 *
 * REINICIO INTERNO (no visible):
 *   Pierde 42% → regresa al paqueteEquivalente, nunca a 0.
 */

// ─── Auto-detect first 15 days ───────────────────────────────
export const detectarPrimeros15Dias = () => new Date().getDate() <= 15;

export const mensajeVentana15Dias = (dentro) =>
  dentro
    ? "Estás dentro de los primeros 15 días del mes. Tus compras sí participan en el Programa de Lealtad."
    : "Estás fuera de los primeros 15 días del mes. Las compras realizadas en este periodo no participan en el Programa de Lealtad y pueden provocar el reinicio de tus beneficios.";

// ─── Base messages ───────────────────────────────────────────
export const obtenerMensajesBase = (totalPuntos, ya42) => {
  const msgs = [];
  if (totalPuntos < 100) {
    msgs.push({ tipo: "calificacion", cumple: false, texto: `Te faltan ${100 - totalPuntos} puntos para calificar este mes y tener derecho a recibir comisiones.` });
  } else {
    msgs.push({ tipo: "calificacion", cumple: true, texto: "¡Felicidades! Has cubierto tu calificación mensual de 100 puntos y tienes derecho a recibir comisiones." });
  }
  if (ya42) {
    if (totalPuntos < 200) {
      msgs.push({ tipo: "mantenimiento42", cumple: false, texto: `Te faltan ${200 - totalPuntos} puntos para mantener el 42% de descuento.` });
    } else {
      msgs.push({ tipo: "mantenimiento42", cumple: true, texto: "¡Felicidades! Has superado los 200 puntos de compra mensual y mantienes el 42% de descuento." });
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

// ─── Membresía ───────────────────────────────────────────────
export const obtenerMensajeMembresia = (totalPuntos, dentroPrimeros15) => {
  const ok = (t, m1, m2) => ({ texto: t, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: m1, mensajeSecundario: m2, continuidad: true });
  const warn = (t, m1, m2) => ({ texto: t, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: m1, mensajeSecundario: m2, continuidad: true });
  const bad = (t, m1, m2) => ({ texto: t, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: m1, mensajeSecundario: m2, continuidad: false });
  if (!dentroPrimeros15) return bad("Compra fuera del periodo de Lealtad.", "Tu compra se realizó fuera del periodo del Programa de Lealtad.", totalPuntos >= 100 ? "Calificas para comisiones, pero no mantienes beneficios de lealtad." : `Te faltan ${100 - totalPuntos} pts para calificar a comisiones.`);
  if (totalPuntos < 100) return bad(`Te faltan ${100 - totalPuntos} pts para calificar.`, `Te faltan ${100 - totalPuntos} pts para calificar a comisiones.`, `Además, te faltan ${200 - totalPuntos} pts para mantener el 42%.`);
  if (totalPuntos < 200) return warn("Calificaste para comisiones, pero no mantienes el 42%.", "✔ Ya calificaste para comisiones.", `Te faltan ${200 - totalPuntos} pts para mantener el 42% de descuento.`);
  return ok("Mantienes tu 42% de descuento.", "✔ Calificación cubierta y 42% mantenido.", "Has superado 200 pts. Tu descuento del 42% está activo.");
};

// ─── Puntos Personales y CP ──────────────────────────────────
export const obtenerDescuentoLealtad = (mes) => {
  if (mes <= 1) return 30; if (mes <= 3) return 33; if (mes <= 5) return 35;
  if (mes <= 11) return 37; if (mes <= 17) return 40; return 42;
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

export const obtenerMensajeLealtad = (totalPuntos, mesLealtad, dentroPrimeros15, descuento, siguiente) => {
  const ok = (t, m1, m2, c) => ({ texto: t, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: m1, mensajeSecundario: m2, continuidad: c });
  const warn = (t, m1, m2) => ({ texto: t, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: m1, mensajeSecundario: m2, continuidad: true });
  const bad = (t, m1, m2) => ({ texto: t, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: m1, mensajeSecundario: m2, continuidad: false });
  const c100 = totalPuntos >= 100;
  if (!dentroPrimeros15) return bad("Compra fuera del periodo de Lealtad. Reinicia tu secuencia.", "Esta compra no sostiene tu avance y reinicia tu secuencia.", c100 ? "Aunque cubriste 100 pts, fuera de los primeros 15 días no conservas continuidad." : `Te faltan ${100 - totalPuntos} pts para calificación.`);
  if (!c100) return bad(`Te faltan ${100 - totalPuntos} pts para calificación.`, `Te faltan ${100 - totalPuntos} pts para calificación de 100 pts.`, "Necesitas mínimo 100 pts personales en los primeros 15 días.");
  if (mesLealtad >= 18) {
    if (totalPuntos < 200) return warn(`Mes ${mesLealtad} — Calificaste para comisiones, pero no mantienes el 42%.`, "✔ Calificación de 100 pts cubierta.", `Te faltan ${200 - totalPuntos} pts para mantener el 42% de descuento.`);
    return ok(`Mes ${mesLealtad} — ¡42% de descuento mantenido!`, "✔ Calificación cubierta y 42% de descuento mantenido.", "Has superado 200 pts. Tu descuento del 42% está activo este mes.", true);
  }
  if (siguiente) { const p = siguiente.mesesFaltantes === 1 ? "mes" : "meses"; return ok(`Mes ${mesLealtad} — ${descuento}% de descuento.`, `✔ Calificación cubierta. Tu descuento actual es ${descuento}%.`, `Te faltan ${siguiente.mesesFaltantes} ${p} consecutivos para llegar al ${siguiente.etiqueta}.`, true); }
  return ok(`Mes ${mesLealtad} — ${descuento}% de descuento.`, `✔ Calificación cubierta. Tu descuento actual es ${descuento}%.`, "Continúa comprando cada mes en los primeros 15 días para avanzar.", true);
};

// ─── Puntos en Comunidad ─────────────────────────────────────
// Escala: 1-500→30% | 501-1500→35% | 1501-3000→40% | 3001+→42%
export const obtenerDescuentoAcelerado = (acum) => {
  if (acum >= 3001) return 42; if (acum >= 1501) return 40;
  if (acum >= 501) return 35; if (acum >= 1) return 30; return 0;
};
export const obtenerSiguienteEscalonAcelerado = (acum) => {
  if (acum < 501) return { meta: 501, etiqueta: "35%" };
  if (acum < 1501) return { meta: 1501, etiqueta: "40%" };
  if (acum < 3001) return { meta: 3001, etiqueta: "42%" };
  return null;
};

/** Suma: personales + CP + grupales + base + pedido */
export const calcularAcumuladoComunidad = ({ puntosPersonales, puntosClientesPreferentes, puntosGrupales, puntosBaseInicial, puntosPedidoActual }) => {
  return Math.max(0,
    Number(puntosPersonales || 0) +
    Number(puntosClientesPreferentes || 0) +
    Number(puntosGrupales || 0) +
    Number(puntosBaseInicial || 0) +
    Number(puntosPedidoActual || 0)
  );
};

/** Paquete equivalente — para reinicio interno, nunca a 0 */
export const obtenerPaqueteEquivalente = (puntos) => {
  if (puntos >= 500) return 500;
  if (puntos >= 400) return 400;
  if (puntos >= 300) return 300;
  if (puntos >= 200) return 200;
  if (puntos >= 100) return 100;
  return 0;
};

export const obtenerMensajeAcelerado = (acum, desc, sig, dentroPrimeros15, totalPuntos, puntosBaseInicial = 0) => {
  const ok = (t, m1, m2) => ({ texto: t, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: m1, mensajeSecundario: m2 });
  const warn = (t, m1, m2) => ({ texto: t, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: m1, mensajeSecundario: m2 });
  const bad = (t, m1, m2) => ({ texto: t, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: m1, mensajeSecundario: m2 });

  if (acum <= 0) return bad("Captura tus puntos para evaluar.", "Ingresa tus puntos personales, de Clientes Preferentes y grupales.", "");

  const ya42 = acum >= 3001;
  const ptsRequeridos = ya42 ? 200 : 100;

  if (!dentroPrimeros15 && totalPuntos < ptsRequeridos) {
    const baseEquiv = obtenerPaqueteEquivalente(puntosBaseInicial);
    const baseDesc = obtenerDescuentoAcelerado(baseEquiv);
    return bad(
      `Fuera de ventana de 15 días sin ${ptsRequeridos} pts → reinicio a base inicial.`,
      `⚠ Reinicio de progreso. Tu base inicial (Paquete ${baseEquiv}) te coloca en ${baseDesc}%.`,
      `Acumulado se reinicia a ${baseEquiv} pts (tu paquete de ingreso). Nunca a cero.`
    );
  }

  if (ya42) {
    if (totalPuntos < 200) return warn(`Acumulado: ${acum} pts → 42%. Pero no mantienes el descuento.`, `✔ Has alcanzado 3001+ pts → 42% de descuento.`, `Te faltan ${200 - totalPuntos} pts para mantener el 42% este mes.`);
    return ok(`¡${acum} pts acumulados → 42% de descuento mantenido!`, "¡Felicidades! Has alcanzado 3001+ pts y mantienes el 42%.", "Tu descuento del 42% está activo con 200+ pts este mes.");
  }

  if (totalPuntos < 100) return bad(`Acumulado: ${acum} pts → ${desc}%. Pero no calificas.`, `Tu acumulado comunitario es ${acum} pts → ${desc}% de descuento.`, `Te faltan ${100 - totalPuntos} pts para calificar este mes.`);
  if (sig) { const f = sig.meta - acum; return (desc >= 35 ? warn : ok)(`Acumulado: ${acum} pts → ${desc}% de descuento.`, `✔ Calificación cubierta. Acumulado: ${acum} pts → ${desc}%.`, `Te faltan ${f} pts para llegar al ${sig.etiqueta}.`); }
  return ok(`${acum} pts acumulados → ${desc}%.`, `✔ Calificación cubierta. ${desc}% de descuento.`, "");
};

// ─── Cliente Preferente ──────────────────────────────────────
export const obtenerDescuentoClientePreferente = (p) => { if (p >= 650) return 20; if (p >= 150) return 15; return 10; };
export const obtenerSiguienteNivelCP = (p) => { if (p < 150) return { meta: 150, etiqueta: "15%" }; if (p < 650) return { meta: 650, etiqueta: "20%" }; return null; };
export const obtenerTotalSegunDescuentoCP = (d, t) => d === 10 ? t.total10 : d === 15 ? t.total15 : t.total20;
export const obtenerMensajeClientePreferente = (acum) => {
  if (acum < 150) { const f = 150 - acum; return { texto: `10% de descuento. Faltan ${f} pts → 15%.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: "Descuento actual: 10%.", mensajeSecundario: `Faltan ${f} pts → 15%.` }; }
  if (acum < 650) { const f = 650 - acum; return { texto: `15% de descuento. Faltan ${f} pts → 20%.`, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: "Descuento actual: 15%.", mensajeSecundario: `Faltan ${f} pts → 20%.` }; }
  return { texto: "¡20% de descuento! Nivel máximo.", colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: "Descuento actual: 20%.", mensajeSecundario: "Nivel máximo de Cliente Preferente." };
};

// ─── Price resolution ────────────────────────────────────────
export const obtenerPrecioActual = (item, perfil, descCP, descPaq, modo, descLealtad, descAcel, prog) => {
  if (perfil === "clientePreferente") { if (descCP === 10) return item.precioCP10 ?? item.precioPublico * 0.9; if (descCP === 15) return item.precioPublico * 0.85; return item.precio20 ?? item.precioPublico * 0.8; }
  if (modo === "compraInicial") { if (descPaq === 30) return item.precio30; if (descPaq === 33) return item.precio33; if (descPaq === 42) return item.precio42; return item.precioPublico; }
  if (prog === "membresia") return item.precio42;
  if (prog === "lealtad") { const m = { 30: "precio30", 33: "precio33", 35: "precio35", 37: "precio37", 40: "precio40", 42: "precio42" }; return item[m[descLealtad]] || item.precioPublico; }
  const m = { 30: "precio30", 35: "precio35", 40: "precio40", 42: "precio42" };
  return item[m[descAcel]] || item.precioPublico;
};

export const obtenerSubtotalPedido = (item, perfil, descCP, descPaq, modo, descLealtad, descAcel, prog) => {
  if (perfil === "clientePreferente") { if (descCP === 10) return item.subtotal10; if (descCP === 15) return item.subtotal15; return item.subtotal20; }
  if (modo === "compraInicial") { if (descPaq === 30) return item.subtotal30; if (descPaq === 33) return item.subtotal33; if (descPaq === 42) return item.subtotal42; return 0; }
  if (prog === "membresia") return item.subtotal42;
  if (prog === "lealtad") { const m = { 30: "subtotal30", 33: "subtotal33", 35: "subtotal35", 37: "subtotal37", 40: "subtotal40", 42: "subtotal42" }; return item[m[descLealtad]] || 0; }
  const m = { 30: "subtotal30", 35: "subtotal35", 40: "subtotal40", 42: "subtotal42" };
  return item[m[descAcel]] || 0;
};