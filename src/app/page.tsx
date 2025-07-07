"use client";

import { useEffect, useRef, useState } from "react";
import { connectSocket } from "@/lib/socket";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function Home() {
  const socketRef = useRef<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Example static IDs — replace with real ones dynamically
  const conversationId = "0f6059a1-47a4-4639-bef1-1e119e96981b";
  const senderId = "e3d531f6-4803-4ac3-b029-932806d8f596";

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("joinRoom", { conversationId });
    socket.emit("getMessages", { conversationId, page: 1, limit: 30 });

    socket.on("messagesFetched", (res) => {
      console.log("📥 Messages fetched:", res);

      const incomingMessages = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      setMessages(incomingMessages);
    });

    socket.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    socketRef.current.emit("sendMessage", {
      conversationId,
      senderId,
      content: input,
      messageType: "TEXT",
    });

    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>

      <div className="border h-96 overflow-y-scroll p-4 rounded bg-gray-100 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2 text-black">
            <strong>{msg.sender.name}</strong>: {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-4 py-2 rounded"
          placeholder="Type a message"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
