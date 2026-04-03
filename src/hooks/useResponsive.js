import { useState, useEffect } from "react";

export function useResponsive(breakpoint = 768) {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= breakpoint);
  const [vistaMovil, setVistaMovil] = useState(
    window.innerWidth <= breakpoint ? "cards" : "tabla"
  );

  useEffect(() => {
    const handler = () => {
      const m = window.innerWidth <= breakpoint;
      setEsMovil(m);
      if (!m) setVistaMovil("tabla");
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return { esMovil, vistaMovil, setVistaMovil };
}
