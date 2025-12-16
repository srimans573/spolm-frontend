import React, { useState } from "react";
import ProtectedRoute from "./Protected";
import Sidebar from "../components/Sidebar";
import AgentList from "../components/AgentList";

import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/helper/Breadcrumb";

function Agents({ user }) {
  const navigate = useNavigate();

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
                  onClick={() => navigate("/agents/create")}
                  style={{ border: "1px solid black" }}
                >
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
      {/* Create page is now a full route at /agents/create */}
    </ProtectedRoute>
  );
}

export default Agents;
