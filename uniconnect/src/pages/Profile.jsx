import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, UserPlus, Image, X, Heart, MessageCircle } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Sawan Yaduvanshi",
    username: "@sawanyadav",
    bio: "Engineering Student at Chandigarh University | Loves coding 💻 & coffee ☕",
    avatar: "https://i.pravatar.cc/200?img=12",
    friends: 320,
    posts: 9,
  });

  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleSave = () => {
    setUser(editedUser);
    setEditMode(false);
  };

  const fakePosts = [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d",
      caption: "Late-night coding session ☕💻 #StudentLife",
      likes: 128,
      comments: 18,
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
      caption: "Organizing my semester notes 📚✨",
      likes: 155,
      comments: 22,
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1513258496099-48168024aec0",
      caption: "AI lecture 🤖",
      likes: 112,
      comments: 16,
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1f3",
      caption: "React project 🚀",
      likes: 174,
      comments: 30,
    },
    {
      id: 5,
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
      caption: "Study goals ✅",
      likes: 139,
      comments: 11,
    },
    {
      id: 6,
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      caption: "Group study 📖",
      likes: 189,
      comments: 24,
    },
    {
      id: 7,
      img: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238",
      caption: "Library vibes 📚💜",
      likes: 210,
      comments: 26,
    },
    {
      id: 8,
      img: "https://images.unsplash.com/photo-1584697964192-3c351ba6c4e5",
      caption: "Final year project 👨‍💻",
      likes: 165,
      comments: 19,
    },
    {
      id: 9,
      img: "https://images.unsplash.com/photo-1522202222206-0ec76d39e6b8",
      caption: "Teamwork 🙌",
      likes: 233,
      comments: 37,
    },
  ];

  return (
    <motion.div
      className="min-h-[85vh] bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white flex flex-col items-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 🔥 PROFILE HEADER */}
      <div className="flex flex-col items-center mb-6">

        <motion.img
          src={user.avatar}
          alt="Profile"
          className="w-28 h-28 rounded-full border-4 border-purple-500 shadow-[0_0_25px_#a855f7] mb-4"
          whileHover={{ scale: 1.1 }}
        />

        <h2 className="text-2xl font-semibold">{user.name}</h2>
        <p className="text-purple-300">{user.username}</p>

        <p className="text-sm text-gray-400 text-center max-w-md mt-2">
          {user.bio}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold">{user.posts}</p>
            <p className="text-sm text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{user.friends}</p>
            <p className="text-sm text-gray-400">Friends</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-xl text-sm hover:scale-105 transition"
          >
            <Edit2 size={16} /> Edit Profile
          </button>

          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm transition">
            <UserPlus size={16} /> Add Friend
          </button>
        </div>
      </div>

      {/* 🔥 POSTS GRID */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-3">
        {fakePosts.map((post) => (
          <motion.div
            key={post.id}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-xl cursor-pointer group"
            onClick={() => setSelectedPost(post)}
          >
            <img src={post.img} className="w-full h-full object-cover" />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-semibold transition">
              <div className="flex items-center gap-1">
                <Heart size={18} /> {post.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={18} /> {post.comments}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🔥 POST MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              className="bg-black/90 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg border border-purple-700 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setSelectedPost(null)}
              >
                <X size={22} />
              </button>

              <img src={selectedPost.img} className="rounded-xl mb-3" />

              <p className="text-sm text-purple-300 italic">
                {selectedPost.caption}
              </p>

              <div className="flex items-center gap-5 mt-3 text-gray-300">
                <div className="flex items-center gap-2">
                  <Heart className="text-red-500" /> {selectedPost.likes}
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle /> {selectedPost.comments}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 EDIT MODAL */}
      {editMode && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-black/90 p-6 rounded-2xl shadow-lg w-[90%] max-w-md border border-purple-800"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

            <div className="flex flex-col gap-3">
              <input
                value={editedUser.name}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, name: e.target.value })
                }
                className="bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              />

              <input
                value={editedUser.username}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, username: e.target.value })
                }
                className="bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                value={editedUser.bio}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, bio: e.target.value })
                }
                className="bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-white resize-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={handleSave}
                className="mt-3 bg-gradient-to-r from-purple-600 to-pink-500 py-2 rounded-lg hover:scale-105 transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}