import {
  ActivityIcon,
  BotIcon,
  BrainCircuitIcon,
  BrainCogIcon,
  BrainIcon,
  HomeIcon,
  icons,
  LogOutIcon,
  LogsIcon,
  Settings2Icon,
  SettingsIcon,
  TrendingUpDown,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

function Sidebar({
  organization = { name: "Spolm Org", initials: "SP" },
  user = null,
}) {
  const { collapsed } = useSidebar();
  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: <HomeIcon size={15} /> },
    { label: "Agents", to: "/agents", icon: <BrainIcon size={15} /> },
    { label: "Traces", to: "/logs", icon: <LogsIcon size={15} /> },
    { label: "Patterns", to: "/patterns", icon: <TrendingUpDown size={15} /> },
    { label: "Settings", to: "/settings", icon: <SettingsIcon size={15} /> },
  ];

  const activeLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: collapsed ? "0px" : "12px",
    color: "black",
    background: isActive ? "whitesmoke" : "transparent",
    textDecoration: "none",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    borderLeft: isActive && "2px solid coral",
    padding: collapsed ? "8px 0px" : "5px 10px",
    justifyContent: collapsed ? "center" : "flex-start",
    width: "100%",
  });

  return (
    <aside
      style={{
        minWidth: collapsed ? 64 : 240,
        width: collapsed ? 40 : 240,
        borderRight: "1px solid #e5e7eb",
        padding: collapsed ? "12px 8px" : "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fff",
        height: "1",
        boxSizing: "border-box",
        transition: "width 160ms ease, padding 120ms ease",
        overflow: "hidden",
      }}
    >
      <div>
        {/* Organization badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: collapsed ? 8 : 18,
            paddingBottom: collapsed ? 6 : "10px",
            justifyContent: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                margin: "0px",
                fontSize: collapsed ? 12 : 20,
                fontWeight: 600,
                fontFamily: "Libre Baskerville",
                padding: "5px",
              }}
            >
              {"spolm"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <div
            style={{
              padding: 0,
              marginRight: !collapsed && 20,
              display: "flex",
              flexDirection: "column",
              justifyContent:"center",
              gap: 6,
            }}
          >
            {navItems.map((item) => (
              <NavLink to={item.to} style={activeLinkStyle} key={item.to}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : 12,
                    justifyContent: collapsed ? "center" : "flex-start",
                    width: "100%",
                  }}
                >
                  {item.icon}
                  <span style={{ display: collapsed ? "none" : "inline" }}>
                    {item.label}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Bottom area: profile / settings / logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingTop: collapsed ? 8 : "10px",
        }}
      >
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "black",
            fontSize: "14px",
            paddingLeft: collapsed ? 0 : "10px",
            cursor: "pointer",
            justifyContent:collapsed&&"center"
          }}
        >
          <LogOutIcon size={15} />
          {!collapsed && <span>Log Out</span>}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderTop: collapsed ? "none" : "1px solid #e5e7eb",
            paddingTop: collapsed ? 8 : 20,
            width: "100%",
            justifyContent:"center"
          }}
        >
          <div
            style={{
              width: collapsed ? "80%" : 40,
              height: collapsed ? 36 : 40,
              background: "coral",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#0f172a",
              border: "1px solid black",
              fontSize: collapsed ? 16 : 30,
              borderRadius: "1px",
              fontFamily: "Libre Baskerville",
            }}
          >
            {user && user.uid
              ? (
                  (
                    JSON.parse(
                      localStorage.getItem("spolm_user_" + user.uid)
                    ) || {}
                  ).firstName || "U"
                ).slice(0, 1)
              : "U"}
          </div>
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {(user &&
                  user.uid &&
                  (
                    JSON.parse(
                      localStorage.getItem("spolm_user_" + user.uid)
                    ) || {}
                  ).firstName) ||
                  "User"}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {user &&
                  user.uid &&
                  (
                    JSON.parse(
                      localStorage.getItem("spolm_user_" + user.uid)
                    ) || {}
                  ).organization}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
