import React, { useState } from "react";

export default function StepDetails({ selectedStep }) {
  const [expandedInput, setExpandedInput] = useState(true);
  const [expandedOutput, setExpandedOutput] = useState(true);

  if (!selectedStep) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#fff",
        }}
      >
        <div
          style={{
            padding: "11px 16px",
            borderBottom: "1px solid gainsboro",
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            DETAILS
          </h3>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          Select a step to view details
        </div>
      </div>
    );
  }

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

  const badge = getStepTypeBadge(selectedStep.step_type);
  const hasError = selectedStep.step_error;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        overflow: "hidden", // Prevents the main card from spilling out
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "11px 16px",
          borderBottom: "1px solid gainsboro",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 2,
              }}
            >
              {selectedStep.step_name}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              {"Step ID: "}
              {selectedStep.step_id}
            </p>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: badge.bg,
                  color: badge.color,
                  padding: "2px 6px",
                  border: `1px solid ${badge.border}`,
                  fontWeight: 600,
                  fontSize: 9,
                }}
              >
                {badge.label}
              </span>
              <span style={{ fontSize: 10, color: "#6b7280" }}>•</span>
              <span
                style={{
                  background: "#f9fafb",
                  padding: "2px 6px",
                  border: "1px solid #d1d5db",
                  fontWeight: 500,
                  fontSize: 9,
                  color: "#374151",
                }}
              >
                {selectedStep.tool_provider}
              </span>
              <span style={{ fontSize: 10, color: "#6b7280" }}>•</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {selectedStep.step_latency}ms
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: 9,
              color:
                selectedStep.step_status === "success" ? "#059669" : "#dc2626",
              background:
                selectedStep.step_status === "success"
                  ? "#d1fae5"
                  : "#fee2e2",
              padding: "3px 8px",
              border: `1px solid ${
                selectedStep.step_status === "success" ? "#6ee7b7" : "#fca5a5"
              }`,
              fontWeight: 600,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {selectedStep.step_status}
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT - INPUT/OUTPUT */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 0, // Crucial for allowing flex children to scroll
          overflow: "hidden", // Ensures grid doesn't expand beyond parent
        }}
      >
        {/* INPUT SECTION */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid gainsboro",
            height: "100%", // Fill the grid column
            overflow: "hidden", // Contain internal scrolling
          }}
        >
          <div
            onClick={() => setExpandedInput(!expandedInput)}
            style={{
              padding: "9px 12px",
              background: "#f9fafb",
              borderBottom: "1px solid gainsboro",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>
              INPUT
            </span>
            <span style={{ fontSize: 10, color: "#6b7280" }}>
              {expandedInput ? "▼" : "▶"}
            </span>
          </div>
          {expandedInput && (
            <div
              style={{
                flex: 1,
                overflowY: "auto", // Scroll here
                minHeight: 0,
                background: "#fafafa", // Moved background here for continuity
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontFamily: '"Fira Code", "Courier New", monospace',
                  color: "#374151",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  padding: 8,
                  borderBottom: "1px solid #e5e7eb",
                  minHeight: "100%", // Fill space but allow growth
                  // Removed: height: "100vh" (This was the bug)
                }}
              >
                {JSON.stringify(selectedStep.step_input, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* OUTPUT SECTION */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            onClick={() => setExpandedOutput(!expandedOutput)}
            style={{
              padding: "9px 12px",
              background: "#f9fafb",
              borderBottom: "1px solid gainsboro",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>
              OUTPUT
            </span>
            <span style={{ fontSize: 10, color: "#6b7280" }}>
              {expandedOutput ? "▼" : "▶"}
            </span>
          </div>
          {expandedOutput && (
            <div
              style={{
                flex: 1,
                overflowY: "auto", // Scroll here
                minHeight: 0,
                background: "#fafafa",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontFamily: '"Fira Code", "Courier New", monospace',
                  color: "#374151",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  padding: 8,
                  borderBottom: "1px solid #e5e7eb",
                  minHeight: "100%",
                }}
              >
                {JSON.stringify(selectedStep.step_output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ERROR SECTION */}
      {hasError && (
        <div
          style={{
            background: "#fef2f2",
            borderTop: "1px solid #fecaca",
            padding: 10,
            flexShrink: 0,
            maxHeight: "150px", // Optional: limit error height
            overflowY: "auto", // Allow error to scroll if huge
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#dc2626",
              marginBottom: 4,
            }}
          >
            ERROR
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              fontFamily: '"Fira Code", "Courier New", monospace',
              color: "#991b1b",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {typeof hasError === "string"
              ? hasError
              : JSON.stringify(hasError, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}