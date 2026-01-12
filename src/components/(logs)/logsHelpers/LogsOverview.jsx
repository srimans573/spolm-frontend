import React, { useMemo } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { getTokenTotals } from "../../../utils/tokenCalculator";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Lightbulb,
  Activity,
  ArrowRight,
  Target,
  Flag,
  Boxes,
  DollarSignIcon,
} from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

// ─────────────────────────────────────────────────────────────
// Design Tokens — Minimal palette
// ─────────────────────────────────────────────────────────────
const fonts = {
  heading: '"Libre Baskerville", Georgia, serif',
  body: "Poppins, system-ui, sans-serif",
  mono: "SF Mono, Monaco, Consolas, monospace",
};

const colors = {
  text: "#1a1a1a",
  muted: "#6b7280",
  light: "#9ca3af",
  border: "#e5e5e5",
  bg: "#fafafa",
  accent: "#10b981", // Single accent color
  accentLight: "#d1fae5",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const fmt = (ms) =>
  ms == null
    ? "-"
    : ms < 1000
    ? `${Math.round(ms)}ms`
    : `${(ms / 1000).toFixed(2)}s`;

// Token pricing (per 1M tokens) - adjust based on your LLM provider
const TOKEN_PRICING = {
  gemini: { input: 0.075, output: 0.30 },
  openai: { input: 0.50, output: 1.50 },
  anthropic: { input: 3.00, output: 15.00 },
  default: { input: 0.10, output: 0.30 },
};

function calculateCost(steps = []) {
  // Guard against non-array input
  if (!steps || !Array.isArray(steps)) return 0;
  
  let totalCost = 0;
  steps.forEach((step) => {
    if (step.tokens) {
      const provider = step.tool_provider?.toLowerCase() || "default";
      const pricing = TOKEN_PRICING[provider] || TOKEN_PRICING.default;
      const inputCost = (step.tokens.promptTokenCount || 0) * (pricing.input / 1_000_000);
      const outputCost = (step.tokens.candidatesTokenCount || 0) * (pricing.output / 1_000_000);
      totalCost += inputCost + outputCost;
    }
  });
  return totalCost;
}

function analyze(steps = [], duration = 0, userTask = "", finalOutput = "") {
  // Guard against non-array input
  if (!steps || !Array.isArray(steps) || !steps.length) return null;

  const total = steps.reduce((a, s) => a + (s.step_latency || 0), 0);
  const latencies = steps.map((s) => s.step_latency || 0).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];

  // Calculate token usage from steps
  const tokenTotals = getTokenTotals(steps);
  const totalTokens = tokenTotals.totalTokens;
  const inputTokens = tokenTotals.inputTokens;
  const outputTokens = tokenTotals.outputTokens;
  const estimatedCost = calculateCost(steps);

  let fastest = steps[0],
    slowest = steps[0];
  const toolCounts = {},
    typeCounts = {},
    failures = [];
  let successCount = 0;

  steps.forEach((s, i) => {
    const lat = s.step_latency || 0;
    if (lat < (fastest.step_latency || Infinity)) fastest = s;
    if (lat > (slowest.step_latency || 0)) slowest = s;

    toolCounts[s.tool_provider || "unknown"] =
      (toolCounts[s.tool_provider || "unknown"] || 0) + 1;
    typeCounts[s.step_type || "unknown"] =
      (typeCounts[s.step_type || "unknown"] || 0) + 1;

    if (s.step_status === "success") successCount++;
    else if (s.step_status === "failure") {
      failures.push({ step: s, index: i + 1 });
    }
  });

  const successRate = (successCount / steps.length) * 100;
  const score = +(successRate / 10).toFixed(1);

  const insights = [];
  const recommendations = [];

  if (failures.length) {
    failures.forEach((f) => {
      insights.push({
        type: "error",
        text: `Step ${f.index} "${f.step.step_name}" failed`,
        detail: f.step.step_error?.reasoning || "",
      });
    });
    recommendations.push({
      text: "Add retry logic for failed steps",
      priority: "high",
    });
  }

  const llmCalls = steps.filter((s) => s.step_type === "llm_call").length;
  if (llmCalls > 5) {
    insights.push({
      type: "info",
      text: `${llmCalls} LLM calls — consider consolidating`,
    });
  }

  if (successRate === 100) {
    insights.push({
      type: "success",
      text: "All steps completed successfully",
    });
  }

  if (duration > 5000) {
    recommendations.push({
      text: "Duration exceeds 5s — optimize critical path",
      priority: "medium",
    });
  }

  // Build step durations for line chart
  const stepDurations = steps.map((s, i) => ({
    label: s.step_name.length > 8 ? s.step_name.slice(0, 8) + "…" : s.step_name,
    value: s.step_latency || 0,
    status: s.step_status,
  }));

  return {
    score,
    successRate,
    successCount,
    failCount: failures.length,
    totalSteps: steps.length,
    avgLatency: Math.round(total / steps.length),
    p50,
    p95,
    totalDuration: duration,
    fastest: { name: fastest.step_name, lat: fastest.step_latency },
    slowest: { name: slowest.step_name, lat: slowest.step_latency },
    toolCounts,
    typeCounts,
    insights,
    recommendations,
    llmCalls,
    toolCalls: steps.filter((s) => s.step_type !== "llm_call").length,
    userTask,
    finalOutput,
    stepDurations,
    // Token data
    totalTokens,
    inputTokens,
    outputTokens,
    estimatedCost,
  };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function LogsOverview({ run }) {
  // Parse steps if it's a JSON string, otherwise use as-is
  const parsedSteps = useMemo(() => {
    if (!run?.steps) return [];
    if (typeof run.steps === "string") {
      try {
        return JSON.parse(run.steps);
      } catch (e) {
        console.error("Failed to parse steps:", e);
        return [];
      }
    }
    return Array.isArray(run.steps) ? run.steps : [];
  }, [run?.steps]);

  const stats = useMemo(
    () => {
      if (!parsedSteps.length) return null;
      return analyze(parsedSteps, run?.duration, run?.user_task, run?.final_output);
    },
    [parsedSteps, run?.duration, run?.user_task, run?.final_output]
  );

  if (!stats)
    return (
      <div style={{ padding: 20, color: colors.muted }}>No data available</div>
    );

  const donutData = {
    labels: ["Success", "Failed"],
    datasets: [
      {
        data: [stats.successCount, stats.failCount || 0.001],
        backgroundColor: [
          colors.accent,
          stats.failCount ? colors.danger : colors.border,
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOpts = {
    cutout: "72%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  // Line chart for step durations
  const lineData = {
    labels: stats.stepDurations.map((s) => s.label),
    datasets: [
      {
        data: stats.stepDurations.map((s) => s.value),
        borderColor: "black",
        backgroundColor: "black",
        borderWidth: 1,
        pointRadius: 2,
        tension: 0,
      },
    ],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => fmt(ctx.raw),
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const maxTool = Math.max(...Object.values(stats.toolCounts));

  return (
    <div
      style={{
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderTop: "1px solid gainsboro",
      }}
    >
      {/* Row 1: Score + Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        {/* Score */}
        <div
          style={{
            padding: "12px",
            borderRight: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6,
            }}
          >
            Score
          </div>
          <div style={{ position: "relative", width: 110, height: 70 }}>
            <Doughnut
              data={donutData}
              options={{ ...donutOpts, rotation: -90, circumference: 180 }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: 0,
                width: "100%",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                  color: stats.score >= 8 ? colors.accent : colors.danger,
                }}
              >
                {stats.score}
              </span>
              <span style={{ fontSize: 10, color: colors.muted }}>/10</span>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: colors.muted }}>
            <span style={{ color: colors.accent, fontWeight: 600 }}>
              {stats.successCount}
            </span>{" "}
            passed ·{" "}
            <span
              style={{
                color: stats.failCount ? colors.danger : colors.muted,
                fontWeight: 600,
              }}
            >
              {stats.failCount}
            </span>{" "}
            failed
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "33% 33% 33%" }}>
          {/* Duration card with line chart */}
          <div
            style={{
              padding: "8px 12px",
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
              gap: 12,
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 4,
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: colors.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <Clock size={10} /> Duration
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginTop: "4px",
                    color: colors.text,
                    fontFamily: fonts.heading,
                  }}
                >
                  {fmt(stats.totalDuration)}
                </div>
              </div>
              <div
                style={{ flex: 1, height: "fit-content", overflow: "scroll" }}
              >
                <Line data={lineData} options={lineOpts} />
              </div>
            </div>
          </div>
          {/* Tokens */}
          <div
            style={{
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: "50%",
                padding: "12px 0px 0px 12px",
                borderBottom: "1px solid gainsboro",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Boxes size={10} /> Tokens
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.text,
                  fontFamily: fonts.heading,
                  marginTop: 4,
                }}
              >
                {stats.totalTokens.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                {stats.inputTokens.toLocaleString()} in · {stats.outputTokens.toLocaleString()} out
              </div>
            </div>
            <div style={{ height: "50%", padding: "12px 0px 0px 12px" }}>
              <div
                style={{
                  fontSize: 9,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <DollarSignIcon size={10} /> Est. Cost
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.text,
                  fontFamily: fonts.heading,
                  marginTop: 4,
                }}
              >
                ${stats.estimatedCost < 0.01 ? stats.estimatedCost.toFixed(4) : stats.estimatedCost.toFixed(2)}
              </div>
            </div>
          </div>
          {/* Steps */}
          <div style={{ padding: "12px" }}>
            <div
              style={{
                fontSize: 9,
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Zap size={10} /> Steps
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.text,
                fontFamily: fonts.heading,
                marginTop: 4,
              }}
            >
              {stats.totalSteps}
            </div>
            <div
              style={{
                overflow: "auto",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Providers
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {Object.entries(stats.toolCounts).map(([tool, count]) => (
                  <div
                    key={tool}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        width: 80,
                        fontSize: 11,
                        fontFamily: fonts.mono,
                      }}
                    >
                      {tool}
                    </span>
                    <div
                      style={{ flex: 1, height: 6, background: colors.border }}
                    >
                      <div
                        style={{
                          width: `${(count / maxTool) * 100}%`,
                          height: "100%",
                          background: colors.text,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        width: 20,
                        fontSize: 11,
                        color: colors.muted,
                        textAlign: "right",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: colors.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 10,
                  }}
                >
                  By Type
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(stats.typeCounts).map(([type, count]) => (
                    <span
                      key={type}
                      style={{
                        padding: "3px 8px",
                        fontSize: 10,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {type}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Task → Output */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              fontSize: 10,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Target size={12} /> Initial Task
          </div>
          <div
            style={{ fontSize: 14, fontFamily: fonts.heading, lineHeight: 1.5 }}
          >
            {stats.userTask || "No task specified"}
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", padding: "0 24px" }}
        >
          <ArrowRight size={20} color={colors.light} />
        </div>
        <div
          style={{
            padding: "16px 20px",
            borderLeft: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Flag size={12} /> Final Output
          </div>
          <div
            style={{
              fontSize: 14,
              fontFamily: fonts.heading,
              lineHeight: 1.5,
              color: stats.finalOutput?.toLowerCase().includes("success")
                ? colors.accent
                : colors.text,
            }}
          >
            {stats.finalOutput || "No output"}
          </div>
        </div>
      </div>

      {/* Row 3: Breakdown + Analysis + Recommendations — fills remaining space */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 260px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Provider Breakdown */}

        {/* Analysis */}
        <div
          style={{
            padding: "16px 18px",
            borderRight: `1px solid ${colors.border}`,
            overflow: "auto",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 12,
            }}
          >
            Analysis
          </div>
          {stats.insights.length === 0 ? (
            <div style={{ color: colors.light, fontSize: 12 }}>
              No issues detected
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.insights.map((insight, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    background:
                      insight.type === "error" ? colors.dangerLight : colors.bg,
                    borderLeft: `3px solid ${
                      insight.type === "error"
                        ? colors.danger
                        : insight.type === "success"
                        ? colors.accent
                        : colors.muted
                    }`,
                  }}
                >
                  {insight.type === "error" ? (
                    <AlertTriangle
                      size={14}
                      color={colors.danger}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                  ) : (
                    <CheckCircle2
                      size={14}
                      color={colors.accent}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>
                      {insight.text}
                    </div>
                    {insight.detail && (
                      <div
                        style={{
                          fontSize: 11,
                          color: colors.muted,
                          marginTop: 3,
                        }}
                      >
                        {insight.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div style={{ padding: "16px 18px", overflow: "auto" }}>
          <div
            style={{
              fontSize: 10,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Lightbulb size={12} /> Recommendations
          </div>
          {stats.recommendations.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: colors.accentLight,
                borderLeft: `3px solid ${colors.accent}`,
              }}
            >
              <CheckCircle2 size={14} color={colors.accent} />
              <span style={{ fontSize: 12 }}>No optimizations needed</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.recommendations.map((rec, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    background: colors.bg,
                  }}
                >
                  <TrendingUp
                    size={12}
                    color={colors.muted}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 12 }}>{rec.text}</div>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        background:
                          rec.priority === "high"
                            ? colors.dangerLight
                            : colors.border,
                        color:
                          rec.priority === "high"
                            ? colors.danger
                            : colors.muted,
                        marginTop: 4,
                        display: "inline-block",
                      }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Example Data
// ─────────────────────────────────────────────────────────────
const exampleRun = {
  run_id: "e28b300f-406c-45d1-998e-46d365e1dd14",
  agent_id: "GmailReadAndReply",
  user_task: "Read the latest email and reply with 'chicken' in it",
  final_output: "Completed successfully — reply sent to srimans572@gmail.com",
  duration: 7147,
  status: "complete",
  steps: [
    {
      step_id: "1",
      step_name: "reasoning",
      step_type: "llm_call",
      step_latency: 756,
      tool_provider: "gemini",
      step_status: "failure",
      step_error: { reasoning: "Agent not authenticated" },
    },

    {
      step_id: "3",
      step_name: "reasoning",
      step_type: "llm_call",
      step_latency: 563,
      tool_provider: "gemini",
      step_status: "success",
    },
    {
      step_id: "7",
      step_name: "reasoning",
      step_type: "llm_call",
      step_latency: 776,
      tool_provider: "gemini",
      step_status: "success",
    },
    {
      step_id: "8",
      step_name: "generateReply",
      step_type: "llm_call",
      step_latency: 1062,
      tool_provider: "gemini",
      step_status: "success",
    },
    {
      step_id: "9",
      step_name: "reasoning",
      step_type: "llm_call",
      step_latency: 927,
      tool_provider: "gemini",
      step_status: "success",
    },
    {
      step_id: "10",
      step_name: "sendReply",
      step_type: "tool_call",
      step_latency: 524,
      tool_provider: "gmail",
      step_status: "success",
    },
    {
      step_id: "11",
      step_name: "reasoning",
      step_type: "llm_call",
      step_latency: 664,
      tool_provider: "gemini",
      step_status: "success",
    },
  ],
};
