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
