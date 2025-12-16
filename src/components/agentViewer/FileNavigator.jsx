import React from 'react';

export default function FileNavigator({
  branches,
  selectedBranch,
  setSelectedBranch,
  query,
  setQuery,
  filteredFiles,
  loading,
  error,
  openFile,
  CustomSelect,
  fontSizes,
  colors,
}) {
  const inputStyle = {
    flex: 1,
    padding: '8px 12px',
    boxSizing: 'border-box',
    width: '100%',
    border: `1px solid ${colors.border}`,
    borderRadius: 0,
    fontSize: fontSizes.sm,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        flex: '0 0 340px',
        minWidth: 260,
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgMain,
        borderRight: `1px solid ${colors.border}`,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: fontSizes.sm, fontWeight: 600, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Repository Files</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <CustomSelect
            options={[
              { value: '', label: 'Select branch' },
              ...branches.map((b) => ({ value: b.name, label: b.name })),
            ]}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <input
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = colors.accentPrimary)}
          onBlur={(e) => (e.target.style.borderColor = colors.border)}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: `1px solid ${colors.border}`,
          borderRadius: 0,
          background: colors.bgMain,
        }}
      >
        {loading && (
          <div style={{ padding: 16, color: colors.textSecondary, fontSize: fontSizes.sm }}>
            Loading repository...
          </div>
        )}

        {error && (
          <div
            style={{
              color: colors.errorText,
              background: colors.errorBg,
              padding: '12px',
              margin: '8px',
              borderRadius: 0,
              fontSize: fontSizes.sm,
              border: `1px solid ${colors.errorBorder}`,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && filteredFiles.length === 0 && (
          <div style={{ padding: 16, color: colors.textSecondary, fontSize: fontSizes.sm }}>No files found</div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredFiles.map((f) => (
            <li
              key={f.path}
              style={{
                padding: '8px 12px',
                borderBottom: `1px solid ${colors.hoverBg}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={() => openFile(f.path)}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflow: 'hidden' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: fontSizes.sm,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: colors.textPrimary,
                  }}
                  title={f.path}
                >
                  {f.path}
                </span>
              </div>
              <div style={{ fontSize: fontSizes.xs, color: colors.textSecondary, flexShrink: 0, marginLeft: 12 }}>
                {f.size ? Math.ceil(f.size / 1024) + ' KB' : '-'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
