import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// --- Fake Friend Data ---
const friends = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/100?img=1", online: true },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/100?img=2", online: false },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/100?img=3", online: true },
  { id: 4, name: "Daisy", avatar: "https://i.pravatar.cc/100?img=4", online: false },
];

export default function Chat() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState({});
  const bottomRef = useRef();

  // 🔥 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedFriend]);

  const sendMessage = () => {
    if (!message.trim() || !selectedFriend) return;

    const newMessage = {
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "You",
    };

    setChats((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMessage],
    }));

    setMessage("");
  };

  return (
    <div className="h-[85vh] bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white rounded-2xl shadow-xl flex overflow-hidden">

      {/* 🔥 FRIEND LIST */}
      <div className="w-1/3 border-r border-purple-800 overflow-y-auto">
        <h2 className="text-lg font-semibold text-center py-4 border-b border-purple-700">
          Messages
        </h2>

        {friends.map((f) => (
          <motion.div
            key={f.id}
            onClick={() => setSelectedFriend(f)}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-3 p-3 cursor-pointer transition ${
              selectedFriend?.id === f.id
                ? "bg-purple-700/40"
                : "hover:bg-purple-800/30"
            }`}
          >
            <div className="relative">
              <img
                src={f.avatar}
                alt={f.name}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              {f.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-black" />
              )}
            </div>

            <div>
              <h3 className="font-semibold">{f.name}</h3>
              <p className="text-xs text-gray-400">
                {f.online ? "Online" : "Offline"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🔥 CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {selectedFriend ? (
          <>
            {/* HEADER */}
            <div className="flex items-center gap-3 border-b border-purple-700 p-3 bg-purple-900/40 backdrop-blur-md">
              <img
                src={selectedFriend.avatar}
                alt={selectedFriend.name}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedFriend.name}
                </h2>
                <p className="text-xs text-gray-400">
                  {selectedFriend.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {(chats[selectedFriend.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "You"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${
                      msg.sender === "You"
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                        : "bg-gray-800 text-purple-300"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] text-gray-300 text-right mt-1">
                      {msg.time}
                    </p>
                  </motion.div>
                </div>
              ))}

              {/* 🔥 auto scroll anchor */}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-purple-700 p-3 flex gap-3 bg-black/40 backdrop-blur-md">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                rows="1"
                className="flex-1 bg-gray-900 border border-purple-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-xl transition hover:scale-105"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
            <p className="text-lg">💬 Start a Conversation</p>
            <p className="text-sm mt-1">Select a friend to begin chatting</p>
          </div>
        )}

      </div>
    </div>
  );
}