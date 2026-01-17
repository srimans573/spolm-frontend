import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Brain,
  Target,
  Eye,
  EyeOff,
  GitBranch,
  Lightbulb,
  TrendingUp,
  Award,
  Activity,
  Tag,
  FileText,
  Zap,
  ArrowRight,
  Info,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Design Tokens — Matching LogsOverview palette
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
  accent: "#10b981",
  accentLight: "#d1fae5",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  info: "#3b82f6",
  infoLight: "#dbeafe",
};

// ─────────────────────────────────────────────────────────────
// Collapsible Section Component
// ─────────────────────────────────────────────────────────────
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderBottom: isOpen ? "none" : `1px solid ${colors.border}`,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          color: colors.text,
          fontFamily: fonts.body,
          textAlign: "left",
        }}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {Icon && <Icon size={14} color={colors.muted} />}
        <span style={{ flex: 1 }}>{title}</span>
        {badge && (
          <span
            style={{
              padding: "2px 8px",
              fontSize: 10,
              background: badge.bg,
              color: badge.color,
              fontWeight: 600,
            }}
          >
            {badge.text}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderTop: "none",
            padding: 16,
            background: "white",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// What Went Right/Wrong Component
// ─────────────────────────────────────────────────────────────
function WhatWentSection({ items, type }) {
  const isRight = type === "right";
  const Icon = isRight ? CheckCircle2 : XCircle;
  const color = isRight ? colors.accent : colors.danger;
  const bg = isRight ? colors.accentLight : colors.dangerLight;

  if (!items?.length) {
    return (
      <div
        style={{
          padding: "12px 16px",
          background: isRight ? colors.dangerLight : colors.accentLight,
          borderLeft: `3px solid ${isRight ? colors.danger : colors.accent}`,
          fontSize: 12,
          color: colors.muted,
        }}
      >
        {isRight ? "No successes recorded" : "No issues detected"}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 12px",
            background: bg,
            borderLeft: `3px solid ${color}`,
          }}
        >
          <Icon size={14} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: colors.text, lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Execution Timeline Component
// ─────────────────────────────────────────────────────────────
function ExecutionTimeline({ timeline }) {
  if (!timeline?.length) {
    return <div style={{ color: colors.muted, fontSize: 12 }}>No timeline data available</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {timeline.map((step, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 16,
            position: "relative",
          }}
        >
          {/* Timeline line */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 24,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: step.was_necessary ? colors.accent : colors.warning,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {step.step_number}
            </div>
            {i < timeline.length - 1 && (
              <div
                style={{
                  width: 2,
                  flex: 1,
                  background: colors.border,
                  minHeight: 20,
                }}
              />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, paddingBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                {step.action_taken}
              </span>
              {step.was_necessary ? (
                <span
                  style={{
                    padding: "2px 6px",
                    fontSize: 9,
                    background: colors.accentLight,
                    color: colors.accent,
                    fontWeight: 600,
                  }}
                >
                  NECESSARY
                </span>
              ) : (
                <span
                  style={{
                    padding: "2px 6px",
                    fontSize: 9,
                    background: colors.warningLight,
                    color: colors.warning,
                    fontWeight: 600,
                  }}
                >
                  OPTIONAL
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.6 }}>
              {step.reasoning_given}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Context Usage Step Component
// ─────────────────────────────────────────────────────────────
function ContextUsageStep({ step }) {
  const [expanded, setExpanded] = useState(false);

  const hasIgnored = step.context_ignored?.key_fields?.length > 0;
  const impactColor =
    step.context_ignored?.impact === "high"
      ? colors.danger
      : step.context_ignored?.impact === "medium"
      ? colors.warning
      : colors.muted;

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        marginBottom: 8,
        background: "white",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {step.step_number}
        </span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: colors.text }}>
          {step.step_name}
        </span>
        {hasIgnored && (
          <span
            style={{
              padding: "2px 6px",
              fontSize: 9,
              background: colors.warningLight,
              color: colors.warning,
              fontWeight: 600,
            }}
          >
            CONTEXT IGNORED
          </span>
        )}
      </button>

      {expanded && (
        <div style={{ padding: "0 12px 12px 44px" }}>
          {/* Context Available */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              <Info size={10} />
              Context Available
            </div>
            <p style={{ fontSize: 11, color: colors.text, margin: 0, marginBottom: 6 }}>
              {step.context_available?.description}
            </p>
            {step.context_available?.key_fields?.map((field, i) => (
              <div
                key={i}
                style={{
                  padding: "4px 8px",
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  background: colors.bg,
                  marginBottom: 4,
                  borderLeft: `2px solid ${colors.border}`,
                }}
              >
                {field}
              </div>
            ))}
          </div>

          {/* Context Used */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                color: colors.accent,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              <Eye size={10} />
              Context Used
            </div>
            <p style={{ fontSize: 11, color: colors.text, margin: 0, marginBottom: 6 }}>
              {step.context_used?.description}
            </p>
            {step.context_used?.key_fields?.map((field, i) => (
              <div
                key={i}
                style={{
                  padding: "4px 8px",
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  background: colors.accentLight,
                  marginBottom: 4,
                  borderLeft: `2px solid ${colors.accent}`,
                }}
              >
                {field}
              </div>
            ))}
          </div>

          {/* Context Ignored */}
          {hasIgnored && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  color: impactColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 6,
                }}
              >
                <EyeOff size={10} />
                Context Ignored ({step.context_ignored?.impact} impact)
              </div>
              <p style={{ fontSize: 11, color: colors.text, margin: 0, marginBottom: 6 }}>
                {step.context_ignored?.description}
              </p>
              {step.context_ignored?.key_fields?.map((field, i) => (
                <div
                  key={i}
                  style={{
                    padding: "4px 8px",
                    fontSize: 10,
                    fontFamily: fonts.mono,
                    background: colors.warningLight,
                    marginBottom: 4,
                    borderLeft: `2px solid ${colors.warning}`,
                  }}
                >
                  {field}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reasoning Decision Component
// ─────────────────────────────────────────────────────────────
function ReasoningDecision({ decision }) {
  const qualityColor =
    decision.reasoning_quality === "sound"
      ? colors.accent
      : decision.reasoning_quality === "flawed"
      ? colors.danger
      : colors.warning;

  return (
    <div
      style={{
        padding: "12px 16px",
        border: `1px solid ${colors.border}`,
        marginBottom: 8,
        background: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: qualityColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            color: "white",
          }}
        >
          {decision.step_number}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {decision.decision_point}
        </span>
        <span
          style={{
            padding: "2px 8px",
            fontSize: 9,
            background:
              decision.reasoning_quality === "sound" ? colors.accentLight : colors.dangerLight,
            color: qualityColor,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {decision.reasoning_quality}
        </span>
      </div>
      <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.6, marginLeft: 32 }}>
        {decision.reasoning_provided}
      </div>
      {decision.reasoning_gaps?.length > 0 && (
        <div style={{ marginTop: 8, marginLeft: 32 }}>
          <div style={{ fontSize: 10, color: colors.danger, fontWeight: 600, marginBottom: 4 }}>
            Reasoning Gaps:
          </div>
          {decision.reasoning_gaps.map((gap, i) => (
            <div
              key={i}
              style={{
                padding: "4px 8px",
                fontSize: 10,
                background: colors.dangerLight,
                marginBottom: 4,
                borderLeft: `2px solid ${colors.danger}`,
              }}
            >
              {gap}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Goal Evaluation Component
// ─────────────────────────────────────────────────────────────
function GoalEvaluation({ goalEval }) {
  if (!goalEval) return null;

  const qualityColor =
    goalEval.completion_quality === "perfect"
      ? colors.accent
      : goalEval.completion_quality === "partial"
      ? colors.warning
      : colors.danger;

  return (
    <div>
      {/* Goal Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 0",
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
            }}
          >
            User Task
          </div>
          <div style={{ fontSize: 13, fontFamily: fonts.heading, color: colors.text }}>
            {goalEval.user_task}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {goalEval.goal_completed ? (
            <CheckCircle2 size={20} color={colors.accent} />
          ) : (
            <XCircle size={20} color={colors.danger} />
          )}
          <span
            style={{
              padding: "4px 10px",
              fontSize: 10,
              background: goalEval.goal_completed ? colors.accentLight : colors.dangerLight,
              color: goalEval.goal_completed ? colors.accent : colors.danger,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {goalEval.completion_quality}
          </span>
        </div>
      </div>

      {/* Requirements */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            color: colors.muted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Requirements Analysis
        </div>
        {goalEval.requirements_analysis?.map((req, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 12px",
              background: req.satisfied ? colors.accentLight : colors.dangerLight,
              borderLeft: `3px solid ${req.satisfied ? colors.accent : colors.danger}`,
              marginBottom: 8,
            }}
          >
            {req.satisfied ? (
              <CheckCircle2 size={14} color={colors.accent} style={{ flexShrink: 0, marginTop: 1 }} />
            ) : (
              <XCircle size={14} color={colors.danger} style={{ flexShrink: 0, marginTop: 1 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: colors.text, marginBottom: 4 }}>
                {req.requirement}
              </div>
              <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>{req.evidence}</div>
              <div style={{ fontSize: 10, color: colors.light, marginTop: 4 }}>
                Satisfied at Step {req.step_that_satisfied}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Output Correctness */}
      <div>
        <div
          style={{
            fontSize: 10,
            color: colors.muted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Output Correctness
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div
            style={{
              padding: 12,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ fontSize: 10, color: colors.muted, marginBottom: 6 }}>EXPECTED</div>
            <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
              {goalEval.output_correctness?.expected_output}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
            <ArrowRight size={16} color={colors.light} />
          </div>
          <div
            style={{
              padding: 12,
              background: goalEval.output_correctness?.matches_goal ? colors.accentLight : colors.dangerLight,
              border: `1px solid ${goalEval.output_correctness?.matches_goal ? colors.accent : colors.danger}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: goalEval.output_correctness?.matches_goal ? colors.accent : colors.danger,
                marginBottom: 6,
              }}
            >
              ACTUAL {goalEval.output_correctness?.matches_goal ? "✓" : "✗"}
            </div>
            <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
              {goalEval.output_correctness?.final_output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Analysis View Component
// ─────────────────────────────────────────────────────────────
export default function AnalysisView({ analysis }) {
  if (!analysis) {
    return (
      <div style={{ padding: 24, color: colors.muted, fontFamily: fonts.body }}>
        No analysis data available
      </div>
    );
  }

  const { execution_timeline, context_tracking, reasoning_forensics, goal_evaluation, summary } = analysis;

  const contextBlindnessBadge = context_tracking?.context_blindness_detected
    ? { text: `${context_tracking.context_blindness_count} ISSUES`, bg: colors.dangerLight, color: colors.danger }
    : { text: "CLEAR", bg: colors.accentLight, color: colors.accent };

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
        overflow: "auto",
      }}
    >
      {/* Main Content */}
      <div style={{ padding: "20px", overflow: "auto", flex: 1 }}>
        {/* What Went Right/Wrong Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                color: colors.accent,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              <CheckCircle2 size={12} />
              What Went Right
            </div>
            <WhatWentSection items={summary?.what_went_right} type="right" />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                color: colors.danger,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              <XCircle size={12} />
              What Went Wrong
            </div>
            <WhatWentSection items={summary?.what_went_wrong} type="wrong" />
          </div>
        </div>

        {/* Root Cause */}
        {summary?.root_cause_summary && (
          <div
            style={{
              padding: "12px 16px",
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              <Lightbulb size={12} />
              Root Cause Summary
            </div>
            <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
              {summary.root_cause_summary}
            </div>
          </div>
        )}

        {/* Collapsible Sections */}
        <CollapsibleSection
          title="Execution Timeline"
          icon={Activity}
          badge={{ text: `${execution_timeline?.length || 0} STEPS`, bg: colors.bg, color: colors.muted }}
        >
          <ExecutionTimeline timeline={execution_timeline} />
        </CollapsibleSection>

        <CollapsibleSection title="Goal Evaluation" icon={Target} defaultOpen={true}>
          <GoalEvaluation goalEval={goal_evaluation} />
        </CollapsibleSection>

        <CollapsibleSection title="Context Tracking" icon={Eye} badge={contextBlindnessBadge} defaultOpen={false}>
          {context_tracking?.per_step_context_usage?.map((step, i) => (
            <ContextUsageStep key={i} step={step} />
          ))}
        </CollapsibleSection>

        <CollapsibleSection title="Reasoning Forensics" icon={Brain} defaultOpen={false}>
          {reasoning_forensics?.decision_graph?.map((decision, i) => (
            <ReasoningDecision key={i} decision={decision} />
          ))}
        </CollapsibleSection>
      </div>
    </div>
  );
}
