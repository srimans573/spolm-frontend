import React, { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

function ChatWindow({ messages = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={ref} style={{ overflowY: "auto", padding: 16, height: "100%" }}>
      {messages.map((m, i) => (
        <ChatBubble key={i} text={m.text} from={m.from} />
      ))}
    </div>
  );
}

export default ChatWindow;
