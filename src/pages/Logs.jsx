import React, { useEffect, useState } from "react";
import Breadcrumb from "../components/helper/Breadcrumb";
import Sidebar from "../components/Sidebar";
import LogsHeader from "../components/(logs)/logsHelpers/LogsHeader";
import LogsStats from "../components/(logs)/logsHelpers/LogsStats";
import LogsTable from "../components/(logs)/logsHelpers/LogsTable";
import example from "../components/(logs)/logsHelpers/mock/mock";
import example2 from "../components/(logs)/logsHelpers/mock/mock2";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

function Logs({ user }) {
  const [logs, setLogs] = useState([example2, example]);
  const [loading, setLoading] = useState(true);
  const [allLogData, setAllLogData] = useState([]);

  useEffect(() => {
    if (!user || !user.uid) {
      setLogs([example2, example]);
      setLoading(false);
      return;
    }

    // Try to read cached user profile to get orgId
    let orgId = null;
    try {
      const raw = localStorage.getItem(`spolm_user_${user.uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        orgId = parsed?.orgId || parsed?.organizationId || parsed?.org || null;
      }
    } catch (e) {
      console.warn("Failed to read cached user profile for orgId", e);
    }

    if (!orgId) {
      // no orgId available yet; show mock data
      setLogs([example2, example]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "organizations", orgId, "logs"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => {
          const data = d.data();
          // Normalize createdAt (support Firestore Timestamp)
          const createdAt =
            data?.createdAt && typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : data?.createdAt || null;
          return { id: d.id, ...data, createdAt };
        });
        setLogs(items);
        console.log(items);
        setLoading(false);

        // Build an array containing every `logData` property from the fetched items.
        try {
          const collected = items.flatMap((it) => {
            if (it == null) return [];
            const ld = it.logData;
            if (ld == null) return [];
            return Array.isArray(ld) ? ld : [ld];
          });
          setAllLogData(collected);
          // expose for quick debugging in the browser console
          try {
            window.__allLogData = collected;
          } catch (e) {}
        } catch (e) {
          console.warn("Failed to collect logData array", e);
        }

        // cache the latest page of logs
        try {
          localStorage.setItem(
            `org_${orgId}_logs`,
            JSON.stringify({ ts: Date.now(), data: items })
          );
        } catch (e) {
          // ignore localStorage errors
        }
      },
      (err) => {
        console.error("logs onSnapshot error", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar user={user} />
      <div style={{width:"100%"}}>
        <div
          style={{
            padding: "8px 18px",
            borderBottom: "1px solid gainsboro",
            position: "sticky",
            width: "100%",
          }}
        >
          <Breadcrumb items={["Per", "Logs"]} />
          {/* Header */}
        </div>{" "}
        <div style={{ width: "100%", padding:18 }}>
          <LogsHeader />
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "85%",
                height: "540px",
              }}
            >
              <LogsTable traces={allLogData} loading={loading} />
            </div>
            <div
              style={{
                width: "15%",
                borderLeft: "1px solid black",
                height: "540px",
              }}
            >
              <LogsStats
                sections={{
                  Stats: {
                    "Total Traces": Array.isArray(logs) ? logs.length : 0,
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
