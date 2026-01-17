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
        {traces &&
          traces.map((t, idx) => {
            const logData = t.logData
              ? typeof t.logData === "string"
                ? JSON.parse(t.logData)
                : t.logData
              : null;
            const analysis = t.analysis
              ? typeof t.analysis === "string"
                ? JSON.parse(t.analysis)
                : t.analysis
              : null;
            if (!logData) return null;
            return (
              <tr
                key={idx}
                onClick={() =>
                  navigate(`/logs/${logData.run_id}`, {
                    state: { run: logData, analysis: analysis },
                  })
                }
                style={{
                  cursor: "pointer",
                  background: idx % 2 === 1 ? "whitesmoke" : "transparent",
                }}
                title={`Open logs for ${logData.run_id || "unknown"}`}
              >
                <td style={cellStyle}>
                  <div>
                    <p>{t.agent_id}</p>
                    <p style={{ fontSize: "8px" }}>
                      {logData.run_id
                        ? logData.run_id.slice(0, 18) + "..."
                        : "N/A"}
                    </p>
                  </div>
                </td>
                <td style={cellStyle}>
                  <p
                    style={{
                      backgroundColor:
                        logData.status === "complete" ? "#98FB98" : "#FA8072",
                      color:
                        logData.status === "complete" ? "#008000" : "#DC143C",
                      outline:
                        logData.status === "complete"
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
                    {logData.status || "unknown"}
                  </p>
                </td>
                <td style={cellStyle}>
                  {logData.user_task
                    ? logData.user_task.slice(0, 25) + "..."
                    : "N/A"}
                </td>
                <td style={cellStyle}>
                  {logData.final_output
                    ? logData.final_output.slice(0, 25) + "..."
                    : "N/A"}
                </td>
                <td style={cellStyle}>
                  {logData.steps
                    ? (typeof logData.steps === "string"
                        ? JSON.parse(logData.steps)
                        : logData.steps
                      ).length
                    : 0}
                </td>
                <td style={cellStyle}>
                  {logData.duration
                    ? (logData.duration / 1000).toPrecision(3) + " sec"
                    : "N/A"}
                </td>
                <td style={cellStyle}>{logData.start_timestamp || "N/A"}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
