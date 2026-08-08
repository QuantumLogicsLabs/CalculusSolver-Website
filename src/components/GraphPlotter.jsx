// website/src/components/GraphPlotter.jsx
import React, { useRef, useEffect } from "react";

export default function GraphPlotter({ result, variable = "x", pointX = 2 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    const scale = 30; // 30px per unit
    const cx = width / 2;
    const cy = height / 2;

    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.stroke();

    // Helper evaluation function for quadratic/linear display
    function evalPoly(xVal) {
      if (!result || !result.expr) return xVal * xVal; // Default x^2 fallback
      const terms = result.expr.numi?.terms || [];
      let y = 0;
      for (const t of terms) {
        let v = t.coeff || 0;
        const p = t.var?.[variable] || 0;
        v *= Math.pow(xVal, p);
        y += v;
      }
      return y;
    }

    // Plot Curve f(x)
    ctx.strokeStyle = "#60A5FA";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const xVal = (px - cx) / scale;
      const yVal = evalPoly(xVal);
      const py = cy - yVal * scale;
      if (py >= -1000 && py <= height + 1000) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Plot Tangent Line at pointX if op is tangent_line or result contains tangent
    if (result && (result.rule === "tangent_line" || result.latex?.includes("y ="))) {
      ctx.strokeStyle = "#F43F5E";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      const x0 = pointX;
      const y0 = evalPoly(x0);
      
      // Calculate slope at x0
      const eps = 0.001;
      const slope = (evalPoly(x0 + eps) - evalPoly(x0 - eps)) / (2 * eps);

      for (let px = 0; px <= width; px += 4) {
        const xVal = (px - cx) / scale;
        const yVal = slope * (xVal - x0) + y0;
        const py = cy - yVal * scale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Point marker
      const px0 = cx + x0 * scale;
      const py0 = cy - y0 * scale;
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.arc(px0, py0, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [result, variable, pointX]);

  return (
    <div style={{ marginTop: 20, textAlign: "center" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 8, letterSpacing: "0.05em" }}>
        Interactive 2D Curve &amp; Tangent Plotter
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        style={{
          width: "100%",
          maxHeight: 300,
          background: "rgba(15, 23, 42, 0.9)",
          borderRadius: 12,
          border: "1px solid rgba(124, 111, 255, 0.3)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}
