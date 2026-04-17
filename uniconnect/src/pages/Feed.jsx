import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  // ✅ Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:50001/api/posts");
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="p-4 bg-gradient-to-br from-purple-800 via-purple-900 to-black text-white min-h-screen">

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        Campus Feed
      </h1>

      {/* 🔥 PINTEREST GRID */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">

        {posts.map((post) => (
          <motion.div
            key={post._id}
            whileHover={{ scale: 1.03 }}
            className="break-inside-avoid"
          >
            <div className="bg-purple-800/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-purple-500/30 transition">

              {/* Image */}
              {post.image && (
                <img
                  src={`http://localhost:50001${post.image}`}
                  alt="Post"
                  className="w-full object-cover rounded-t-2xl"
                />
              )}

              {/* Content */}
              <div className="p-3">
                <h3 className="font-semibold text-sm text-fuchsia-300">
                  {post.author?.username || "Anonymous"}
                </h3>

                <p className="text-sm text-gray-300 mt-1">
                  {post.content}
                </p>
              </div>

            </div>
          </motion.div>
        ))}

      </div>

    </div>
  );
}