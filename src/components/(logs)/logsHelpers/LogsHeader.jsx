import { useState } from "react";
import CustomSelect from "../../ui/CustomSelect";
import { Calendar1Icon, TimerIcon } from "lucide-react";

const LogsHeader = () => {
  const [selectedProject, setSelectedProject] = useState("Project");
  const [dateRange, setDateRange] = useState("last-7-days");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stepType, setStepType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // custom select

  const logData = {
    agent_id: "Sriram",
    run_id: "123456782765679829329732",
  };

  return (
    <div style={{}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0px",
              fontFamily: "Libre Baskerville, serif",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Traces
          </h2>
          <p
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            View your development & production traces here
          </p>
        </div>
        <div
          style={{
            display: "flex",
            height: "fit-content",
            justifyContent: "space-between",
          }}
        >
          {/* Date Range */}
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
              style={{padding: "0px 5px" }}
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
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          width: "100%",
          borderBottom: "1px solid black",
          paddingBottom: "10px",
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: "1px solid #e5e7eb",
            padding: "4px 12px",
            fontSize: "14px",
            minWidth: "250px",
            fontFamily: "inherit",
          }}
        />

        {/* Status Filter */}
        <div style={{ width: 160 }}>
          <CustomSelect
            options={[
              { value: "all", label: "All Status" },
              { value: "complete", label: "Complete" },
              { value: "failed", label: "Failed" },
              { value: "running", label: "Running" },
              { value: "pending", label: "Pending" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {/* Step Type Filter */}
        <div style={{ width: 160 }}>
          <CustomSelect
            options={[
              { value: "all", label: "All Types" },
              { value: "llm_call", label: "LLM Calls" },
              { value: "auth_call", label: "Auth" },
              { value: "email", label: "Email" },
            ]}
            value={stepType}
            onChange={(e) => setStepType(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSearchQuery("");
            setDateRange("last-7-days");
            setStatusFilter("all");
          }}
          style={{
            border: "1px solid #e5e7eb",
            padding: "4px 16px",
            fontSize: "14px",
            background: "white",
            cursor: "pointer",
            color: "black",
            width: "fit-content",
            alignSelf: "flex-end",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default LogsHeader;
