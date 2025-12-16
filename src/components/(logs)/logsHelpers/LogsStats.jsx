import React, { useState } from "react";

/**
 * StatsDropdown Component
 * - Fills the full width of its container
 * - Shows a header bar; clicking toggles open/close
 * - Displays stats such as total traces
 */
export default function LogsStats({ sections = {} }) {
  const [openSections, setOpenSections] = useState({});

  const toggle = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const containerStyle = {
    width: "100%",
    overflowY: "scroll",
    fontSize: "14px",
    background: "transparent",
    height:"inherit"
  };

  const headerStyle = {
    width: "100%",
    padding: "8px",
    cursor: "pointer",
    userSelect: "none",
    fontFamily: "Poppins",
    borderBottom: "1px solid gainsboro",
  };

  const sectionStyle = {
    width: "100%",
  };

  const contentStyle = {
    padding: "12px",
  };

  return (
    <div style={containerStyle}>
      {Object.keys(sections).map((sectionKey) => (
        <div key={sectionKey} style={sectionStyle}>
          <div style={headerStyle} onClick={() => toggle(sectionKey)}>
            {sectionKey}
          </div>

          {openSections[sectionKey] && (
            <div style={contentStyle}>
              {Object.keys(sections[sectionKey]).map((statKey) => (
                <div key={statKey} style={{ marginBottom: "6px" }}>
                  <p style={{fontSize:"12px", color:"gray"}}>{statKey}:</p>
                  <p style={{fontSize:"16px"}}>{sections[sectionKey][statKey]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Example usage inside your container div:
 *
 * <div style={{ width: "15%", height: "520px", background: "white" }}>
 *   <StatsDropdown stats={{
 *     "Total Traces": 1284,
 *     "Errors": 32,
 *     "Active Sessions": 18,
 *   }} />
 * </div>
 */
