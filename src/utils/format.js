/**
 * Formatting utilities.
 */
export const formatoMoneda = (numero) =>
  Number(numero || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
