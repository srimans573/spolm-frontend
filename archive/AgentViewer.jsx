import React, { useEffect, useMemo, useState } from "react";
import CustomSelect from "../src/components/ui/CustomSelect";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import FileViewer from "../src/components/agentViewer/FileViewer";

// --- Spolm-inspired Design Tokens ---
const colors = {
  bgMain: "#ffffff",
  bgalt: "#f9fafb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  accentPrimary: "#000000",
  errorBg: "#fef2f2",
  errorText: "#991b1b",
  errorBorder: "#f87171",
  hoverBg: "#f3f4f6",
};

const fontSizes = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  mono: "13px",
};

// --- GitHub API helpers ---
async function ghFetch(url, token) {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `token ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

async function listBranches(owner, repo, token) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/branches`,
    token
  );
}

async function getRepo(owner, repo, token) {
  return ghFetch(`https://api.github.com/repos/${owner}/${repo}`, token);
}

async function getTree(owner, repo, sha, token) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,
    token
  );
}

async function getFileContents(owner, repo, path, ref, token) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
      path
    )}?ref=${encodeURIComponent(ref)}`,
    token
  );
}

function parseOwnerRepo(ownerRepo) {
  if (!ownerRepo) return [null, null];
  const parts = ownerRepo.split("/");
  return [parts[0] || null, parts[1] || null];
}

const getLanguageFromPath = (path = "") => {
  const ext = (path.split(".").pop() || "").toLowerCase();
  const map = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    java: "java",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    md: "markdown",
    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    yml: "yaml",
    yaml: "yaml",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    swift: "swift",
    php: "php",
    sql: "sql",
  };
  return map[ext] || "text";
};

export default function AgentViewer({ agent }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("gh_token") || ""
  );
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [treeFiles, setTreeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [query, setQuery] = useState("");

  const [owner, repo] = useMemo(() => parseOwnerRepo(agent?.repo), [agent]);

  useEffect(() => {
    setToken(localStorage.getItem("gh_token") || "");
  }, []);

  useEffect(() => {
    if (!agent?.repo) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      setBranches([]);
      setTreeFiles([]);
      setSelectedFile(null);
      setFileContent("");

      try {
        if (!owner || !repo)
          throw new Error("Invalid repo format (owner/repo)");

        const currentToken = localStorage.getItem("gh_token") || token;
        if (!currentToken) {
          setError("No GitHub token found.");
          return;
        }

        const repoData = await getRepo(owner, repo, currentToken);
        if (!mounted) return;

        const br = await listBranches(owner, repo, currentToken);
        if (!mounted) return;

        setBranches(br);

        const defaultBranch = repoData.default_branch || br[0]?.name || "main";
        setSelectedBranch(defaultBranch);

        const info = br.find((b) => b.name === defaultBranch) || br[0];
        const sha = info?.commit?.commit?.tree?.sha || info?.commit?.sha;

        if (!sha) throw new Error("Unable to determine tree SHA");

        const tree = await getTree(owner, repo, sha, currentToken);
        if (!mounted) return;

        const files = (tree.tree || [])
          .filter((t) => t.type === "blob")
          .map((t) => ({ path: t.path, size: t.size, mode: t.mode }));

        setTreeFiles(files);
      } catch (err) {
        console.error("load error", err);
        setError(err.message || "Failed to load repository");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [agent, owner, repo, token]);

  // --- open file ---
  const openFile = async (path) => {
    try {
      setLoading(true);
      setError("");

      const ref = selectedBranch || "main";
      const currentToken = localStorage.getItem("gh_token") || token;

      const d = await getFileContents(owner, repo, path, ref, currentToken);

      let content = "";
      if (d.content) content = atob(d.content.replace(/\n/g, ""));
      else if (d.raw) content = d.raw;

      setSelectedFile(path);
      setFileContent(content);
    } catch (err) {
      console.error("openFile error", err);
      setError(err.message || "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  // search + filter
  const filteredFiles = useMemo(() => {
    if (!query) return treeFiles;
    return treeFiles.filter((f) =>
      f.path.toLowerCase().includes(query.toLowerCase())
    );
  }, [treeFiles, query]);

  // Shared styles
  const cardHeaderStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: colors.textPrimary,
    textTransform: "uppercase",
    marginBottom: "12px",
  };

  const inputStyle = {
    flex: 1,
    padding: "2px 12px",
    width: "100%",
    border: `1px solid ${colors.border}`,
    fontSize: fontSizes.sm,
    outline: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        fontFamily: "-apple-system, BlinkMacSystemFont",
        color: colors.textPrimary,
        height: "100%",
        width: "100%",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          flex: "0 1 340px", // allow shrinking on narrow screens
          minWidth: 160,
          display: "flex",
          flexDirection: "column",
          borderRight: `1px solid ${colors.border}`,
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ ...cardHeaderStyle }}>Repository Files</div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <CustomSelect
              options={[
                { value: "", label: "Select branch" },
                ...branches.map((b) => ({ value: b.name, label: b.name })),
              ]}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            />
          </div>

          <input
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            border: `1px solid ${colors.border}`,
          }}
        >
          {loading && !selectedFile && (
            <div style={{ padding: 16, color: colors.textSecondary }}>
              Loading repository...
            </div>
          )}

          {error && !selectedFile && (
            <div
              style={{
                color: colors.errorText,
                background: colors.errorBg,
                padding: 12,
                margin: 8,
                border: `1px solid ${colors.errorBorder}`,
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && filteredFiles.length === 0 && (
            <div style={{ padding: 16, color: colors.textSecondary }}>
              No files found
            </div>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredFiles.map((f) => (
              <li
                key={f.path}
                style={{
                  padding: "8px 12px",
                  borderBottom: `1px solid ${colors.hoverBg}`,
                  cursor: "pointer",
                }}
                onClick={() => openFile(f.path)}
              >
                <span
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                    fontSize: fontSizes.sm,
                    color: colors.textPrimary,
                  }}
                >
                  {f.path}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          padding: "10px",
        }}
      >
        <FileViewer
          selectedFile={selectedFile}
          selectedBranch={selectedBranch}
          fileContent={fileContent}
          loading={loading}
          error={error}
          fontSizes={fontSizes}
          colors={colors}
          getLanguageFromPath={getLanguageFromPath}
        />
      </div>
    </div>
  );
}
