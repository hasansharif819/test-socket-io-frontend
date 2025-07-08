/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { FaRegThumbsUp, FaRegCommentDots, FaShare } from "react-icons/fa";

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content?: string;
  image?: string;
}

const dummyPosts: Post[] = [
  {
    id: "1",
    user: {
      name: "Sharif Hasan",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    content: "Just enjoying the weather today 🌤️",
  },
  {
    id: "2",
    user: {
      name: "Emily Watson",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
    image: "https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg",
  },
  {
    id: "3",
    user: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
    content: "Weekend hiking adventure! 🥾🌲",
    image: "https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg",
  },
  {
    id: "4",
    user: {
      name: "Reazul Islam",
      avatar: "https://i.pravatar.cc/150?img=27",
    },
    content: "Weekend hiking adventure! 🥾🌲",
    image: "https://images.pexels.com/photos/302743/pexels-photo-302743.jpeg",
  },
];

export default function HomePage() {
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (postId: string) => {
    setLikes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
          👋 Welcome to ChatHive
        </h1>

        <div className="space-y-6">
          {dummyPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-semibold text-gray-800">
                  {post.user.name}
                </span>
              </div>

              {post.content && (
                <p className="text-gray-700 text-base mb-3">{post.content}</p>
              )}

              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-auto rounded-lg mb-3"
                />
              )}

              <div className="flex justify-between items-center text-gray-600 mt-2 pt-2 border-t">
                <button
                  className="flex items-center gap-1 hover:text-blue-600 transition"
                  onClick={() => handleLike(post.id)}
                >
                  <FaRegThumbsUp /> Like ({likes[post.id] || 0})
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600 transition">
                  <FaRegCommentDots /> Comment
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600 transition">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
