import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import SpolmChat from "./pages/SpolmChat";
import Agents from "./pages/Agents";
import AgentDetails from "./pages/AgentDetails";
import CreateAgent from "./pages/CreateAgent";
import Onboarding from "./components/Onboarding";
import { app, auth, db } from "./firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import ProtectedRoute from "./pages/Protected";
import Logs from "./pages/Logs";
import LogDetail from "./pages/LogDetail";
import Dashboard from "./pages/Dashboard";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load and cache the user's Firestore document to avoid fetching on every refresh.
  useEffect(() => {
    if (!user?.uid) {
      setUserProfile(null);
      return;
    }

    const cacheKey = `spolm_user_${user.uid}`;

    // Try to load cached profile first for instant UI
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserProfile(parsed);
      }
    } catch (err) {
      console.warn("Failed to parse cached user profile", err);
    }

    // Attach a realtime listener; with IndexedDB persistence enabled this
    // will often deliver a cached snapshot first and then only trigger a
    // server read when the document actually changes. We avoid an explicit
    // fetch on reload so you won't incur reads on every page refresh.
    const dref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      dref,
      (snap) => {
        if (!snap.exists()) {
          const fallback = { uid: user.uid, email: user.email || null };
          setUserProfile(fallback);
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ ...fallback, _cachedAt: Date.now() }));
          } catch (e) {
            console.warn("Failed to cache fallback profile", e);
          }
          return;
        }

        const data = snap.data() || {};

        // If we have a cached copy, only update when data actually changes.
        try {
          const raw = localStorage.getItem(cacheKey);
          const cached = raw ? JSON.parse(raw) : null;
          const cachedBody = cached ? JSON.stringify(cached) : null;
          const newBody = JSON.stringify(data);
          if (cachedBody === newBody && cached) {
            // No change — do nothing (prevents unnecessary re-renders).
            return;
          }
        } catch (e) {
          // fall through and update cache/state
        }

        setUserProfile(data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ...data, _cachedAt: Date.now() }));
        } catch (e) {
          console.warn("Failed to cache user profile", e);
        }
      },
      (err) => {
        console.error("User profile listener error", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);
  
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Libre Baskerville, serif",
        }}
      >
        
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Router>
        <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <Settings user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute user={user}>
              <Logs user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs/:id"
          element={
            <ProtectedRoute user={user}>
              <LogDetail user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute user={user}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  width: "100vw",
                }}
              >
                <Onboarding user={user} onComplete={() => {}} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/spolm-chat"
          element={
            <ProtectedRoute user={user}>
              <SpolmChat user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents"
          element={
            <ProtectedRoute user={user}>
              <Agents user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/create"
          element={
            <ProtectedRoute user={user}>
              <CreateAgent user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:id"
          element={
            <ProtectedRoute user={user}>
              <AgentDetails user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;
