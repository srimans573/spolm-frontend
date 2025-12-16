import React, { useState, useRef } from "react";
import CustomSelect from "./ui/CustomSelect";
import "../App.css";

function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const formRef = useRef(null);
  const [mode, setMode] = useState('s');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 8,
        padding: 12,
        border: "1px solid black",
        margin: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Ask Spolm..."
        style={{
          flex: 1,
          padding: 10,
          border: "none",
          fontFamily: "Poppins, sans-serif",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ width: 100 }}>
          <CustomSelect
            options={[{ value: 's', label: 's' }]}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </form>
  );
}

export default ChatInput;
