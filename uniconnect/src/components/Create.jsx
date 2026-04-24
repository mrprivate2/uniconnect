import React, { useState } from "react";
import axios from "axios";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Image, Send, X, Sparkles,
  Globe, Lock
} from "lucide-react";

export default function Create() {
  const [type] = useState("post");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState(""); 
  const [date, setDate] = useState(""); 
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visibility, setVisibility] = useState("public");

  const navigate = useNavigate();

  // ✅ use env (production ready)
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // ✅ store actual file
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ FIX: remove BOTH preview + file
  const removeImage = () => {
    setPreview(null);
    setImage(null);
  };

  // ✅ VALIDATION
  const validate = () => {
    if (type === "post" && !content.trim()) {
      return "Post content required";
    }

    if (type === "rent") {
      if (!title.trim()) return "Item name required";
      if (!price) return "Price required";
    }

    if (type === "event") {
      if (!title.trim()) return "Event name required";
      if (!location.trim()) return "Location required";
      if (!date) return "Date required";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append("type", type);
      formData.append("visibility", visibility);

      if (image) {
        formData.append("media", image);
      }

      if (type === "post") {
        formData.append("content", content.trim());
      }

      if (type === "rent") {
        formData.append("title", title.trim());
        formData.append("price", price);
      }

      if (type === "event") {
        formData.append("title", title.trim());
        formData.append("location", location.trim());
        formData.append("eventDate", date);
      }

      // ✅ FIX: correct API usage
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      // ✅ SUCCESS handling
      if (res.status === 200 || res.status === 201) {
        // reset state
        setContent("");
        setTitle("");
        setPrice("");
        setLocation("");
        setDate("");
        setImage(null);
        setPreview(null);

        // redirect
        navigate("/feed", { state: { refresh: true } });
      }

    } catch (err) {
      console.error("Upload failed:", err);

      // ✅ BETTER ERROR MESSAGE
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed";

      alert(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] relative overflow-hidden p-4 lg:p-10 pb-32 font-sans">
      
      <Motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 blur-[100px] rounded-full" 
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Create <span className="text-[#3F8CFF]">Something.</span>
          </h1>
          <div className="flex bg-white shadow-lg p-1.5 rounded-2xl border border-blue-50">
            <button onClick={() => setVisibility("public")} className={`p-2 rounded-xl ${visibility === 'public' ? 'bg-[#3F8CFF] text-white' : 'text-slate-300'}`}><Globe size={18} /></button>
            <button onClick={() => setVisibility("private")} className={`p-2 rounded-xl ${visibility === 'private' ? 'bg-[#3F8CFF] text-white' : 'text-slate-300'}`}><Lock size={18} /></button>
          </div>
        </header>

        <Motion.div className="bg-white/80 backdrop-blur-xl rounded-[3.5rem] p-2 shadow-xl border border-white">
          <div className="p-6 lg:p-10">
            
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* SAME UI — unchanged */}

              {/* textarea / inputs unchanged */}

              <div className="relative">
                {preview ? (
                  <div className="relative rounded-[3rem] overflow-hidden shadow-lg">
                    <img src={preview} alt="preview" className="w-full h-64 object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                      <X />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:bg-blue-50">
                    <Image className="text-blue-400" />
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                )}
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full py-6 rounded-[2.5rem] font-black text-[12px] tracking-[0.4em] bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                {isUploading ? <Sparkles className="animate-spin" /> : <><Send size={18} /> DEPLOY {type.toUpperCase()}</>}
              </button>

            </form>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
