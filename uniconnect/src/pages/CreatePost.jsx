import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function CreatePost() {
  const [type, setType] = useState("post");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      if (type === "post") {
        formData.append("content", content);
      } else {
        formData.append("title", title);
        formData.append("price", price);
      }

      formData.append("type", type);
      formData.append("image", image);

      await axios.post("http://localhost:50001/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading");
    }
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="page-title">Create</h1>

      <div className="card">

        {/* TYPE */}
        <div className="flex gap-4 mb-4">
          <button className={`btn ${type === "post" ? "btn-primary" : ""}`} onClick={() => setType("post")}>
            Post
          </button>

          <button className={`btn ${type === "rent" ? "btn-primary" : ""}`} onClick={() => setType("rent")}>
            Rent Item
          </button>
        </div>

        {/* POST */}
        {type === "post" && (
          <textarea
            className="input mb-4"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        {/* RENT */}
        {type === "rent" && (
          <>
            <input
              className="input mb-4"
              placeholder="Item title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="input mb-4"
              placeholder="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </>
        )}

        {/* 🔥 FILE UPLOAD */}
        <input
          type="file"
          className="mb-4"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button className="btn btn-primary w-full" onClick={handleSubmit}>
          Upload
        </button>
      </div>
    </motion.div>
  );
}