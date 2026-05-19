import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { productos } from "../data/productos";
import { mapearFila, calcularTotales } from "../utils/calculations";

/**
 * Manages the full order/cart state:
 * - quantities per product
 * - filtering by category / search
 * - computed row data and totals
 * - product refs for scroll-to-search
 */
export function useOrder() {
  const [cantidades, setCantidades] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [filaActiva, setFilaActiva] = useState("");
  const productRefs = useRef({});

  // ── Categories ──
  const categorias = useMemo(() => {
    const unicas = [...new Set(productos.map((i) => i.categoria))];
    return ["TODAS", ...unicas];
  }, []);

  // ── Filtering ──
  const productosFiltrados = useMemo(() => {
    let base =
      categoriaSeleccionada === "TODAS"
        ? productos
        : productos.filter((i) => i.categoria === categoriaSeleccionada);

    const q = busqueda.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (i) =>
          i.producto.toLowerCase().includes(q) ||
          i.codigo.toLowerCase().includes(q) ||
          i.categoria.toLowerCase().includes(q)
      );
    }
    return base;
  }, [categoriaSeleccionada, busqueda]);

  // ── Mapped rows ──
  const filasCalculadas = useMemo(
    () => productosFiltrados.map((i) => mapearFila(i, cantidades)),
    [productosFiltrados, cantidades]
  );

  const filasTotales = useMemo(
    () => productos.map((i) => mapearFila(i, cantidades)),
    [cantidades]
  );

  const productosSeleccionados = useMemo(
    () => filasTotales.filter((i) => i.unidades > 0),
    [filasTotales]
  );

  // ── Aggregate totals ──
  const totales = useMemo(() => calcularTotales(filasTotales), [filasTotales]);

  // ── Cart actions (memoized to avoid re-renders) ──
  const cambiarCantidad = useCallback((codigo, valor) => {
    const n = Number(valor);
    setCantidades((p) => ({ ...p, [codigo]: n >= 0 ? n : 0 }));
    setFilaActiva(codigo);
  }, []);

  const incrementarProducto = useCallback((codigo) => {
    setCantidades((p) => ({ ...p, [codigo]: (p[codigo] || 0) + 1 }));
    setFilaActiva(codigo);
  }, []);

  const decrementarProducto = useCallback((codigo) => {
    setCantidades((p) => ({ ...p, [codigo]: Math.max((p[codigo] || 0) - 1, 0) }));
    setFilaActiva(codigo);
  }, []);

  const eliminarProducto = useCallback(
    (codigo) => {
      setCantidades((p) => ({ ...p, [codigo]: 0 }));
      if (filaActiva === codigo) setFilaActiva("");
    },
    [filaActiva]
  );

  const vaciarPedido = useCallback(() => {
    setCantidades({});
    setFilaActiva("");
  }, []);

  // ── Auto-scroll on search ──
  useEffect(() => {
    if (!busqueda.trim()) return;
    const timer = setTimeout(() => {
      const q = busqueda.trim().toLowerCase();
      const match = productos.find(
        (i) =>
          i.producto.toLowerCase().includes(q) ||
          i.codigo.toLowerCase().includes(q)
      );
      if (match && productRefs.current[match.codigo]) {
        productRefs.current[match.codigo].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setFilaActiva(match.codigo);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  return {
    // State
    cantidades,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    setBusqueda,
    filaActiva,
    setFilaActiva,
    productRefs,
    categorias,

    // Computed
    productosFiltrados,
    filasCalculadas,
    filasTotales,
    productosSeleccionados,
    totales,

    // Actions
    cambiarCantidad,
    incrementarProducto,
    decrementarProducto,
    eliminarProducto,
    vaciarPedido,
  };
}
