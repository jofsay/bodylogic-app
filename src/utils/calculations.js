/**
 * BodyLogic — Motor de Cálculo.
 *
 * PLA: base = paqueteInicial (NUNCA 0) + personales + grupales + pedido
 *   1-500→30% | 501-1500→35% | 1501-3000→40% | 3001+→42%
 *
 * PL: escala por meses consecutivos
 *   M1→30% | M2-3→33% | M4-5→35% | M6-11→37% | M12-17→40% | M18+→42%
 *
 * CP: 0-149→10% | 150-649→20% | 650+→30%
 *
 * Simulador: descuento manual, independiente de lealtad
 */

export const detectarPrimeros15Dias = () => new Date().getDate() <= 15;

export const generarMensajesPuntos = (puntosMes, tiene42, dentroPrimeros15, cumplioQuincena) => {
  const msgs = [];
  if (dentroPrimeros15) {
    msgs.push(puntosMes >= 100
      ? { cumple: true, texto: "✔ Ya cumpliste los primeros 100 puntos requeridos en esta primera quincena." }
      : { cumple: false, texto: `Te faltan ${100 - puntosMes} puntos para alcanzar los 100 puntos requeridos en esta primera quincena.` });
  } else {
    msgs.push(cumplioQuincena
      ? { cumple: true, texto: "✔ Cumpliste los 100 puntos de la primera quincena." }
      : { cumple: false, texto: "No cumpliste los 100 puntos en la primera quincena. No conservas el beneficio del Programa de Lealtad para este periodo." });
  }
  if (tiene42) {
    msgs.push(puntosMes >= 200
      ? { cumple: true, texto: "✔ ¡Ya completaste los 200 puntos mensuales para mantener tu descuento!" }
      : { cumple: false, texto: `Te faltan ${200 - puntosMes} puntos para completar los 200 puntos mensuales y mantener tu descuento.` });
  }
  return msgs;
};

// ─── Row-level ───────────────────────────────────────────────
export const mapearFila = (item, cantidades) => {
  const u = Number(cantidades[item.codigo] || 0);
  return { ...item, unidades: u, subtotalPuntos: u * item.puntos, subtotalPrecioPublico: u * item.precioPublico, subtotalValorComisionable: u * item.valorComisionable,
    subtotal10: item.precioCP10 !== undefined ? u * item.precioCP10 : u * item.precioPublico * 0.9,
    subtotal15: u * item.precioPublico * 0.85,
    subtotal20: item.precio20 !== undefined ? u * item.precio20 : u * item.precioPublico * 0.8,
    subtotal30: u * item.precio30, subtotal33: u * item.precio33, subtotal35: u * item.precio35,
    subtotal37: u * item.precio37, subtotal40: u * item.precio40, subtotal42: u * item.precio42 };
};

export const calcularTotales = (filas) => {
  const s = (k) => filas.reduce((a, i) => a + i[k], 0);
  return { totalUnidades: s("unidades"), totalPuntos: s("subtotalPuntos"), totalPrecioPublico: s("subtotalPrecioPublico"), totalValorComisionable: s("subtotalValorComisionable"),
    total10: s("subtotal10"), total15: s("subtotal15"), total20: s("subtotal20"), total30: s("subtotal30"), total33: s("subtotal33"), total35: s("subtotal35"), total37: s("subtotal37"), total40: s("subtotal40"), total42: s("subtotal42") };
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
  if (totalPuntos >= 500) return { texto: "Ya alcanzaste el paquete de 500 puntos y el 42% de descuento.", ...st("#ecfccb","#3f6212","#84cc16","#65a30d"), siguienteMensaje: "Paquete más alto de compra inicial." };
  const f = paquete.siguienteObjetivo - totalPuntos;
  return { texto: `${paquete.nombre} con ${paquete.descuento}%. Te faltan ${f} pts para ${paquete.siguientePaquete}.`, ...st("#fef3c7","#92400e","#f59e0b","#d97706"), siguienteMensaje: `Te faltan ${f} pts para ${paquete.siguientePaquete}.` };
};

// ─── Escalas ─────────────────────────────────────────────────
export const obtenerDescuentoPL = (mes) => { if (mes <= 1) return 30; if (mes <= 3) return 33; if (mes <= 5) return 35; if (mes <= 11) return 37; if (mes <= 17) return 40; return 42; };
export const obtenerDescuentoPLA = (acum) => { if (acum >= 3001) return 42; if (acum >= 1501) return 40; if (acum >= 501) return 35; if (acum >= 1) return 30; return 0; };
export const obtenerTotalSegunDescuento = (desc, tot) => { const m = { 10: "total10", 20: "total20", 30: "total30", 33: "total33", 35: "total35", 37: "total37", 40: "total40", 42: "total42" }; return tot[m[desc]] || 0; };

