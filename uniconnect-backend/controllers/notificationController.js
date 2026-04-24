import { supabase } from "../config/supabase.js";
import { catchAsync } from "../middleware/catchAsync.js";

/* =========================
   ✅ GET NOTIFICATIONS
========================= */
export const getNotifications = catchAsync(async (req, res) => {
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(`
      *,
      sender:users!notifications_sender_id_fkey(id, name, username, avatar),
      post:posts(id, title, content, image)
    `)
    .eq("recipient_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  res.json(notifications.map(n => ({ ...n, _id: n.id, sender: { ...n.sender, _id: n.sender.id } })));
});

/* =========================
   ✅ GET ALL ANNOUNCEMENTS (ADMIN)
========================= */
export const getAllAnnouncements = catchAsync(async (req, res) => {
  const { data: announcements, error } = await supabase
    .from("notifications")
    .select(`
      *,
      sender:users!notifications_sender_id_fkey(id, name, username, avatar)
    `)
    .eq("type", "announcement")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Group by text/created_at to show unique announcements in history
  const uniqueAnnouncements = [];
  const seen = new Set();
  
  for (const a of announcements) {
    const key = `${a.text}-${a.created_at}`;
    if (!seen.has(key)) {
      uniqueAnnouncements.push({ ...a, _id: a.id });
      seen.add(key);
    }
  }

  res.json(uniqueAnnouncements);
});

/* =========================
   ✅ CREATE ANNOUNCEMENT (ADMIN)
========================= */
export const createAnnouncement = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Announcement text required" });

  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id")
    .neq("role", "admin");

  if (userError) throw userError;

  const notifications = users.map(u => ({
    recipient_id: u.id,
    sender_id: req.user.id,
    type: "announcement",
    text: text,
  }));

  const { error: insertError } = await supabase.from("notifications").insert(notifications);
  if (insertError) throw insertError;

  // Real-time Broadcast via Socket
  const io = req.app.get("io");
  if (io) {
    users.forEach(u => {
      io.to(u.id).emit("notification", {
        text: text,
        type: "announcement",
        sender: { name: "System Admin", username: "admin" },
        createdAt: new Date()
      });
    });
  }

  res.json({ message: `Announcement transmitted to ${users.length} nodes.` });
});

/* =========================
   ✅ MARK AS READ
========================= */
export const markNotificationAsRead = catchAsync(async (req, res) => {
  const { data: notification, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !notification) return res.status(404).json({ error: "Not found" });

  res.json({ ...notification, _id: notification.id });
});
