import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./ui/CustomSelect";
import { auth, db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

function AgentList({ onSelect }) {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      const orgId = JSON.parse(localStorage.getItem("spolm_user_"+user.uid)).orgId;
      if (!user) return;
      try {
        const colRef = collection(db, "organizations", orgId, "agents");
        const snap = await getDocs(colRef);
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        setAgents(items.reverse());
      } catch (err) {
        console.error(err);
      }
    };
    const unsub = auth.onAuthStateChanged(() => load());
    load();
    return () => unsub();
  }, []);

  const languages = Array.from(
    new Set(agents.map((a) => a.language).filter(Boolean))
  ).sort();

  const filtered = agents
    .filter((a) => {
      const q = query.trim().toLowerCase();
      if (languageFilter && a.language !== languageFilter) return false;
      if (!q) return true;
      return (
        (a.name || "").toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q) ||
        (a.repo || "").toLowerCase().includes(q)
      );
    })
    .sort((x, y) => {
      const a = x[sortKey] || "";
      const b = y[sortKey] || "";
      if (a < b) return sortDir === "asc" ? -1 : 1;
      if (a > b) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "fit-content", display: "flex", gap: 10 }}>
          <input
            placeholder="Search name, description, repos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              border: "1px solid #e5e7eb",
              padding: "4px 12px",
              fontSize: "14px",
              minWidth: "250px",
              fontFamily: "inherit",
            }}
          />
          <div style={{ width: 160 }}>
            <CustomSelect
              options={[
                { value: "createdAt", label: "Newest" },
                { value: "name", label: "Name" },
                { value: "language", label: "Language" },
              ]}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <p
          style={{
            float: "right",
            fontSize: "12px",
            fontStyle: "italic",
            color: "gray",
          }}
        >
          Showing {filtered.length} of {agents.length} agents
        </p>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No agents match your filters.</div>
      ) : (
        <div style={{ overflow: "auto", background: "white" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "#fafafa",
                    borderBottom: "1px solid #ddd",
                    color: "#6b7280",
                  }}
                >
                  Agent
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "#fafafa",
                    borderBottom: "1px solid #ddd",
                    color: "#6b7280",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "#fafafa",
                    borderBottom: "1px solid #ddd",
                    color: "#6b7280",
                  }}
                >
                  Prompt
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "#fafafa",
                    borderBottom: "1px solid #ddd",
                    color: "#6b7280",
                  }}
                >
                  Repo
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "#fafafa",
                    borderBottom: "1px solid #ddd",
                    color: "#6b7280",
                  }}
                >
                  Created At
                </th>
                <th
                  style={{
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    background: "#fafafa",
                    borderBottom: "1px solid #ddd",
                    color: "#6b7280",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const bg = idx % 2 === 1 ? "whitesmoke" : "transparent";
                const createdAt = (() => {
                  if (!a.createdAt) return "-";
                  try {
                    if (a.createdAt.toDate)
                      return a.createdAt.toDate().toLocaleString();
                    if (a.createdAt.seconds)
                      return new Date(
                        a.createdAt.seconds * 1000
                      ).toLocaleString();
                    return new Date(a.createdAt).toLocaleString();
                  } catch (e) {
                    return String(a.createdAt);
                  }
                })();

                return (
                  <tr
                    key={a.id}
                    onClick={() =>
                      onSelect ? onSelect(a) : navigate(`/agents/${a.id}`)
                    }
                    title={a.name}
                    style={{ cursor: "pointer", background: bg }}
                  >
                    <td
                      style={{
                        padding: "4px 8px",
                        borderBottom: "1px solid #eee",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 220,
                      }}
                    >
                      <div style={{ fontSize: "13px" }}>{a.name}</div>
                      <div style={{ fontSize: 9, color: "#6b7280" }}>
                        Agent ID: {a.id}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        maxWidth: 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "13px",
                      }}
                    >
                      {a.description}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        maxWidth: 200,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "13px",
                      }}
                    >
                      {a.instructions.slice(0, 30)}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "13px",
                      }}
                    >
                      {a.repo || "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                      {createdAt}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        textAlign: "right",
                      }}
                    ></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AgentList;
