import { useMemo, useState } from "react";
import FormularioMembresia from "./components/FormularioMembresia";
import { productos } from "./data/productos";

function App() {
  const [cantidades, setCantidades] = useState({});
  const [modo, setModo] = useState("compraInicial");
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(100);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODAS");
  const [documentoActivo, setDocumentoActivo] = useState("CATALOGO-BODYLOGIC-2026.pdf");

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
  };

  const limpiarCantidades = () => {
    setCantidades({});
  };

  const productosFiltrados =
    categoriaSeleccionada === "TODAS"
      ? productos
      : productos.filter((item) => item.categoria === categoriaSeleccionada);

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

  const totalUnidades = filasCalculadas.reduce((acc, item) => acc + item.unidades, 0);
  const totalPuntos = filasCalculadas.reduce((acc, item) => acc + item.subtotalPuntos, 0);
  const totalPrecioPublico = filasCalculadas.reduce((acc, item) => acc + item.subtotalPrecioPublico, 0);
  const totalValorComisionable = filasCalculadas.reduce((acc, item) => acc + item.subtotalValorComisionable, 0);
  const totalCP10 = filasCalculadas.reduce((acc, item) => acc + item.subtotalCP10, 0);
  const total20 = filasCalculadas.reduce((acc, item) => acc + item.subtotal20, 0);
  const total30 = filasCalculadas.reduce((acc, item) => acc + item.subtotal30, 0);
  const total33 = filasCalculadas.reduce((acc, item) => acc + item.subtotal33, 0);
  const total35 = filasCalculadas.reduce((acc, item) => acc + item.subtotal35, 0);
  const total37 = filasCalculadas.reduce((acc, item) => acc + item.subtotal37, 0);
  const total40 = filasCalculadas.reduce((acc, item) => acc + item.subtotal40, 0);
  const total42 = filasCalculadas.reduce((acc, item) => acc + item.subtotal42, 0);

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

  const rutaDocumentoActivo = `/archivos/${documentoActivo}`;

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

              <div style={heroStats}>
                <div style={statCard}>
                  <div style={statNumero}>{filasCalculadas.length}</div>
                  <div style={statLabel}>Productos visibles</div>
                </div>
                <div style={statCard}>
                  <div style={statNumero}>{totalPuntos}</div>
                  <div style={statLabel}>Puntos actuales</div>
                </div>
                <div style={statCard}>
                  <div style={statNumero}>{totalUnidades}</div>
                  <div style={statLabel}>Unidades capturadas</div>
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
            <button
              onClick={() => setModo("compraInicial")}
              style={modo === "compraInicial" ? botonPrimarioActivo : botonPrimario}
            >
              Compra inicial
            </button>

            <button
              onClick={() => setModo("recompraMensual")}
              style={modo === "recompraMensual" ? botonPrimarioActivo : botonPrimario}
            >
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

            <div style={controlInfoCard}>
              <div style={controlInfoNumero}>
                {categoriaSeleccionada === "TODAS" ? "Todas" : categoriaSeleccionada}
              </div>
              <div style={controlInfoTexto}>Categoría visible</div>
            </div>
          </div>
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
          </div>

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
                {filasCalculadas.map((item, index) => (
                  <tr key={item.codigo} style={index % 2 === 0 ? filaPar : filaImpar}>
                    <td style={estiloTd}>{item.categoria}</td>
                    <td style={estiloTd}>{item.codigo}</td>
                    <td style={estiloTdProducto}>
                      <strong>{item.producto}</strong>
                    </td>
                    <td style={estiloTd}>{item.contenido}</td>
                    <td style={estiloTd}>
                      <input
                        type="number"
                        min="0"
                        value={item.unidades}
                        onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
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
                ))}

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
        </section>

        <section style={gridInformacion}>
          <div style={infoPanel}>
            <h2 style={panelTitulo}>3 formas de adquirir producto</h2>
            <div style={cardsInfoGrid}>
              <div style={infoCardDestacado}>
                <div style={miniBadge}>Web</div>
                <h3 style={infoCardTitulo}>Sitio web</h3>
                <p style={infoCardTexto}>Ingresa directamente a:</p>

                <a
                  href="https://www.bodylogicglobal.com"
                  target="_blank"
                  rel="noreferrer"
                  style={infoCardLink}
                >
                  www.bodylogicglobal.com
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

          <div style={documentosGrid}>
            <div style={listaDocs}>
              {documentos.map((doc) => {
                const ruta = `/archivos/${doc.archivo}`;
                const activo = documentoActivo === doc.archivo;

                return (
                  <div
                    key={doc.archivo}
                    style={{
                      ...docCard,
                      border: activo ? "2px solid #f97316" : "1px solid #fde4d3",
                      boxShadow: activo ? "0 14px 30px rgba(249,115,22,0.14)" : "none",
                    }}
                  >
                    <div>
                      <div style={docTitulo}>{doc.nombre}</div>
                      <div style={docDescripcion}>{doc.descripcion}</div>
                      <div style={docArchivo}>{doc.archivo}</div>
                    </div>

                    <div style={accionesDoc}>
                      <button onClick={() => setDocumentoActivo(doc.archivo)} style={botonDocumento}>
                        Ver aquí
                      </button>

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

            <div style={visorPanel}>
              <div style={visorHeader}>Vista previa del documento</div>
              <iframe
                src={rutaDocumentoActivo}
                title="Vista previa de PDF"
                width="100%"
                height="760"
                style={visorIframe}
              />
            </div>
          </div>
        </section>

        <FormularioMembresia />
      </div>
    </div>
  );
}

const pagina = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(255,237,213,0.92) 0%, rgba(255,247,237,0.90) 16%, #fffaf5 40%, #fffdf9 100%)",
  padding: "28px",
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
  position: "relative",
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

const heroStats = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginTop: "24px",
};

const statCard = {
  backgroundColor: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.20)",
  borderRadius: "24px",
  padding: "18px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 14px 32px rgba(0,0,0,0.10)",
};

