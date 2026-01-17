import React, { useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  X,
  Bot,
  Brain,
  Activity,
  Database,
  Zap,
  Info,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Design Tokens — Matching existing design system
// ─────────────────────────────────────────────────────────────
const fonts = {
  heading: '"Libre Baskerville", Georgia, serif',
  body: "Poppins, system-ui, sans-serif",
};

const colors = {
  black: "#000000",
  white: "#ffffff",
  coral: "#FF6B6B",
  coralLight: "#FFE5E5",
  gray: "#666666",
  grayLight: "#f5f5f5",
  border: "#000000",
};

// ─────────────────────────────────────────────────────────────
// Toggle Switch Component
// ─────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, label, description, icon: Icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: enabled ? colors.coralLight : colors.white,
        border: `1px solid ${colors.black}`,
        cursor: "pointer",
      }}
      onClick={() => onChange(!enabled)}
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: enabled ? colors.coral : colors.grayLight,
          border: `1px solid ${colors.black}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={enabled ? colors.white : colors.gray} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.black,
            marginBottom: 2,
            fontFamily: fonts.body,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: colors.gray,
            lineHeight: 1.5,
            fontFamily: fonts.body,
          }}
        >
          {description}
        </div>
      </div>
      <div
        style={{
          width: 35,
          height: 16,
          background: enabled ? colors.coral : colors.grayLight,
          border: `1px solid ${colors.black}`,
          padding: 2,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: colors.white,
            border: `1px solid ${colors.black}`,
            transform: enabled ? "translateX(18px)" : "translateX(0)",
            transition: "transform 0.15s ease",
          }}
        />
      </div>
    </div>
  );
}

function AgentCreateModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [traceAnalysis, setTraceAnalysis] = useState(true);
  const [experientialLearning, setExperientialLearning] = useState(true);
  const [patternDetection, setPatternDetection] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter an agent name");
      return;
    }
    setSaving(true);
    try {
      const user = auth.currentUser;
      const org = JSON.parse(localStorage.getItem(`spolm_user_${user.uid}`));
      if (!user || !org) throw new Error("Not authenticated");
      const colRef = collection(db, "organizations", org.orgId, "agents");
      const docRef = doc(colRef); // Generate ID first
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `aid_${Date.now().toString(36)}_${Math.random()
              .toString(36)
              .slice(2, 9)}`;

      await setDoc(docRef, {
        id: docRef.id, // Now the ID is stored in the document
        name,
        description,
        uniqueId,
        settings: {
          traceAnalysis,
          experientialLearning,
          patternDetection,
        },
        createdAt: serverTimestamp(),
      });
      if (onCreated)
        onCreated({
          id: docRef.id,
          uniqueId,
          name,
          description,
          settings: {
            traceAnalysis,
            experientialLearning,
            patternDetection,
          },
        });
      // Reset form
      setName("");
      setDescription("");
      setTraceAnalysis(true);
      setExperientialLearning(true);
      setPatternDetection(false);
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
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          background: colors.white,
          border: `1px solid ${colors.black}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
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
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontFamily: fonts.heading,
                  color: colors.black,
                }}
              >
                Create Agent
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: colors.gray,
                  fontFamily: fonts.body,
                }}
              >
                Set up a new learning-enabled agent
              </p>
            </div>
          </div>
          <div
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              background: colors.white,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color={colors.black} />
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: 20,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* Basic Info */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.gray,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
                fontFamily: fonts.body,
              }}
            >
              Basic Information
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.black,
                  marginBottom: 6,
                  fontFamily: fonts.body,
                }}
              >
                Agent Name <span style={{ color: colors.coral }}>*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Support Agent"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13,
                  border: `1px solid ${colors.black}`,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: fonts.body,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.black,
                  marginBottom: 6,
                  fontFamily: fonts.body,
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this agent does..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13,
                  border: `1px solid ${colors.black}`,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: fonts.body,
                  resize: "vertical",
                  minHeight: 70,
                }}
              />
            </div>
          </div>

          {/* Learning Settings */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.gray,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
                fontFamily: fonts.body,
              }}
            >
              Learning & Analysis Settings
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Toggle
                enabled={traceAnalysis}
                onChange={setTraceAnalysis}
                label="Trace Analysis"
                description="Analyze production logs to extract chain of thought."
                icon={Activity}
              />
              <Toggle
                enabled={experientialLearning}
                onChange={setExperientialLearning}
                label="Experiential Learning"
                description="Learn from successful and failed interactions to improve"
                icon={Brain}
              />
              {/*<Toggle
                enabled={patternDetection}
                onChange={setPatternDetection}
                label="Pattern Detection"
                description="Detect recurring issues and strategies across sessions"
                icon={Zap}
              />*/}
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: 14,
              background: colors.grayLight,
              border: `1px solid ${colors.black}`,
            }}
          >
            <Info size={16} color={colors.gray} style={{ flexShrink: 0, marginTop: 1 }} />
            <div
              style={{
                fontSize: 11,
                color: colors.gray,
                lineHeight: 1.6,
                fontFamily: fonts.body,
              }}
            >
              <strong style={{ color: colors.black }}>How it works:</strong> Before each task, your
              agent retrieves similar historical interactions as context. By seeing what worked (and
              what didn't), it adapts its strategy pre-emptively—turning raw telemetry into long-term
              memory.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: `1px solid ${colors.black}`,
            display: "flex",
            gap: 10,
            background: colors.grayLight,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 500,
              border: `1px solid ${colors.black}`,
              background: colors.white,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${colors.black}`,
              background: saving || !name.trim() ? colors.grayLight : colors.coral,
              color: saving || !name.trim() ? colors.gray : colors.white,
              cursor: saving || !name.trim() ? "not-allowed" : "pointer",
              fontFamily: fonts.body,
            }}
          >
            {saving ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentCreateModal;
