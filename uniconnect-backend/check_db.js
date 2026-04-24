import { supabase } from "./config/supabase.js";

async function checkDatabase() {
  console.log("🔍 Querying Supabase 'posts' table...");
  
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, image, media_type, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error fetching posts:", error.message);
    return;
  }

  if (data.length === 0) {
    console.log("⚠️ No posts found in the database.");
  } else {
    console.log(`✅ Found ${data.length} recent posts:`);
    data.forEach((post, index) => {
      console.log(`\n--- Post #${index + 1} ---`);
      console.log(`ID: ${post.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Image URL: ${post.image || "NULL"}`);
      console.log(`Media Type: ${post.media_type}`);
    });
  }
  process.exit();
}

checkDatabase();
