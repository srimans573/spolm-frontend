export default function StepsView({ steps, onStepClick, selectedId }) {
  const getStepTypeBadge = (type) => {
    const types = {
      llm_call: {
        bg: "#eff6ff",
        border: "#93c5fd",
        color: "#1e40af",
        label: "LLM",
      },
      auth_call: {
        bg: "#f0fdf4",
        border: "#86efac",
        color: "#15803d",
        label: "AUTH",
      },
      email: {
        bg: "#fef3c7",
        border: "#fde047",
        color: "#92400e",
        label: "EMAIL",
      },
    };
    return (
      types[type] || {
        bg: "#f3f4f6",
        border: "#d1d5db",
        color: "#374151",
        label: type?.toUpperCase() || "TOOL",
      }
    );
  };

  return (
    <div>
      {steps.map((s, idx) => {
        const badge = getStepTypeBadge(s.step_type);
        const isSelected = selectedId === s.step_id;
        return (
          <div
            key={s.step_id}
            onClick={() => onStepClick(s.step_id)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              cursor: "pointer",
              background: isSelected ? "#eff6ff" : "white",
              borderBottom: "1px solid #e5e7eb",
              borderLeft: isSelected
                ? "2px solid #3b82f6"
                : "2px solid transparent",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "white";
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 11,
                  color: "#111827",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {idx + 1}. {s.step_name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  marginTop: 2,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    padding: "1px 4px",
                    border: `1px solid ${badge.border}`,
                    fontSize: 9,
                    fontWeight: 600,
                  }}
                >
                  {badge.label}
                </span>
                <span style={{ fontSize: 9 }}>{s.tool_provider}</span>
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                marginLeft: 6,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {s.step_latency || 0}ms
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: s.step_status === "success" ? "#059669" : "#dc2626",
                  background:
                    s.step_status === "success" ? "#d1fae5" : "#fee2e2",
                  padding: "1px 4px",
                  border: `1px solid ${
                    s.step_status === "success" ? "#6ee7b7" : "#fca5a5"
                  }`,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {s.step_status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}