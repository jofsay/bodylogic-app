/**
 * Robust file downloader with fallback to window.open.
 */
export const descargarArchivo = async (archivo, nombreVisible, onStart, onEnd) => {
  const ruta = `/archivos/${archivo}`;
  onStart?.(archivo);
  try {
    const r = await fetch(ruta, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status}`);
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = archivo;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 1500);
  } catch (e) {
    console.error(e);
    alert(`No se pudo descargar "${nombreVisible}".`);
    window.open(ruta, "_blank", "noopener,noreferrer");
  } finally {
    onEnd?.();
  }
};
