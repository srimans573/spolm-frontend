import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function FileViewer({
  selectedFile,
  selectedBranch,
  fileContent,
  loading,
  error,
  fontSizes,
  colors,
  getLanguageFromPath,
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: colors.bgMain,
        overflowX: "scroll",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: "12px",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: colors.textPrimary,
          }}
        >
          {selectedFile || "Select a file"}
        </div>
        <div
          style={{
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            background: colors.hoverBg,
            padding: "4px 8px",
            borderRadius: 0,
          }}
        >
          {selectedBranch ? `branch: ${selectedBranch}` : "No branch selected"}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          X: "auto",
          background: colors.bgalt,
          color: colors.textPrimary,
          borderRadius: 0,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: fontSizes.mono,
          border: "1px solid gainsboro",
        }}
      >
        {loading && selectedFile && (
          <div style={{ color: colors.textSecondary }}>
            Loading file content...
          </div>
        )}

        {error && selectedFile && (
          <div
            style={{
              color: colors.errorText,
              background: colors.errorBg,
              padding: "12px",
              borderRadius: 0,
              fontSize: fontSizes.sm,
              border: `1px solid ${colors.errorBorder}`,
              marginBottom: "12px",
            }}
          >
            <strong>Error: </strong>
            {error}
          </div>
        )}

        {!selectedFile && !loading && (
          <div
            style={{
              color: colors.textSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              fontStyle: "italic",
            }}
          >
            Select a file from the repository explorer to view its contents.
          </div>
        )}

        {selectedFile && !loading && fileContent && (
          <SyntaxHighlighter
            language={getLanguageFromPath(selectedFile)}
            style={oneLight}
            showLineNumbers
            wrapLongLines
            customStyle={{
              margin: 0,
              background: colors.bgalt,
              borderRadius: 0,
              fontSize: fontSizes.mono,
              lineHeight: 1.5,
            }}
          >
            {fileContent}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
