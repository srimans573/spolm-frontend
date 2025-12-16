import React, { useState } from "react";
import ProtectedRoute from "./Protected";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import Sidebar from "../components/Sidebar";

function SpolmChat({ user }) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Welcome to Spolm Chat — ask me anything about your agents.",
    },
  ]);

  const handleSend = async (text) => {
    setMessages((m) => [...m, { from: "user", text }]);
    // placeholder: echo bot with small delay
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: `Echo: ${text}` }]);
    }, 600);
  };

  return (
    <ProtectedRoute user={user}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          user={user}
          organization={{ name: "Spolm Enterprise", initials: "SE" }}
        />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", padding:"20px" }}>
          <div
            style={{
              padding: "10px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h1
                style={{
                  marginTop: 0,
                  fontFamily: "Libre Baskerville, sans-serif",
                  margin: "0px",
                }}
              >
                Spolm AI
              </h1>
              <p
                style={{ color: "black", fontFamily: "Poppins", margin: "0px" }}
              >
                Ask Spolm AI to diagnose or fix code for you!
              </p>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <div style={{ flex: 1, overflow: "auto" }}>
              <ChatWindow messages={messages} />
            </div>

            <ChatInput onSend={handleSend} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default SpolmChat;