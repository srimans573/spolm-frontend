import React from "react";
import { User, Mail, Building, Hash } from "lucide-react";

const colors = {
  black: "#000000",
  white: "#ffffff",
  coral: "#FF6B6B",
  coralLight: "#FFE5E5",
  gray: "#666666",
  grayLight: "#f5f5f5",
};

const fonts = {
  heading: '"Libre Baskerville", Georgia, serif',
  body: "Poppins, system-ui, sans-serif",
};

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 16px",
        borderBottom: `1px solid ${colors.black}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: colors.grayLight,
          border: `1px solid ${colors.black}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        <Icon size={14} color={colors.gray} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: colors.gray,
            fontFamily: fonts.body,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: colors.black,
            fontFamily: fonts.body,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

export default function UserInfoCard({ user }) {
  const localKey = user ? `spolm_user_${user.uid}` : null;
  const raw = localKey ? localStorage.getItem(localKey) : null;
  const cached = safeParse(raw) || {};

  const displayName = user?.firstName || cached?.firstName || "—";
  const email = user?.email || cached?.email || "—";
  const orgId = cached?.orgId || cached?.organizationId || "—";
  const orgName = cached?.organization || cached?.organization || "—";

  return (
    <div style={{ marginTop: 20 }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
          borderBottom: `1px solid ${colors.black}`,
          marginBottom: 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: fonts.heading,
            fontSize: 16,
            fontWeight: 400,
          }}
        >
          Account
        </h3>
      </div>

      {/* Info Card */}
      <div
        style={{
          border: `1px solid ${colors.black}`,
          borderTop: "none",
          background: colors.white,
        }}
      >
        <InfoRow icon={User} label="Name" value={displayName} />
        <InfoRow icon={Mail} label="Email" value={email} />
        <InfoRow icon={Building} label="Organization" value={orgName} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: colors.grayLight,
              border: `1px solid ${colors.black}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
              flexShrink: 0,
            }}
          >
            <Hash size={14} color={colors.gray} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: colors.gray,
                fontFamily: fonts.body,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 2,
              }}
            >
              Organization ID
            </div>
            <code
              style={{
                fontSize: 12,
                color: colors.black,
                fontFamily: "monospace",
                display: "inline-block",
              }}
            >
              {orgId}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
