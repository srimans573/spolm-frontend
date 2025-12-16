import React, { useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import ActionButton from "./ActionButton";
import GitHubConnect from "./GitHubConnect";

function AgentCreateModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [repo, setRepo] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const colRef = collection(db, "users", user.uid, "agents");
      // generate a stable unique id for the agent
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `aid_${Date.now().toString(36)}_${Math.random()
              .toString(36)
              .slice(2, 9)}`;

      const docRef = await addDoc(colRef, {
        name,
        description,
        language,
        repo,
        uniqueId,
        createdAt: serverTimestamp(),
      });
      if (onCreated)
        onCreated({
          id: docRef.id,
          uniqueId,
          name,
          description,
          language,
          repo,
        });
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 480,
          background: "white",
          border: "1px solid black",
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: 0, fontFamily: "Libre Baskerville, serif" }}>
          Create Agent
        </h2>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <label>Agent Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agent name"
            className="modal-input"
          />
          <label>Agent Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className="modal-input"
          />
          <label>Language</label>
          <input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language (e.g. Python, JS)"
            className="modal-input"
          />

          <label>Choose GitHub repository</label>
          <GitHubConnect onSelectRepo={(r) => setRepo(r)} onToken={() => {}} />
          <div style={{ marginTop: 8 }}>
            <input
              value={repo}
              disabled
              onChange={(e) => setRepo(e.target.value)}
              placeholder="owner/repo"
              className="modal-input"
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              border: "1px solid black",
              background: "white",
              width:"50%",
              borderRadius: 0,
            }}
          >
            Cancel
          </button>
          
            <button
              style={{
              padding: "8px 12px",
              border: "1px solid black",
              background: "orange",
              borderRadius: 0,
              width:"50%",
            }}
              label={saving ? "Saving..." : "Create Agent"}
              onClick={handleSave}
            >
              Create Agent
            </button>
      
        </div>
      </div>
    </div>
  );
}

export default AgentCreateModal;
