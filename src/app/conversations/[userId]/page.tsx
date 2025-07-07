"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { connectSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
  profilePicture: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  participants: { user: User }[];
  messages: Message[];
}

export default function ConversationsPage() {
  const socketRef = useRef<any>(null);
  const { userId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit("getConversations", {
      userId,
      page: 1,
      limit: 20,
    });

    socket.on("conversationsFetched", (res) => {
      console.log("📦 Conversations fetched:", res);
      setConversations(res.data || []);
    });

    socket.on("error", (err) => {
      console.error("❌ Socket error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>

      {conversations.length === 0 ? (
        <p>No conversations found.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv) => {
            const otherUser = conv.participants.find(
              (p) => p.user.id !== userId
            )?.user;

            const lastMessage = conv.messages?.[0];

            return (
              <li
                key={conv.id}
                className="bg-white shadow rounded p-4 flex justify-between items-start hover:bg-gray-50 transition"
              >
                <div>
                  <h2 className="text-lg text-black font-semibold">
                    {otherUser?.name || "Unknown User"}
                  </h2>
                  <p
                    className={`text-sm ${
                      lastMessage?.isRead === false
                        ? "font-extrabold text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    {lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {lastMessage?.createdAt &&
                    new Date(lastMessage.createdAt).toLocaleString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
