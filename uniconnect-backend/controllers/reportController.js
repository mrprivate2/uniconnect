import { supabase } from "../config/supabase.js";
import { catchAsync } from "../middleware/catchAsync.js";

/* =========================
   ✅ GET ALL REPORTS (ADMIN)
========================= */
export const getReports = catchAsync(async (req, res) => {
  const { data: reports, error } = await supabase
    .from("reports")
    .select(`
      *,
      post:posts(*, author:users(name, username)),
      reporter:users(name, username)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  res.json(reports.map(r => ({ ...r, _id: r.id })));
});

/* =========================
   🚨 REPORT A POST
========================= */
export const reportPost = catchAsync(async (req, res) => {
  const { postId, reason } = req.body;

  const { error } = await supabase
    .from("reports")
    .insert([{
      post_id: postId,
      reporter_id: req.user.id,
      reason,
      status: "pending"
    }]);

  if (error) throw error;
  res.status(201).json({ message: "Post reported successfully" });
});

/* =========================
   ✅ DISMISS REPORT (ADMIN)
========================= */
export const resolveReport = catchAsync(async (req, res) => {
  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", req.params.id);

  if (error) throw error;
  res.json({ message: "Report dismissed" });
});
