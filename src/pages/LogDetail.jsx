import React, { useMemo, useState, useEffect, useRef } from "react";
import example from "../components/(logs)/logsHelpers/mock/mock";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../components/helper/Breadcrumb";
import OverviewCard from "../components/(logs)/logsViewerHelpers/OverviewCard";
import WaterfallTimelineView from "../components/(logs)/logsViewerHelpers/WaterfallTimeline";
import StepsView from "../components/(logs)/logsViewerHelpers/StepsViewer";
import StepDetails from "../components/(logs)/logsViewerHelpers/StepDetails";
import {
  ChartBar,
  FileWarningIcon,
  LayoutDashboardIcon,
  ListCheckIcon,
  LogsIcon,
  SquareActivityIcon,
} from "lucide-react";
import ModalShifter from "../components/helper/ModalShifter";
import LogsComponent from "../components/(logs)/logsComponent/LogsComponent";
import { useLocation, useParams } from "react-router-dom";
import LogsOverview from "../components/(logs)/logsHelpers/LogsOverview";

// Helper: try to find a run in localStorage org caches by run id
function findRunInLocalCaches(runId) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("org_")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const arr = parsed?.data || [];
      const found = arr.find((r) => r.id === runId || r.run_id === runId);
      if (found) return found;
    }
  } catch (e) {
    console.warn("findRunInLocalCaches error", e);
  }
  return null;
}

export default function LogDetail({ user }) {
  const { id: runIdParam } = useParams();
  const location = useLocation();
  const [run, setRun] = useState(location?.state?.run || null);
  const [subOptionMode, setSubOptionMode] = useState("Overview");
  const subOptions = [
    {
      name: "Overview",
      icon: <SquareActivityIcon size={15} />,
    },
    {
      name: "Trace",
      icon: <LogsIcon size={15} />,
    },
    {
      name: "Rubric Evals",
      icon: <ListCheckIcon size={15} />,
    },
  ];

  useEffect(() => {
    if (run) return; // already have run from navigation state
    // try to locate run in local caches saved by Logs page
    if (runIdParam) {
      const found = findRunInLocalCaches(runIdParam);
      if (found) setRun(found);
    }
  }, [run, runIdParam]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      <Sidebar user={user} />
      {/* MAIN CONTENT COLUMN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* HEADER AREA (AUTO HEIGHT) */}
        <div
          style={{
            padding: "8px 18px",
            borderBottom: "1px solid gainsboro",
            position: "sticky",
            width: "100%",
          }}
        >
          <Breadcrumb
            items={[
              "Personal",
              "Logs",
              run?.run_id || runIdParam || "(not found)",
            ]}
          />
        </div>

        <div style={{}}>
          {run ? (
            <OverviewCard run={run} />
          ) : (
            <div style={{ padding: 24 }}>
              <h3>Log not available</h3>
              <p>
                The selected log wasn't passed to this page and couldn't be
                found in local cache. If you navigated directly to this URL, try
                opening the log from the Logs page so the app can pass the data,
                or refresh after opening Logs so the cache is populated.
              </p>
            </div>
          )}
        </div>

        {/*Modal Shifter*/}

        <ModalShifter
          subOptions={subOptions}
          setSubOptionMode={setSubOptionMode}
          subOptionMode={subOptionMode}
        />
        {subOptionMode == "Overview" && <LogsOverview run={run} />}
        {subOptionMode == "Trace" && <LogsComponent run={run} />}
      </div>
    </div>
  );
}
