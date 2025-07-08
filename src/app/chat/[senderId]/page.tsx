/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { connectSocket } from "@/lib/socket";
import { FaPhoneAlt, FaVideo, FaEllipsisV } from "react-icons/fa";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  createdAt: string;
}

export default function ChatPage() {
  const { senderId } = useParams<{ senderId: string }>();
  const socketRef = useRef<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState<null | Message["sender"]>(null);

  // const conversationId = "839d396a-0008-4675-8a3c-db1b648d9510";
  const conversationId = "0f6059a1-47a4-4639-bef1-1e119e96981b";

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("joinRoom", { conversationId });
    socket.emit("getMessages", { conversationId, page: 1, limit: 30 });

    socket.on("messagesFetched", (res) => {
      const incomingMessages = Array.isArray(res?.data) ? res.data : [];
      setMessages(incomingMessages);

      const altUser = incomingMessages.find(
        (m: any) => m.sender.id !== senderId
      );
      if (altUser) setReceiver(altUser.sender);
    });

    socket.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);

      if (message.sender.id !== senderId) {
        setReceiver(message.sender);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, senderId]);

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
    <div className="max-w-3xl mx-auto border rounded shadow-md mt-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 rounded-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden text-blue-600 font-semibold text-sm shrink-0">
            {receiver?.profilePicture ? (
              <img
                src={receiver.profilePicture}
                alt={receiver.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{receiver?.name?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="text-lg font-semibold">
            {receiver?.name || "Receiver"}
          </div>
        </div>
        <div className="flex gap-4 text-xl">
          <FaPhoneAlt className="cursor-pointer hover:text-blue-200" />
          <FaVideo className="cursor-pointer hover:text-blue-200" />
          <FaEllipsisV className="cursor-pointer hover:text-blue-200" />
        </div>
      </div>

      {/* Messages */}
      <div className="h-[500px] overflow-y-auto p-4 bg-gray-100 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender.id === senderId;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden text-white font-semibold text-sm shrink-0">
                  {msg.sender.profilePicture ? (
                    <img
                      src={msg.sender.profilePicture}
                      alt={msg.sender.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-700">
                      {msg.sender.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              )}

              <div
                className={`rounded-xl px-4 py-2 max-w-[70%] ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 shadow"
                }`}
              >
                <div className="text-sm">{msg.content}</div>
              </div>

              {isMe && (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden text-white font-semibold text-sm shrink-0">
                  <span className="text-gray-700">
                    {msg.sender.name?.[0]?.toUpperCase() || "M"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t">
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
