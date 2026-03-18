import { useEffect, useMemo, useState } from "react";
import FormularioMembresia from "./components/FormularioMembresia";
import { productos } from "./data/productos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [cantidades, setCantidades] = useState({});
  const [modo, setModo] = useState("compraInicial");
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(100);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODAS");
  const [filaActiva, setFilaActiva] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [vistaMovil, setVistaMovil] = useState(window.innerWidth <= 768 ? "cards" : "tabla");

  useEffect(() => {
    const manejarResize = () => {
      const movil = window.innerWidth <= 768;
      setEsMovil(movil);
    };

    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);

  const categorias = useMemo(() => {
    const unicas = [...new Set(productos.map((item) => item.categoria))];
    return ["TODAS", ...unicas];
  }, []);

  const documentos = [
    {
      nombre: "Catálogo Bodylogic 2026",
      archivo: "CATALOGO-BODYLOGIC-2026.pdf",
      descripcion: "Consulta visual del catálogo general.",
    },
    {
      nombre: "Lista de Precios CP Marzo 26",
      archivo: "LISTA-PRECIOS-CP-MARZO-26.pdf",
      descripcion: "Precios para Cliente Preferente.",
    },
    {
      nombre: "Lista de Precios DI Marzo 26",
      archivo: "LISTA-PRECIOS-DI-MARZO-26.pdf",
      descripcion: "Precios para Distribuidor Independiente.",
    },
    {
      nombre: "Solicitud de Membresía",
      archivo: "SOLICITUD-DE-MEMBRESIA.pdf",
      descripcion: "Formato oficial para alta de nuevos asociados.",
    },
  ];

  const cambiarCantidad = (codigo, valor) => {
    const numero = Number(valor);
    setCantidades({
      ...cantidades,
      [codigo]: numero >= 0 ? numero : 0,
    });
    setFilaActiva(codigo);
  };

  const incrementarProducto = (codigo) => {
    const actual = cantidades[codigo] || 0;
    setCantidades({
      ...cantidades,
      [codigo]: actual + 1,
    });
    setFilaActiva(codigo);
  };

  const decrementarProducto = (codigo) => {
    const actual = cantidades[codigo] || 0;
    const nuevo = actual - 1;
    setCantidades({
      ...cantidades,
      [codigo]: nuevo >= 0 ? nuevo : 0,
    });
    setFilaActiva(codigo);
  };

  const eliminarProducto = (codigo) => {
    setCantidades({
      ...cantidades,
      [codigo]: 0,
    });
    if (filaActiva === codigo) {
      setFilaActiva("");
    }
  };

  const limpiarCantidades = () => {
    setCantidades({});
    setFilaActiva("");
  };

  const productosFiltradosBase =
    categoriaSeleccionada === "TODAS"
      ? productos
      : productos.filter((item) => item.categoria === categoriaSeleccionada);

  const textoBusqueda = busqueda.trim().toLowerCase();

  const productosFiltrados = productosFiltradosBase.filter((item) => {
    if (!textoBusqueda) return true;
    return (
      item.producto.toLowerCase().includes(textoBusqueda) ||
      item.codigo.toLowerCase().includes(textoBusqueda) ||
      item.categoria.toLowerCase().includes(textoBusqueda)
    );
  });

  const filasCalculadas = productosFiltrados.map((item) => {
    const unidades = cantidades[item.codigo] || 0;

    const subtotalPuntos = unidades * item.puntos;
    const subtotalPrecioPublico = unidades * item.precioPublico;
    const subtotalValorComisionable = unidades * item.valorComisionable;
    const subtotalCP10 = unidades * item.precioCP10;
    const subtotal20 = unidades * item.precio20;
    const subtotal30 = unidades * item.precio30;
    const subtotal33 = unidades * item.precio33;
    const subtotal35 = unidades * item.precio35;
    const subtotal37 = unidades * item.precio37;
    const subtotal40 = unidades * item.precio40;
    const subtotal42 = unidades * item.precio42;

    return {
      ...item,
      unidades,
      subtotalPuntos,
      subtotalPrecioPublico,
      subtotalValorComisionable,
      subtotalCP10,
      subtotal20,
      subtotal30,
      subtotal33,
      subtotal35,
      subtotal37,
      subtotal40,
      subtotal42,
    };
  });

  const filasTotales = productos.map((item) => {
    const unidades = cantidades[item.codigo] || 0;

    const subtotalPuntos = unidades * item.puntos;
    const subtotalPrecioPublico = unidades * item.precioPublico;
    const subtotalValorComisionable = unidades * item.valorComisionable;
    const subtotalCP10 = unidades * item.precioCP10;
    const subtotal20 = unidades * item.precio20;
    const subtotal30 = unidades * item.precio30;
    const subtotal33 = unidades * item.precio33;
    const subtotal35 = unidades * item.precio35;
    const subtotal37 = unidades * item.precio37;
    const subtotal40 = unidades * item.precio40;
    const subtotal42 = unidades * item.precio42;

    return {
      ...item,
      unidades,
      subtotalPuntos,
      subtotalPrecioPublico,
      subtotalValorComisionable,
      subtotalCP10,
      subtotal20,
      subtotal30,
      subtotal33,
      subtotal35,
      subtotal37,
      subtotal40,
      subtotal42,
    };
  });

  const productosSeleccionados = filasTotales.filter((item) => item.unidades > 0);

  const totalUnidades = filasTotales.reduce((acc, item) => acc + item.unidades, 0);
  const totalPuntos = filasTotales.reduce((acc, item) => acc + item.subtotalPuntos, 0);
  const totalPrecioPublico = filasTotales.reduce((acc, item) => acc + item.subtotalPrecioPublico, 0);
  const totalValorComisionable = filasTotales.reduce((acc, item) => acc + item.subtotalValorComisionable, 0);
  const totalCP10 = filasTotales.reduce((acc, item) => acc + item.subtotalCP10, 0);
  const total20 = filasTotales.reduce((acc, item) => acc + item.subtotal20, 0);
  const total30 = filasTotales.reduce((acc, item) => acc + item.subtotal30, 0);
  const total33 = filasTotales.reduce((acc, item) => acc + item.subtotal33, 0);
  const total35 = filasTotales.reduce((acc, item) => acc + item.subtotal35, 0);
  const total37 = filasTotales.reduce((acc, item) => acc + item.subtotal37, 0);
  const total40 = filasTotales.reduce((acc, item) => acc + item.subtotal40, 0);
  const total42 = filasTotales.reduce((acc, item) => acc + item.subtotal42, 0);

  const obtenerEstadoPuntos = () => {
    if (modo === "compraInicial") {
      if (totalPuntos >= paqueteSeleccionado) {
        return {
          texto: `Ya cubriste los ${paqueteSeleccionado} puntos de este paquete. ¡MUCHAS FELICIDADES, RECIBE UNA CORDIAL BIENVENIDA!`,
          colorFondo: "#ecfccb",
          colorTexto: "#3f6212",
          colorBorde: "#84cc16",
          colorSemaforo: "#65a30d",
        };
      } else {
        return {
          texto: `Te faltan ${paqueteSeleccionado - totalPuntos} puntos para poder adquirir este paquete.`,
          colorFondo: "#fee2e2",
          colorTexto: "#991b1b",
          colorBorde: "#ef4444",
          colorSemaforo: "#dc2626",
        };
      }
    }

    if (totalPuntos < 100) {
      return {
        texto: "Esta recompra aún no te califica para recibir comisiones. Necesitas mínimo 100 puntos para calificar.",
        colorFondo: "#fee2e2",
        colorTexto: "#991b1b",
        colorBorde: "#ef4444",
        colorSemaforo: "#dc2626",
      };
    }

    if (totalPuntos >= 100 && totalPuntos < 200) {
      return {
        texto: "Esta recompra te califica para recibir comisiones, pero todavía no logras el 42% de descuento.",
        colorFondo: "#fef3c7",
        colorTexto: "#92400e",
        colorBorde: "#f59e0b",
        colorSemaforo: "#d97706",
      };
    }

    return {
      texto: "Esta recompra te califica para recibir comisiones y te permite mantener el 42% de descuento en recompras durante este mes. ¡MUCHAS FELICIDADES!",
      colorFondo: "#ecfccb",
      colorTexto: "#3f6212",
      colorBorde: "#84cc16",
      colorSemaforo: "#65a30d",
    };
  };

  const estado = obtenerEstadoPuntos();

  const formatoMoneda = (numero) => {
    return Number(numero || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const descargarPDFPedido = () => {
    if (productosSeleccionados.length === 0) {
      alert("Primero captura al menos un producto con unidades mayores a 0.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const fechaActual = new Date().toLocaleString("es-MX");

    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, 842, 84, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("BodyLogic - Resumen de pedido", 40, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      modo === "compraInicial"
        ? `Compra inicial | Paquete elegido: ${paqueteSeleccionado} puntos`
        : "Recompra mensual",
      40,
      60
    );

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaActual}`, 40, 108);
    doc.text(`Estado del pedido: ${estado.texto}`, 40, 124);

    const body = productosSeleccionados.map((item) => [
      item.producto,
      String(item.unidades),
      String(item.subtotalPuntos),
      formatoMoneda(item.subtotalPrecioPublico),
      formatoMoneda(item.subtotalCP10),
      formatoMoneda(item.subtotal30),
      formatoMoneda(item.subtotal42),
    ]);

    autoTable(doc, {
      startY: 145,
      head: [[
        "Producto",
        "Unidades",
        "Subtotal puntos",
        "Subtotal precio público",
        "Subtotal 10%",
        "Subtotal 30%",
        "Subtotal 42%"
      ]],
      body,
      theme: "grid",
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [40, 40, 40],
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 220 },
        1: { cellWidth: 65, halign: "center" },
        2: { cellWidth: 85, halign: "center" },
        3: { cellWidth: 110, halign: "right" },
        4: { cellWidth: 100, halign: "right" },
        5: { cellWidth: 100, halign: "right" },
        6: { cellWidth: 100, halign: "right" },
      },
      alternateRowStyles: {
        fillColor: [255, 250, 245],
      },
      margin: { left: 40, right: 40 },
    });

    const finalY = doc.lastAutoTable.finalY + 22;

    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(1);
    doc.line(40, finalY, 802, finalY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(124, 45, 18);
    doc.text(`Total de unidades: ${totalUnidades}`, 40, finalY + 22);
    doc.text(`Total de puntos: ${totalPuntos}`, 190, finalY + 22);
    doc.text(`Total precio público: ${formatoMoneda(totalPrecioPublico)}`, 330, finalY + 22);
    doc.text(`Total 10%: ${formatoMoneda(totalCP10)}`, 570, finalY + 22);

    doc.text(`Total 30%: ${formatoMoneda(total30)}`, 40, finalY + 44);
    doc.text(`Total 42%: ${formatoMoneda(total42)}`, 220, finalY + 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(
      "Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.",
      40,
      finalY + 70
    );

    doc.save("Resumen-Pedido-BodyLogic.pdf");
  };

const irAPedidoActual = () => {
  const seccion = document.getElementById("pedido-actual");
  if (seccion) {
    seccion.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const irArriba = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const imprimirFormulario = () => {
    if (productosSeleccionados.length === 0) {
      alert("Primero captura al menos un producto con unidades mayores a 0.");
      return;
    }

    const filasHTML = productosSeleccionados
      .map(
        (item) => `
          <tr>
            <td>${item.producto}</td>
            <td style="text-align:center;">${item.unidades}</td>
            <td style="text-align:center;">${item.subtotalPuntos}</td>
            <td style="text-align:right;">${formatoMoneda(item.subtotalPrecioPublico)}</td>
            <td style="text-align:right;">${formatoMoneda(item.subtotalCP10)}</td>
            <td style="text-align:right;">${formatoMoneda(item.subtotal30)}</td>
            <td style="text-align:right;">${formatoMoneda(item.subtotal42)}</td>
          </tr>
        `
      )
      .join("");

    const ventana = window.open("", "_blank", "width=1200,height=900");

    if (!ventana) {
      alert("Tu navegador bloqueó la ventana de impresión. Permite pop-ups e inténtalo de nuevo.");
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Formulario de compra BodyLogic</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #222; }
            .encabezado { background: linear-gradient(135deg, #c2410c, #fb923c); color: white; padding: 18px 22px; border-radius: 16px; margin-bottom: 24px; }
            h1 { margin: 0 0 6px 0; font-size: 26px; }
            .sub { font-size: 13px; opacity: 0.95; }
            .meta { margin: 14px 0 20px 0; font-size: 13px; line-height: 1.7; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th { background: #ea580c; color: white; padding: 10px; border: 1px solid #d6d3d1; font-size: 13px; }
            td { border: 1px solid #e5e7eb; padding: 10px; font-size: 13px; }
            tr:nth-child(even) { background: #fffaf5; }
            .totales { margin-top: 24px; padding: 16px; border: 1px solid #fdba74; border-radius: 14px; background: #fff7ed; line-height: 1.8; font-size: 14px; }
            .firma { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="encabezado">
            <h1>BodyLogic - Formulario de compra</h1>
            <div class="sub">
              ${
                modo === "compraInicial"
                  ? `Compra inicial | Paquete elegido: ${paqueteSeleccionado} puntos`
                  : "Recompra mensual"
              }
            </div>
          </div>

          <div class="meta">
            <div><strong>Fecha:</strong> ${new Date().toLocaleString("es-MX")}</div>
            <div><strong>Estado del pedido:</strong> ${estado.texto}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades</th>
                <th>Subtotal puntos</th>
                <th>Subtotal precio público</th>
                <th>Subtotal 10%</th>
                <th>Subtotal 30%</th>
                <th>Subtotal 42%</th>
              </tr>
            </thead>
            <tbody>
              ${filasHTML}
            </tbody>
          </table>

          <div class="totales">
            <div><strong>Total de unidades:</strong> ${totalUnidades}</div>
            <div><strong>Total de puntos:</strong> ${totalPuntos}</div>
            <div><strong>Total precio público:</strong> ${formatoMoneda(totalPrecioPublico)}</div>
            <div><strong>Total 10%:</strong> ${formatoMoneda(totalCP10)}</div>
            <div><strong>Total 30%:</strong> ${formatoMoneda(total30)}</div>
            <div><strong>Total 42%:</strong> ${formatoMoneda(total42)}</div>
          </div>

          <div class="firma">
            Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas para el apoyo de su comunidad empresarial BodyLogic.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  };

  return (
    <div style={pagina}>
      <div style={brilloSuperior}></div>
      <div style={brilloLateral}></div>

      <div style={contenedorPrincipal}>
        <header style={hero}>
          <div style={heroOverlay}>
            <div style={heroContent}>
              <div style={badgeSuperior}>Plataforma de Apoyo Comercial</div>
              <h1 style={heroTitulo}>BodyLogic</h1>
              <p style={heroTexto}>
                Centro avanzado de cálculo de puntos, validación comercial, documentos oficiales
                y gestión operativa para asociados.
              </p>

              <div style={fraseAutorContainer}>
                <div style={fraseAutor}>
                  Este material ha sido creado por el líder Jorge Francisco Sánchez Yerenas
                  para el apoyo de su comunidad empresarial BodyLogic.
                </div>
              </div>
            </div>
          </div>
        </header>

        <section style={panelControles}>
          <div style={panelTituloFila}>
            <h2 style={panelTitulo}>Panel de control</h2>
            <p style={panelSubtitulo}>
              Configura el modo de compra, filtra productos y limpia tu captura.
            </p>
          </div>

          <div style={filaBotones}>
            <button onClick={() => setModo("compraInicial")} style={modo === "compraInicial" ? botonPrimarioActivo : botonPrimario}>
              Compra inicial
            </button>

            <button onClick={() => setModo("recompraMensual")} style={modo === "recompraMensual" ? botonPrimarioActivo : botonPrimario}>
              Recompra mensual
            </button>

            <button onClick={limpiarCantidades} style={botonSecundario}>
              Limpiar cantidades
            </button>
          </div>

          <div style={gridControles}>
            {modo === "compraInicial" && (
              <div style={controlCard}>
                <label style={labelControl}>Paquete de Ingreso</label>
                <select
                  value={paqueteSeleccionado}
                  onChange={(e) => setPaqueteSeleccionado(Number(e.target.value))}
                  style={selectEstilo}
                >
                  <option value={100}>100 puntos</option>
                  <option value={200}>200 puntos</option>
                  <option value={300}>300 puntos</option>
                  <option value={400}>400 puntos</option>
                  <option value={500}>500 puntos</option>
                </select>
              </div>
            )}

            <div style={controlCard}>
              <label style={labelControl}>Filtrar por categoría</label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                style={selectEstilo}
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            <div style={controlCard}>
              <label style={labelControl}>Buscar producto o código</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. Omega 3 o código"
                style={inputBusqueda}
              />
            </div>

            <div style={controlInfoCard}>
              <div style={controlInfoNumero}>
                {categoriaSeleccionada === "TODAS" ? "Todas" : categoriaSeleccionada}
              </div>
              <div style={controlInfoTexto}>Categoría visible</div>
            </div>
          </div>

          {esMovil && (
            <div style={switchVistaMovil}>
              <button
                onClick={() => setVistaMovil("cards")}
                style={vistaMovil === "cards" ? botonPrimarioActivo : botonPrimario}
              >
                Vista móvil
              </button>

              <button
                onClick={() => setVistaMovil("tabla")}
                style={vistaMovil === "tabla" ? botonPrimarioActivo : botonPrimario}
              >
                Vista tabla
              </button>
            </div>
          )}
        </section>

        <section
          style={{
            ...semaforoCard,
            backgroundColor: estado.colorFondo,
            border: `2px solid ${estado.colorBorde}`,
          }}
        >
          <div
            style={{
              ...dotSemaforo,
              backgroundColor: estado.colorSemaforo,
              boxShadow: `0 0 0 8px ${estado.colorFondo}`,
            }}
          />
          <div>
            <div style={{ ...semaforoTitulo, color: estado.colorTexto }}>Semáforo de puntos</div>
            <div style={{ ...semaforoTexto, color: estado.colorTexto }}>{estado.texto}</div>
          </div>
        </section>

        <section id="pedido-actual" style={pedidoActualPanel}>
          <div style={panelTituloFila}>
            <h2 style={panelTitulo}>Pedido actual</h2>
            <p style={panelSubtitulo}>
              Aquí aparecen únicamente los productos que ya capturaste.
            </p>
          </div>

          {productosSeleccionados.length === 0 ? (
            <div style={pedidoVacio}>
              Aún no has agregado productos al pedido.
            </div>
          ) : (
            <div style={pedidoActualGrid}>
              {productosSeleccionados.map((item) => (
                <div key={item.codigo} style={pedidoCard}>
                  <div style={pedidoCardTop}>
                    <div>
                      <div style={pedidoCodigo}>{item.codigo}</div>
                      <div style={pedidoNombre}>{item.producto}</div>
                      <div style={pedidoContenido}>{item.contenido}</div>
                    </div>

                    <button
                      onClick={() => eliminarProducto(item.codigo)}
                      style={botonEliminarPedido}
                    >
                      Quitar
                    </button>
                  </div>

                  <div style={pedidoControles}>
                    <button onClick={() => decrementarProducto(item.codigo)} style={botonCantidad}>
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={item.unidades}
                      onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
                      style={inputCantidadPedido}
                    />

                    <button onClick={() => incrementarProducto(item.codigo)} style={botonCantidad}>
                      +
                    </button>
                  </div>

                  <div style={pedidoTotalesGrid}>
                    <MiniDato label="Subtotal puntos" valor={item.subtotalPuntos} />
                    <MiniDato label="Público" valor={formatoMoneda(item.subtotalPrecioPublico)} />
                    <MiniDato label="10%" valor={formatoMoneda(item.subtotalCP10)} />
                    <MiniDato label="30%" valor={formatoMoneda(item.subtotal30)} />
                    <MiniDato label="42%" valor={formatoMoneda(item.subtotal42)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {esMovil && (
          <section style={resumenMovilPanel}>
            <div style={resumenMovilGrid}>
              <div style={resumenMiniCard}>
                <div style={resumenMiniLabel}>Unidades</div>
                <div style={resumenMiniValor}>{totalUnidades}</div>
              </div>
              <div style={resumenMiniCard}>
                <div style={resumenMiniLabel}>Puntos</div>
                <div style={resumenMiniValor}>{totalPuntos}</div>
              </div>
              <div style={resumenMiniCard}>
                <div style={resumenMiniLabel}>Público</div>
                <div style={resumenMiniValorPeque}>{formatoMoneda(totalPrecioPublico)}</div>
              </div>
              <div style={resumenMiniCard}>
                <div style={resumenMiniLabel}>42%</div>
                <div style={resumenMiniValorPeque}>{formatoMoneda(total42)}</div>
              </div>
            </div>
          </section>
        )}

        <section style={tablaPanel}>
          <div style={panelTituloFila}>
            <div>
              <h2 style={panelTitulo}>Tabla maestra de productos</h2>
              <p style={panelSubtitulo}>
                Mostrando <strong>{filasCalculadas.length}</strong> producto(s)
                {categoriaSeleccionada !== "TODAS"
                  ? ` en la categoría "${categoriaSeleccionada}".`
                  : " en todas las categorías."}
              </p>
            </div>

            <div style={accionesResumen}>
              <button onClick={descargarPDFPedido} style={botonDocumento}>
                Descargar PDF del pedido
              </button>

              <button onClick={imprimirFormulario} style={botonSecundarioPremium}>
                Imprimir formulario
              </button>
            </div>
          </div>

          {esMovil && vistaMovil === "cards" ? (
            <div style={cardsProductosMovil}>
              {filasCalculadas.map((item) => {
                const activa = filaActiva === item.codigo;
                const cardStyle = activa
                  ? { ...cardProductoMovil, ...cardProductoActiva }
                  : item.unidades > 0
                  ? { ...cardProductoMovil, ...cardProductoConCaptura }
                  : cardProductoMovil;

                return (
                  <div
                    key={item.codigo}
                    style={cardStyle}
                    onClick={() => setFilaActiva(item.codigo)}
                  >
                    <div style={cardProductoTop}>
                      <div>
                        <div style={cardCodigo}>{item.codigo}</div>
                        <div style={cardNombre}>{item.producto}</div>
                        <div style={cardContenido}>{item.contenido}</div>
                      </div>
                      <div style={cardBadgeCategoria}>{item.categoria}</div>
                    </div>

                    <div style={cardInputRow}>
                      <label style={labelMini}>Unidades</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unidades}
                        onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
                        onFocus={() => setFilaActiva(item.codigo)}
                        style={inputCantidadMovil}
                      />
                    </div>

                    <div style={cardResumenGrid}>
                      <MiniDato label="Puntos unit." valor={item.puntos} />
                      <MiniDato label="Subtotal puntos" valor={item.subtotalPuntos} />
                      <MiniDato label="Público" valor={formatoMoneda(item.subtotalPrecioPublico)} />
                      <MiniDato label="10%" valor={formatoMoneda(item.subtotalCP10)} />
                      <MiniDato label="30%" valor={formatoMoneda(item.subtotal30)} />
                      <MiniDato label="42%" valor={formatoMoneda(item.subtotal42)} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={tablaWrapper}>
              <table style={tabla}>
                <thead>
                  <tr style={filaHeader}>
                    <th style={estiloTh}>Categoría</th>
                    <th style={estiloTh}>Código</th>
                    <th style={estiloTh}>Producto</th>
                    <th style={estiloTh}>Contenido</th>
                    <th style={estiloTh}>Unidades</th>
                    <th style={estiloTh}>Puntos</th>
                    <th style={estiloTh}>Subtotal puntos</th>
                    <th style={estiloTh}>Precio público</th>
                    <th style={estiloTh}>Subtotal precio público</th>
                    <th style={estiloTh}>Valor comisionable</th>
                    <th style={estiloTh}>Subtotal valor comisionable</th>
                    <th style={estiloTh}>CP -10%</th>
                    <th style={estiloTh}>Subtotal CP -10%</th>
                    <th style={estiloTh}>-20%</th>
                    <th style={estiloTh}>Subtotal -20%</th>
                    <th style={estiloTh}>-30%</th>
                    <th style={estiloTh}>Subtotal -30%</th>
                    <th style={estiloTh}>-33%</th>
                    <th style={estiloTh}>Subtotal -33%</th>
                    <th style={estiloTh}>-35%</th>
                    <th style={estiloTh}>Subtotal -35%</th>
                    <th style={estiloTh}>-37%</th>
                    <th style={estiloTh}>Subtotal -37%</th>
                    <th style={estiloTh}>-40%</th>
                    <th style={estiloTh}>Subtotal -40%</th>
                    <th style={estiloTh}>-42%</th>
                    <th style={estiloTh}>Subtotal -42%</th>
                  </tr>
                </thead>

                <tbody>
                  {filasCalculadas.map((item, index) => {
                    const activa = filaActiva === item.codigo;
                    const base = index % 2 === 0 ? filaPar : filaImpar;
                    const estiloFila = activa
                      ? filaActivaEstilo
                      : item.unidades > 0
                      ? filaConCaptura
                      : base;

                    return (
                      <tr key={item.codigo} onClick={() => setFilaActiva(item.codigo)} style={estiloFila}>
                        <td style={estiloTd}>{item.categoria}</td>
                        <td style={estiloTd}>{item.codigo}</td>
                        <td style={{ ...estiloTdProducto, cursor: "pointer" }}>
                          <strong>{item.producto}</strong>
                        </td>
                        <td style={estiloTd}>{item.contenido}</td>
                        <td style={estiloTd}>
                          <input
                            type="number"
                            min="0"
                            value={item.unidades}
                            onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
                            onFocus={() => setFilaActiva(item.codigo)}
                            style={inputCantidad}
                          />
                        </td>
                        <td style={estiloTd}>{item.puntos}</td>
                        <td style={estiloTd}>{item.subtotalPuntos}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precioPublico)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotalPrecioPublico)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.valorComisionable)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotalValorComisionable)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precioCP10)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotalCP10)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio20)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal20)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio30)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal30)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio33)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal33)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio35)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal35)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio37)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal37)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio40)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal40)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.precio42)}</td>
                        <td style={estiloTd}>{formatoMoneda(item.subtotal42)}</td>
                      </tr>
                    );
                  })}

                  <tr style={filaTotal}>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>TOTAL GENERAL</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{totalUnidades}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td
                      style={{
                        ...estiloTdTotal,
                        backgroundColor: estado.colorFondo,
                        color: estado.colorTexto,
                        border: `2px solid ${estado.colorBorde}`,
                        borderRadius: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {totalPuntos}
                    </td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(totalPrecioPublico)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(totalValorComisionable)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(totalCP10)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total20)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total30)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total33)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total35)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total37)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total40)}</strong></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}><strong>{formatoMoneda(total42)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={gridInformacionUnaColumna}>
          <div style={infoPanel}>
            <h2 style={panelTitulo}>3 formas de adquirir producto</h2>
            <div style={cardsInfoGrid}>
              <div style={infoCardDestacado}>
                <div style={miniBadge}>Web</div>
                <h3 style={infoCardTitulo}>Sitio web</h3>
                <p style={infoCardTexto}>Ingresa directamente a:</p>
                <a href="https://www.bodylogicglobal.com" target="_blank" rel="noreferrer" style={infoCardLink}>
                  www.bodylogicglobal.com ↗
                </a>
              </div>

              <div style={infoCard}>
                <div style={miniBadge}>Teléfono</div>
                <h3 style={infoCardTitulo}>Centro de servicio</h3>
                <p style={infoCardDato}>800 702 4840</p>
                <p style={infoCardTexto}>Lunes a viernes de 8:00 a 20:00 hrs.</p>
                <p style={infoCardTexto}>Sábados de 9:00 a 14:00 hrs.</p>
              </div>

              <div style={infoCard}>
                <div style={miniBadge}>Presencial</div>
                <h3 style={infoCardTitulo}>CAD</h3>
                <p style={infoCardTexto}>Adquiere tus productos en tu CAD más cercano.</p>
              </div>
            </div>
          </div>

          <div style={leyendasPanel}>
            <h2 style={panelTitulo}>Leyendas importantes</h2>
            <div style={leyendaItem}>Los puntos mostrados corresponden al valor en puntos de cada producto.</div>
            <div style={leyendaItem}>El valor comisionable corresponde al 89% del precio con descuento sin IVA.</div>
            <div style={leyendaItem}>Las herramientas de negocio no generan puntos ni valor comisionable.</div>
            <div style={leyendaItem}>La información debe validarse siempre con la lista vigente de la empresa.</div>
          </div>
        </section>

        <section style={documentosPanel}>
          <div style={panelTituloFila}>
            <div>
              <h2 style={panelTitulo}>Documentos importantes</h2>
              <p style={panelSubtitulo}>
                Consulta, abre o descarga los archivos oficiales desde la misma plataforma.
              </p>
            </div>
          </div>

          <div style={listaDocs}>
            {documentos.map((doc) => {
              const ruta = `/archivos/${doc.archivo}`;
              return (
                <div key={doc.archivo} style={docCard}>
                  <div>
                    <div style={docTitulo}>{doc.nombre}</div>
                    <div style={docDescripcion}>{doc.descripcion}</div>
                    <div style={docArchivo}>{doc.archivo}</div>
                  </div>

                  <div style={accionesDoc}>
                    <a href={ruta} target="_blank" rel="noreferrer" style={linkDocumento}>
                      Abrir PDF
                    </a>

                    <a href={ruta} download style={linkDocumento}>
                      Descargar
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

{esMovil && (
  <div style={resumenFlotante}>
    <div style={resumenFlotanteFila}>
      <div style={resumenFlotanteMini}>
        <div style={resumenFlotanteLabel}>Puntos</div>
        <div style={resumenFlotanteValor}>{totalPuntos}</div>
      </div>

      <div style={resumenFlotanteMini}>
        <div style={resumenFlotanteLabel}>Unidades</div>
        <div style={resumenFlotanteValor}>{totalUnidades}</div>
      </div>

      <div style={resumenFlotanteMini}>
        <div style={resumenFlotanteLabel}>42%</div>
        <div style={resumenFlotanteValorMoneda}>{formatoMoneda(total42)}</div>
      </div>
    </div>

    <div style={resumenFlotanteBotones}>
      <button onClick={irAPedidoActual} style={botonResumenFlotantePrimario}>
        Ver pedido
      </button>

      <button onClick={irArriba} style={botonResumenFlotanteSecundario}>
        Subir
      </button>
    </div>
  </div>
)}

        <FormularioMembresia />
      </div>
    </div>
  );
}

function MiniDato({ label, valor }) {
  return (
    <div style={miniDatoCard}>
      <div style={miniDatoLabel}>{label}</div>
      <div style={miniDatoValor}>{valor}</div>
    </div>
  );
}

const pagina = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(255,237,213,0.92) 0%, rgba(255,247,237,0.90) 16%, #fffaf5 40%, #fffdf9 100%)",
  padding: "28px",
  paddingBottom: "120px",
  fontFamily: "Arial, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const brilloSuperior = {
  position: "absolute",
  top: "-120px",
  right: "-120px",
  width: "340px",
  height: "340px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%)",
  pointerEvents: "none",
};

const brilloLateral = {
  position: "absolute",
  bottom: "120px",
  left: "-90px",
  width: "250px",
  height: "250px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 72%)",
  pointerEvents: "none",
};

const contenedorPrincipal = {
  maxWidth: "1880px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const hero = {
  borderRadius: "34px",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, #5f250f 0%, #8f3412 20%, #c2410c 44%, #ea580c 72%, #fb923c 100%)",
  boxShadow: "0 30px 80px rgba(194,65,12,0.32)",
  marginBottom: "24px",
};

const heroOverlay = {
  background:
    "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 24%), radial-gradient(circle at left bottom, rgba(255,255,255,0.10), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))",
};

const heroContent = {
  padding: "42px",
  color: "#ffffff",
};

const badgeSuperior = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  backgroundColor: "rgba(255,255,255,0.16)",
  border: "1px solid rgba(255,255,255,0.24)",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "16px",
  color: "#ffffff",
  letterSpacing: "0.3px",
};

const heroTitulo = {
  margin: 0,
  fontSize: "52px",
  lineHeight: 1.02,
  color: "#ffffff",
  fontWeight: "bold",
  letterSpacing: "0.2px",
  textShadow: "0 4px 18px rgba(0,0,0,0.16)",
};

const heroTexto = {
  marginTop: "14px",
  maxWidth: "980px",
  fontSize: "17px",
  lineHeight: 1.75,
  color: "rgba(255,255,255,0.95)",
};

const fraseAutorContainer = {
  marginTop: "18px",
  maxWidth: "920px",
};

const fraseAutor = {
  display: "inline-block",
  padding: "14px 18px",
  borderRadius: "18px",
  backgroundColor: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.22)",
  color: "#fff7ed",
  lineHeight: 1.6,
  fontSize: "14px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
  backdropFilter: "blur(6px)",
};

const panelControles = {
  backgroundColor: "rgba(255,255,255,0.93)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
};

const panelTituloFila = {
  marginBottom: "18px",
};

const panelTitulo = {
  margin: 0,
  fontSize: "26px",
  color: "#7c2d12",
};

const panelSubtitulo = {
  margin: "8px 0 0 0",
  color: "#7c6f64",
  fontSize: "15px",
  lineHeight: 1.5,
};

const filaBotones = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const botonPrimario = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid #f3d2b7",
  backgroundColor: "#fffaf5",
  color: "#7c2d12",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonPrimarioActivo = {
  ...botonPrimario,
  background: "linear-gradient(135deg, #fdba74 0%, #fb923c 100%)",
  border: "2px solid #ea580c",
  color: "#ffffff",
  boxShadow: "0 10px 24px rgba(249,115,22,0.20)",
};

const botonSecundario = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid #f3d2b7",
  backgroundColor: "#fffaf5",
  color: "#7c2d12",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonSecundarioPremium = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "1px solid #f3d2b7",
  backgroundColor: "#fffaf5",
  color: "#7c2d12",
  cursor: "pointer",
  fontWeight: "bold",
};

const gridControles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const controlCard = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff7ed 100%)",
  border: "1px solid #fde2cc",
  borderRadius: "18px",
  padding: "16px",
};

const controlInfoCard = {
  background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
  border: "1px solid #fdba74",
  borderRadius: "18px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const controlInfoNumero = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#9a3412",
  wordBreak: "break-word",
};

const controlInfoTexto = {
  marginTop: "8px",
  color: "#7c6f64",
};

const labelControl = {
  display: "block",
  marginBottom: "10px",
  fontWeight: "bold",
  color: "#7c2d12",
};

const selectEstilo = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #f3c9a9",
  backgroundColor: "#ffffff",
  color: "#7c2d12",
  boxSizing: "border-box",
};

const inputBusqueda = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #f3c9a9",
  backgroundColor: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
};

const switchVistaMovil = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const semaforoCard = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
  borderRadius: "24px",
  padding: "20px 24px",
  marginBottom: "20px",
  boxShadow: "0 18px 36px rgba(124,45,18,0.06)",
};

const dotSemaforo = {
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  flexShrink: 0,
};

const semaforoTitulo = {
  fontSize: "18px",
  fontWeight: "bold",
};

const semaforoTexto = {
  marginTop: "4px",
  lineHeight: 1.5,
};

const pedidoActualPanel = {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
};

const pedidoVacio = {
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "#fffaf5",
  border: "1px dashed #fdc9a3",
  color: "#7c6f64",
};

const pedidoActualGrid = {
  display: "grid",
  gap: "14px",
};

const pedidoCard = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  border: "1px solid #fde2cc",
  borderRadius: "20px",
  padding: "16px",
};

const pedidoCardTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
};

const pedidoCodigo = {
  fontSize: "12px",
  color: "#9a3412",
  fontWeight: "bold",
};

const pedidoNombre = {
  marginTop: "4px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#7c2d12",
  lineHeight: 1.35,
};

const pedidoContenido = {
  marginTop: "4px",
  fontSize: "12px",
  color: "#7c6f64",
};

const botonEliminarPedido = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid #fecaca",
  backgroundColor: "#fff1f2",
  color: "#b91c1c",
  cursor: "pointer",
  fontWeight: "bold",
};

const pedidoControles = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "14px",
};

const botonCantidad = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  border: "1px solid #fdc9a3",
  backgroundColor: "#ffffff",
  color: "#9a3412",
  fontWeight: "bold",
  fontSize: "22px",
  cursor: "pointer",
};

const inputCantidadPedido = {
  width: "90px",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #f3c9a9",
  backgroundColor: "#ffffff",
  color: "#111827",
  textAlign: "center",
  fontWeight: "bold",
};

const pedidoTotalesGrid = {
  marginTop: "14px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "10px",
};

const resumenMovilPanel = {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: "24px",
  padding: "16px",
  boxShadow: "0 12px 30px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
};

const resumenMovilGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const resumenMiniCard = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  border: "1px solid #fde2cc",
  borderRadius: "16px",
  padding: "12px",
};

const resumenMiniLabel = {
  fontSize: "12px",
  color: "#7c6f64",
  marginBottom: "6px",
};

const resumenMiniValor = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#7c2d12",
};

const resumenMiniValorPeque = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#7c2d12",
  lineHeight: 1.4,
};

const tablaPanel = {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
};

const accionesResumen = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const cardsProductosMovil = {
  display: "grid",
  gap: "14px",
};

const cardProductoMovil = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  border: "1px solid #fde2cc",
  borderRadius: "20px",
  padding: "16px",
  boxShadow: "0 10px 24px rgba(124,45,18,0.05)",
};

const cardProductoConCaptura = {
  background: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)",
};

const cardProductoActiva = {
  border: "2px solid #ea580c",
  boxShadow: "0 0 0 3px rgba(234,88,12,0.12)",
};

const cardProductoTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "flex-start",
};

const cardCodigo = {
  fontSize: "12px",
  color: "#9a3412",
  fontWeight: "bold",
};

const cardNombre = {
  marginTop: "4px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#7c2d12",
  lineHeight: 1.35,
};

const cardContenido = {
  marginTop: "4px",
  fontSize: "12px",
  color: "#7c6f64",
};

const cardBadgeCategoria = {
  padding: "6px 10px",
  borderRadius: "999px",
  backgroundColor: "#fed7aa",
  color: "#9a3412",
  fontSize: "11px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const cardInputRow = {
  marginTop: "14px",
};

const labelMini = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  fontWeight: "bold",
  color: "#7c2d12",
};

const inputCantidadMovil = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #f3c9a9",
  backgroundColor: "#ffffff",
  color: "#111827",
  boxSizing: "border-box",
};

const cardResumenGrid = {
  marginTop: "14px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const miniDatoCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #fde2cc",
  borderRadius: "14px",
  padding: "10px",
};

const miniDatoLabel = {
  fontSize: "11px",
  color: "#7c6f64",
  marginBottom: "6px",
};

const miniDatoValor = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#7c2d12",
  lineHeight: 1.35,
};

const tablaWrapper = {
  overflowX: "auto",
  marginTop: "6px",
  borderRadius: "18px",
  border: "1px solid #fde2cc",
};

const tabla = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  minWidth: "3200px",
  backgroundColor: "#ffffff",
};

const filaHeader = {
  background: "linear-gradient(180deg, #fff1e6 0%, #ffe4cf 100%)",
};

const filaPar = {
  backgroundColor: "#ffffff",
};

const filaImpar = {
  backgroundColor: "#fffaf5",
};

const filaConCaptura = {
  backgroundColor: "#fff3e8",
};

const filaActivaEstilo = {
  backgroundColor: "#fed7aa",
};

const filaTotal = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff1e6 100%)",
};

const estiloTh = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid #f2cfb6",
  color: "#7c2d12",
  fontSize: "13px",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  background: "linear-gradient(180deg, #fff1e6 0%, #ffe4cf 100%)",
  zIndex: 1,
};

const estiloTd = {
  padding: "12px",
  borderBottom: "1px solid #fdf0e7",
  color: "#5b4d43",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const estiloTdProducto = {
  ...estiloTd,
  color: "#7c2d12",
};

const estiloTdTotal = {
  padding: "14px 12px",
  borderTop: "1px solid #fde0c8",
  color: "#7c2d12",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const inputCantidad = {
  width: "84px",
  padding: "9px 10px",
  borderRadius: "10px",
  border: "1px solid #f3c9a9",
  backgroundColor: "#ffffff",
  color: "#111827",
};

const gridInformacionUnaColumna = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "20px",
  marginBottom: "20px",
};

const infoPanel = {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
};

const leyendasPanel = {
  background: "linear-gradient(180deg, #fff7ed 0%, #fff3e8 100%)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fdc9a3",
};

const cardsInfoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const infoCard = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  border: "1px solid #fde2cc",
  borderRadius: "22px",
  padding: "18px",
};

const infoCardDestacado = {
  ...infoCard,
  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
  border: "1px solid #fdc9a3",
};

const miniBadge = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  backgroundColor: "#fed7aa",
  color: "#9a3412",
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const infoCardTitulo = {
  margin: "0 0 10px 0",
  color: "#7c2d12",
};

const infoCardTexto = {
  margin: "6px 0",
  color: "#7c6f64",
  lineHeight: 1.5,
};

const infoCardDato = {
  margin: "6px 0",
  color: "#c2410c",
  fontWeight: "bold",
};

const infoCardLink = {
  display: "inline-block",
  marginTop: "8px",
  color: "#c2410c",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #fdc9a3",
};

const leyendaItem = {
  padding: "12px 14px",
  borderRadius: "14px",
  backgroundColor: "rgba(255,255,255,0.70)",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  lineHeight: 1.6,
  marginBottom: "10px",
};

const documentosPanel = {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
};

const listaDocs = {
  display: "grid",
  gap: "12px",
};

const docCard = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  borderRadius: "20px",
  padding: "16px",
  border: "1px solid #fde4d3",
};

const docTitulo = {
  fontWeight: "bold",
  fontSize: "17px",
  color: "#7c2d12",
};

const docDescripcion = {
  marginTop: "8px",
  color: "#7c6f64",
  lineHeight: 1.5,
};

const docArchivo = {
  marginTop: "8px",
  color: "#ea580c",
  fontSize: "13px",
};

const accionesDoc = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const botonDocumento = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #fdba74",
  background: "linear-gradient(180deg, #fed7aa 0%, #fdba74 100%)",
  color: "#7c2d12",
  cursor: "pointer",
  fontWeight: "bold",
};

const linkDocumento = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #fde2cc",
  backgroundColor: "#ffffff",
  color: "#7c2d12",
  textDecoration: "none",
  fontWeight: "bold",
  display: "inline-block",
};

const resumenFlotante = {
  position: "fixed",
  left: "12px",
  right: "12px",
  bottom: "12px",
  zIndex: 999,
  background: "rgba(124,45,18,0.96)",
  color: "#ffffff",
  borderRadius: "20px",
  padding: "12px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const resumenFlotanteFila = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1.2fr",
  gap: "10px",
  marginBottom: "10px",
};

const resumenFlotanteMini = {
  backgroundColor: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "14px",
  padding: "10px",
};

const resumenFlotanteLabel = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.78)",
  marginBottom: "4px",
};

const resumenFlotanteValor = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#ffffff",
};

const resumenFlotanteValorMoneda = {
  fontSize: "13px",
  fontWeight: "bold",
  color: "#ffffff",
  lineHeight: 1.35,
};

const resumenFlotanteBotones = {
  display: "flex",
  gap: "10px",
};

const botonResumenFlotantePrimario = {
  flex: 1,
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #fdba74",
  background: "linear-gradient(135deg, #fdba74 0%, #fb923c 100%)",
  color: "#7c2d12",
  fontWeight: "bold",
  cursor: "pointer",
};

const botonResumenFlotanteSecundario = {
  flex: 1,
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.10)",
  color: "#ffffff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default App;