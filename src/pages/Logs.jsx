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
  const [servedServerSnapshot, setServedServerSnapshot] = useState(false);

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
      { includeMetadataChanges: true },
      (snapshot) => {
        const isFromCache = !!snapshot.metadata?.fromCache;
        const hasPendingWrites = !!snapshot.metadata?.hasPendingWrites;

        // If persistence is enabled, Firestore may deliver a cached snapshot first.
        // To avoid showing stale data that no longer exists on the server, ignore the
        // initial cached snapshot when we are online and haven't served a server result yet.
        if (isFromCache && typeof navigator !== "undefined" && navigator.onLine && !servedServerSnapshot) {
          // keep loading until we receive a server-backed snapshot
          setLoading(true);
          return;
        }

        const items = snapshot.docs.map((d) => {
          const data = d.data();
          // Normalize createdAt (support Firestore Timestamp)
          const createdAt =
            data?.createdAt && typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : data?.createdAt || null;

          const agentId = data?.agentId;
          return { id: d.id, ...data, createdAt, agentId };
        });
        console.log(items)
        setLogs(items);
        // mark that we've served at least one non-cache snapshot
        if (!isFromCache) setServedServerSnapshot(true);
        console.log("Logs snapshot", {
          count: items.length,
          fromCache: isFromCache,
          hasPendingWrites,
          docIds: snapshot.docs.map((d) => d.id),
        });
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
      <div style={{ width: "100%" }}>
        <div
          style={{
            padding: "8px 18px",
            borderBottom: "1px solid gainsboro",
            position: "sticky",
            width: "100%",
            marginBottom:"18px"
          }}
        >
          <Breadcrumb items={["Per", "Logs"]} />
          {/* Header */}
        </div>{" "}
        <div style={{ width: "100%" }}>
          <div style={{ padding: "0px 18px" }}>
            <LogsHeader />
          </div>
         
            <div
              style={{
                width:"100%",
                height: "540px",
                boxSizing:"border-box",
                padding:"0px 18px"
              }}
            >
              <LogsTable traces={logs} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
