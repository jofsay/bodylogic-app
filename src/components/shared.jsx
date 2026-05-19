import React from "react";
import { T } from "../config/tokens";

/* ═══════════════════════════════════════════════════════════════
   BADGE
   ═══════════════════════════════════════════════════════════════ */
export const Badge = React.memo(function Badge({ children, style: s }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: T.r.pill,
        backgroundColor: T.orange200,
        color: T.orange700,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: ".3px",
        ...s,
      }}
    >
      {children}
    </span>
  );
});

/* ═══════════════════════════════════════════════════════════════
   BUTTON
   ═══════════════════════════════════════════════════════════════ */
export const Btn = React.memo(function Btn({
  children,
  onClick,
  active,
  ghost,
  danger,
  style: s,
  ...rest
}) {
  const base = {
    padding: "11px 20px",
    borderRadius: T.r.sm,
    cursor: "pointer",
    fontWeight: active ? 700 : 600,
    fontSize: "14px",
    letterSpacing: "-.1px",
    position: "relative",
    overflow: "hidden",
  };
  const variant = danger
    ? {
        border: "1.5px solid #fca5a5",
        backgroundColor: "rgba(255,241,242,.9)",
        color: "#b91c1c",
        boxShadow: T.s.xxs,
      }
    : ghost
      ? {
          border: `1px solid ${T.cream500}`,
          backgroundColor: "transparent",
          color: T.textMuted,
          boxShadow: "none",
        }
      : active
        ? {
            border: `2px solid ${T.orange500}`,
            background: `linear-gradient(135deg,${T.orange400} 0%,${T.orange500} 100%)`,
            color: T.white,
            boxShadow: `0 6px 24px rgba(234,88,12,.25),inset 0 1px 0 rgba(255,255,255,.2)`,
            textShadow: "0 1px 2px rgba(0,0,0,.1)",
          }
        : {
            border: `1px solid ${T.cream500}`,
            background: `linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,250,245,.9))`,
            color: T.textDark,
            boxShadow: T.s.xs,
          };
  return (
    <button
      onClick={onClick}
      className="bl-btn-hover"
      style={{ ...base, ...variant, ...s }}
      {...rest}
    >
      {children}
    </button>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MINI DATO (stat card)
   ═══════════════════════════════════════════════════════════════ */
export const MiniDato = React.memo(function MiniDato({
  label,
  value,
  highlight,
  large,
}) {
  return (
    <div
      style={{
        backgroundColor: highlight
          ? "rgba(255,237,213,.55)"
          : "rgba(255,255,255,.80)",
        border: `1px solid ${highlight ? T.orange300 : T.cream500}`,
        borderRadius: T.r.sm,
        padding: large ? "14px 16px" : "10px 12px",
        transition: "all .25s cubic-bezier(.22,.61,.36,1)",
        backdropFilter: "blur(4px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg,${T.orange400},${T.orange500})`,
            borderRadius: "3px 3px 0 0",
          }}
        />
      )}
      <div
        style={{
          fontSize: large ? "11px" : "10px",
          color: T.textMuted,
          marginBottom: large ? "5px" : "3px",
          fontWeight: 600,
          letterSpacing: ".5px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        className={large ? "bl-count-pop" : ""}
        style={{
          fontSize: large ? "18px" : "13px",
          fontWeight: 800,
          color: highlight ? T.orange600 : T.textDark,
          lineHeight: 1.25,
          fontFamily: T.fontBody,
        }}
      >
        {value}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
export const ProgressBar = React.memo(function ProgressBar({
  current,
  target,
  label,
  colorStart = T.orange400,
  colorEnd = T.orange500,
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const done = pct >= 100;
  return (
    <div style={{ marginTop: "10px" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: T.textMuted,
            marginBottom: "6px",
            fontWeight: 600,
          }}
        >
          <span style={{ maxWidth: "70%", lineHeight: 1.3 }}>{label}</span>
          <span
            className={done ? "bl-count-pop" : ""}
            style={{
              fontWeight: 800,
              color: done ? T.green500 : T.orange600,
              fontSize: done ? "13px" : "11px",
            }}
          >
            {done ? "✓ 100%" : `${Math.round(pct)}%`}
          </span>
        </div>
      )}
      <div
        style={{
          height: "7px",
          borderRadius: "99px",
          backgroundColor: "rgba(253,226,204,.5)",
          overflow: "hidden",
          boxShadow: T.s.inner,
        }}
      >
        <div
          className="bl-progress-bar"
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "99px",
            background: done
              ? `linear-gradient(90deg,#4ade80,${T.green500})`
              : `linear-gradient(90deg,${colorStart},${colorEnd})`,
            boxShadow: done
              ? "0 0 10px rgba(74,222,128,.35)"
              : "0 0 10px rgba(234,88,12,.18)",
          }}
        />
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   SECTION CARD (glass panel wrapper)
   ═══════════════════════════════════════════════════════════════ */
export function SectionCard({ children, style: extra, className = "", delay = 0 }) {
  return (
    <section
      className={`bl-section ${delay > 0 ? `bl-d${delay}` : ""} ${className}`.trim()}
      style={{
        backgroundColor: "rgba(255,255,255,.88)",
        borderRadius: T.r.xl,
        padding: "clamp(18px,3.5vw,30px)",
        boxShadow: T.s.lg,
        border: "1px solid rgba(253,228,211,.7)",
        marginBottom: "18px",
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        position: "relative",
        overflow: "hidden",
        ...extra,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: "1px",
          background: `linear-gradient(90deg,transparent,${T.orange300},transparent)`,
          opacity: 0.5,
        }}
      />
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING STAT helpers (for mobile summary)
   ═══════════════════════════════════════════════════════════════ */
export const FS = React.memo(function FS({ l, v, c, big }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      <span
        style={{
          fontSize: "9px",
          color: c,
          opacity: 0.65,
          fontWeight: 700,
          letterSpacing: ".5px",
          textTransform: "uppercase",
        }}
      >
        {l}
      </span>
      <span
        style={{
          fontSize: big ? "18px" : "12px",
          fontWeight: 800,
          color: c,
          fontFamily: T.fontBody,
          lineHeight: 1.1,
        }}
      >
        {v}
      </span>
    </div>
  );
});

export const FC = React.memo(function FC({ l, v, num, e }) {
  return (
    <div
      style={{
        borderRadius: "10px",
        padding: "8px 10px",
        border: `1px solid ${e.colorBorde}`,
        backgroundColor: "rgba(255,255,255,.40)",
        backdropFilter: "blur(4px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {num && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg,${e.colorSemaforo}80,transparent)`,
            borderRadius: "2px",
          }}
        />
      )}
      <div
        style={{
          fontSize: "9px",
          marginBottom: "3px",
          color: e.colorTexto,
          fontWeight: 700,
          letterSpacing: ".4px",
          textTransform: "uppercase",
          opacity: 0.75,
        }}
      >
        {l}
      </div>
      <div
        style={{
          fontSize: num ? "17px" : "11px",
          fontWeight: 800,
          color: e.colorTexto,
          lineHeight: 1.2,
          fontFamily: T.fontBody,
        }}
      >
        {v}
      </div>
    </div>
  );
});