import { useEffect, useState } from 'react';
export function useResponsive(breakpoint = 820) {
  const get = () => (typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false);
  const [isMobile, setIsMobile] = useState(get);
  useEffect(() => { const onResize = () => setIsMobile(get()); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [breakpoint]);
  return isMobile;
}