import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

const CampusFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("http://localhost:50001/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 Skeleton Loader
  if (loading) {
    return (
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(8)
          .fill()
          .map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-darkBg text-white p-4">

      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-center 
        bg-gradient-to-r from-neonPink to-neonBlue 
        bg-clip-text text-transparent"
      >
        🏫 Campus Feed
      </motion.h1>

      {/* 🔥 PINTEREST GRID */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">

        {posts.map((post, i) => (
          <motion.div
            key={post._id || i}
            className="break-inside-avoid cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(post)}
          >
            <div className="relative rounded-2xl overflow-hidden bg-cardBg/60 backdrop-blur-md shadow-lg">

              {/* IMAGE */}
              {post.image && (
                <img
                  src={
                    post.image.startsWith("http")
                      ? post.image
                      : `http://localhost:50001${post.image}`
                  }
                  alt="post"
                  className="w-full object-cover"
                />
              )}

              {/* 🔥 HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                <div className="flex justify-between items-center w-full">

                  <span className="text-sm font-semibold">
                    @{post.user?.username || "anon"}
                  </span>

                  <div className="flex items-center gap-2 text-sm">
                    <Heart size={16} /> {post.likes || 0}
                  </div>

                </div>
              </div>

              {/* TEXT */}
              {post.content && (
                <div className="p-3">
                  <p className="text-sm text-gray-300">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

      </div>

      {/* 🔥 FULLSCREEN MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-2xl w-full bg-black rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.image && (
                <img
                  src={
                    selected.image.startsWith("http")
                      ? selected.image
                      : `http://localhost:50001${selected.image}`
                  }
                  className="w-full max-h-[70vh] object-cover"
                />
              )}

              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">
                  @{selected.user?.username || "anonymous"}
                </h2>

                <p className="text-gray-300">
                  {selected.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CampusFeed;