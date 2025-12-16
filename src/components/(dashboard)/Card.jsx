export default function Card({ title, icon, number, type }) {
  return (
    <div
      style={{
        height: "300px",
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
            fontSize: "60px",
          }}
        >
          {number}{" "}
        </h1>
        <button
          style={{
            width: "fit-content",
            borderBottom: "1px solid black",
            padding: "0px",
          }}
        >
          View More
        </button>
      </div>
    </div>
  );
}
