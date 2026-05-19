/**
 * Injects global CSS once. Call in App root useEffect.
 * All animations, scrollbar, focus rings, mobile overrides.
 */
export const injectGlobalStyles = () => {
  if (document.getElementById("bl-global-styles")) return;
  const style = document.createElement("style");
  style.id = "bl-global-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box}
    html{scroll-behavior:smooth;-webkit-tap-highlight-color:transparent}
    body{margin:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overscroll-behavior-y:none}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(234,88,12,0.2);border-radius:99px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(234,88,12,0.4)}
    button,select,input,a{transition:all 0.2s cubic-bezier(0.22,0.61,0.36,1);font-family:'DM Sans',sans-serif}
    button:active:not(:disabled){transform:scale(0.95)!important;transition-duration:0.08s!important}
    button:disabled{opacity:0.45;cursor:not-allowed;filter:grayscale(0.3)}
    select:focus,input:focus,button:focus-visible{outline:none;border-color:#ea580c!important;box-shadow:0 0 0 3px rgba(234,88,12,0.12),0 4px 12px rgba(234,88,12,0.06)!important}
    input[type="number"]{-moz-appearance:textfield}
    input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{opacity:0;height:0}
    input[type="number"]:hover::-webkit-inner-spin-button,input[type="number"]:hover::-webkit-outer-spin-button{opacity:1;height:28px}
    ::selection{background:rgba(234,88,12,0.15);color:#7c2d12}
    @keyframes blFadeUp{from{opacity:0;transform:translateY(18px) scale(0.99)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes blScaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
    @keyframes blPulse{0%,100%{transform:scale(1);opacity:1;box-shadow:0 0 0 0 currentColor}50%{transform:scale(1.12);opacity:0.9;box-shadow:0 0 12px -2px currentColor}}
    @keyframes blSlideDown{from{opacity:0;transform:translateY(-8px);max-height:0}to{opacity:1;transform:translateY(0);max-height:1400px}}
    @keyframes blShine{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes blCountPop{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
    .bl-section{animation:blFadeUp 0.5s cubic-bezier(0.22,0.61,0.36,1) both}
    .bl-d1{animation-delay:.07s}.bl-d2{animation-delay:.14s}.bl-d3{animation-delay:.21s}.bl-d4{animation-delay:.28s}.bl-d5{animation-delay:.35s}.bl-d6{animation-delay:.42s}
    .bl-card{transition:transform .25s cubic-bezier(.22,.61,.36,1),box-shadow .25s cubic-bezier(.22,.61,.36,1),border-color .25s,background .3s}
    .bl-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(124,45,18,.11)}
    @media(max-width:768px){.bl-card:hover{transform:none;box-shadow:none}.bl-card:active{transform:scale(0.985);transition-duration:.1s}}
    .bl-expand{animation:blSlideDown .38s cubic-bezier(.22,.61,.36,1) both;overflow:hidden}
    .bl-progress-bar{transition:width .8s cubic-bezier(.22,.61,.36,1)}
    .bl-btn-hover:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(234,88,12,.14)}
    .bl-shine{background:linear-gradient(90deg,transparent 25%,rgba(255,255,255,.10) 50%,transparent 75%);background-size:200% 100%;animation:blShine 4s ease-in-out infinite}
    .bl-semaforo{animation:blPulse 2.8s cubic-bezier(.4,0,.6,1) infinite}
    .bl-float-glass{backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4)}
    .bl-count-pop{animation:blCountPop .25s ease}
    @media(max-width:768px){.bl-desktop-only{display:none!important}button,select,input{min-height:46px;font-size:15px}select{font-size:16px!important}}
    @media(min-width:769px){.bl-mobile-only{display:none!important}}
  `;
  document.head.appendChild(style);
};
