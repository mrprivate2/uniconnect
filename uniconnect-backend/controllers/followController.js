import { supabase } from "../config/supabase.js";
import { catchAsync } from "../middleware/catchAsync.js";

/* =========================
   ❤️ FOLLOW USER
========================= */
export const followUser = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  // Check if target user exists
  const { data: targetUser } = await supabase.from("users").select("id, name").eq("id", targetUserId).single();
  if (!targetUser) return res.status(404).json({ error: "User not found" });

  const { data: existing, error: checkError } = await supabase
    .from("followers")
    .select("*")
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (!existing) {
    const { error: insertError } = await supabase
      .from("followers")
      .insert([{ follower_id: currentUserId, following_id: targetUserId }]);

    if (insertError) throw insertError;

    // Check if they are following us back (for the "already friends" logic)
    const { data: mutual } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", targetUserId)
      .eq("following_id", currentUserId)
      .maybeSingle();

    const { count: followersCount } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("following_id", targetUserId);

    const { count: followingCount } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", currentUserId);

    if (io) {
      // 1. Notify target user (B) that A followed them
      io.to(targetUserId).emit("relationship_updated", { 
        fromId: currentUserId, 
        type: 'followed_you',
        followersCount: followersCount 
      });

      // 2. Notify sender (A) for live status/count update across tabs
      io.to(currentUserId).emit("relationship_updated", { 
        toId: targetUserId, 
        type: 'you_followed',
        followingCount: followingCount
      });
      
      // Legacy support
      io.to(targetUserId).emit("follow_updated", { followers: followersCount });
      io.to(currentUserId).emit("follow_count_updated", { following: followingCount });

      const notifText = mutual 
        ? `✨ You and ${req.user.name} are now friends!` 
        : `👋 ${req.user.name} started following you. Follow back?`;
      
      // Save notification to DB
      const { data: notif } = await supabase.from("notifications").insert([{
        recipient_id: targetUserId,
        sender_id: currentUserId,
        type: "follow",
        text: notifText
      }]).select().single();

      if (notif) {
        io.to(targetUserId).emit("notification", {
          _id: notif.id,
          type: "follow",
          sender: req.user.name,
          text: notifText,
          createdAt: notif.created_at,
        });
      }
    }
  }

  res.json({ message: "Followed successfully" });
});

/* =========================
   ❌ UNFOLLOW USER
========================= */
export const unfollowUser = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  const { error: deleteError } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId);

  if (deleteError) throw deleteError;

  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", targetUserId);
    
  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", currentUserId);

  if (io) {
    // Notify both parties of the disconnect
    io.to(targetUserId).emit("relationship_updated", { 
      fromId: currentUserId, 
      type: 'unfollowed_you',
      followersCount: followersCount 
    });
    io.to(currentUserId).emit("relationship_updated", { 
      toId: targetUserId, 
      type: 'you_unfollowed',
      followingCount: followingCount
    });

    io.to(targetUserId).emit("follow_updated", { followers: followersCount });
    io.to(currentUserId).emit("follow_count_updated", { following: followingCount });
  }

  res.json({ message: "Unfollowed successfully" });
});

/* =========================
   📊 GET FOLLOW STATS
========================= */
export const getFollowStats = catchAsync(async (req, res) => {
  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", req.params.id);

  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", req.params.id);

  res.json({
    followers: followersCount,
    following: followingCount,
  });
});

/* =========================
   👥 GET FOLLOWERS LIST
========================= */
export const getFollowers = catchAsync(async (req, res) => {
  const targetId = req.params.id;
  const requesterId = req.user?.id;
  console.log(`🔍 Fetching followers for user: ${targetId}`);
  
  const { data, error } = await supabase
    .from("followers")
    .select(`
      user:users!follower_id (
        id, name, username, avatar, bio
      )
    `)
    .eq("following_id", targetId);

  if (error) {
    console.error("❌ Supabase Followers Error:", error);
    return res.status(500).json({ error: error.message });
  }

  // Check follow status
  let followedIds = new Set();
  if (requesterId) {
    const { data: follows } = await supabase.from("followers").select("following_id").eq("follower_id", requesterId);
    if (follows) followedIds = new Set(follows.map(f => f.following_id));
  }

  const formatted = (data || []).map(item => ({
    ...item.user,
    _id: item.user.id,
    isFollowing: followedIds.has(item.user.id)
  }));

  res.json(formatted);
});

/* =========================
   👥 GET FOLLOWING LIST
========================= */
export const getFollowing = catchAsync(async (req, res) => {
  const targetId = req.params.id;
  const requesterId = req.user?.id;
  console.log(`🔍 Fetching following for user: ${targetId}`);

  const { data, error } = await supabase
    .from("followers")
    .select(`
      user:users!following_id (
        id, name, username, avatar, bio
      )
    `)
    .eq("follower_id", targetId);

  if (error) {
    console.error("❌ Supabase Following Error:", error);
    return res.status(500).json({ error: error.message });
  }

  // Check follow status
  let followedIds = new Set();
  if (requesterId) {
    const { data: follows } = await supabase.from("followers").select("following_id").eq("follower_id", requesterId);
    if (follows) followedIds = new Set(follows.map(f => f.following_id));
  }

  const formatted = (data || []).map(item => ({
    ...item.user,
    _id: item.user.id,
    isFollowing: followedIds.has(item.user.id)
  }));

  res.json(formatted);
});

/* =========================
   ❌ REMOVE FOLLOWER (FORCED)
========================= */
export const removeFollower = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const currentUserId = req.user.id; // The person removing the follower
  const followerIdToRemove = req.params.id; // The person being removed

  const { error: deleteError } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", followerIdToRemove)
    .eq("following_id", currentUserId);

  if (deleteError) throw deleteError;

  // Get new counts
  const { count: followersCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", currentUserId);
    
  const { count: followingCount } = await supabase
    .from("followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", followerIdToRemove);

  if (io) {
    // Notify the person who was removed that they are no longer following currentUserId
    io.to(followerIdToRemove).emit("relationship_updated", { 
      toId: currentUserId, 
      type: 'you_unfollowed',
      followingCount: followingCount
    });

    // Notify current user (A) for live count update
    io.to(currentUserId).emit("follow_updated", { followers: followersCount });
  }

  res.json({ message: "Follower removed successfully" });
});
