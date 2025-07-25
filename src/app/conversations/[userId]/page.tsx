/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { connectSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
  profilePicture: string | null;
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

    // Initial fetch
    socket.emit("getConversations", {
      userId,
      page: 1,
      limit: 20,
    });

    socket.on("conversationsFetched", (res) => {
      console.log("📦 Conversations fetched:", res);
      setConversations(res.data || []);
    });

    // Listen for conversation updates
    socket.on("conversationUpdated", (data) => {
      if (data.userId === userId) {
        setConversations((prev) => {
          // Remove the old version of the conversation if it exists
          const filtered = prev.filter((c) => c.id !== data.conversation.id);
          // Add the updated conversation to the beginning of the array
          return [data.conversation, ...filtered];
        });
      }
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
      <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>

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
                className="bg-white shadow rounded p-4 flex gap-4 items-start hover:bg-gray-50 transition cursor-pointer"
              >
                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xl font-semibold text-white shrink-0">
                  {otherUser?.profilePicture ? (
                    <img
                      src={otherUser.profilePicture}
                      alt={otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-700">
                      {otherUser?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-semibold text-black">
                      {otherUser?.name || "Unknown User"}
                    </h2>
                    <span className="text-xs text-gray-400">
                      {lastMessage?.createdAt &&
                        new Date(lastMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      lastMessage?.isRead === false
                        ? "font-extrabold text-green-500"
                        : "text-gray-600"
                    }`}
                  >
                    {lastMessage?.content || "No messages yet"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
