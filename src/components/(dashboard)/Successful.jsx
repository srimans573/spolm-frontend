import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CheckCheckIcon } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

// Center text plugin for Chart.js v3+
const centerTextPlugin = {
  id: "centerTextPlugin",
  beforeDraw: (chart) => {
    const { ctx, width, height } = chart;
    const centerConfig = chart.config.options.plugins.centerText;
    if (!centerConfig) return;

    const { text, fontSize = 20, color = "#111" } = centerConfig;

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  },
};

ChartJS.register(centerTextPlugin);

const wrapperStyle = {
  display: "flex",
};

const cardStyle = {
  border: "1px solid gainsboro",
  boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
  padding: "10px",
  width: "100%",
  minWidth: "360px",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
  fontFamily: "Poppins",
};

const legendRow = (color) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  color: "#0f172a",
});

export default function Successful({
  successful = 65,
  failed = 35,
  size = 160,
  colors,
} = {}) {
  const s = Number(successful) || 0;
  const f = Number(failed) || 0;
  const total = s + f || 1;
  const pct = Math.round((s / total) * 100);

  const palette = colors || {
    success: "#28a155",
    fail: "#c62828",
    muted: "#e6eef6",
  };

  const data = useMemo(
    () => ({
      labels: ["Successful", "Failed"],
      datasets: [
        {
          data: [s, f],
          backgroundColor: [palette.success, palette.fail],
          borderColor: ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.9)"],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [s, f, palette]
  );

  const options = useMemo(
    () => ({
      cutout: "50%",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.label}: ${ctx.parsed} (${Math.round(
                (ctx.parsed / total) * 100
              )}%)`,
          },
        },
      },
    }),
  );

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <span>{<CheckCheckIcon size={20} color="gray" />}</span>
            <div
              style={{
                fontFamily: "Poppins",
                marginLeft: 2,
                color: "gray",
                margin: "0px",
              }}
            >
              Success vs Failures
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <div style={legendRow(palette.success)}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: palette.success,
                  display: "inline-block",
                }}
              />
              <p style={{ fontWeight: 400 }}>Successful</p>
            </div>
            <div style={legendRow(palette.fail)}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: palette.fail,
                  display: "inline-block",
                }}
              />
              <p style={{ fontWeight: 400 }}>Failed</p>
            </div>
          </div>
        </div>

        <div
          style={{
            height: size,
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            width:"100%"
          }}
        >
          <h1
            style={{
              fontFamily: "Libre Baskerville",
              margin: 0,
              fontSize: "60px",
            }}
          >
            {3}{" "}
          </h1>
          <div style={{width: "50%"}}>
          <Doughnut data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}