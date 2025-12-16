export default function RecentActivity({ title, icon, number, type }) {
  return (
    <div
      style={{
        border: "1px solid gainsboro",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex:1
      }}
    >
      <div>
        {icon}
        <p
          style={{
            fontFamily: "Poppins",
            marginLeft: 2,
            color: " gray",
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1
          style={{
            fontFamily: "Libre Baskerville",
            margin: 0,
            fontSize: "30px",
          }}
        >
          {number}{"Nothing to show."}
        </h1>
      </div>
    </div>
  );
}