export const siguienteEscalonPL = (mes) => { if (mes < 2) return { etiqueta: "33%", faltan: 2 - mes }; if (mes < 4) return { etiqueta: "35%", faltan: 4 - mes }; if (mes < 6) return { etiqueta: "37%", faltan: 6 - mes }; if (mes < 12) return { etiqueta: "40%", faltan: 12 - mes }; if (mes < 18) return { etiqueta: "42%", faltan: 18 - mes }; return null; };
export const siguienteEscalonPLA = (acum) => { if (acum < 501) return { meta: 501, etiqueta: "35%" }; if (acum < 1501) return { meta: 1501, etiqueta: "40%" }; if (acum < 3001) return { meta: 3001, etiqueta: "42%" }; return null; };

// ─── PLA: base = paqueteInicial, NUNCA 0 ─────────────────────
export const calcularPuntosAcelerado = ({ paqueteInicial, puntosPersonales = 0, puntosGrupales = 0, puntosPedido = 0 }) => {
  const base = paqueteInicial; // NUNCA 0
  return base + Number(puntosPersonales) + Number(puntosGrupales) + Number(puntosPedido);
};

// ─── Resolvers ───────────────────────────────────────────────
const ok = (t, m1, m2) => ({ texto: t, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: m1, mensajeSecundario: m2 });
const warn = (t, m1, m2) => ({ texto: t, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: m1, mensajeSecundario: m2 });
const bad = (t, m1, m2) => ({ texto: t, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: m1, mensajeSecundario: m2 });

export const resolverTiene42 = (puntosMes, cumplioQuincena) => {
  if (!cumplioQuincena) return { descuento: 42, mantiene: false, ...bad("No cumpliste los 100 pts en la primera quincena.", "No se cumplió el requisito de primera quincena.", "Necesitas al menos 100 pts en los primeros 15 días.") };
  if (puntosMes >= 200) return { descuento: 42, mantiene: true, ...ok("Mantienes tu 42% de descuento.", "✔ 42% de descuento activo.", `Has completado ${puntosMes} pts. Requisito cubierto.`) };
  if (puntosMes >= 100) return { descuento: 42, mantiene: false, ...warn("Primera quincena cubierta. Faltan pts para los 200 mensuales.", "✔ Primera quincena cubierta.", `Te faltan ${200 - puntosMes} pts para completar los 200 mensuales.`) };
  return { descuento: 42, mantiene: false, ...bad(`Te faltan ${100 - puntosMes} pts para los primeros 100.`, `Te faltan ${100 - puntosMes} pts para calificación.`, "Necesitas 100 pts en 1ra quincena y 200 en el mes.") };
};

export const resolverPL = (puntosMes, mesActual, cumplioQuincena) => {
  const desc = obtenerDescuentoPL(mesActual); const sig = siguienteEscalonPL(mesActual);
  if (!cumplioQuincena) return { descuento: desc, modalidad: "PL", ...bad("No se cumplieron los 100 pts en la primera quincena.", "No conservas tu avance en el Programa de Lealtad.", "Necesitas al menos 100 pts en los primeros 15 días.") };
  if (mesActual >= 18) {
    if (puntosMes >= 200) return { descuento: 42, modalidad: "PL", ...ok(`Mes ${mesActual} — ¡42% mantenido!`, "✔ 42% mantenido.", `${puntosMes} pts este mes.`) };
    return { descuento: 42, modalidad: "PL", ...warn(`Mes ${mesActual} — Faltan pts para mantener 42%.`, "✔ Primera quincena cubierta.", `Te faltan ${200 - puntosMes} pts para los 200 mensuales.`) };
  }
  if (puntosMes < 100) return { descuento: desc, modalidad: "PL", ...bad(`Te faltan ${100 - puntosMes} pts para calificar.`, `Mes ${mesActual} — ${desc}%.`, `Te faltan ${100 - puntosMes} pts.`) };
  if (sig) { const p = sig.faltan === 1 ? "mes" : "meses"; return { descuento: desc, modalidad: "PL", ...ok(`Mes ${mesActual} — ${desc}%.`, `✔ Descuento actual: ${desc}%.`, `Te faltan ${sig.faltan} ${p} para el ${sig.etiqueta}.`) }; }
  return { descuento: desc, modalidad: "PL", ...ok(`Mes ${mesActual} — ${desc}%.`, `✔ ${desc}%.`, "") };
};

