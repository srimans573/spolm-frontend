import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { collection, getDoc } from "firebase/firestore";

function generateSecureKey(length = 40) {

  // generate a URL-safe base64-like token
  const array = new Uint8Array(length);
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  // convert to hex-like string
  return (
    "sk_" +
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length)
  );
}

function CreateApiKeyModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      // Generate a new key whenever modal opens
      const newKey = generateSecureKey(40);
      setApiKey(newKey);
      
    } else {
      // Reset state when closed
      setApiKey("");
      setName("");
      setDescription("");
      setError("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      // optionally show a toast
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const idToken = await user.getIdToken();
      const orgId = JSON.parse(localStorage.getItem("spolm_user_" + user.uid)).orgId;

      const res = await fetch("http://localhost:8080/api/keys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, description, apiKey, orgId}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Create failed: ${res.status}`);
      }

      const data = await res.json();

      const saved = {
        id: data.id,
        name,
        description,
        prefix: data.prefix,
        createdAt: data.createdAt,
      };

      if (onSave) onSave(saved);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create key");
    } finally {
      setSaving(false);
      handleClose();
    }
  };

  const handleClose = () => {
    // once closed, API key preview is gone — user must copy now
    setApiKey("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
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
          width: 560,
          background: "white",
          border: "1px solid black",
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "Libre Baskerville, serif",
            fontSize: 22,
          }}
        >
          Create API Key
        </h2>
        <p
          style={{
            marginTop: 8,
            marginBottom: 16,
            fontFamily: "Poppins, sans-serif",
            color: "#374151",
          }}
        >
          Name your API key and add a short description. An API key will be generated &
          shown once — copy it now.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 6,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My first API key"
              style={{ padding: 10, border: "1px solid black" }}
              required
            />
          </div>
          <div style={{ width: 220, display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: 12,
                marginBottom: 6,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Gmail Agents"
              style={{ padding: 10, border: "1px solid black" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 12,
              marginBottom: 6,
              display: "block",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            API Key
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={apiKey}
              readOnly
              style={{
                flex: 1,
                padding: 10,
                border: "1px solid black",
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                padding: "6px 8px",
                border: "1px solid black",
                background: "white",
                cursor: "pointer",
                width: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="black"
                height={20}
                viewBox="0 0 640 640"
              >
                <path d="M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z" />
              </svg>
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              fontFamily: "Poppins",
              padding: "8px 12px",
              border: "1px solid black",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            style={{
              fontFamily: "Poppins",
              padding: "8px 12px",
              border: "1px solid black",
              background: "black",
              color: "white",
              cursor: "pointer",
            }}
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateApiKeyModal;
