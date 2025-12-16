import React, { useState, useMemo } from "react";

const AgentRunViewer = ({ run }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [filter, setFilter] = useState("all");

  if (!run) return null;

  const toggleStep = (stepId) => {
    const newSet = new Set(expandedSteps);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    setExpandedSteps(newSet);
  };

  const filteredSteps = useMemo(() => {
    if (filter === "all") return run.steps || [];
    return (run.steps || []).filter((s) => s.step_status === filter);
  }, [run.steps, filter]);

  const stats = useMemo(() => {
    const steps = run.steps || [];
    return {
      total: steps.length,
      success: steps.filter((s) => s.step_status === "success").length,
      failure: steps.filter((s) => s.step_status === "failure").length,
      totalLatency: steps.reduce((sum, s) => sum + (s.step_latency || 0), 0),
    };
  }, [run.steps]);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    return date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10b981";
      case "failure":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      llm_call: "🤖",
      auth_call: "🔐",
      email: "📧",
      tool: "⚙️",
    };
    return icons[type] || "→";
  };

  return (
    <div style={{ background: "#ffffff", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: 24, borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>
            {run.agent_id}
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            {run.user_task}
          </p>
        </div>

        {/* Metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Status</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: getStatusColor(run.status),
                textTransform: "capitalize",
              }}
            >
              {run.status}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Duration</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {formatTime(run.duration || 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Started</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {formatTimestamp(run.start_timestamp)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Steps</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {stats.success}/{stats.total}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ padding: "12px 24px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>Success: {stats.success}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>Failed: {stats.failure}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>Total Latency: {formatTime(stats.totalLatency)}</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
        {["all", "success", "failure"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              background: filter === f ? "#e0f2fe" : "#f3f4f6",
              color: filter === f ? "#0369a1" : "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Steps Timeline */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
        {filteredSteps.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>
            No steps found
          </div>
        ) : (
          <div>
            {filteredSteps.map((step, idx) => (
              <div
                key={step.step_id}
                style={{
                  marginBottom: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.step_id)}
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "none",
                    background: "#f9fafb",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  {/* Expand Icon */}
                  <div
                    style={{
                      transform: expandedSteps.has(step.step_id) ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    ▶
                  </div>

                  {/* Status Dot */}
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: getStatusColor(step.step_status),
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />

                  {/* Step Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{getTypeIcon(step.step_type)}</span>
                      <span>{step.step_name}</span>
                    </div>
                  </div>

                  {/* Step Details */}
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280" }}>
                    <span>{step.tool_provider}</span>
                    <span>{formatTime(step.step_latency || 0)}</span>
                    <span>{formatTimestamp(step.step_end_time)}</span>
                  </div>
                </button>

                {/* Step Details (Expanded) */}
                {expandedSteps.has(step.step_id) && (
                  <div style={{ padding: 16, borderTop: "1px solid #e5e7eb", background: "#ffffff", fontSize: 12 }}>
                    {/* Input */}
                    {step.step_input && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase" }}>
                          Input
                        </div>
                        <pre
                          style={{
                            background: "#f3f4f6",
                            padding: 8,
                            borderRadius: 4,
                            overflow: "auto",
                            fontSize: 11,
                            fontFamily: "monospace",
                            margin: 0,
                            maxHeight: 200,
                            color: "#374151",
                          }}
                        >
                          {typeof step.step_input === "string"
                            ? step.step_input
                            : JSON.stringify(step.step_input, null, 2).slice(0, 500)}
                        </pre>
                      </div>
                    )}

                    {/* Output */}
                    {step.step_output && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase" }}>
                          Output
                        </div>
                        <pre
                          style={{
                            background: "#f3f4f6",
                            padding: 8,
                            borderRadius: 4,
                            overflow: "auto",
                            fontSize: 11,
                            fontFamily: "monospace",
                            margin: 0,
                            maxHeight: 200,
                            color: "#374151",
                          }}
                        >
                          {typeof step.step_output === "string"
                            ? step.step_output
                            : JSON.stringify(step.step_output, null, 2).slice(0, 500)}
                        </pre>
                      </div>
                    )}

                    {/* Error */}
                    {step.step_error && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 8, textTransform: "uppercase" }}>
                          Error
                        </div>
                        <pre
                          style={{
                            background: "#fee2e2",
                            padding: 8,
                            borderRadius: 4,
                            overflow: "auto",
                            fontSize: 11,
                            fontFamily: "monospace",
                            margin: 0,
                            maxHeight: 200,
                            color: "#991b1b",
                          }}
                        >
                          {typeof step.step_error === "string"
                            ? step.step_error
                            : JSON.stringify(step.step_error, null, 2).slice(0, 500)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {run.final_output && (
        <div style={{ padding: 16, borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase" }}>
            Final Output
          </div>
          <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>
            {run.final_output}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentRunViewer;
