import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../components/helper/Breadcrumb";
import CustomSelect from "../components/ui/CustomSelect";
import {
  ArrowRight,
  Database,
  Zap,
  Activity,
  PlusCircle,
  Grid3X3,
  Percent,
  BookOpen,
  Code,
  BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react";

// Design tokens - consistent with existing Spolm styling
const fonts = {
  heading: '"Libre Baskerville", Georgia, serif',
  body: "Poppins, system-ui, sans-serif",
};

const colors = {
  text: "#1e293b",
  muted: "#64748b",
  border: "gainsboro",
  accent: "#10b981",
  coral: "coral",
};

export default function Dashboard({ user }) {
  const [dateRange, setDateRange] = useState("today");

  // Spolm metrics
  const stats = {
    totalInteractions: 3,
    retrievalUsage: "0%",
    retrievalEvents: 0,
    addEvents: 0,
  };

  return (
    <div style={{ display: "flex", fontFamily: fonts.body, color: colors.text }}>
      <Sidebar user={user} />
      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {/* Breadcrumb */}
        <div style={{ padding: "8px 18px", borderBottom: `1px solid ${colors.border}` }}>
          <Breadcrumb items={["Personal"]} />
        </div>

        {/* Header with Hello and Date Picker */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 18px" }}>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 400 }}>
            Hello,{" "}
            <span style={{ color: colors.coral, opacity: 0.7 }}>
              {user?.displayName || "User"}
            </span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarIcon size={18} color="black" />
            <CustomSelect
              options={[
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "last-7-days", label: "Last 7 days" },
                { value: "last-30-days", label: "Last 30 days" },
              ]}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: 140, fontFamily: fonts.body }}
            />
          </div>
        </div>

        {/* Stats Row - 4 cards like Mem0 */}
        <div style={{ display: "flex", gap: 10, padding: "0 18px", marginTop: 8 }}>
          {[
            { icon: Grid3X3, label: "Total Interactions", value: stats.totalInteractions, color: colors.accent },
            { icon: Percent, label: "Retrieval API Usage", value: stats.retrievalUsage, color: colors.coral },
            { icon: Activity, label: "Retrieval Events", value: stats.retrievalEvents, color: colors.accent },
            { icon: PlusCircle, label: "Add Events", value: stats.addEvents, color: colors.muted },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                border: `1px solid ${colors.border}`,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <stat.icon size={16} color={stat.color} />
                <span style={{ fontSize: 13, color: colors.muted }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: fonts.heading }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Two-panel row: Agent Runs + Stored Interactions */}
        <div style={{ display: "flex", gap: 10, padding: "10px 18px" }}>
          {/* Agent Runs */}
          <div style={{ flex: 1, border: `1px solid ${colors.border}`, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Agent Runs</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: fonts.heading, marginTop: 4 }}>0</div>
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: colors.text,
                  color: "#fff",
                  border: "none",
                  fontSize: 12,
                  fontFamily: fonts.body,
                  cursor: "pointer",
                }}
              >
                View Runs <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted, fontSize: 13 }}>
              No run activity for this range.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              <span style={{ width: 8, height: 8, background: colors.accent, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: colors.muted, textTransform: "uppercase" }}>Total Runs</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: colors.muted }}>View Breakdown</span>
            </div>
          </div>

          {/* Stored Interactions */}
          <div style={{ flex: 1, border: `1px solid ${colors.border}`, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Stored Interactions</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: fonts.heading, marginTop: 4 }}>0</div>
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: colors.text,
                  color: "#fff",
                  border: "none",
                  fontSize: 12,
                  fontFamily: fonts.body,
                  cursor: "pointer",
                }}
              >
                View Interactions <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted, fontSize: 13 }}>
              No interaction activity for this range.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              <span style={{ width: 8, height: 8, background: "#3b82f6", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: colors.muted, textTransform: "uppercase" }}>Total Interactions</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: colors.muted }}>View Breakdown</span>
            </div>
          </div>
        </div>

        {/* Explore the Platform */}
        <div style={{ padding: "16px 18px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: fonts.heading, marginBottom: 12 }}>
            Explore the Platform
          </h2>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { icon: Code, title: "SDK Integration", desc: "Capture agent interactions with our lightweight SDK", color: colors.accent },
              { icon: BarChart3, title: "Analytics", desc: "Query and analyze your agent interaction data", color: colors.coral },
              { icon: BookOpen, title: "Documentation", desc: "Learn how to build learning loops", color: colors.text },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  flex: 1,
                  padding: 16,
                  border: `1px solid ${colors.border}`,
                  cursor: "pointer",
                }}
              >
                <item.icon size={18} color={item.color} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: colors.muted, lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
