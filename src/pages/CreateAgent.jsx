import React, { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../components/helper/Breadcrumb";
import GitHubConnect from "../components/GitHubConnect";
import { Edit2, Trash2, X, XIcon } from "lucide-react";

export default function CreateAgent({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rubrics, setRubrics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Rubric modal state
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [editingRubricIndex, setEditingRubricIndex] = useState(-1);
  const [modalRubricKey, setModalRubricKey] = useState("");
  const [modalRubricDescription, setModalRubricDescription] = useState("");
  const [modalRubricCriteria, setModalRubricCriteria] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleAddRubric = () => {
    setEditingRubricIndex(-1);
    setModalRubricKey("");
    setModalRubricDescription("");
    setModalRubricCriteria("");
    setIsRubricModalOpen(true);
  };

  const openEditRubric = (index) => {
    const r = rubrics[index] || { key: "", value: "", description: "" };
    setEditingRubricIndex(index);
    setModalRubricKey(r.key || "");
    setModalRubricDescription(r.description || "");
    setModalRubricCriteria(r.value || "");
    setIsRubricModalOpen(true);
  };

  const handleSaveRubricFromModal = () => {
    const name = (modalRubricKey || "").trim();
    const criteria = (modalRubricCriteria || "").trim();
    if (!name) {
      setFieldErrors((s) => ({
        ...s,
        modalRubricKey: "Rubric name is required",
      }));
      return;
    }
    const newRubric = {
      key: name,
      value: criteria,
      description: modalRubricDescription || "",
    };
    if (editingRubricIndex >= 0) {
      const updated = [...rubrics];
      updated[editingRubricIndex] = newRubric;
      setRubrics(updated);
    } else {
      setRubrics([...rubrics, newRubric]);
    }
    setIsRubricModalOpen(false);
    setError("");
    setFieldErrors((s) => ({ ...s, modalRubricKey: null }));
  };

  const handleRubricChange = (index, field, val) => {
    const newRubrics = [...rubrics];
    newRubrics[index][field] = val;
    setRubrics(newRubrics);
  };

  const handleRemoveRubric = (index) =>
    setRubrics(rubrics.filter((_, i) => i !== index));

  const handleSave = async () => {
    // Prevent saving while rubric modal is open
    if (isRubricModalOpen) {
      setError("Finish or cancel the rubric editor before saving.");
      return;
    }

    // Validate form
    const valid = validateForm();
    if (!valid) return;

    setSaving(true);
    setError("");
    try {
      const currentUser = JSON.parse(localStorage.getItem("spolm_user_"+user.uid))
      if (!currentUser) throw new Error("Not authenticated");

      const colRef = collection(db, "organizations", currentUser.orgId, "agents");
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `aid_${Date.now().toString(36)}_${Math.random()
              .toString(36)
              .slice(2, 9)}`;

      const validRubrics = rubrics.filter(
        (r) => r.key.trim() !== "" || r.value.trim() !== ""
      );
      const docRef = await addDoc(colRef, {
        name,
        description,
        repo,
        instructions,
        rubrics: validRubrics,
        createdAt: serverTimestamp(),
      });
      await updateDoc(docRef, { agentId: docRef.id });
      navigate(`/agents/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  // Validation helpers
  const validateForm = () => {
    const errors = {};
    if (!name || !name.trim()) errors.name = "Agent name is required";
    if (name && name.trim().length < 3)
      errors.name = "Agent name must be at least 3 characters";
    if (description && description.length > 1000)
      errors.description = "Description is too long";
    if (!instructions || !instructions.trim())
      errors.instructions = "Instructions / system prompt is required";
    if (instructions && instructions.trim().length < 10)
      errors.instructions = "Instructions must be at least 10 characters";

    // Rubrics validation: keys must be non-empty
    const invalidRubrics = rubrics.some(
      (r) => !(r.key || "").toString().trim()
    );
    if (invalidRubrics) errors.rubrics = "All rubrics must have a name";

    setFieldErrors(errors);
    setError(
      Object.keys(errors).length
        ? "Please fix validation errors before saving."
        : ""
    );
    return Object.keys(errors).length === 0;
  };

  const inputStyle = {
    width: "100%",
    padding: "4px 10px",
    border: "1px solid #e6e6e6",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    boxSizing: "border-box",
    marginTop: "8px",
  };

  const labelStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: "600",
    fontSize: "13px",
    color: "#111827",
  };

  const sectionStyle = {
    background: "#fff",
    padding: "20px",
    boxSizing: "border-box",
    height: "100%",
    borderTop: "1px solid gainsboro",
    borderBottom: "1px solid gainsboro",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        user={user}
        organization={{ name: "Spolm Enterprise", initials: "SE" }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <main style={{ padding: "18px", boxSizing: "border-box", flex: 1 }}>
          <Breadcrumb items={["Personal", "Agents", "Create Agent"]} />

          <div style={{ marginTop: "18px", marginBottom: "18px" }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "Libre Baskerville, serif",
                fontSize: "26px",
              }}
            >
              Create Agent
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "Poppins, sans-serif",
                color: "#6b7280",
              }}
            >
              Create an agent that Spolm can monitor and fix!
            </p>
          </div>

          {/* Three-column enterprise layout */}
          <div style={{ display: "flex", height: "68vh" }}>
            {/* Column 1 - Basic Information */}
            <div
              style={{
                ...sectionStyle,
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #ececec",
                  paddingBottom: 12,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "Libre Baskerville, serif",
                    fontSize: "16px",
                  }}
                >
                  Basic Information
                </h3>
                <div
                  style={{
                    marginTop: 6,
                    color: "#6b7280",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: 13,
                  }}
                >
                  Name and short description
                </div>
              </div>

              <label style={labelStyle}>Agent Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Customer Support Bot"
                style={inputStyle}
              />
              {fieldErrors.name && (
                <div style={{ color: "#b91c1c", marginTop: 6, fontSize: 13 }}>
                  {fieldErrors.name}
                </div>
              )}

              <label style={{ ...labelStyle, marginTop: "10px" }}>
                Agent Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                style={{ ...inputStyle, height: "100%", resize: "vertical" }}
              />
              {fieldErrors.description && (
                <div style={{ color: "#b91c1c", marginTop: 6, fontSize: 13 }}>
                  {fieldErrors.description}
                </div>
              )}
            </div>

            {/* Column 2 - Configuration */}
            <div
              style={{
                ...sectionStyle,
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                borderRight: "1px solid gainsboro",
                borderLeft: "1px solid gainsboro",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #ececec",
                  paddingBottom: 12,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "Libre Baskerville, serif",
                    fontSize: "16px",
                  }}
                >
                  Configuration
                </h3>
                <div
                  style={{
                    marginTop: 6,
                    color: "#6b7280",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: 13,
                  }}
                >
                  Repo & system prompt
                </div>
              </div>

              <label style={labelStyle}>Agent GitHub Repository</label>
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <GitHubConnect
                  onSelectRepo={(r) => setRepo(r)}
                  onToken={() => {}}
                />
                {repo && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 8,
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    Selected: {repo}
                  </div>
                )}
              </div>

              <label style={labelStyle}>
                Main Reasoning Prompt / Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="System prompt or high-level instructions"
                style={{
                  ...inputStyle,
                  height: "100%",
                  resize: "vertical",
                }}
              />
              {fieldErrors.instructions && (
                <div style={{ color: "#b91c1c", marginTop: 6, fontSize: 13 }}>
                  {fieldErrors.instructions}
                </div>
              )}
            </div>

            {/* Column 3 - Rubrics */}
            <div
              style={{
                ...sectionStyle,
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #ececec",
                  paddingBottom: 12,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "Libre Baskerville, serif",
                    fontSize: "16px",
                  }}
                >
                  Evaluation Rubrics
                </h3>
                <div
                  style={{
                    marginTop: 6,
                    color: "#6b7280",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: 13,
                  }}
                >
                  Define metrics to evaluate agent performance
                </div>
              </div>

              <div style={{ flex: 1, overflow: "auto" }}>
                {rubrics.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#6b7280",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 16 }}>
                      {" "}
                      None — create one to get started.
                    </div>
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {rubrics.map((rubric, index) => (
                      <li
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 8,
                          borderBottom: "1px solid #f1f1f1",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              fontSize: 13,
                              color: "#111827",
                            }}
                          >
                            {rubric.key}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() => openEditRubric(index)}
                            title="Edit"
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 6,
                              cursor: "pointer",
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveRubric(index)}
                            title="Delete"
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 6,
                              cursor: "pointer",
                              color: "#dc2626",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <button
                  onClick={handleAddRubric}
                  style={{
                    background: "white",
                    border: "1px solid #000",
                    padding: "8px 16px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: 13,
                    cursor: "pointer",
                    borderRadius: 0,
                  }}
                >
                  + Add Eval
                </button>
              </div>
            </div>
          </div>

          {/* Rubric modal (slide-in from left) */}
          {isRubricModalOpen && (
            <div
              role="presentation"
              onClick={() => setIsRubricModalOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                zIndex: 60,
                width: "100%",
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 360,
                  background: "#fff",
                  boxShadow: "-2px 0 12px rgba(0,0,0,0.12)",
                  padding: 20,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  transform: "translateX(0)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "Libre Baskerville, serif",
                      width: "100%",
                    }}
                  >
                    {editingRubricIndex >= 0 ? "Edit Eval" : "Add Eval"}
                  </h3>
                  <X
                    size={20}
                    cursor={"pointer"}
                    onClick={() => setIsRubricModalOpen(false)}
                  />
                </div>

                <label style={labelStyle}>Eval Name</label>
                <input
                  value={modalRubricKey}
                  onChange={(e) => setModalRubricKey(e.target.value)}
                  placeholder="e.g. Accuracy"
                  style={inputStyle}
                />
                {fieldErrors.modalRubricKey && (
                  <div style={{ color: "#b91c1c", marginTop: 6, fontSize: 13 }}>
                    {fieldErrors.modalRubricKey}
                  </div>
                )}

                <label style={{ ...labelStyle, marginTop: "10px" }}>
                  Description
                </label>
                <textarea
                  value={modalRubricDescription}
                  onChange={(e) => setModalRubricDescription(e.target.value)}
                  placeholder="What this metric measures"
                  style={{ ...inputStyle, height: 100, resize: "vertical" }}
                />

                <label style={{ ...labelStyle, marginTop: "10px" }}>Goal</label>
                <textarea
                  value={modalRubricCriteria}
                  onChange={(e) => setModalRubricCriteria(e.target.value)}
                  placeholder="e.g. > 95%"
                  style={{
                    ...inputStyle,
                    height: 80,
                    resize: "vertical",
                    marginBottom: 12,
                  }}
                />

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <button
                    onClick={() => setIsRubricModalOpen(false)}
                    style={{
                      padding: "8px 12px",
                      background: "white",
                      border: "1px solid #d1d5db",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRubricFromModal}
                    style={{
                      padding: "8px 12px",
                      background: "black",
                      color: "white",
                      border: "1px solid #0f766e",
                      cursor: "pointer",
                    }}
                  >
                    {editingRubricIndex >= 0 ? "Save" : "Add Rubric"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 16,
              marginTop: 18,
              paddingTop: 12,
              borderTop: "1px solid #e6e6e6",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "4px 8px",
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontFamily: "Poppins, sans-serif",
                  position: "absolute",
                  top: 25,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={async () => setError(null)}
              >
                {error}
              </div>
            )}
            <button
              onClick={() => navigate("/agents")}
              style={{
                padding: "10px 20px",
                background: "white",
                border: "1px solid #d1d5db",
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 20px",
                background: "#ea580c",
                color: "white",
                border: "1px solid #ea580c",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Creating..." : "Create Agent"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
