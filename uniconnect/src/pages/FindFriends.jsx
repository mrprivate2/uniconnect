import React, { useState } from "react";
import { motion } from "framer-motion";

const allFriends = [
  { id: 1, name: "Alice Johnson", university: "Chandigarh University", avatar: "https://i.pravatar.cc/100?img=1", online: true },
  { id: 2, name: "Bob Williams", university: "Delhi University", avatar: "https://i.pravatar.cc/100?img=2", online: false },
  { id: 3, name: "Charlie Brown", university: "IIT Bombay", avatar: "https://i.pravatar.cc/100?img=3", online: true },
  { id: 4, name: "Daisy Patel", university: "NIT Trichy", avatar: "https://i.pravatar.cc/100?img=4", online: false },
  { id: 5, name: "Emma Singh", university: "Amity University", avatar: "https://i.pravatar.cc/100?img=5", online: true },
  { id: 6, name: "Franklin Mehta", university: "SRM University", avatar: "https://i.pravatar.cc/100?img=6", online: false },
  { id: 7, name: "Grace Kumar", university: "BITS Pilani", avatar: "https://i.pravatar.cc/100?img=7", online: true },
  { id: 8, name: "Harshit Rao", university: "Chandigarh University", avatar: "https://i.pravatar.cc/100?img=8", online: true },
];

export default function FindFriends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentRequests, setSentRequests] = useState([]);

  const filteredFriends = allFriends.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFriend = (id) => {
    setSentRequests((prev) => [...prev, id]);
  };

  return (
    <motion.div
      className="min-h-[85vh] bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">
        Find Friends 👥
      </h1>

      {/* 🔍 Search Bar */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search by name or university..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md 
          bg-purple-900/40 backdrop-blur-md 
          border border-purple-500/30 
          rounded-xl px-4 py-2 text-white 
          placeholder-gray-400 
          focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* 🧑‍🤝‍🧑 Friends Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => {
            const isSent = sentRequests.includes(friend.id);

            return (
              <motion.div
                key={friend.id}
                whileHover={{ scale: 1.05 }}
                className="bg-purple-800/50 backdrop-blur-md 
                border border-purple-500/20 
                rounded-2xl p-4 flex flex-col items-center 
                shadow-lg hover:shadow-purple-500/30 transition"
              >

                {/* Avatar + Online */}
                <div className="relative mb-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-20 h-20 rounded-full border-4 border-purple-500"
                  />
                  {friend.online && (
                    <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border border-black" />
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-center">
                  {friend.name}
                </h3>

                <p className="text-sm text-purple-300 text-center">
                  {friend.university}
                </p>

                {/* Button */}
                <button
                  onClick={() => handleAddFriend(friend.id)}
                  disabled={isSent}
                  className={`mt-3 px-4 py-2 rounded-xl text-sm transition ${
                    isSent
                      ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105"
                  }`}
                >
                  {isSent ? "✓ Request Sent" : "Add Friend"}
                </button>

              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-400 mt-10">
            😢 No friends found
          </div>
        )}

      </div>
    </motion.div>
  );
}