export const formatoMoneda = (valor = 0) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(valor) || 0);
export const formatoNumero = (valor = 0) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(Number(valor) || 0);
export const numeroSeguro = (valor) => Math.max(0, Number(valor) || 0);
export const normalizar = (texto = '') => texto.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();