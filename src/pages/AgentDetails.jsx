import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import AgentViewer from "../components/AgentViewer";
import Breadcrumb from "../components/helper/Breadcrumb";
import ModalShifter from "../components/helper/ModalShifter";
import {
  ChartBar,
  Code,
  Code2,
  LayoutDashboardIcon,
  LayoutIcon,
  Logs,
  TrendingUpIcon,
  ViewIcon,
  Activity,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import LogDetail from "./LogDetail";
import LogsComponent from "../components/(logs)/logsComponent/LogsComponent";
import LogsTable from "../components/(logs)/logsHelpers/LogsTable";

function SectionedAgentDetails({ agent }) {
  return (
    <div style={{ paddingLeft: "18px", paddingBottom: 10 }}>
      <div
        style={{
          fontWeight: 700,
          fontFamily: "Libre Baskerville",
          fontSize: 18,
          marginBottom: 4,
        }}
      >
        {agent?.name}
      </div>
      <div style={{ fontSize: 14, marginBottom:"4px"  }}>{agent?.description}</div>
      <div style={{ display: "flex", gap: 16, fontSize: 12, }}>
        <span style={{ color: "#028a0f", fontWeight: 500 }}>
          Connected to {agent?.repo}
        </span>
        <div style={{display:"flex"}}>
          <span>Agent ID:</span>{"  "}
          <code
            style={{
              background: "#f3f4f6",
              padding: "2px 4px",
              color: "#374151",
              fontFamily: "monospace",
              fontSize: 11,
              border:"1px solid gainsboro",
              marginLeft:"8px"
            }}
          >
            {agent?.agentId?.slice(0, 12) || "-"}...
          </code>
        </div>
      </div>
    </div>
  );
}

function AgentDetails({ user }) {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [agentRuns, setAgentRuns] = useState([]);
  const [section, setSection] = useState("Overview");

  const options = [
    { name: "Overview", icon: <LayoutDashboardIcon size={15} /> },
    { name: "Code Repository", icon: <Code2 size={15} /> },
    { name: "Logs", icon: <Logs size={15} /> },
    { name: "Patterns", icon: <TrendingUpIcon size={15} /> },
    { name: "Statistics", icon: <ChartBar size={15} /> },
  ];

  useEffect(() => {
    const load = async () => {
      const orgId = JSON.parse(localStorage.getItem("spolm_user_" + user.uid)).orgId;
      if (!orgId) return;
      try {
        const d = await getDoc(doc(db, "organizations", orgId, "agents", id));
        if (d.exists()) setAgent({ id: d.id, ...(d.data() || {}) });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  // Stream runs for this agent
  useEffect(() => {
    if (!agent?.agentId) return;
    let orgId = null;
    try {
      const raw = localStorage.getItem(`spolm_user_${user.uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        orgId = parsed?.orgId || parsed?.organizationId || null;
      }
    } catch (e) {
      console.warn("Failed to read orgId from cache", e);
    }
    if (!orgId) return;

    const q = query(
      collection(db, "organizations", orgId, "logs"),
      where("agentId", "==", agent.agentId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          const createdAt =
            data?.createdAt && typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : data?.createdAt || null;
          return { id: d.id, ...data, createdAt };
        });
        setAgentRuns(items);
      },
      (err) => {
        console.error("agent runs listener error", err);
      }
    );

    return () => unsub();
  }, [agent?.agentId, user]);

  const containerStyle = {
    fontSize: 13,
    color: "#374151",
    height: "100%",
    boxSizing: "border-box",
    overflowY: "auto",
    borderTop: "1px solid gainsboro",
  };
  const labelStyle = {
    fontSize: 11,
    paddingLeft: "18px",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
  };
  const boxStyle = {
    border: "1px solid #e5e7eb",
    padding: 12,
    background: "#fafafa",
    marginBottom: 12,
    fontFamily: "monospace",
    fontSize: 12,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: 300,
    overflowY: "auto",
  };
  const statCardStyle = {
    border: "1px solid #e5e7eb",
    padding: 12,
    background: "#fafafa",
    textAlign: "center",
    minWidth: 0,
  };

  return (
    <div style={{ display: "flex", maxHeight: "100vh", overflow: "hidden" }}>
      <Sidebar
        user={user}
        organization={{ name: "Spolm Enterprise", initials: "SE" }}
      />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px",  flexShrink: 0 }}>
          <Breadcrumb items={["Personal", "Agents", id]} />
        </div>
        <SectionedAgentDetails agent={agent} />
        <ModalShifter
          subOptions={options}
          setSubOptionMode={setSection}
          subOptionMode={section}
        />
        <div style={{ flex: 1, overflowY: "hidden" }}>
          {section === "Overview" && (
            <div style={containerStyle}>
              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>Description</div>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: 12,
                    background: "#fafafa",
                    lineHeight: 1.6,
                  }}
                >
                  {agent?.description || "No description provided."}
                </div>
              </div>
              <div>
                <div style={labelStyle}>
                  Main Reasoning Prompt / Instructions
                </div>
                <div
                  style={{
                    ...boxStyle,
                    background: "#111827",
                    color: "#e5e7eb",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  {agent?.instructions || "No instructions provided."}
                </div>
              </div>
              {agent?.rubrics && agent.rubrics.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={labelStyle}>Evaluation Rubrics</div>
                  {agent.rubrics.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: 10,
                        marginBottom: 8,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {r.key}
                      </div>
                      {r.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginBottom: 4,
                          }}
                        >
                          {r.description}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: "monospace",
                          color: "#374151",
                        }}
                      >
                        Criteria: {r.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === "Code Repository" && (
            <div style={containerStyle}>
              <div
                style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
              ></div>
              <div style={{ height: "100%" }}>
                <AgentViewer agent={agent} />
              </div>
            </div>
          )}

          {section === "Logs" && (
            <div style={containerStyle}>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 12,
                  background: "#fafafa",
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
               <LogsTable traces={agentRuns} loading={true}/>
              </div>
            </div>
          )}

          {section === "Patterns" && (
            <div style={containerStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div style={statCardStyle}>
                  <div style={labelStyle}>Execution Count</div>
                  <div
                    style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}
                  >
                    0
                  </div>
                </div>
                <div style={statCardStyle}>
                  <div style={labelStyle}>Success Rate</div>
                  <div
                    style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}
                  >
                    -
                  </div>
                </div>
                <div style={statCardStyle}>
                  <div style={labelStyle}>Avg Response</div>
                  <div
                    style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}
                  >
                    -
                  </div>
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 12,
                  background: "#fafafa",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                  Patterns will be analyzed and displayed here.
                </p>
              </div>
            </div>
          )}

          {section === "Statistics" && (
            <div style={containerStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    ...statCardStyle,
                    background: "#e8f9ee",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <div style={{ ...labelStyle, color: "#28a155" }}>
                    Total Runs
                  </div>
                  <div
                    style={{ fontSize: 28, fontWeight: 700, color: "#28a155" }}
                  >
                    0
                  </div>
                </div>
                <div
                  style={{
                    ...statCardStyle,
                    background: "#feecec",
                    border: "1px solid #fca5a5",
                  }}
                >
                  <div style={{ ...labelStyle, color: "#c62828" }}>
                    Failed Runs
                  </div>
                  <div
                    style={{ fontSize: 28, fontWeight: 700, color: "#c62828" }}
                  >
                    0
                  </div>
                </div>
                <div style={statCardStyle}>
                  <div style={labelStyle}>Total Tokens</div>
                  <div
                    style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}
                  >
                    -
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AgentDetails;
