import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import example from "./mock/mock";
import {
  BotIcon,
  Calendar1Icon,
  ChartBarIncreasing,
  CircleCheckIcon,
  Clock10Icon,
  FlagIcon,
  List,
  PersonStandingIcon,
  RocketIcon,
  TabletIcon,
  UserCheck,
  UserRoundPen,
  WavesLadder,
} from "lucide-react";

/**
 * TracesTable Component
 * - Renders traces in a full table similar to Helicone's style
 * - Inline CSS only, no Tailwind
 *
 * Expected trace object shape:
 * {
 *   createdAt: "November 12 10:16 AM",
 *   status: "Success",
 *   request: "You are an expert t...",
 *   response: "Great choice! Cost...",
 *   model: "gpt-3.5-turbo-0125",
 *   totalTokens: 339,
 *   promptTokens: 234,
 *   completionTokens: 105,
 * }
 */
export default function LogsTable({ traces = [] }) {
  const navigate = useNavigate();
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    background: "white",
  };

  const headerStyle = {
    fontWeight: "500",
    background: "#fafafa",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    padding: "10px",
    fontSize: "12px",
    color: "gray",
    justifyContent: "center",
  };

  const cellStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
    width: "fit-content",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    justifyContent: "center",
    fontSize: "12px",
  };

  const statusPillStyle = (status) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 0,
    background: status === "Success" ? "#e8f9ee" : "#feecec",
    color: status === "Success" ? "#28a155" : "#c62828",
    fontWeight: "bold",
    fontSize: "12px",
  });

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BotIcon size={14} />
              <p>Agent</p>
            </div>
          </th>
          <th style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CircleCheckIcon size={14} />
              <p>Status</p>
            </div>
          </th>
          <th style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <UserRoundPen size={14} />
              <p>Task</p>
            </div>
          </th>
          <th style={headerStyle}>
            {" "}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FlagIcon size={14} />
              <p>Result</p>
            </div>
          </th>
          <th style={headerStyle}>
            {" "}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ChartBarIncreasing size={14} />
              <p>Steps</p>
            </div>
          </th>
          <th style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock10Icon size={14} />
              <p>Duration</p>
            </div>
          </th>
          <th style={headerStyle}>
            {" "}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar1Icon size={14} />
              <p>Created At</p>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {traces.map((t, idx) => (
          <tr
            key={idx}
            onClick={() => navigate(`/logs/${t.run_id}`, { state: { run: t } })}
            style={{
              cursor: "pointer",
              background: idx % 2 == 1 ? "whitesmoke" : "transparent",
            }}
            title={`Open logs for ${t.run_id}`}
          >
            <td style={cellStyle}>
              <div>
                <p>{t.agent_id}</p>
                <p style={{ fontSize: "8px" }}>
                  {t.run_id.slice(0, 18) + "..."}
                </p>
              </div>
            </td>
            <td style={cellStyle}>
              <p
                style={{
                  backgroundColor:
                    t.status == "complete" ? "#98FB98" : "#FA8072",
                  color: t.status == "complete" ? "#008000" : "#DC143C",
                  outline:
                    t.status == "complete"
                      ? "1px solid #008000"
                      : "1px solid #DC143C",
                  cursor: "pointer",
                  fontWeight: "600",
                  width: "50px",
                  textAlign: "center",
                  padding: "4px 8px",
                  fontSize: "10px",
                }}
              >
                {t.status}
              </p>
            </td>
            <td style={cellStyle}>{t.user_task.slice(0, 25) + "..."}</td>
            <td style={cellStyle}>{t.final_output.slice(0, 25) + "..."}</td>
            <td style={cellStyle}>{JSON.parse(t.steps).length}</td>
            <td style={cellStyle}>
              {(t.duration / 1000).toPrecision(3) + " sec"}
            </td>
            <td style={cellStyle}>{t.start_timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
