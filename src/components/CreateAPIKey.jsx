import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { collection, getDoc } from "firebase/firestore";
import { X, Key, Copy } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Design Tokens — Matching existing design system
// ─────────────────────────────────────────────────────────────
const colors = {
  black: "#000000",
  white: "#ffffff",
  coral: "#FF6B6B",
  coralLight: "#FFE5E5",
  gray: "#666666",
  grayLight: "#f5f5f5",
  border: "#000000",
};

const fonts = {
  heading: '"Libre Baskerville", Georgia, serif',
  body: "Poppins, system-ui, sans-serif",
};

function generateSecureKey(length = 40) {
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
      const orgId = JSON.parse(
        localStorage.getItem("spolm_user_" + user.uid)
      ).orgId;

      const res = await fetch(
        "https://spolm-api-key-management.vercel.app/api/keys/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ name, description, apiKey, orgId }),
        }
      );

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
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        fontFamily: fonts.body,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: colors.white,
          border: `1px solid ${colors.black}`,
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.black}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: colors.coral,
                border: `1px solid ${colors.black}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Key size={18} color="#ffffff" />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontFamily: fonts.heading,
                  color: colors.black,
                  fontWeight: 400,
                }}
              >
                Create API Key
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: colors.gray,
                  fontFamily: fonts.body,
                }}
              >
                Generate a new key for API access
              </p>
            </div>
          </div>
          <div
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: colors.white,
              cursor: "pointer",
            }}
          >
            <X size={16} color="#000000" />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* Name Field */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
                fontFamily: fonts.body,
                color: colors.black,
              }}
            >
              Name <span style={{ color: colors.coral }}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My first API key"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 13,
                border: `1px solid ${colors.black}`,
                fontFamily: fonts.body,
                outline: "none",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
                fontFamily: fonts.body,
                color: colors.black,
              }}
            >
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Gmail Agents"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 13,
                border: `1px solid ${colors.black}`,
                fontFamily: fonts.body,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* API Key Field */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
                fontFamily: fonts.body,
                color: colors.black,
               
              }}
            >
              Generated API Key
            </label>
            <div style={{ display: "flex", width: "100%" }}>
              <input
                value={apiKey}
                readOnly
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "12px 14px",
                  fontSize: 12,
                  border: `1px solid ${colors.black}`,
                  borderRight: "none",
                  fontFamily: "monospace",
                  background: colors.grayLight,
                  boxSizing: "border-box",
                }}
              />
              <div
                onClick={handleCopy}
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  border: `1px solid ${colors.black}`,
                  background: colors.white,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
                title="Copy to clipboard"
              >
                <Copy size={16} color="#000000" />
              </div>
            </div>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 11,
                color: colors.gray,
                fontFamily: fonts.body,
              }}
            >
              Copy this key now — you won't be able to see it again after closing.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "#FEE2E2",
                border: `1px solid ${colors.coral}`,
                fontSize: 12,
                color: "#DC2626",
                marginBottom: 16,
                fontFamily: fonts.body,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${colors.black}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              fontFamily: fonts.body,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 500,
              border: `1px solid ${colors.black}`,
              background: colors.white,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            style={{
              fontFamily: fonts.body,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${colors.black}`,
              background: saving || !name.trim() ? colors.grayLight : colors.coral,
              color: saving || !name.trim() ? colors.gray : colors.white,
              cursor: saving || !name.trim() ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Create Key"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateApiKeyModal;
