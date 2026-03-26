import { useEffect, useMemo, useState } from "react";
import { productos } from "./data/productos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [perfilUsuario, setPerfilUsuario] = useState("distribuidor");
  const [cantidades, setCantidades] = useState({});
  const [modo, setModo] = useState("compraInicial");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODAS");
  const [filaActiva, setFilaActiva] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [vistaMovil, setVistaMovil] = useState(
    window.innerWidth <= 768 ? "cards" : "tabla"
  );
  const [resumenContraido, setResumenContraido] = useState(false);
  const [descargandoArchivo, setDescargandoArchivo] = useState("");

  // Distribuidor Independiente
  const [programaRecompra, setProgramaRecompra] = useState("lealtad");
  const [mesLealtad, setMesLealtad] = useState(1);
  const [dentroPrimeros15, setDentroPrimeros15] = useState(true);

  // Lealtad acelerado
  const [puntosPersonalesAcelerado, setPuntosPersonalesAcelerado] = useState(0);
  const [puntosGrupalesAcelerado, setPuntosGrupalesAcelerado] = useState(0);
  const [acumuladoPrevioAcelerado, setAcumuladoPrevioAcelerado] = useState(0);

  // Cliente Preferente
  const [acumuladoPrevioClientePreferente, setAcumuladoPrevioClientePreferente] =
    useState(0);

  useEffect(() => {
    const manejarResize = () => {
      setEsMovil(window.innerWidth <= 768);
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
      tipo: "normal",
    },
    {
      nombre: "Lista de Precios CP Marzo 26",
      archivo: "LISTA-PRECIOS-CP-MARZO-26.pdf",
      descripcion: "Precios para Cliente Preferente.",
      tipo: "normal",
    },
    {
      nombre: "Lista de Precios DI Marzo 26",
      archivo: "LISTA-PRECIOS-DI-MARZO-26.pdf",
      descripcion: "Precios para Distribuidor Independiente.",
      tipo: "normal",
    },
    {
      nombre: "Solicitud de Membresía",
      archivo: "SOLICITUD-DE-MEMBRESIA.pdf",
      descripcion: "Formato oficial editable para alta de nuevos asociados.",
      tipo: "membresia",
    },
  ];

  const descargarArchivoRobusto = async (archivo, nombreVisible) => {
    const ruta = `/archivos/${archivo}`;
    setDescargandoArchivo(archivo);

    try {
      const respuesta = await fetch(ruta, { cache: "no-store" });

      if (!respuesta.ok) {
        throw new Error(`No se pudo descargar el archivo: ${respuesta.status}`);
      }

      const blob = await respuesta.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = urlBlob;
      enlace.download = archivo;
      enlace.style.display = "none";
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      setTimeout(() => {
        window.URL.revokeObjectURL(urlBlob);
      }, 1500);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      alert(
        `No se pudo descargar automáticamente "${nombreVisible}". Se intentará abrir el archivo directamente.`
      );
      window.open(ruta, "_blank", "noopener,noreferrer");
    } finally {
      setDescargandoArchivo("");
    }
  };

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

  const vaciarPedidoActual = () => {
    setCantidades({});
    setFilaActiva("");
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
    const unidades = Number(cantidades[item.codigo] || 0);

    const subtotalPuntos = unidades * item.puntos;
    const subtotalPrecioPublico = unidades * item.precioPublico;
    const subtotalValorComisionable = unidades * item.valorComisionable;
    const subtotal10 =
      item.precioCP10 !== undefined
        ? unidades * item.precioCP10
        : unidades * item.precioPublico * 0.9;
    const subtotal15 = unidades * item.precioPublico * 0.85;
    const subtotal20 =
      item.precio20 !== undefined
        ? unidades * item.precio20
        : unidades * item.precioPublico * 0.8;
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
      subtotal10,
      subtotal15,
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
    const unidades = Number(cantidades[item.codigo] || 0);

    const subtotalPuntos = unidades * item.puntos;
    const subtotalPrecioPublico = unidades * item.precioPublico;
    const subtotalValorComisionable = unidades * item.valorComisionable;
    const subtotal10 =
      item.precioCP10 !== undefined
        ? unidades * item.precioCP10
        : unidades * item.precioPublico * 0.9;
    const subtotal15 = unidades * item.precioPublico * 0.85;
    const subtotal20 =
      item.precio20 !== undefined
        ? unidades * item.precio20
        : unidades * item.precioPublico * 0.8;
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
      subtotal10,
      subtotal15,
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
  const totalPrecioPublico = filasTotales.reduce(
    (acc, item) => acc + item.subtotalPrecioPublico,
    0
  );
  const totalValorComisionable = filasTotales.reduce(
    (acc, item) => acc + item.subtotalValorComisionable,
    0
  );
  const total10 = filasTotales.reduce((acc, item) => acc + item.subtotal10, 0);
  const total15 = filasTotales.reduce((acc, item) => acc + item.subtotal15, 0);
  const total20 = filasTotales.reduce((acc, item) => acc + item.subtotal20, 0);
  const total30 = filasTotales.reduce((acc, item) => acc + item.subtotal30, 0);
  const total33 = filasTotales.reduce((acc, item) => acc + item.subtotal33, 0);
  const total35 = filasTotales.reduce((acc, item) => acc + item.subtotal35, 0);
  const total37 = filasTotales.reduce((acc, item) => acc + item.subtotal37, 0);
  const total40 = filasTotales.reduce((acc, item) => acc + item.subtotal40, 0);
  const total42 = filasTotales.reduce((acc, item) => acc + item.subtotal42, 0);

  const obtenerPaqueteCompraInicial = (puntos) => {
    if (puntos >= 500) {
      return {
        nombre: "Paquete 500",
        puntosBase: 500,
        descuento: 42,
        totalConDescuento: total42,
        siguientePaquete: null,
        siguienteObjetivo: null,
      };
    }

    if (puntos >= 400) {
      return {
        nombre: "Paquete 400",
        puntosBase: 400,
        descuento: 33,
        totalConDescuento: total33,
        siguientePaquete: "Paquete 500",
        siguienteObjetivo: 500,
      };
    }

    if (puntos >= 300) {
      return {
        nombre: "Paquete 300",
        puntosBase: 300,
        descuento: 33,
        totalConDescuento: total33,
        siguientePaquete: "Paquete 400",
        siguienteObjetivo: 400,
      };
    }

    if (puntos >= 200) {
      return {
        nombre: "Paquete 200",
        puntosBase: 200,
        descuento: 33,
        totalConDescuento: total33,
        siguientePaquete: "Paquete 300",
        siguienteObjetivo: 300,
      };
    }

    if (puntos >= 100) {
      return {
        nombre: "Paquete 100",
        puntosBase: 100,
        descuento: 30,
        totalConDescuento: total30,
        siguientePaquete: "Paquete 200",
        siguienteObjetivo: 200,
      };
    }

    return {
      nombre: "Aún no calificas",
      puntosBase: 0,
      descuento: 0,
      totalConDescuento: 0,
      siguientePaquete: "Paquete 100",
      siguienteObjetivo: 100,
    };
  };

  const paqueteActual = obtenerPaqueteCompraInicial(totalPuntos);

  const obtenerMensajeCompraInicial = () => {
    if (totalPuntos < 100) {
      const faltan = 100 - totalPuntos;
      return {
        texto: `Te faltan ${faltan} puntos para iniciar con el paquete de 100 puntos.`,
        colorFondo: "#fee2e2",
        colorTexto: "#991b1b",
        colorBorde: "#ef4444",
        colorSemaforo: "#dc2626",
        siguienteMensaje: `Te faltan ${faltan} puntos para iniciar (${paqueteActual.siguientePaquete}).`,
      };
    }

    if (totalPuntos >= 500) {
      return {
        texto: `Ya alcanzaste el paquete de 500 puntos y el 42% de descuento. ¡Estás en el nivel más alto de compra inicial!`,
        colorFondo: "#ecfccb",
        colorTexto: "#3f6212",
        colorBorde: "#84cc16",
        colorSemaforo: "#65a30d",
        siguienteMensaje: "Ya estás en el paquete más alto de compra inicial.",
      };
    }

    const faltan = paqueteActual.siguienteObjetivo - totalPuntos;

    return {
      texto: `Ya estás dentro del ${paqueteActual.nombre} con ${paqueteActual.descuento}% de descuento. Te faltan ${faltan} puntos para alcanzar ${paqueteActual.siguientePaquete}.`,
      colorFondo: "#fef3c7",
      colorTexto: "#92400e",
      colorBorde: "#f59e0b",
      colorSemaforo: "#d97706",
      siguienteMensaje: `Te faltan ${faltan} puntos para llegar a ${paqueteActual.siguientePaquete}.`,
    };
  };

  const obtenerDescuentoLealtad = (mes) => {
    if (mes <= 1) return 30;
    if (mes <= 3) return 33;
    if (mes <= 5) return 35;
    if (mes <= 11) return 37;
    if (mes <= 17) return 40;
    return 42;
  };

  const descuentoLealtadActual = obtenerDescuentoLealtad(mesLealtad);

  const totalSegunDescuentoLealtad = (() => {
    switch (descuentoLealtadActual) {
      case 30:
        return total30;
      case 33:
        return total33;
      case 35:
        return total35;
      case 37:
        return total37;
      case 40:
        return total40;
      case 42:
        return total42;
      default:
        return total30;
    }
  })();

  const obtenerSiguienteEscalonLealtad = (mes) => {
    if (mes < 2) return { etiqueta: "33%", mesesFaltantes: 2 - mes };
    if (mes < 4) return { etiqueta: "35%", mesesFaltantes: 4 - mes };
    if (mes < 6) return { etiqueta: "37%", mesesFaltantes: 6 - mes };
    if (mes < 12) return { etiqueta: "40%", mesesFaltantes: 12 - mes };
    if (mes < 18) return { etiqueta: "42%", mesesFaltantes: 18 - mes };
    return null;
  };

  const siguienteEscalonLealtad = obtenerSiguienteEscalonLealtad(mesLealtad);

  const obtenerMensajeLealtad = () => {
    const califica100 = totalPuntos >= 100;

    if (!dentroPrimeros15) {
      return {
        texto:
          "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",
        colorFondo: "#fee2e2",
        colorTexto: "#991b1b",
        colorBorde: "#ef4444",
        colorSemaforo: "#dc2626",
        mensajePrincipal:
          "Esta compra no sostiene tu avance en el programa de lealtad y reinicia tu secuencia.",
        mensajeSecundario: califica100
          ? "Aunque cubriste 100 puntos, al no comprar dentro de los primeros 15 días no conservas continuidad."
          : `Además, te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
        califica100,
        continuidad: false,
      };
    }

    if (!califica100) {
      return {
        texto: `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
        colorFondo: "#fee2e2",
        colorTexto: "#991b1b",
        colorBorde: "#ef4444",
        colorSemaforo: "#dc2626",
        mensajePrincipal: `Te faltan ${100 - totalPuntos} puntos para cubrir tu calificación de 100 puntos.`,
        mensajeSecundario:
          "Necesitas mínimo 100 puntos personales en los primeros 15 días para sostener tu avance en Lealtad.",
        califica100: false,
        continuidad: false,
      };
    }

    if (siguienteEscalonLealtad) {
      const plural = siguienteEscalonLealtad.mesesFaltantes === 1 ? "mes" : "meses";
      return {
        texto: `¡Felicidades! Ya sostienes tu mes ${mesLealtad} en Lealtad con ${descuentoLealtadActual}% de descuento.`,
        colorFondo: "#ecfccb",
        colorTexto: "#3f6212",
        colorBorde: "#84cc16",
        colorSemaforo: "#65a30d",
        mensajePrincipal:
          "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",
        mensajeSecundario: `Te faltan ${siguienteEscalonLealtad.mesesFaltantes} ${plural} consecutivos para llegar al ${siguienteEscalonLealtad.etiqueta}.`,
        califica100: true,
        continuidad: true,
      };
    }

    return {
      texto: `¡Felicidades! Ya estás en el tramo máximo del Programa de Lealtad con ${descuentoLealtadActual}% de descuento.`,
      colorFondo: "#ecfccb",
      colorTexto: "#3f6212",
      colorBorde: "#84cc16",
      colorSemaforo: "#65a30d",
      mensajePrincipal:
        "¡Felicidades! Ya sostienes tu calificación de 100 puntos dentro del Programa de Lealtad.",
      mensajeSecundario:
        "Ya te encuentras en el tramo más alto del Programa de Lealtad.",
      califica100: true,
      continuidad: true,
    };
  };

  const totalAcumuladoAcelerado =
    Number(puntosPersonalesAcelerado || 0) +
    Number(puntosGrupalesAcelerado || 0) +
    Number(acumuladoPrevioAcelerado || 0);

  const obtenerDescuentoAcelerado = (acumulado) => {
    if (acumulado >= 3001) return 42;
    if (acumulado >= 1501) return 40;
    if (acumulado >= 501) return 35;
    if (acumulado >= 1) return 30;
    return 0;
  };

  const descuentoAceleradoActual = obtenerDescuentoAcelerado(totalAcumuladoAcelerado);

  const totalSegunDescuentoAcelerado = (() => {
    switch (descuentoAceleradoActual) {
      case 30:
        return total30;
      case 35:
        return total35;
      case 40:
        return total40;
      case 42:
        return total42;
      default:
        return 0;
    }
  })();

  const obtenerSiguienteEscalonAcelerado = (acumulado) => {
    if (acumulado < 501) return { meta: 501, etiqueta: "35%" };
    if (acumulado < 1501) return { meta: 1501, etiqueta: "40%" };
    if (acumulado < 3001) return { meta: 3001, etiqueta: "42%" };
    return null;
  };

  const siguienteEscalonAcelerado = obtenerSiguienteEscalonAcelerado(
    totalAcumuladoAcelerado
  );

  const obtenerMensajeAcelerado = () => {
    if (totalAcumuladoAcelerado <= 0) {
      return {
        texto:
          "Captura puntos personales, grupales y acumulado previo para evaluar tu Lealtad Acelerado.",
        colorFondo: "#fee2e2",
        colorTexto: "#991b1b",
        colorBorde: "#ef4444",
        colorSemaforo: "#dc2626",
        mensajePrincipal:
          "Aún no has capturado puntos suficientes para evaluar el Programa de Lealtad Acelerado.",
        mensajeSecundario:
          "Ingresa tus puntos personales, grupales y acumulado previo.",
      };
    }

    if (siguienteEscalonAcelerado) {
      const faltan = siguienteEscalonAcelerado.meta - totalAcumuladoAcelerado;
      return {
        texto: `Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y te coloca en ${descuentoAceleradoActual}% dentro del Programa de Lealtad Acelerado.`,
        colorFondo: descuentoAceleradoActual >= 35 ? "#fef3c7" : "#fee2e2",
        colorTexto: descuentoAceleradoActual >= 35 ? "#92400e" : "#991b1b",
        colorBorde: descuentoAceleradoActual >= 35 ? "#f59e0b" : "#ef4444",
        colorSemaforo: descuentoAceleradoActual >= 35 ? "#d97706" : "#dc2626",
        mensajePrincipal: `Tu acumulado actual es de ${totalAcumuladoAcelerado} puntos y ya estás en ${descuentoAceleradoActual}% de descuento.`,
        mensajeSecundario: `Te faltan ${faltan} puntos acumulados para llegar al ${siguienteEscalonAcelerado.etiqueta}.`,
      };
    }

    return {
      texto: `¡Felicidades! Ya alcanzaste ${totalAcumuladoAcelerado} puntos acumulados y entras al 42% en Lealtad Acelerado.`,
      colorFondo: "#ecfccb",
      colorTexto: "#3f6212",
      colorBorde: "#84cc16",
      colorSemaforo: "#65a30d",
      mensajePrincipal:
        "¡Felicidades! Ya alcanzaste el tramo máximo del Programa de Lealtad Acelerado.",
      mensajeSecundario: "Ya estás en 42% de descuento por acumulado.",
    };
  };

  const puntosAcumuladosClientePreferente =
    Number(acumuladoPrevioClientePreferente || 0) + Number(totalPuntos || 0);

  const obtenerDescuentoClientePreferente = (puntos) => {
    if (puntos >= 650) return 20;
    if (puntos >= 150) return 15;
    return 10;
  };

  const descuentoClientePreferenteActual = obtenerDescuentoClientePreferente(
    puntosAcumuladosClientePreferente
  );

  const totalSegunDescuentoClientePreferente = (() => {
    switch (descuentoClientePreferenteActual) {
      case 10:
        return total10;
      case 15:
        return total15;
      case 20:
        return total20;
      default:
        return total10;
    }
  })();

  const obtenerMensajeClientePreferente = () => {
    if (puntosAcumuladosClientePreferente < 150) {
      const faltan = 150 - puntosAcumuladosClientePreferente;
      return {
        texto: `Actualmente estás en 10% de descuento. Te faltan ${faltan} puntos acumulados para llegar al 15%.`,
        colorFondo: "#fee2e2",
        colorTexto: "#991b1b",
        colorBorde: "#ef4444",
        colorSemaforo: "#dc2626",
        mensajePrincipal:
          "Tu descuento actual como Cliente Preferente es 10%.",
        mensajeSecundario: `Te faltan ${faltan} puntos acumulados para llegar al 15%.`,
      };
    }

    if (puntosAcumuladosClientePreferente < 650) {
      const faltan = 650 - puntosAcumuladosClientePreferente;
      return {
        texto: `Actualmente estás en 15% de descuento. Te faltan ${faltan} puntos acumulados para llegar al 20%.`,
        colorFondo: "#fef3c7",
        colorTexto: "#92400e",
        colorBorde: "#f59e0b",
        colorSemaforo: "#d97706",
        mensajePrincipal:
          "Tu descuento actual como Cliente Preferente es 15%.",
        mensajeSecundario: `Te faltan ${faltan} puntos acumulados para llegar al 20%.`,
      };
    }

    return {
      texto:
        "¡Felicidades! Ya alcanzaste el 20% de descuento como Cliente Preferente.",
      colorFondo: "#ecfccb",
      colorTexto: "#3f6212",
      colorBorde: "#84cc16",
      colorSemaforo: "#65a30d",
      mensajePrincipal:
        "Tu descuento actual como Cliente Preferente es 20%.",
      mensajeSecundario:
        "Ya estás en el nivel máximo de Cliente Preferente.",
    };
  };

  const estado =
    perfilUsuario === "clientePreferente"
      ? obtenerMensajeClientePreferente()
      : modo === "compraInicial"
        ? obtenerMensajeCompraInicial()
        : programaRecompra === "lealtad"
          ? obtenerMensajeLealtad()
          : obtenerMensajeAcelerado();

  const formatoMoneda = (numero) => {
    return Number(numero || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  const obtenerTotalPedidoActual = (item) => {
    if (perfilUsuario === "clientePreferente") {
      switch (descuentoClientePreferenteActual) {
        case 10:
          return item.subtotal10;
        case 15:
          return item.subtotal15;
        case 20:
          return item.subtotal20;
        default:
          return item.subtotal10;
      }
    }

    if (modo === "compraInicial") {
      switch (paqueteActual.descuento) {
        case 30:
          return item.subtotal30;
        case 33:
          return item.subtotal33;
        case 42:
          return item.subtotal42;
        default:
          return 0;
      }
    }

    if (programaRecompra === "lealtad") {
      switch (descuentoLealtadActual) {
        case 30:
          return item.subtotal30;
        case 33:
          return item.subtotal33;
        case 35:
          return item.subtotal35;
        case 37:
          return item.subtotal37;
        case 40:
          return item.subtotal40;
        case 42:
          return item.subtotal42;
        default:
          return item.subtotal30;
      }
    }

    switch (descuentoAceleradoActual) {
      case 30:
        return item.subtotal30;
      case 35:
        return item.subtotal35;
      case 40:
        return item.subtotal40;
      case 42:
        return item.subtotal42;
      default:
        return 0;
    }
  };

  const obtenerDescuentoActualGeneral = () => {
    if (perfilUsuario === "clientePreferente") {
      return descuentoClientePreferenteActual;
    }

    if (modo === "compraInicial") {
      return paqueteActual.descuento;
    }

    if (programaRecompra === "lealtad") {
      return descuentoLealtadActual;
    }

    return descuentoAceleradoActual;
  };

  const obtenerTotalConDescuentoGeneral = () => {
    if (perfilUsuario === "clientePreferente") {
      return totalSegunDescuentoClientePreferente;
    }

    if (modo === "compraInicial") {
      return paqueteActual.totalConDescuento;
    }

    if (programaRecompra === "lealtad") {
      return totalSegunDescuentoLealtad;
    }

    return totalSegunDescuentoAcelerado;
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

    let textoModo = "";
    if (perfilUsuario === "clientePreferente") {
      textoModo = `Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}`;
    } else if (modo === "compraInicial") {
      textoModo = `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    } else if (programaRecompra === "lealtad") {
      textoModo = `Recompra mensual | Programa de Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;
    } else {
      textoModo = `Recompra mensual | Lealtad Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
    }

    doc.text(textoModo, 40, 60);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaActual}`, 40, 108);
    doc.text(`Estado del pedido: ${estado.texto}`, 40, 124);

    const descuentoActualPDF = obtenerDescuentoActualGeneral();

    const body = productosSeleccionados.map((item) => [
      item.producto,
      String(item.unidades),
      String(item.subtotalPuntos),
      formatoMoneda(item.subtotalPrecioPublico),
      formatoMoneda(item.subtotalValorComisionable),
      formatoMoneda(obtenerTotalPedidoActual(item)),
    ]);

    autoTable(doc, {
      startY: 145,
      head: [[
        "Producto",
        "Unidades",
        "Subtotal puntos",
        "Subtotal precio público",
        "Subtotal valor comisionable",
        `Subtotal ${descuentoActualPDF}%`,
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
    doc.text(
      `Total precio público: ${formatoMoneda(totalPrecioPublico)}`,
      330,
      finalY + 22
    );

    doc.text(
      `Total valor comisionable: ${formatoMoneda(totalValorComisionable)}`,
      40,
      finalY + 44
    );
    doc.text(
      `Total con descuento: ${formatoMoneda(obtenerTotalConDescuentoGeneral())}`,
      330,
      finalY + 44
    );

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
            <td style="text-align:right;">${formatoMoneda(item.subtotalValorComisionable)}</td>
            <td style="text-align:right;">${formatoMoneda(obtenerTotalPedidoActual(item))}</td>
          </tr>
        `
      )
      .join("");

    const ventana = window.open("", "_blank", "width=1200,height=900");

    if (!ventana) {
      alert(
        "Tu navegador bloqueó la ventana de impresión. Permite pop-ups e inténtalo de nuevo."
      );
      return;
    }

    const descuentoActualImpresion = obtenerDescuentoActualGeneral();

    let subtituloImpresion = "";
    if (perfilUsuario === "clientePreferente") {
      subtituloImpresion = `Cliente Preferente | ${descuentoClientePreferenteActual}% | Acumulado ${puntosAcumuladosClientePreferente}`;
    } else if (modo === "compraInicial") {
      subtituloImpresion = `Compra inicial | ${paqueteActual.nombre} | ${paqueteActual.descuento}%`;
    } else if (programaRecompra === "lealtad") {
      subtituloImpresion = `Recompra mensual | Programa de Lealtad | Mes ${mesLealtad} | ${descuentoLealtadActual}%`;
    } else {
      subtituloImpresion = `Recompra mensual | Lealtad Acelerado | Acumulado ${totalAcumuladoAcelerado} | ${descuentoAceleradoActual}%`;
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
            <div class="sub">${subtituloImpresion}</div>
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
                <th>Subtotal valor comisionable</th>
                <th>Subtotal con ${descuentoActualImpresion}%</th>
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
            <div><strong>Total valor comisionable:</strong> ${formatoMoneda(totalValorComisionable)}</div>
            <div><strong>Total con descuento:</strong> ${formatoMoneda(obtenerTotalConDescuentoGeneral())}</div>
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

  const telefonoCentroServicio = "8007024840";

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
                Centro avanzado de cálculo de puntos, validación comercial,
                documentos oficiales y gestión operativa para asociados.
              </p>

              <div style={fraseAutorContainer}>
                <div style={fraseAutor}>
                  Este material ha sido creado por el líder Jorge Francisco Sánchez
                  Yerenas para el apoyo de su comunidad empresarial BodyLogic.
                </div>
              </div>
            </div>
          </div>
        </header>

        <section style={panelControles}>
          <div style={panelTituloFila}>
            <h2 style={panelTitulo}>Panel de control</h2>
            <p style={panelSubtitulo}>
              Selecciona tu perfil, configura el modo de compra y filtra productos.
            </p>
          </div>

          <div style={gridControles}>
            <div style={controlCard}>
              <label style={labelControl}>Perfil de usuario</label>
              <select
                value={perfilUsuario}
                onChange={(e) => setPerfilUsuario(e.target.value)}
                style={selectEstilo}
              >
                <option value="distribuidor">Distribuidor Independiente</option>
                <option value="clientePreferente">Cliente Preferente</option>
              </select>
            </div>

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

            {perfilUsuario === "distribuidor" ? (
              <div style={controlInfoCard}>
                <div style={controlInfoNumero}>Distribuidor</div>
                <div style={controlInfoTexto}>
                  Flujo completo de ingreso y recompra
                </div>
              </div>
            ) : (
              <div style={controlInfoCard}>
                <div style={controlInfoNumero}>Cliente Preferente</div>
                <div style={controlInfoTexto}>
                  Flujo simplificado con descuento progresivo
                </div>
              </div>
            )}
          </div>

          {perfilUsuario === "distribuidor" ? (
            <>
              <div style={{ ...filaBotones, marginTop: "18px" }}>
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
                {modo === "compraInicial" ? (
                  <div style={controlInfoCard}>
                    <div style={controlInfoNumero}>{paqueteActual.nombre}</div>
                    <div style={controlInfoTexto}>
                      Paquete detectado automáticamente
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={controlCard}>
                      <label style={labelControl}>Programa de recompra</label>
                      <select
                        value={programaRecompra}
                        onChange={(e) => setProgramaRecompra(e.target.value)}
                        style={selectEstilo}
                      >
                        <option value="lealtad">Programa de Lealtad</option>
                        <option value="acelerado">Lealtad Acelerado</option>
                      </select>
                    </div>

                    {programaRecompra === "lealtad" ? (
                      <>
                        <div style={controlCard}>
                          <label style={labelControl}>Mes actual del programa</label>
                          <select
                            value={mesLealtad}
                            onChange={(e) => setMesLealtad(Number(e.target.value))}
                            style={selectEstilo}
                          >
                            {Array.from({ length: 18 }, (_, i) => i + 1).map((mes) => (
                              <option key={mes} value={mes}>
                                {mes === 18 ? "Mes 18 o más" : `Mes ${mes}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={controlCard}>
                          <label style={labelControl}>
                            ¿Compras dentro de los primeros 15 días?
                          </label>
                          <select
                            value={dentroPrimeros15 ? "si" : "no"}
                            onChange={(e) => setDentroPrimeros15(e.target.value === "si")}
                            style={selectEstilo}
                          >
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={controlCard}>
                          <label style={labelControl}>Puntos personales del periodo</label>
                          <input
                            type="number"
                            min="0"
                            value={puntosPersonalesAcelerado}
                            onChange={(e) =>
                              setPuntosPersonalesAcelerado(Number(e.target.value || 0))
                            }
                            style={inputBusqueda}
                          />
                        </div>

                        <div style={controlCard}>
                          <label style={labelControl}>Puntos grupales del periodo</label>
                          <input
                            type="number"
                            min="0"
                            value={puntosGrupalesAcelerado}
                            onChange={(e) =>
                              setPuntosGrupalesAcelerado(Number(e.target.value || 0))
                            }
                            style={inputBusqueda}
                          />
                        </div>

                        <div style={controlCard}>
                          <label style={labelControl}>Acumulado previo</label>
                          <input
                            type="number"
                            min="0"
                            value={acumuladoPrevioAcelerado}
                            onChange={(e) =>
                              setAcumuladoPrevioAcelerado(Number(e.target.value || 0))
                            }
                            style={inputBusqueda}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ ...filaBotones, marginTop: "18px" }}>
                <button onClick={limpiarCantidades} style={botonSecundario}>
                  Limpiar cantidades
                </button>
              </div>

              <div style={gridControles}>
                <div style={controlCard}>
                  <label style={labelControl}>Puntos acumulados previos</label>
                  <input
                    type="number"
                    min="0"
                    value={acumuladoPrevioClientePreferente}
                    onChange={(e) =>
                      setAcumuladoPrevioClientePreferente(Number(e.target.value || 0))
                    }
                    style={inputBusqueda}
                  />
                </div>

                <div style={controlInfoCard}>
                  <div style={controlInfoNumero}>{descuentoClientePreferenteActual}%</div>
                  <div style={controlInfoTexto}>
                    Descuento actual de Cliente Preferente
                  </div>
                </div>

                <div style={controlInfoCard}>
                  <div style={controlInfoNumero}>{puntosAcumuladosClientePreferente}</div>
                  <div style={controlInfoTexto}>Puntos acumulados totales</div>
                </div>
              </div>
            </>
          )}

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
            <div style={{ ...semaforoTitulo, color: estado.colorTexto }}>
              {perfilUsuario === "clientePreferente"
                ? "Lectura de Cliente Preferente"
                : modo === "compraInicial"
                  ? "Lectura automática de compra inicial"
                  : programaRecompra === "lealtad"
                    ? "Lectura de recompra mensual - Lealtad"
                    : "Lectura de recompra mensual - Lealtad Acelerado"}
            </div>
            <div style={{ ...semaforoTexto, color: estado.colorTexto }}>
              {estado.texto}
            </div>
          </div>
        </section>

        <section id="pedido-actual" style={pedidoActualPanel}>
          <div style={panelTituloFila}>
            <h2 style={panelTitulo}>Pedido actual</h2>
            <p style={panelSubtitulo}>
              Aquí aparecen únicamente los productos que ya capturaste.
            </p>

            {productosSeleccionados.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <button onClick={vaciarPedidoActual} style={botonVaciarPedido}>
                  Vaciar todo el pedido
                </button>
              </div>
            )}
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
                    <button
                      onClick={() => decrementarProducto(item.codigo)}
                      style={botonCantidad}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={item.unidades}
                      onChange={(e) => cambiarCantidad(item.codigo, e.target.value)}
                      style={inputCantidadPedido}
                    />

                    <button
                      onClick={() => incrementarProducto(item.codigo)}
                      style={botonCantidad}
                    >
                      +
                    </button>
                  </div>

                  <div style={pedidoTotalesGrid}>
                    <MiniDato label="Subtotal puntos" value={item.subtotalPuntos} />
                    <MiniDato
                      label="Público"
                      value={formatoMoneda(item.subtotalPrecioPublico)}
                    />
                    <MiniDato
                      label={`Con ${obtenerDescuentoActualGeneral()}%`}
                      value={formatoMoneda(obtenerTotalPedidoActual(item))}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      <MiniDato label="Puntos unit." value={item.puntos} />
                      <MiniDato label="Subtotal puntos" value={item.subtotalPuntos} />
                      <MiniDato
                        label="Público"
                        value={formatoMoneda(item.subtotalPrecioPublico)}
                      />
                      <MiniDato
                        label="Comisionable"
                        value={formatoMoneda(item.subtotalValorComisionable)}
                      />
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
                      <tr
                        key={item.codigo}
                        onClick={() => setFilaActiva(item.codigo)}
                        style={estiloFila}
                      >
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
                        <td style={estiloTd}>
                          {formatoMoneda(item.subtotalPrecioPublico)}
                        </td>
                        <td style={estiloTd}>
                          {formatoMoneda(item.valorComisionable)}
                        </td>
                        <td style={estiloTd}>
                          {formatoMoneda(item.subtotalValorComisionable)}
                        </td>
                      </tr>
                    );
                  })}

                  <tr style={filaTotal}>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}>
                      <strong>TOTAL GENERAL</strong>
                    </td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}>
                      <strong>{totalUnidades}</strong>
                    </td>
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
                    <td style={estiloTdTotal}>
                      <strong>{formatoMoneda(totalPrecioPublico)}</strong>
                    </td>
                    <td style={estiloTdTotal}></td>
                    <td style={estiloTdTotal}>
                      <strong>{formatoMoneda(totalValorComisionable)}</strong>
                    </td>
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
                <a
                  href="https://www.bodylogicglobal.com"
                  target="_blank"
                  rel="noreferrer"
                  style={infoCardLink}
                >
                  www.bodylogicglobal.com ↗
                </a>
              </div>

              <div style={infoCard}>
                <div style={miniBadge}>Teléfono</div>
                <h3 style={infoCardTitulo}>Centro de servicio</h3>
                <a href={`tel:${telefonoCentroServicio}`} style={telefonoLink}>
                  800 702 4840
                </a>
                <p style={infoCardTexto}>
                  Lunes a viernes de 8:00 a 20:00 hrs.
                </p>
                <p style={infoCardTexto}>Sábados de 9:00 a 14:00 hrs.</p>
              </div>

              <div style={infoCard}>
                <div style={miniBadge}>Presencial</div>
                <h3 style={infoCardTitulo}>CAD</h3>
                <p style={infoCardTexto}>
                  Adquiere tus productos en tu CAD más cercano.
                </p>
              </div>
            </div>
          </div>

          <div style={leyendasPanel}>
            <h2 style={panelTitulo}>Leyendas importantes</h2>
            <div style={leyendaItem}>
              Los puntos mostrados corresponden al valor en puntos de cada producto.
            </div>
            <div style={leyendaItem}>
              El valor comisionable corresponde al 89% del precio con descuento sin IVA.
            </div>
            <div style={leyendaItem}>
              Las herramientas de negocio no generan puntos ni valor comisionable.
            </div>
            <div style={leyendaItem}>
              La información debe validarse siempre con la lista vigente de la empresa.
            </div>
          </div>
        </section>

        <section style={documentosPanel}>
          <div style={panelTituloFila}>
            <div>
              <h2 style={panelTitulo}>Documentos importantes</h2>
              <p style={panelSubtitulo}>
                Descarga los archivos oficiales desde la misma plataforma.
              </p>
            </div>
          </div>

          <div style={listaDocs}>
            {documentos.map((doc) => {
              const esMembresia = doc.tipo === "membresia";
              const estaDescargando = descargandoArchivo === doc.archivo;

              return (
                <div key={doc.archivo} style={docCard}>
                  <div>
                    <div style={docTitulo}>{doc.nombre}</div>
                    <div style={docDescripcion}>{doc.descripcion}</div>
                    <div style={docArchivo}>{doc.archivo}</div>
                  </div>

                  <div style={accionesDoc}>
                    <button
                      onClick={() =>
                        descargarArchivoRobusto(doc.archivo, doc.nombre)
                      }
                      style={botonDocumento}
                      disabled={estaDescargando}
                    >
                      {estaDescargando
                        ? "Descargando..."
                        : esMembresia
                          ? "Descargar y rellenar"
                          : "Descargar PDF"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {esMovil && (
          <div
            style={{
              ...resumenFlotante,
              background: estado.colorFondo,
              border: `1px solid ${estado.colorBorde}`,
              boxShadow: `0 18px 40px rgba(0,0,0,0.18)`,
            }}
          >
            {perfilUsuario === "clientePreferente" ? (
              <>
                <div style={resumenVisibleSiempre}>
                  <div style={resumenVisibleMiniDatos}>
                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Perfil
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        Cliente Preferente
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Acumulado
                      </span>
                      <span style={{ ...resumenVisibleValor, color: estado.colorTexto }}>
                        {puntosAcumuladosClientePreferente}
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Descuento
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        {descuentoClientePreferenteActual}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setResumenContraido(!resumenContraido)}
                    style={botonToggleResumen}
                  >
                    {resumenContraido ? "▼ Mostrar" : "▲ Ocultar"}
                  </button>
                </div>

                {!resumenContraido && (
                  <>
                    <div style={resumenCompraInicialGrande}>
                      <div
                        style={{
                          ...resumenCompraInicialTitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        Cliente Preferente
                      </div>
                      <div
                        style={{
                          ...resumenCompraInicialSubtitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        Descuento actual: {descuentoClientePreferenteActual}%
                      </div>
                    </div>

                    <div style={resumenFlotanteFilaCompraInicial}>
                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Puntos acumulados
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValor,
                            color: estado.colorTexto,
                          }}
                        >
                          {puntosAcumuladosClientePreferente}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Precio público
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalPrecioPublico)}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Total con {descuentoClientePreferenteActual}%
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalSegunDescuentoClientePreferente)}
                        </div>
                      </div>
                    </div>

                    <div style={resumenFlotanteMensaje}>
                      <div style={{ color: estado.colorTexto, fontWeight: "bold" }}>
                        {estado.mensajePrincipal}
                      </div>
                      <div
                        style={{
                          color: estado.colorTexto,
                          fontWeight: "bold",
                          marginTop: "8px",
                        }}
                      >
                        {estado.mensajeSecundario}
                      </div>
                    </div>

                    <div style={resumenFlotanteBotonesGrid}>
                      <button
                        onClick={irAPedidoActual}
                        style={botonResumenFlotantePrimario}
                      >
                        Ver pedido
                      </button>

                      <button
                        onClick={descargarPDFPedido}
                        style={botonResumenFlotanteAccion}
                      >
                        PDF
                      </button>

                      <button
                        onClick={imprimirFormulario}
                        style={botonResumenFlotanteAccion}
                      >
                        Imprimir
                      </button>

                      <button
                        onClick={irArriba}
                        style={botonResumenFlotanteSecundario}
                      >
                        Subir
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : modo === "compraInicial" ? (
              <>
                <div style={resumenVisibleSiempre}>
                  <div style={resumenVisibleMiniDatos}>
                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Puntos
                      </span>
                      <span style={{ ...resumenVisibleValor, color: estado.colorTexto }}>
                        {totalPuntos}
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Paquete
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {paqueteActual.nombre}
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Descuento
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        {paqueteActual.descuento}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setResumenContraido(!resumenContraido)}
                    style={botonToggleResumen}
                  >
                    {resumenContraido ? "▼ Mostrar" : "▲ Ocultar"}
                  </button>
                </div>

                {!resumenContraido && (
                  <>
                    <div style={resumenCompraInicialGrande}>
                      <div
                        style={{
                          ...resumenCompraInicialTitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        {paqueteActual.nombre}
                      </div>
                      <div
                        style={{
                          ...resumenCompraInicialSubtitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        Descuento actual: {paqueteActual.descuento}%
                      </div>
                    </div>

                    <div style={resumenFlotanteFilaCompraInicial}>
                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Puntos
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValor,
                            color: estado.colorTexto,
                          }}
                        >
                          {totalPuntos}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Precio público
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalPrecioPublico)}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Total con {paqueteActual.descuento}%
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(paqueteActual.totalConDescuento)}
                        </div>
                      </div>
                    </div>

                    <div style={resumenFlotanteMensaje}>
                      <span style={{ color: estado.colorTexto, fontWeight: "bold" }}>
                        {estado.siguienteMensaje}
                      </span>
                    </div>

                    <div style={resumenFlotanteBotonesGrid}>
                      <button
                        onClick={irAPedidoActual}
                        style={botonResumenFlotantePrimario}
                      >
                        Ver pedido
                      </button>

                      <button
                        onClick={descargarPDFPedido}
                        style={botonResumenFlotanteAccion}
                      >
                        PDF
                      </button>

                      <button
                        onClick={imprimirFormulario}
                        style={botonResumenFlotanteAccion}
                      >
                        Imprimir
                      </button>

                      <button
                        onClick={irArriba}
                        style={botonResumenFlotanteSecundario}
                      >
                        Subir
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : programaRecompra === "lealtad" ? (
              <>
                <div style={resumenVisibleSiempre}>
                  <div style={resumenVisibleMiniDatos}>
                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Programa
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        Lealtad
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Mes
                      </span>
                      <span style={{ ...resumenVisibleValor, color: estado.colorTexto }}>
                        {mesLealtad}
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Descuento
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        {descuentoLealtadActual}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setResumenContraido(!resumenContraido)}
                    style={botonToggleResumen}
                  >
                    {resumenContraido ? "▼ Mostrar" : "▲ Ocultar"}
                  </button>
                </div>

                {!resumenContraido && (
                  <>
                    <div style={resumenCompraInicialGrande}>
                      <div
                        style={{
                          ...resumenCompraInicialTitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        {estado.continuidad
                          ? "Lealtad sostenida"
                          : "Secuencia comprometida"}
                      </div>
                      <div
                        style={{
                          ...resumenCompraInicialSubtitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        Descuento actual: {descuentoLealtadActual}%
                      </div>
                    </div>

                    <div style={resumenFlotanteFilaCompraInicial}>
                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Puntos personales
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValor,
                            color: estado.colorTexto,
                          }}
                        >
                          {totalPuntos}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Precio público
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalPrecioPublico)}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Total con {descuentoLealtadActual}%
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalSegunDescuentoLealtad)}
                        </div>
                      </div>
                    </div>

                    <div style={resumenFlotanteMensaje}>
                      <div style={{ color: estado.colorTexto, fontWeight: "bold" }}>
                        {estado.mensajePrincipal}
                      </div>
                      <div
                        style={{
                          color: estado.colorTexto,
                          fontWeight: "bold",
                          marginTop: "8px",
                        }}
                      >
                        {estado.mensajeSecundario}
                      </div>
                    </div>

                    <div style={resumenFlotanteBotonesGrid}>
                      <button
                        onClick={irAPedidoActual}
                        style={botonResumenFlotantePrimario}
                      >
                        Ver pedido
                      </button>

                      <button
                        onClick={descargarPDFPedido}
                        style={botonResumenFlotanteAccion}
                      >
                        PDF
                      </button>

                      <button
                        onClick={imprimirFormulario}
                        style={botonResumenFlotanteAccion}
                      >
                        Imprimir
                      </button>

                      <button
                        onClick={irArriba}
                        style={botonResumenFlotanteSecundario}
                      >
                        Subir
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div style={resumenVisibleSiempre}>
                  <div style={resumenVisibleMiniDatos}>
                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Programa
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        Acelerado
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Acumulado
                      </span>
                      <span style={{ ...resumenVisibleValor, color: estado.colorTexto }}>
                        {totalAcumuladoAcelerado}
                      </span>
                    </div>

                    <div style={resumenVisibleDato}>
                      <span style={{ ...resumenVisibleLabel, color: estado.colorTexto }}>
                        Descuento
                      </span>
                      <span
                        style={{
                          ...resumenVisibleValorMoneda,
                          color: estado.colorTexto,
                        }}
                      >
                        {descuentoAceleradoActual}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setResumenContraido(!resumenContraido)}
                    style={botonToggleResumen}
                  >
                    {resumenContraido ? "▼ Mostrar" : "▲ Ocultar"}
                  </button>
                </div>

                {!resumenContraido && (
                  <>
                    <div style={resumenCompraInicialGrande}>
                      <div
                        style={{
                          ...resumenCompraInicialTitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        Lealtad Acelerado
                      </div>
                      <div
                        style={{
                          ...resumenCompraInicialSubtitulo,
                          color: estado.colorTexto,
                        }}
                      >
                        Descuento actual: {descuentoAceleradoActual}%
                      </div>
                    </div>

                    <div style={resumenFlotanteFilaCompraInicial}>
                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Puntos periodo
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValor,
                            color: estado.colorTexto,
                          }}
                        >
                          {Number(puntosPersonalesAcelerado || 0) +
                            Number(puntosGrupalesAcelerado || 0)}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Precio público
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalPrecioPublico)}
                        </div>
                      </div>

                      <div
                        style={{
                          ...resumenFlotanteMini,
                          border: `1px solid ${estado.colorBorde}`,
                          backgroundColor: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <div
                          style={{
                            ...resumenFlotanteLabel,
                            color: estado.colorTexto,
                          }}
                        >
                          Total con {descuentoAceleradoActual}%
                        </div>
                        <div
                          style={{
                            ...resumenFlotanteValorMoneda,
                            color: estado.colorTexto,
                          }}
                        >
                          {formatoMoneda(totalSegunDescuentoAcelerado)}
                        </div>
                      </div>
                    </div>

                    <div style={resumenFlotanteMensaje}>
                      <div style={{ color: estado.colorTexto, fontWeight: "bold" }}>
                        {estado.mensajePrincipal}
                      </div>
                      <div
                        style={{
                          color: estado.colorTexto,
                          fontWeight: "bold",
                          marginTop: "8px",
                        }}
                      >
                        {estado.mensajeSecundario}
                      </div>
                    </div>

                    <div style={resumenFlotanteBotonesGrid}>
                      <button
                        onClick={irAPedidoActual}
                        style={botonResumenFlotantePrimario}
                      >
                        Ver pedido
                      </button>

                      <button
                        onClick={descargarPDFPedido}
                        style={botonResumenFlotanteAccion}
                      >
                        PDF
                      </button>

                      <button
                        onClick={imprimirFormulario}
                        style={botonResumenFlotanteAccion}
                      >
                        Imprimir
                      </button>

                      <button
                        onClick={irArriba}
                        style={botonResumenFlotanteSecundario}
                      >
                        Subir
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniDato({ label, value }) {
  return (
    <div style={miniDatoCard}>
      <div style={miniDatoLabel}>{label}</div>
      <div style={miniDatoValor}>{value}</div>
    </div>
  );
}

const pagina = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(255,237,213,0.92) 0%, rgba(255,247,237,0.90) 16%, #fffaf5 40%, #fffdf9 100%)",
  padding: "28px",
  paddingBottom: "150px",
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
  background:
    "radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%)",
  pointerEvents: "none",
};

const brilloLateral = {
  position: "absolute",
  bottom: "120px",
  left: "-90px",
  width: "250px",
  height: "250px",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 72%)",
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

const botonVaciarPedido = {
  padding: "10px 14px",
  borderRadius: "12px",
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
  minWidth: "1900px",
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

const telefonoLink = {
  display: "inline-block",
  margin: "6px 0",
  color: "#c2410c",
  fontWeight: "bold",
  textDecoration: "none",
  fontSize: "18px",
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

const resumenFlotante = {
  position: "fixed",
  left: "12px",
  right: "12px",
  bottom: "12px",
  zIndex: 999,
  color: "#ffffff",
  borderRadius: "20px",
  padding: "12px",
  backdropFilter: "blur(10px)",
};

const resumenVisibleSiempre = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const resumenVisibleMiniDatos = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  flexWrap: "wrap",
};

const resumenVisibleDato = {
  display: "flex",
  flexDirection: "column",
};

const resumenVisibleLabel = {
  fontSize: "11px",
  marginBottom: "2px",
};

const resumenVisibleValor = {
  fontSize: "18px",
  fontWeight: "bold",
};

const resumenVisibleValorMoneda = {
  fontSize: "13px",
  fontWeight: "bold",
};

const botonToggleResumen = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.68)",
  color: "#7c2d12",
  fontWeight: "bold",
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontSize: "14px",
};

const resumenFlotanteFilaCompraInicial = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "10px",
  marginTop: "10px",
  marginBottom: "10px",
};

const resumenFlotanteMini = {
  borderRadius: "14px",
  padding: "10px",
};

const resumenFlotanteLabel = {
  fontSize: "11px",
  marginBottom: "4px",
};

const resumenFlotanteValor = {
  fontSize: "20px",
  fontWeight: "bold",
};

const resumenFlotanteValorMoneda = {
  fontSize: "13px",
  fontWeight: "bold",
  lineHeight: 1.35,
};

const resumenCompraInicialGrande = {
  marginTop: "10px",
  marginBottom: "10px",
  padding: "12px 14px",
  borderRadius: "16px",
  backgroundColor: "rgba(255,255,255,0.50)",
};

const resumenCompraInicialTitulo = {
  fontSize: "22px",
  fontWeight: "bold",
  lineHeight: 1.2,
};

const resumenCompraInicialSubtitulo = {
  marginTop: "4px",
  fontSize: "14px",
  fontWeight: "bold",
};

const resumenFlotanteMensaje = {
  marginTop: "10px",
  marginBottom: "10px",
  padding: "10px 12px",
  borderRadius: "14px",
  backgroundColor: "rgba(255,255,255,0.48)",
  fontSize: "12px",
  lineHeight: 1.45,
};

const resumenFlotanteBotonesGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const botonResumenFlotantePrimario = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #fdba74",
  background: "linear-gradient(135deg, #fdba74 0%, #fb923c 100%)",
  color: "#7c2d12",
  fontWeight: "bold",
  cursor: "pointer",
};

const botonResumenFlotanteAccion = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.72)",
  color: "#7c2d12",
  fontWeight: "bold",
  cursor: "pointer",
};

const botonResumenFlotanteSecundario = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.28)",
  color: "#7c2d12",
  fontWeight: "bold",
  cursor: "pointer",
};

export default App;