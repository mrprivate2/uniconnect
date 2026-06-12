import { supabase } from "../config/supabase.js";
import { catchAsync } from "../middleware/catchAsync.js";

/* =========================
   ✅ GET CHAT HISTORY
========================= */
export const getChatHistory = catchAsync(async (req, res) => {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${req.user.id},receiver_id.eq.${req.params.userId}),and(sender_id.eq.${req.params.userId},receiver_id.eq.${req.user.id})`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  res.json(messages.map(m => ({ ...m, _id: m.id })));
});

/* =========================
   🖼 UPLOAD CHAT MEDIA
========================= */
export const uploadChatMedia = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No payload node attached" });
  
  const { receiverId } = req.body;
  const fileName = `chat-${Date.now()}-${req.file.originalname}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("uniconnect")
    .upload(`chat/${fileName}`, req.file.buffer, {
      contentType: req.file.mimetype
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("uniconnect")
    .getPublicUrl(`chat/${fileName}`);

  const imageUrl = publicUrlData.publicUrl;

  const { data: newMessage, error: insertError } = await supabase
    .from("messages")
    .insert([{
      sender_id: req.user.id,
      receiver_id: receiverId,
      image: imageUrl,
      text: "Sent an image node"
    }])
    .select()
    .single();

  if (insertError) throw insertError;

  // Emit to socket
  const io = req.app.get("io");
  if (io) {
      io.to(receiverId).emit("receive_message", {
          senderId: req.user.id,
          receiverId,
          image: imageUrl,
          text: "Sent an image node",
          time: new Date(),
          _id: newMessage.id
      });
  }

  res.json({ ...newMessage, _id: newMessage.id });
});

/* =========================
   ✅ GET CONVERSATIONS
========================= */
export const getConversations = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // This is a bit complex in Supabase without a dedicated conversations table
  // We'll get all messages where the user is either sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      id, text, created_at, image,
      sender:users!messages_sender_id_fkey(id, name, username, avatar),
      receiver:users!messages_receiver_id_fkey(id, name, username, avatar)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Group by the "other" user
  const conversationMap = new Map();

  messages.forEach(msg => {
    const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;
    if (!otherUser) return;
    
    if (!conversationMap.has(otherUser.id)) {
      conversationMap.set(otherUser.id, {
        _id: otherUser.id,
        user: { ...otherUser, _id: otherUser.id },
        lastMessage: {
          text: msg.text,
          time: msg.created_at,
          image: msg.image
        }
      });
    }
  });

  res.json(Array.from(conversationMap.values()));
});
