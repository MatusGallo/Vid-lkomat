import { useEffect, useRef, useState } from "react";
import type { TrendPoint } from "../types";
import { czk, kfmt } from "../utils/format";
import { niceCeil } from "../utils/stats";

type Props = { points: TrendPoint[] };

export function LineTrend({ points }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(700);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setW(el.clientWidth || 700);
    update();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, []);

  const H = w < 560 ? 230 : 300;
  const padL = 46, padR = 14, padT = 12, padB = 28;
  const plotW = Math.max(10, w - padL - padR);
  const plotH = H - padT - padB;
  const n = points.length;
  const maxV = Math.max(0, ...points.map((p) => (p.count ? p.total : 0)));
  const niceMax = niceCeil(maxV) || 1;
  const X = (i: number) => padL + (n > 1 ? (plotW * i) / (n - 1) : plotW / 2);
  const Y = (v: number) => padT + plotH * (1 - v / niceMax);

  const pathFor = (sel: (p: TrendPoint) => number): string => {
    let d = "";
    let pen = false;
    points.forEach((p, i) => {
      if (!p.count) {
        pen = false;
        return;
      }
      d += (pen ? "L" : "M") + X(i).toFixed(1) + "," + Y(sel(p)).toFixed(1) + " ";
      pen = true;
    });
    return d.trim();
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const hv = hover != null ? points[hover] : null;
  const tipHalf = w < 480 ? 80 : 92;
  const tipX = hover != null ? Math.min(Math.max(X(hover), tipHalf + 6), w - tipHalf - 6) : 0;
  const tipY = hv && hv.count ? Math.max(28, Math.min(Y(hv.total), Y(hv.profit))) : 0;

  const labelStride = Math.max(1, Math.ceil(n / Math.max(6, Math.floor(plotW / 56))));

  return (
    <div className="od-linewrap" ref={wrapRef}>
      <svg
        className="od-lt-svg"
        width={w}
        height={H}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t, i) => {
          const y = padT + plotH * (1 - t);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2c2823" strokeDasharray="3 3" />
              <text className="od-lt-axis" x={padL - 8} y={y + 3} textAnchor="end">
                {kfmt(niceMax * t)}
              </text>
            </g>
          );
        })}
        {points.map((p, i) =>
          i % labelStride === 0 || i === n - 1 ? (
            <text
              key={i}
              className="od-lt-axis"
              x={X(i)}
              y={H - 8}
              textAnchor="middle"
              fill={p.isCurrent ? "#f4711e" : "#5d564c"}
            >
              {p.label}
            </text>
          ) : null,
        )}

        {hover != null && (
          <line
            x1={X(hover)}
            y1={padT}
            x2={X(hover)}
            y2={padT + plotH}
            stroke="#3a352e"
            strokeDasharray="3 3"
          />
        )}

        <path d={pathFor((p) => p.total)} fill="none" stroke="#f4711e" strokeWidth="2.5" />
        <path d={pathFor((p) => p.profit)} fill="none" stroke="#5ed18a" strokeWidth="2.5" />

        {points.map((p, i) =>
          p.count ? (
            <g key={"p" + i}>
              <circle cx={X(i)} cy={Y(p.total)} r={hover === i ? 5 : 3} fill="#f4711e" />
              <circle cx={X(i)} cy={Y(p.profit)} r={hover === i ? 5 : 3} fill="#5ed18a" />
            </g>
          ) : null,
        )}

        {points.map((_, i) => {
          const left = i === 0 ? 0 : (X(i - 1) + X(i)) / 2;
          const right = i === n - 1 ? w : (X(i) + X(i + 1)) / 2;
          return (
            <rect
              key={"h" + i}
              x={left}
              y={0}
              width={right - left}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}
      </svg>

      {hv && hv.count > 0 && hover != null && (
        <div className="od-lt-tip" style={{ left: tipX + "px", top: tipY + "px" }}>
          <div className="od-charttip">
            <div className="od-tip-h">{hv.fullLabel}</div>
            <div className="od-tip-r">
              <span className="d o" /> Obrat <b>{czk(hv.total)}</b>
            </div>
            <div className="od-tip-r">
              <span className="d n" /> Zisk <b>{czk(hv.profit)}</b>
            </div>
            <div className="od-tip-r">
              <span className="d g" /> Zásahy <b>{hv.count}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
