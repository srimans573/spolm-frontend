import Sidebar from "../components/Sidebar";
import CreateApiKeyModal from "../components/CreateAPIKey";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import Breadcrumb from "../components/helper/Breadcrumb";
import UserInfoCard from "../components/UserInfoCard";
import { Plus, PlusIcon, Trash, Trash2 } from "lucide-react";

function Settings({ user }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [keys, setKeys] = useState([]);

  const handleCreateClick = () => setModalOpen(true);

  const handleSaveKey = (data) => {
    // stub: in real app, persist to Firestore or backend
    setKeys((s) => [{ ...data, createdAt: new Date().toISOString() }, ...s]);
    // simple toast could be added
  };

  useEffect(() => {
    const loadKeys = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const colRef = collection(db, "users", currentUser.uid, "apiKeys");
        const snap = await getDocs(colRef);
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        setKeys(items.reverse());
      } catch (err) {
        console.error("Failed to load keys", err);
      }
    };

    // load once when component mounts and when auth state changes
    const unsub = auth.onAuthStateChanged(() => {
      loadKeys();
    });
    loadKeys();
    return () => unsub();
  }, []);

  const handleRevoke = async (id) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "apiKeys", id));
      setKeys((s) => s.filter((k) => k.id !== id));
    } catch (err) {
      console.error("failed to delete key", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        user={user}
        organization={{ name: "Spolm Enterprise", initials: "SE" }}
      />
      <main style={{ flex: 1 }}>
        <div
          style={{
            padding: "8px 18px",
            borderBottom: "1px solid gainsboro",
            position: "sticky",
            width: "100%",
          }}
        >
          <Breadcrumb items={["Personal", "Settings"]} /> {/* Header */}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            padding: "0px 18px",
          }}
        >
          <div style={{}}>
            <h2
              style={{
                marginTop: 0,
                fontFamily: "Libre Baskerville, sans-serif",
                margin: "0px",
              }}
            >
              Settings
            </h2>
            <p style={{ color: "black", fontFamily: "Poppins", margin: "0px" }}>
              Manage your team members, plans and API keys.
            </p>
          </div>
        </div>
        <div style={{ padding: "0px 18px" }}>
          <UserInfoCard user={user} />
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                paddingBottom: "10px",
                borderBottom: "1px solid gainsboro",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontFamily: "Libre Baskerville" }}>API keys</h3>
              </div>
              <button
                onClick={handleCreateClick}
                label="Create API Key"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "fit-content",
                  border: "1px solid black",
                  justifySelf: "end",
                  fontWeight: "600",
                  color: "white",
                  background: "#FF6B6B",
                }}
              >
                <PlusIcon size={16} />
                <p>Create API Key </p>
              </button>
            </div>
            <CreateApiKeyModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onSave={handleSaveKey}
            />
            <div
              style={{
                background: "white",
              }}
            >
              {keys.length === 0 ? (
                <p
                  style={{
                    color: "#6b7280",
                    fontFamily: "Poppins",
                    padding: "50px 10px",
                    textAlign: "center",
                  }}
                >
                  No API keys yet. Create one to get started.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {keys.map((k) => (
                    <li
                      key={k.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid black",
                        padding: "10px 0px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontFamily: "Libre Baskerville",
                            fontSize: "14px",
                          }}
                        >
                          {"Name: " + k.name || "Unnamed key"}
                        </div>
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              fontFamily: "Poppins",
                            }}
                          >
                            {"Description: " + k.description || ""}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            fontFamily: "Poppins",
                          }}
                        >
                          {"Created At: " +
                            new Date(
                              k.createdAt.seconds * 1000,
                            ).toLocaleDateString() || ""}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "monospace",
                            background: "whitesmoke",
                            padding: "5px 8px",
                            border: "1px solid gray",
                          }}
                        >
                          {(k.prefix || "").slice(0, 12) +
                            (k.prefix ? "..." : "")}
                        </div>
                        <button
                          onClick={() => handleRevoke(k.id)}
                          style={{
                            padding: "2px 8px",
                            background: "white",
                            color: "#ef4444",
                            cursor: "pointer",
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
