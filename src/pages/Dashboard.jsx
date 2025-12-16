import React, { useEffect, useMemo, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import mockExample from "../components/(logs)/logsHelpers/mock/mock";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../components/helper/Breadcrumb";
import {
  AlertOctagonIcon,
  Calendar1Icon,
  SigmaIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";
import CustomSelect from "../components/ui/CustomSelect";
import Card from "../components/(dashboard)/Card";
import LogsComponent from "../components/(logs)/logsComponent/LogsComponent";
import Successful from "../components/(dashboard)/Successful";
import RecentActivity from "../components/(dashboard)/RecentActivity";

// --- STYLES CONFIGURATION ---
// We use a JS object for styles to keep this file self-contained without Tailwind.
const theme = {
  bg: "#f8fafc", // Very light slate
  textMain: "#1e293b", // Slate 800
  textSub: "#64748b", // Slate 500
  border: "#e2e8f0", // Slate 200
  primary: "#6366f1", // Indigo
  success: "#10b981", // Emerald
  danger: "#ef4444", // Red
  warning: "#f59e0b", // Amber
};

const styles = {
  dashboardContainer: {
    display: "flex",
    overflow: "hidden",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: theme.textMain,
    width: "100%",
  },
  mainContent: {
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 18px",
    fontFamily: "Libre Baskerville",
    height: "auto",
  }}
  

export default function Dashboard({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last-7-days");

  return (
    <div style={styles.dashboardContainer}>
      <Sidebar user={user} />
      <div style={{ width: "100%", height: "100vh" }}>
        <main style={styles.mainContent}>
          <div
            style={{
              padding: "8px 18px",
              borderBottom: "1px solid gainsboro",
              position: "sticky",
              width: "100%",
            }}
          >
            <Breadcrumb items={["Per"]} />
            {/* Header */}
          </div>
          <div style={styles.header}>
            <div>
              <h1 style={styles.headerTitle}>
                Hello,{" "}
                <span style={{ color: "coral", opacity: "0.7" }}>
                  {user.displayName}
                </span>
              </h1>
            </div>
            <div>
              <div
                style={{
                  width: 160,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Calendar1Icon
                  color="black"
                  size={20}
                  style={{ padding: "0px 5px" }}
                />
                <CustomSelect
                  options={[
                    { value: "today", label: "Today" },
                    { value: "yesterday", label: "Yesterday" },
                    { value: "last-7-days", label: "Last 7 days" },
                    { value: "last-30-days", label: "Last 30 days" },
                  ]}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ width: "100%", fontFamily: "Poppins" }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              padding: "0px 18px",
              gap: "10px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Card
              title={"Agent Runs"}
              icon={<SigmaIcon size={18} color="gray" />}
              number={12989}
              type={"runs"}
            />
            <Card
              title={"Simulations Ran"}
              icon={<TestTubeDiagonalIcon size={18} color="gray" />}
              number={83}
              type={"simulations"}
            />
            <Card
              title={"Issues Diagnosed"}
              icon={<AlertOctagonIcon size={18} color="gray" />}
              number={14}
              type={"issues"}
            />
            <Card
              title={"Average Run Duration"}
              icon={<AlertOctagonIcon size={18} color="gray" />}
              number={7.2}
              type={"seconds"}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              padding: "0px 18px",
              gap: "10px",
              width: "100%",
              boxSizing: "border-box",
              marginTop:"10px"
            }}
          >
            <Successful successful={120} failed={30} size={180} />
            <RecentActivity title={"Recent Activity"}/>
          </div>
        </main>
      </div>
    </div>
  );
}
