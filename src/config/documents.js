export const documentos = [
  { nombre: 'Catálogo Bodylogic 2026', archivo: 'CATALOGO-BODYLOGIC-2026.pdf', descripcion: 'Consulta visual del catálogo general.', tipo: 'normal', icono: '📖', perfiles: ['distribuidor', 'clientePreferente', 'simulador'] },
  { nombre: 'Lista de Precios CP Marzo 26', archivo: 'LISTA-PRECIOS-CP-MARZO-26.pdf', descripcion: 'Precios para Cliente Preferente.', tipo: 'normal', icono: '💰', perfiles: ['clientePreferente', 'distribuidor', 'simulador'] },
  { nombre: 'Lista de Precios DI Marzo 26', archivo: 'LISTA-PRECIOS-DI-MARZO-26.pdf', descripcion: 'Precios para Distribuidor Independiente.', tipo: 'normal', icono: '📊', perfiles: ['distribuidor', 'simulador'] },
  { nombre: 'Solicitud de Membresía', archivo: 'SOLICITUD-DE-MEMBRESIA-v2.pdf', descripcion: 'Formato oficial para alta de nuevos asociados.', tipo: 'membresia', icono: '📝', perfiles: ['distribuidor'] },
];
export const getVisibleDocuments = (perfil) => documentos.filter((d) => d.perfiles.includes(perfil));
export const documentUrl = (archivo) => `/archivos/${archivo}`;