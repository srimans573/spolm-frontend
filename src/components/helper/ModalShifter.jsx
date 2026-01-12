export default function ModalShifter({subOptions, setSubOptionMode, subOptionMode}) {
  return (
    <div style={{ borderTop: "1px solid gainsboro", display: "flex" }}>
      {subOptions.map((t, idx) => (
        <div
          style={{
            padding: "0px 61px",
            borderRight: "1px solid gainsboro",
            width: "fit-content",
            textAlign: "center",
            cursor: "pointer",
            background: subOptionMode == t.name && "whitesmoke",
            borderBottom: subOptionMode == t.name && "2px solid black",
            fontWeight: subOptionMode == t.name && "600",
            fontFamily: "Poppins",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
          onClick={async () => setSubOptionMode(t.name)}
        >
          <div style={{ marginTop: "3px", marginRight: "5px" }}>{t.icon}</div>
          <p style={{ fontSize: "12px" }}>{t.name}</p>
        </div>
      ))}
    </div>
  );
}
