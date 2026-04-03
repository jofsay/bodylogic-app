export const documentos = [
  {
    nombre: "Catálogo BodyLogic 2026",
    archivo: "CATALOGO-BODYLOGIC-2026.pdf",
    descripcion: "Catálogo oficial de productos BodyLogic.",
    icono: "📘",
    tipo: "catalogo",
  },
  {
    nombre: "Lista de precios Cliente Preferente",
    archivo: "LISTA-PRECIOS-CP-MARZO-26.pdf",
    descripcion: "Lista de precios actualizada para clientes preferentes.",
    icono: "📄",
    tipo: "precios",
  },
  {
    nombre: "Lista de precios Distribuidor",
    archivo: "LISTA-PRECIOS-DI-MARZO-26.pdf",
    descripcion: "Lista de precios para distribuidores independientes.",
    icono: "📄",
    tipo: "precios",
  },
  {
    nombre: "Solicitud de Membresía",
    archivo: "SOLICITUD-DE-MEMBRESIA-v2.pdf",
    descripcion: "Formato editable para alta de nuevos asociados.",
    icono: "📝",
    tipo: "membresia",
  },
];

export function getVisibleDocuments(perfil) {
  if (perfil === "clientePreferente") {
    return documentos.filter((d) => d.tipo !== "membresia");
  }
  return documentos;
}