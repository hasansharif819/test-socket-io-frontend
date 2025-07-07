/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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

export default function ChatPage() {
  const { senderId } = useParams<{ senderId: string }>();
  const socketRef = useRef<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const conversationId = "0f6059a1-47a4-4639-bef1-1e119e96981b"; // TODO: Replace with real ID or fetch from query

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("joinRoom", { conversationId });
    socket.emit("getMessages", { conversationId, page: 1, limit: 30 });

    socket.on("messagesFetched", (res) => {
      const incomingMessages = Array.isArray(res?.data) ? res.data : [];
      setMessages(incomingMessages);
    });

    socket.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId]);

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Chat Room</h1>

      <div className="h-[500px] overflow-y-auto border rounded p-4 bg-gray-100 mb-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender.id === senderId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-[70%] ${
                  isMe ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {msg.sender.name}
                </div>
                <div className="text-base">{msg.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-4 py-2 rounded"
          placeholder="Type your message..."
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
