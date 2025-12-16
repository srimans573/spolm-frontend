import {ChevronRight} from "lucide-react";
import React from "react";

/**
 * Breadcrumb component (inline styles, no Tailwind)
 * Generates real URLs based on items.
 */
export default function Breadcrumb({ items = [] }) {

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#6b7280",
  };

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    fontFamily:"Poppins"
  };

  const linkStyle = {
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    transition: "color 0.2s",
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: "#111827",
    fontWeight: "500",
  };

  const separatorStyle = {
    margin: "0 8px",
    color: "#d1d5db",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
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
              {idx==0?"Personal":item}
            </a>
            {!isLast && <span style={separatorStyle}><ChevronRight size={20}/></span>}
          </div>
        );
      })}
    </nav>
  );
}
