import { supabase } from "../config/supabase.js";
import { catchAsync } from "../middleware/catchAsync.js";

/* =========================
   ✅ GET ALL COLLEGES
========================= */
export const getColleges = catchAsync(async (req, res) => {
  const { data: colleges, error } = await supabase
    .from("colleges")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  res.json(colleges.map(c => ({ ...c, _id: c.id })));
});

/* =========================
   ✅ CREATE COLLEGE
========================= */
export const createCollege = catchAsync(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "College name is required" });
  }

  const { data: exists } = await supabase
    .from("colleges")
    .select("id")
    .eq("name", name)
    .single();

  if (exists) {
    return res.status(400).json({ error: "College already exists" });
  }

  const { data: college, error } = await supabase
    .from("colleges")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json({ ...college, _id: college.id });
});

/* =========================
   ✅ GET COLLEGE BY ID
========================= */
export const getCollegeById = catchAsync(async (req, res) => {
  const { data: college, error } = await supabase
    .from("colleges")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !college) {
    return res.status(404).json({ error: "College not found" });
  }
  res.json({ ...college, _id: college.id });
});

/* =========================
   ❌ DELETE COLLEGE
========================= */
export const deleteCollege = catchAsync(async (req, res) => {
  const { error } = await supabase
    .from("colleges")
    .delete()
    .eq("id", req.params.id);

  if (error) throw error;
  res.json({ message: "College deleted successfully" });
});
