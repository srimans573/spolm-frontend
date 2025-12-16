export default function OverviewCard({ run }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        padding: "14px 18px",
        background: "#ffffff",
        marginBottom: 1,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: "#111827",
              fontFamily: "Libre Baskerville",
            }}
          >
            {run?.agent_id}
          </h2>
        </div>
        <p
          style={{
            margin: "0 0 10px 0",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          Task: {run.user_task}
        </p>
        <div
          style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5}}>
            <span style={{ fontWeight: 500 }}>Run ID</span>
            <code
              style={{
                background: "#f9fafb",
                padding: "2px 5px",
                fontSize: 10,
                border: "1px solid #d1d5db",
                fontFamily: "monospace",
              }}
            >
              {run.run_id}
            </code>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontWeight: 500 }}>Started</span>
            <span style={{}}>
              {new Date(run.start_timestamp).toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontWeight: 500 }}>Duration</span>
            <span style={{ color: "#111827", fontWeight: 600 }}>
              {(
                (run.duration ||
                  run.steps?.reduce((a, b) => a + (b.step_latency || 0), 0)) /
                1000
              ).toFixed(3)}
              s
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "0 10px",
          borderLeft: "1px solid black",
        }}
      >
        <div style={{ textAlign: "center", minWidth: 50 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 3,
            }}
          >
            STEPS
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>
            {run.steps?.length ?? 0}
          </div>
        </div>
        <div style={{ textAlign: "center", minWidth: 70 }}>
          <div
            style={{
              fontSize: 10,
              color: "black",
              fontWeight: 500,
              marginBottom: 3,
            }}
          >
            STATUS
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 11,
              color: run.status === "complete" ? "#059669" : "#dc2626",
              background: run.status === "complete" ? "#d1fae5" : "#fee2e2",
              padding: "2px 8px",
              border: `1px solid ${
                run.status === "complete" ? "#6ee7b7" : "#fca5a5"
              }`,
            }}
          >
            {run.status.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
