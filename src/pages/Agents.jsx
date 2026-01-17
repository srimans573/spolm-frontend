import React, { useState } from "react";
import ProtectedRoute from "./Protected";
import Sidebar from "../components/Sidebar";
import AgentList from "../components/AgentList";
import AgentCreateModal from "../components/AgentCreateModal";

import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/helper/Breadcrumb";
import { Plus } from "lucide-react";

function Agents({ user }) {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <ProtectedRoute user={user}>
      <div style={{ display: "flex", minHeight: "100vh", width:"100%" }}>
        <Sidebar
          user={user}
          organization={{ name: "Spolm Enterprise", initials: "SE" }}
        />
        <div style={{ width: "100%" }}>
          <main style={{ flex: 1,  }}>
            <div
              style={{
                padding: "8px 18px",
                borderBottom: "1px solid gainsboro",
                position: "sticky",
                width: "100%",
              }}
            >
              <Breadcrumb items={["Personal", "Agents"]} /> {/* Header */}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 18px",
              }}
            >
              <div>
                <h2
                  style={{
                    marginTop: 0,
                    fontFamily: "Libre Baskerville, sans-serif",
                    margin: "0px",
                  }}
                >
                  Agents
                </h2>
                <p
                  style={{
                    color: "black",
                    fontFamily: "Poppins",
                    margin: "0px",
                  }}
                >
                  View your agents here
                </p>
              </div>
              <div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    border: "1px solid black",
                    background: "#FF6B6B",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  <Plus size={16} />
                  Create Agent
                </button>
              </div>
            </div>
            <div style={{ padding: "0px 18px" }}>
              <AgentList onSelect={(a) => navigate(`/agents/${a.id}`)} />
            </div>
          </main>
        </div>
      </div>

      {/* Create Agent Modal */}
      <AgentCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(agent) => {
          // Optionally navigate to the new agent or refresh list
          navigate(`/agents/${agent.id}`);
        }}
      />
    </ProtectedRoute>
  );
}

export default Agents;
