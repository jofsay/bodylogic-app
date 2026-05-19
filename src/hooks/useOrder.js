import { useCallback, useMemo, useState } from 'react';
import { normalizar, numeroSeguro } from '../utils/format';
import { calcularFilas, sumarTotales } from '../utils/calculations';

export function useOrder(productos, descuentoActivo) {
  const [cantidades, setCantidades] = useState({});
  const [categoria, setCategoria] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('tarjetas');
  const categorias = useMemo(() => ['TODAS', ...Array.from(new Set(productos.map((p) => p.categoria))).filter(Boolean)], [productos]);
  const filasTodas = useMemo(() => calcularFilas(productos, cantidades, descuentoActivo), [productos, cantidades, descuentoActivo]);
  const filasVisibles = useMemo(() => {
    const q = normalizar(busqueda);
    return filasTodas.filter((p) => (categoria === 'TODAS' || p.categoria === categoria) && (!q || normalizar(`${p.codigo} ${p.producto} ${p.contenido} ${p.categoria}`).includes(q)));
  }, [filasTodas, categoria, busqueda]);
  const filasSeleccionadas = useMemo(() => filasTodas.filter((f) => f.unidades > 0), [filasTodas]);
  const totales = useMemo(() => sumarTotales(filasTodas), [filasTodas]);
  const totalesPedido = useMemo(() => sumarTotales(filasSeleccionadas), [filasSeleccionadas]);
  const cambiarCantidad = useCallback((codigo, valor) => setCantidades((prev) => ({ ...prev, [codigo]: numeroSeguro(valor) })), []);
  const quitarProducto = useCallback((codigo) => setCantidades((prev) => ({ ...prev, [codigo]: 0 })), []);
  const limpiar = useCallback(() => setCantidades({}), []);
  const cargarCantidades = useCallback((next) => setCantidades(next || {}), []);
  return { cantidades, cambiarCantidad, quitarProducto, limpiar, cargarCantidades, categoria, setCategoria, busqueda, setBusqueda, vista, setVista, categorias, filasTodas, filasVisibles, filasSeleccionadas, totales: totalesPedido, totalesGlobales: totales };
}