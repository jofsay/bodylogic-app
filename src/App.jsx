import { useMemo, useRef, useState } from 'react';
import { productos } from './data/productos';
import { useResponsive } from './hooks/useResponsive';
import { useOrder } from './hooks/useOrder';
import { useDiscountEngine } from './hooks/useDiscountEngine';
import Header from './components/layout/Header';
import ControlPanel from './components/control/ControlPanel';
import ProductExplorer from './components/products/ProductExplorer';
import OrderSummary from './components/order/OrderSummary';
import FloatingSummary from './components/floating/FloatingSummary';
import DocumentsPanel from './components/documents/DocumentsPanel';
import FormularioMembresia from './components/documents/FormularioMembresia';
import { generarPedidoPDF } from './utils/pdf';
import { precioUnitarioPorDescuento, totalPorDescuento } from './utils/calculations';
import { exportarPedidoJSON, leerJSON } from './utils/download';
import './index.css';

export default function App() {
  const isMobile = useResponsive();
  const [perfilUsuario, setPerfilUsuario] = useState('distribuidor');
  const [modo, setModo] = useState('compraInicial');
  const [descuentoSimulador, setDescuentoSimulador] = useState(35);
  const [nombreCliente, setNombreCliente] = useState('');
  const [mostrarMembresia, setMostrarMembresia] = useState(false);
  const [recompra, setRecompra] = useState({
    programa: 'lealtad',
    mesActual: 1,
    dentroPrimeros15: true,
    puntosClientesPreferentes: 0,
    descuentoActual: 30,
    puntosPersonalesExtra: 0,
    puntosGrupales: 0,
    acumuladoPrevio: 0,
    ingreso500: false,
  });
  const [clientePreferente, setClientePreferente] = useState({ acumuladoPrevio: 0 });

  const provisionalDiscount = perfilUsuario === 'simulador' ? descuentoSimulador : 0;
  const order = useOrder(productos, provisionalDiscount);
  const engine = useDiscountEngine({
    perfilUsuario,
    modo,
    totales: order.totales,
    recompra,
    clientePreferente,
    descuentoSimulador,
  });

  const descuentoActivo = perfilUsuario === 'ventas' ? 0 : engine.descuentoActivo;
  const esVentas = perfilUsuario === 'ventas';

  const applyActive = (f) => {
    const unit = esVentas ? f.precioPublico : precioUnitarioPorDescuento(f, descuentoActivo);
    return {
      ...f,
      descuentoActivo,
      precioActivoUnitario: unit,
      subtotalPrecioActivo: unit * f.unidades,
    };
  };

  const filasSeleccionadas = useMemo(
    () => order.filasSeleccionadas.map(applyActive),
    [order.filasSeleccionadas, descuentoActivo, esVentas]
  );

  const filasVisiblesActivas = useMemo(
    () => order.filasVisibles.map(applyActive),
    [order.filasVisibles, descuentoActivo, esVentas]
  );

  const totalesActivos = useMemo(
    () => ({
      ...order.totales,
      totalPrecioActivo: esVentas
        ? order.totales.totalPrecioPublico
        : totalPorDescuento(order.totales, descuentoActivo),
    }),
    [order.totales, descuentoActivo, esVentas]
  );

  const pedidoRef = useRef(null);
  const irPedido = () => document.getElementById('pedido-actual')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const irArriba = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const print = () => window.print();
  const pdf = () => generarPedidoPDF({
    filas: filasSeleccionadas,
    totales: totalesActivos,
    perfil: perfilUsuario,
    modo,
    resumen: engine.resumen,
    descuentoActivo,
    nombreCliente,
  });
  const exportar = () => exportarPedidoJSON({
    cantidades: order.cantidades,
    perfilUsuario,
    modo,
    descuentoSimulador,
    nombreCliente,
    recompra,
    clientePreferente,
  });
  const importar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await leerJSON(file);
      order.cargarCantidades(data.cantidades || {});
      if (data.perfilUsuario) setPerfilUsuario(data.perfilUsuario);
      if (data.modo) setModo(data.modo);
      if (data.descuentoSimulador) setDescuentoSimulador(data.descuentoSimulador);
      if (typeof data.nombreCliente === 'string') setNombreCliente(data.nombreCliente);
      if (data.recompra) setRecompra(data.recompra);
      if (data.clientePreferente) setClientePreferente(data.clientePreferente);
    } catch {
      alert('No pude leer el archivo JSON del pedido.');
    } finally {
      e.target.value = '';
    }
  };

  const productOrder = {
    ...order,
    filasVisibles: filasVisiblesActivas,
    filasSeleccionadas,
    totales: totalesActivos,
  };

  return (
    <main className="app">
      <Header />
      <ControlPanel
        perfilUsuario={perfilUsuario}
        setPerfilUsuario={setPerfilUsuario}
        modo={modo}
        setModo={setModo}
        descuentoSimulador={descuentoSimulador}
        setDescuentoSimulador={setDescuentoSimulador}
        nombreCliente={nombreCliente}
        setNombreCliente={setNombreCliente}
        recompra={recompra}
        setRecompra={setRecompra}
        clientePreferente={clientePreferente}
        setClientePreferente={setClientePreferente}
      />
      <OrderSummary
        ref={pedidoRef}
        filas={filasSeleccionadas}
        totales={totalesActivos}
        resumen={engine.resumen}
        descuentoActivo={descuentoActivo}
        perfilUsuario={perfilUsuario}
        nombreCliente={nombreCliente}
        onClear={order.limpiar}
        onRemove={order.quitarProducto}
        onPdf={pdf}
        onPrint={print}
        onExport={exportar}
        onImport={importar}
      />
      <ProductExplorer order={productOrder} descuentoActivo={descuentoActivo} perfilUsuario={perfilUsuario} />
      <DocumentsPanel perfilUsuario={perfilUsuario} onOpenMembership={() => setMostrarMembresia(true)} />
      {mostrarMembresia && <FormularioMembresia onClose={() => setMostrarMembresia(false)} />}
      <FloatingSummary
        isMobile={isMobile}
        resumen={engine.resumen}
        totales={totalesActivos}
        descuentoActivo={descuentoActivo}
        perfilUsuario={perfilUsuario}
        onPedido={irPedido}
        onPdf={pdf}
        onPrint={print}
        onTop={irArriba}
      />
    </main>
  );
}