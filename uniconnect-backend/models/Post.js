import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // 📝 Normal Post
  content: String,

  // 🖼 Image (for both)
  image: String,

  // 🔥 NEW: type (post or rent)
  type: {
    type: String,
    enum: ["post", "rent"],
    default: "post",
  },

  // 🏠 RentHub fields
  title: String,
  price: Number,

  likes: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", postSchema);