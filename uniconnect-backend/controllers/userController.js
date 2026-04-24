import { supabase } from "../config/supabase.js";
import { catchAsync } from "../middleware/catchAsync.js";

/* =========================
   ✅ GET ALL USERS (FOR ADMIN)
========================= */
export const getAllUsersAdmin = catchAsync(async (req, res) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, email, role, name, bio, avatar, college_id, is_private");

  if (error) throw error;
  res.json(users.map(u => ({ ...u, _id: u.id })));
});

/* =========================
   ✅ GET USERS (PAGINATED)
========================= */
export const getUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const requesterId = req.user?.id;

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, name, avatar, bio")
    .range(from, to);

  if (error) throw error;

  // Check which users are already followed by requester
  let followedIds = new Set();
  if (requesterId) {
    const { data: follows } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", requesterId);
    
    if (follows) followedIds = new Set(follows.map(f => f.following_id));
  }

  const formatted = users.map(u => ({ 
    ...u, 
    _id: u.id,
    isFollowing: followedIds.has(u.id)
  }));

  res.json(formatted);
});

/* =========================
   🔍 SEARCH USERS
========================= */
export const searchUsers = catchAsync(async (req, res) => {
  const { q } = req.query;
  const requesterId = req.user?.id;

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, name, avatar, bio")
    .or(`username.ilike.%${q}%,name.ilike.%${q}%`);

  if (error) throw error;

  let followedIds = new Set();
  if (requesterId) {
    const { data: follows } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", requesterId);
    
    if (follows) followedIds = new Set(follows.map(f => f.following_id));
  }

  const formatted = users.map(u => ({ 
    ...u, 
    _id: u.id,
    isFollowing: followedIds.has(u.id)
  }));

  res.json(formatted);
});

/* =========================
   👤 UPDATE PROFILE
========================= */
export const updateProfile = catchAsync(async (req, res) => {
  const { name, bio, isPrivate, publicKey, college, avatar } = req.body;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (bio) updateData.bio = bio;
  if (avatar) updateData.avatar = avatar;
  if (publicKey) updateData.public_key = publicKey;
  if (college) updateData.college_id = college;
  if (typeof isPrivate === "boolean") updateData.is_private = isPrivate;

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) throw error;

  res.json({
    _id: updatedUser.id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    bio: updatedUser.bio,
    avatar: updatedUser.avatar,
    isPrivate: updatedUser.is_private,
    role: updatedUser.role,
    publicKey: updatedUser.public_key,
    college: updatedUser.college_id
  });
});

/* =========================
   🔑 GET PUBLIC KEY
========================= */
export const getPublicKey = catchAsync(async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("public_key")
    .eq("id", req.params.id)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ publicKey: user.public_key });
});

/* =========================
   👤 GET USER PROFILE
========================= */
export const getUserProfile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user?.id;

  // 1. Fetch Basic User Info
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, username, name, avatar, bio, role, created_at, college_id")
    .eq("id", id)
    .single();

  if (userError || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  // 2. Parallel Fetch Metadata (Fast & Robust)
  const results = await Promise.allSettled([
    supabase.from("followers").select("*", { count: "exact", head: true }).eq("following_id", id),
    supabase.from("followers").select("*", { count: "exact", head: true }).eq("follower_id", id),
    user.college_id ? supabase.from("colleges").select("id, name").eq("id", user.college_id).single() : Promise.resolve({ data: null }),
    supabase.from("saved_posts").select("post_id").eq("user_id", id),
    requesterId ? supabase.from("followers").select("*").eq("follower_id", requesterId).eq("following_id", id).maybeSingle() : Promise.resolve({ data: null }),
    requesterId ? supabase.from("followers").select("*").eq("follower_id", id).eq("following_id", requesterId).maybeSingle() : Promise.resolve({ data: null })
  ]);

  const followersRes = results[0].status === 'fulfilled' ? results[0].value : { count: 0 };
  const followingRes = results[1].status === 'fulfilled' ? results[1].value : { count: 0 };
  const collegeRes = results[2].status === 'fulfilled' ? results[2].value : { data: null };
  const savedRes = results[3].status === 'fulfilled' ? results[3].value : { data: [] };
  const isFollowingRes = results[4].status === 'fulfilled' ? results[4].value : { data: null };
  const followedByRes = results[5].status === 'fulfilled' ? results[5].value : { data: null };

  res.json({
    _id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    college: collegeRes.data || { id: null, name: "Independent Node" },
    createdAt: user.created_at,
    followersCount: followersRes.count || 0,
    followingCount: followingRes.count || 0,
    savedPosts: savedRes.data?.map(s => s.post_id) || [],
    isFollowing: !!isFollowingRes.data,
    followedBy: !!followedByRes.data
  });
});

/* =========================
   ❤️ SAVE / UNSAVE POST
========================= */
export const toggleSavePost = catchAsync(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const { data: existing } = await supabase
    .from("saved_posts")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  if (existing) {
    await supabase.from("saved_posts").delete().eq("user_id", userId).eq("post_id", postId);
  } else {
    await supabase.from("saved_posts").insert([{ user_id: userId, post_id: postId }]);
  }

  const { data: allSaved } = await supabase
    .from("saved_posts")
    .select("post_id")
    .eq("user_id", userId);

  res.json({
    message: "Updated saved posts",
    savedPosts: allSaved.map(s => s.post_id),
  });
});

/* =========================
   🖼 UPLOAD AVATAR
========================= */
export const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const bucketName = process.env.SUPABASE_BUCKET || process.env.VITE_SUPABASE_BUCKET || "uniconnect";
  const fileName = `avatar-${Date.now()}-${req.file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`avatars/${fileName}`, req.file.buffer, {
      contentType: req.file.mimetype,
    });

  if (error) {
    console.error("❌ Supabase Avatar Storage Error:", error);
    throw new Error(`Avatar upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(`avatars/${fileName}`);
  
  const avatarUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar: avatarUrl })
    .eq("id", req.user.id);

  if (updateError) throw updateError;

  res.json({
    message: "Avatar updated successfully",
    avatar: avatarUrl,
  });
});

/* =========================
   🚫 BAN / UNBAN USER (ADMIN)
========================= */
export const toggleBanUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Get current status
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("is_banned")
    .eq("id", id)
    .single();

  if (fetchError || !user) {
    return res.status(404).json({ error: "User node not found" });
  }

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({ is_banned: !user.is_banned })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({ 
    message: updatedUser.is_banned ? "User node suspended" : "User node restored",
    isBanned: updatedUser.is_banned 
  });
});

/* =========================
   ❌ DELETE USER
========================= */
export const deleteUser = catchAsync(async (req, res) => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", req.params.id);

  if (error) throw error;
  res.json({ message: "User deleted successfully" });
});
