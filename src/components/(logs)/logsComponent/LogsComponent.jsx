import { useState, useRef, useMemo, useEffect } from "react";
import example from "../logsHelpers/mock/mock";

import StepsView from "../logsViewerHelpers/StepsViewer";
import StepDetails from "../logsViewerHelpers/StepDetails";
import WaterfallTimelineView from "../logsViewerHelpers/WaterfallTimeline";

export default function LogsComponent({run}) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("waterfall");

  // resizable left column state (px)
  const [leftWidth, setLeftWidth] = useState(420);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startWidth: 420,
    moveHandler: null,
    upHandler: null,
  });

  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current.active = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startWidth = leftWidth;

    dragRef.current.moveHandler = (ev) => {
      if (!dragRef.current.active) return;
      const delta = ev.clientX - dragRef.current.startX;
      const newW = Math.max(
        240,
        Math.min(1000, dragRef.current.startWidth + delta)
      );
      setLeftWidth(newW);
    };

    dragRef.current.upHandler = () => {
      dragRef.current.active = false;
      window.removeEventListener("mousemove", dragRef.current.moveHandler);
      window.removeEventListener("mouseup", dragRef.current.upHandler);
      dragRef.current.moveHandler = null;
      dragRef.current.upHandler = null;
    };

    window.addEventListener("mousemove", dragRef.current.moveHandler);
    window.addEventListener("mouseup", dragRef.current.upHandler);
  };

  const totalMs = useMemo(() => {
    if (run?.duration) return run.duration;
    return (run?.steps || []).reduce(
      (a, b) => a + (Number(b.step_latency || 0) || 0),
      0
    );
  }, [run]);

  useEffect(() => {
    if (run?.steps?.length) {
      setSelected(run.steps[0].step_id);
    }
  }, [run]);

  const selectedStep = run?.steps?.find((s) => s.step_id === selected);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${leftWidth}px 8px 1fr`,
        flex: 1,
        overflow: "hidden",
        borderTop: "1px solid gainsboro",
      }}
    >
      {/* LEFT COLUMN (SCROLLS) */}
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid gainsboro",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "5.5px 14px",
            borderBottom: "1px solid gainsboro",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {view === "waterfall" ? "WATERFALL" : "STEPS"}
          </h4>

          <div
            style={{
              display: "flex",
              gap: 4,
              border: "1px solid #d1d5db",
              background: "white",
            }}
          >
            <button
              onClick={() => setView("waterfall")}
              style={{
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 600,
                border: "none",
                background: view === "waterfall" ? "black" : "transparent",
                color: view === "waterfall" ? "white" : "#6b7280",
                cursor: "pointer",
              }}
            >
              WATERFALL
            </button>
            <button
              onClick={() => setView("steps")}
              style={{
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 600,
                border: "none",
                background: view === "steps" ? "black" : "transparent",
                color: view === "steps" ? "white" : "#6b7280",
                cursor: "pointer",
              }}
            >
              STEPS
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {view === "waterfall" ? (
            <WaterfallTimelineView
              steps={run.steps || []}
              totalMs={totalMs}
              onStepClick={setSelected}
              selectedId={selected}
            />
          ) : (
            <StepsView
              steps={run.steps || []}
              onStepClick={setSelected}
              selectedId={selected}
            />
          )}
        </div>
      </aside>

      {/* DRAGGABLE DIVIDER */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={onMouseDown}
        style={{
          width: 10,
          cursor: "col-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: "1px solid black",
        }}
      ></div>

      {/* RIGHT COLUMN (SCROLLS) */}
      <div style={{ minWidth: 0, overflow: "auto", paddingRight: "10px" }}>
        <StepDetails selectedStep={selectedStep} />
      </div>
    </div>
  );
}
