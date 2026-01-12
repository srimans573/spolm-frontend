import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React from "react";
import { useSidebar } from "../../context/SidebarContext";

/**
 * Breadcrumb component (inline styles, no Tailwind)
 * Generates real URLs based on items.
 */
export default function Breadcrumb({ items = [] }) {
  const { collapsed, toggle } = useSidebar();

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#6b7280",
    width: "100%",
  };

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    fontFamily: "Poppins",
    whiteSpace: "nowrap",
  };

  const linkStyle = {
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    transition: "color 0.2s",
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "inline-block",
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: "#111827",
    fontWeight: "500",
  };

  const separatorStyle = {
    margin: "0 8px",
    color: "#d1d5db",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  // Build cumulative paths, but first item always goes to /dashboard
  const paths = items.map((_, idx) => {
    if (idx === 0) return "/dashboard";
    return (
      "/" +
      items
        .slice(1, idx + 1)
        .map((s) => s.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-"))
        .join("/")
    );
  });

  return (
    <nav style={containerStyle}>
      <div style={{ display: "flex", alignItems: "center" }}>
      <button
        onClick={toggle}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0px",
          marginRight: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} style={itemStyle}>
            <a
              href={paths[idx]}
              style={isLast ? activeLinkStyle : linkStyle}
              onMouseEnter={(e) =>
                !isLast && (e.currentTarget.style.color = "#111827")
              }
              onMouseLeave={(e) =>
                !isLast && (e.currentTarget.style.color = "#6b7280")
              }
            >
              {idx == 0 ? "Personal" : item}
            </a>
            {!isLast && (
              <span style={separatorStyle}>
                <ChevronRight size={20} />
              </span>
            )}
          </div>
        );
      })}
      </div>
    </nav>
  );
}