const statNumero = {
  fontSize: "30px",
  fontWeight: "bold",
  color: "#ffffff",
};

const statLabel = {
  marginTop: "6px",
  fontSize: "14px",
  color: "rgba(255,255,255,0.88)",
};

const panelControles = {
  backgroundColor: "rgba(255,255,255,0.93)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
  backdropFilter: "blur(6px)",
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
  border: "1px solid #f3c9a9",
  backgroundColor: "#fff7ed",
  color: "#9a3412",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 4px 14px rgba(124,45,18,0.04)",
  transition: "all 0.2s ease",
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
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
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

const tablaPanel = {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(124,45,18,0.08)",
  border: "1px solid #fde4d3",
  marginBottom: "20px",
};

const tablaWrapper = {
  overflowX: "auto",
  marginTop: "6px",
  borderRadius: "18px",
  border: "1px solid #fde2cc",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.60)",
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
};

const gridInformacion = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
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
  boxShadow: "0 12px 24px rgba(124,45,18,0.04)",
};

const infoCardDestacado = {
  ...infoCard,
  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
  border: "1px solid #fdc9a3",
  boxShadow: "0 14px 28px rgba(249,115,22,0.10)",
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
  boxShadow: "0 8px 18px rgba(249,115,22,0.08)",
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

const documentosGrid = {
  display: "grid",
  gridTemplateColumns: "0.95fr 1.05fr",
  gap: "20px",
};

const listaDocs = {
  display: "grid",
  gap: "12px",
};

const docCard = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  borderRadius: "20px",
  padding: "16px",
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
  boxShadow: "0 8px 18px rgba(249,115,22,0.10)",
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

const visorPanel = {
  background: "linear-gradient(180deg, #fffaf5 0%, #fff4ea 100%)",
  border: "1px solid #fde2cc",
  borderRadius: "24px",
  overflow: "hidden",
  minHeight: "100%",
  boxShadow: "0 12px 30px rgba(124,45,18,0.05)",
};

const visorHeader = {
  padding: "14px 18px",
  background: "linear-gradient(180deg, #fed7aa 0%, #fdba74 100%)",
  color: "#7c2d12",
  fontWeight: "bold",
  borderBottom: "1px solid #f4c49c",
};

const visorIframe = {
  border: "none",
  display: "block",
  backgroundColor: "#ffffff",
};

export default App;