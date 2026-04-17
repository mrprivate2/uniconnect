import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Create() {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");

  const navigate = useNavigate(); // ✅ for redirect

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || !authorName.trim()) return;

    try {
      const res = await axios.post("http://localhost:50001/api/posts", {
        author: authorName,
        content,
      });

      console.log("NEW POST:", res.data);

      setAuthorName("");
      setContent("");

      // ✅ redirect to feed after post
      navigate("/feed");

    } catch (err) {
      console.error(err);
      alert("Error creating post");
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-purple-800 via-purple-900 to-black text-white">

      <h1 className="text-3xl font-bold mb-6 text-center">Create Post</h1>

      <div className="bg-purple-800/40 backdrop-blur-md p-4 rounded-2xl border border-purple-500/30 max-w-xl mx-auto">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Your name"
            className="bg-transparent border border-purple-400/30 p-2 rounded text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />

          <textarea
            placeholder="Share something with your campus..."
            className="bg-transparent border border-purple-400/30 p-2 rounded text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl hover:opacity-90 transition"
          >
            Post
          </button>

        </form>

      </div>
    </div>
  );
}