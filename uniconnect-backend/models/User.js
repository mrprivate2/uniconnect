import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: false },
  bio: { type: String },
  avatar: { type: String },

  publicKey: { type: String } // 🔐 ADD THIS
});

const User = mongoose.model("User", userSchema);
export default User;