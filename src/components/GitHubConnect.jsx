import React, { useEffect, useState } from "react";
import CustomSelect from "./ui/CustomSelect";
import { GithubAuthProvider, linkWithPopup, signInWithPopup, fetchSignInMethodsForEmail, linkWithCredential } from "firebase/auth";
import { auth } from "../firebase/config";

function GitHubConnect({ onToken, onSelectRepo }) {
  const [token, setToken] = useState(localStorage.getItem("gh_token") || "");
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchRepos(token);
  }, [token]);

  const connectWithFirebaseGitHub = async () => {
  const provider = new GithubAuthProvider();
  provider.addScope("repo");
  provider.addScope("read:user");

  try {
    let result;

    // If user is already logged in (Google, etc.)
    if (auth.currentUser) {
      // Link GitHub to existing account instead of signing in again
      result = await linkWithPopup(auth.currentUser, provider);
      console.log("Linked GitHub to existing account");
    } else {
      // Otherwise, this is a fresh sign-in
      result = await signInWithPopup(auth, provider);
      console.log("Signed in directly with GitHub");
    }

    const credential = GithubAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) throw new Error("GitHub access token missing.");

    // Test token validity before storing
    const testRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });
    if (!testRes.ok) throw new Error("GitHub token validation failed");
    const userData = await testRes.json();

    console.log("GitHub connected for user:", userData.login);

    localStorage.setItem("gh_token", accessToken);
    setToken(accessToken);
    if (onToken) onToken(accessToken);
    await fetchRepos(accessToken);
  } catch (err) {
    console.error("GitHub connection failed", err);
    setError(err.message || "GitHub connection failed");
  }
};

  const fetchRepos = async (t) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.github.com/user/repos?per_page=100", {
        headers: { Authorization: `token ${t}`, Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) throw new Error("Failed to fetch repos");
      const data = await res.json();
      setRepos(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load repos");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (e) => {
    const val = e.target.value;
    if (onSelectRepo) onSelectRepo(val);
  };

  const clear = () => {
    localStorage.removeItem("gh_token");
    setToken("");
    setRepos([]);
    if (onToken) onToken(null);
    if (onSelectRepo) onSelectRepo(null);
  };

  return (
    <div style={{}}>
      {!token ? (
        <div>
          <p style={{ margin: 0, marginBottom: 8 }}>Connect your GitHub account to browse repositories.</p>
          <button onClick={connectWithFirebaseGitHub} style={{ padding: "8px 12px", background: "white", cursor: "pointer" }}>Connect to GitHub</button>
          {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div>Loading repos...</div>
          ) : (
            <CustomSelect
              options={[{ value: '', label: 'Select repository...' }, ...repos.map((r) => ({ value: r.full_name, label: r.full_name }))]}
              value={selectedRepo}
              onChange={(e) => {
                setSelectedRepo(e.target.value);
                handleSelect(e);
              }}
              style={{ width: '100%' }}
            />
          )}
          {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default GitHubConnect;
