import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
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
  // Normalize createdAt values coming from Firestore (Timestamp), strings, numbers, or Date
  const parseDate = (value) => {
    if (!value) return null;
    try {
      if (typeof value === "string") return new Date(value);
      if (typeof value === "number") return new Date(value);
      if (value instanceof Date) return value;
      if (typeof value.toDate === "function") return value.toDate(); // Firestore Timestamp
    } catch (e) {
      return null;
    }
    return null;
  };

  const createdDate = parseDate(agent?.createdAt);
  const createdLabel = createdDate
    ? createdDate.toLocaleDateString()
    : "Unknown";

  return (
    <div style={{ paddingLeft: "18px", paddingBottom: 0 }}>
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
      <div style={{ fontSize: 14, marginBottom: "4px" }}>
        {agent?.description}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
        <span style={{ color: "#028a0f", fontWeight: 500 }}>
          Created on {createdLabel}
        </span>
        <div style={{ display: "flex" }}>
          <span>Agent ID:</span>
          {"  "}
          <code
            style={{
              background: "#f3f4f6",
              padding: "2px 4px",
              color: "#374151",
              fontFamily: "monospace",
              fontSize: 11,
              border: "1px solid gainsboro",
              marginLeft: "8px",
            }}
          >
            {agent?.agentId || agent?.id}
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
  const [section, setSection] = useState("Traces");

  const options = [{ name: "Traces", icon: <Logs size={15} /> }];

  useEffect(() => {
    const load = async () => {
      const orgId = JSON.parse(
        localStorage.getItem("spolm_user_" + user.uid),
      ).orgId;
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
      orderBy("createdAt", "desc"),
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
      },
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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
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
        <div
          style={{
            padding: "8px 18px",
            borderBottom: "1px solid gainsboro",
            position: "sticky",
            width: "100%",
          }}
        >
          <Breadcrumb items={["Personal", "Agents", id]} /> {/* Header */}
        </div>
        <div
          style={{
            padding: "18px 0px",
          }}
        >
          <SectionedAgentDetails agent={agent} />
        </div>
        <ModalShifter
          subOptions={options}
          setSubOptionMode={setSection}
          subOptionMode={section}
        />
        <div style={{ flex: 1, overflowY: "hidden" }}>
          {section === "Traces" && (
            <div style={containerStyle}>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {agentRuns.length != 0 ? (
                  <LogsTable traces={agentRuns} loading={true} />
                ) : (
                  <div style={{position:"absolute", top:"50%", left:"50%"}}>Nothing to see here yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AgentDetails;
