import React from "react";

function ChatBubble({ text, from = "bot" }) {
  const isUser = from === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "center",
        marginTop:"10px"
      }}
    >
      <div
        style={{
          height: "30px",
          width: "30px",
          display: "flex",
          outline: "1px solid black",
          marginRight: "10px",
          color: "black",
          justifyContent: "center",
          alignItems: "center",
          fontFamily:"Poppins",
          fontWeight:"bold"
        }}
      >
        <p></p>
        {isUser ? "U" : "s"}
      </div>
      <div
        style={{
          maxWidth: "75%",
          border: isUser ? "1px solid black" : "1px solid orange",
          color: isUser ? "black" : "black",
          fontFamily: "Poppins, sans-serif",
          fontSize: 14,
          display: "flex",
        }}
      >
        <p style={{ padding: "10px 12px" }}>{text}</p>
      </div>
    </div>
  );
}

export default ChatBubble;
