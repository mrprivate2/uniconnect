import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function PersonalChat() {
  const { name } = useParams();

  const [messages, setMessages] = useState([
    { sender: "friend", text: "Hey there! 😊" },
    { sender: "me", text: "Hi! How’s your day going?" },
    { sender: "friend", text: "Pretty good, just working on my project." },
  ]);

  const [input, setInput] = useState("");
  const bottomRef = useRef();

  // 🔥 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: "me", text: input },
    ]);

    setInput("");
  };

  return (
    <motion.div
      className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* 🔥 HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-purple-700 bg-purple-900/40 backdrop-blur-md">
        <img
          src={`https://i.pravatar.cc/100?u=${name}`}
          alt={name}
          className="w-10 h-10 rounded-full border-2 border-purple-500"
        />
        <div>
          <h1 className="text-lg font-semibold">{name}</h1>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* 🔥 MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md ${
                msg.sender === "me"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500"
                  : "bg-gray-800 text-purple-200"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </motion.div>
          </div>
        ))}

        {/* auto scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* 🔥 INPUT */}
      <div className="p-3 border-t border-purple-700 bg-black/40 backdrop-blur-md flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          rows="1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 resize-none bg-gray-900 border border-purple-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 rounded-xl hover:scale-105 transition"
        >
          Send
        </button>
      </div>

    </motion.div>
  );
}