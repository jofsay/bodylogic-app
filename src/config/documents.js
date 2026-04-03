/**
 * Static documents list.
 * In a future SaaS version this could come from an API / CMS.
 */
export const documentos = [
  {
    nombre: "Catálogo Bodylogic 2026",
    archivo: "CATALOGO-BODYLOGIC-2026.pdf",
    descripcion: "Consulta visual del catálogo general.",
    tipo: "normal",
    icono: "📖",
  },
  {
    nombre: "Lista de Precios CP Marzo 26",
    archivo: "LISTA-PRECIOS-CP-MARZO-26.pdf",
    descripcion: "Precios para Cliente Preferente.",
    tipo: "normal",
    icono: "💰",
  },
  {
    nombre: "Lista de Precios DI Marzo 26",
    archivo: "LISTA-PRECIOS-DI-MARZO-26.pdf",
    descripcion: "Precios para Distribuidor Independiente.",
    tipo: "normal",
    icono: "📊",
  },
  {
    nombre: "Solicitud de Membresía",
    archivo: "SOLICITUD-DE-MEMBRESIA-v2.pdf",
    descripcion: "Formato oficial editable para alta de nuevos asociados.",
    tipo: "membresia",
    icono: "📝",
  },
];

/**
 * Filter documents based on user profile.
 */
export const getVisibleDocuments = (perfil) => {
  if (perfil === "clientePreferente") {
    return documentos.filter(
      (d) =>
        d.archivo !== "LISTA-PRECIOS-DI-MARZO-26.pdf" &&
        d.archivo !== "SOLICITUD-DE-MEMBRESIA-v2.pdf"
    );
  }
  return documentos;
};