export const resolverPLA = (puntosPersonalesAcum, puntosGrupalesAcum, paqueteInicial, puntosMes, cumplioQuincena) => {
  const acum = calcularPuntosAcelerado({ paqueteInicial, puntosPersonales: puntosPersonalesAcum, puntosGrupales: puntosGrupalesAcum, puntosPedido: puntosMes });
  const desc = obtenerDescuentoPLA(acum); const sig = siguienteEscalonPLA(acum);
  if (!cumplioQuincena) return { descuento: desc, modalidad: "PLA", acumulado: acum, ...bad("No se cumplieron los 100 pts en la primera quincena.", `Acumulado: ${acum} pts → ${desc}%.`, "Se requieren 100 pts en la primera quincena.") };
  if (acum >= 3001) {
    if (puntosMes >= 200) return { descuento: 42, modalidad: "PLA", acumulado: acum, ...ok(`¡42%! Acumulado: ${acum} pts.`, `✔ ${acum} pts → 42%. Mantenimiento cubierto.`, `${puntosMes} pts este mes.`) };
    return { descuento: 42, modalidad: "PLA", acumulado: acum, ...warn(`${acum} pts → 42%. Faltan pts mensuales.`, `✔ 1ra quincena cubierta. ${acum} pts → 42%.`, `Te faltan ${200 - puntosMes} pts para los 200 mensuales.`) };
  }
  if (puntosMes < 100) return { descuento: desc, modalidad: "PLA", acumulado: acum, ...bad(`${acum} pts → ${desc}%. No calificas.`, `Acumulado: ${acum} pts → ${desc}%.`, `Te faltan ${100 - puntosMes} pts.`) };
  if (sig) { const f = sig.meta - acum; return { descuento: desc, modalidad: "PLA", acumulado: acum, ...(desc >= 35 ? warn : ok)(`${acum} pts → ${desc}%.`, `✔ Acumulado: ${acum} pts → ${desc}%.`, `Te faltan ${f} pts para el ${sig.etiqueta}.`) }; }
  return { descuento: desc, modalidad: "PLA", acumulado: acum, ...ok(`${acum} pts → ${desc}%.`, `✔ ${desc}%.`, "") };
};

// ─── Cliente Preferente — NUEVA escala: 10/20/30 ─────────────
export const obtenerDescuentoClientePreferente = (p) => { if (p >= 650) return 30; if (p >= 150) return 20; return 10; };
export const obtenerSiguienteNivelCP = (p) => { if (p < 150) return { meta: 150, etiqueta: "20%" }; if (p < 650) return { meta: 650, etiqueta: "30%" }; return null; };
export const obtenerTotalSegunDescuentoCP = (d, t) => d === 10 ? t.total10 : d === 20 ? t.total20 : t.total30;

export const obtenerMensajeClientePreferente = (acum) => {
  if (acum < 150) { const f = 150 - acum; return { texto: `Puntos acumulados: ${acum}. Descuento actual: 10%. Te faltan ${f} pts para el 20%.`, colorFondo: "#fee2e2", colorTexto: "#991b1b", colorBorde: "#ef4444", colorSemaforo: "#dc2626", mensajePrincipal: `Puntos acumulados: ${acum} — Descuento: 10%.`, mensajeSecundario: `Te faltan ${f} pts para el 20%.` }; }
  if (acum < 650) { const f = 650 - acum; return { texto: `Puntos acumulados: ${acum}. Descuento actual: 20%. Te faltan ${f} pts para el 30%.`, colorFondo: "#fef3c7", colorTexto: "#92400e", colorBorde: "#f59e0b", colorSemaforo: "#d97706", mensajePrincipal: `Puntos acumulados: ${acum} — Descuento: 20%.`, mensajeSecundario: `Te faltan ${f} pts para el 30%.` }; }
  return { texto: `Puntos acumulados: ${acum}. ¡Descuento: 30%! Nivel máximo.`, colorFondo: "#ecfccb", colorTexto: "#3f6212", colorBorde: "#84cc16", colorSemaforo: "#65a30d", mensajePrincipal: `Puntos acumulados: ${acum} — ¡30%!`, mensajeSecundario: "Nivel máximo de Cliente Preferente." };
};

// ─── Simulador ───────────────────────────────────────────────
export const DESCUENTOS_SIMULADOR = [0, 10, 20, 30, 33, 35, 37, 40, 42];
export const calcularPrecioSimulador = (precio, descuento) => precio * (1 - descuento / 100);

// ─── Price resolution ────────────────────────────────────────
export const obtenerPrecioActual = (item, perfil, descCP, descPaq, modo, descFinal) => {
  if (perfil === "simulador") return item.precioPublico;
  if (perfil === "clientePreferente") { if (descCP === 10) return item.precioCP10 ?? item.precioPublico * 0.9; if (descCP === 20) return item.precio20 ?? item.precioPublico * 0.8; return item.precio30; }
  if (modo === "compraInicial") { if (descPaq === 30) return item.precio30; if (descPaq === 33) return item.precio33; if (descPaq === 42) return item.precio42; return item.precioPublico; }
  const m = { 30: "precio30", 33: "precio33", 35: "precio35", 37: "precio37", 40: "precio40", 42: "precio42" };
  return item[m[descFinal]] || item.precioPublico;
};

export const obtenerSubtotalPedido = (item, perfil, descCP, descPaq, modo, descFinal) => {
  if (perfil === "simulador") return item.subtotalPrecioPublico;
  if (perfil === "clientePreferente") { if (descCP === 10) return item.subtotal10; if (descCP === 20) return item.subtotal20; return item.subtotal30; }
  if (modo === "compraInicial") { if (descPaq === 30) return item.subtotal30; if (descPaq === 33) return item.subtotal33; if (descPaq === 42) return item.subtotal42; return 0; }
  const m = { 30: "subtotal30", 33: "subtotal33", 35: "subtotal35", 37: "subtotal37", 40: "subtotal40", 42: "subtotal42" };
  return item[m[descFinal]] || 0;
};