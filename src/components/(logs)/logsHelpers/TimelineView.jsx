import React, { useMemo } from "react";

export default function TimelineView({ steps = [], totalMs = 0, onStepClick, selectedId }) {
  const timed = useMemo(() => {
    let cursor = 0;
    return steps.map((s) => {
      const latency = Number(s.step_latency || 0);
      const start = cursor;
      cursor += latency;
      return { ...s, latency, start, end: cursor };
    });
  }, [steps]);

  const max = totalMs || Math.max(1, ...timed.map((t) => t.end));

  return (
    <div style={{ padding: "12px 14px" }}>
      {timed.map((t, i) => {
        const startPercent = (t.start / max) * 100;
        const widthPercent = (t.latency / max) * 100;
        const isSelected = selectedId === t.step_id;
        const color = t.step_status === "success" ? "#3b82f6" : "#ef4444";

        return (
          <div key={t.step_id} onClick={() => onStepClick(t.step_id)} style={{ marginBottom: 8, cursor: "pointer" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#374151", marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{i + 1}. {t.step_name}</span>
              <span style={{ color: "#6b7280" }}>{t.latency}ms</span>
            </div>
            <div style={{ height: 20, background: "#e5e7eb", border: "1px solid #d1d5db", position: "relative", transition: "border-color 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#9ca3af"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "#d1d5db"}>
              <div style={{ position: "absolute", left: `${startPercent}%`, width: `${widthPercent}%`, height: "100%", background: color, border: isSelected ? "2px solid #111827" : "none", boxSizing: "border-box" }} />
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "#9ca3af", fontWeight: 500, borderTop: "1px solid #e5e7eb", paddingTop: 6 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>{((i * max) / 5 / 1000).toFixed(2)}s</div>
        ))}
      </div>
    </div>
  );
}
