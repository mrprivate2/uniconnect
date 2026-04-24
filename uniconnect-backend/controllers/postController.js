import { catchAsync } from "../middleware/catchAsync.js";
import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from 'uuid';

/* =========================
   ✅ GET ALL POSTS (PAGINATED)
========================= */
export const getPosts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Build the visibility query
  let query = supabase
    .from("posts")
    .select(`
      id, content, type, title, price, location, event_date, category, image, media_type, visibility, created_at,
      author:users(id, name, username, avatar),
      comments:comments(id, text, created_at, user:users(id, name, username, avatar)),
      likes:likes(user_id)
    `);

  // If user is logged in (req.user exists), show public posts OR their own posts
  // Otherwise, just show public posts
  if (req.user && req.user.id) {
    query = query.or(`visibility.eq.public,author_id.eq.${req.user.id}`);
  } else {
    query = query.eq("visibility", "public");
  }

  const { data: posts, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Format to match old Mongoose output
  const formattedPosts = posts.map(post => ({
    ...post,
    _id: post.id,
    image: post.image,
    media_type: post.media_type,
    likes: post.likes?.map(l => l.user_id) || [],
    comments: post.comments?.map(c => ({
      ...c,
      _id: c.id,
      user: c.user ? { ...c.user, _id: c.user.id } : null
    })) || [],
    author: post.author ? { ...post.author, _id: post.author.id } : null
  }));

  res.json(formattedPosts);
});

/* =========================
   ✅ GET POSTS BY TYPE
========================= */
export const getPostsByType = catchAsync(async (req, res) => {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id, content, type, title, price, location, event_date, category, image, media_type, visibility, created_at,
      author:users(id, name, username, avatar),
      comments:comments(id, text, created_at, user:users(id, name, username, avatar)),
      likes:likes(user_id)
    `)
    .eq("type", req.params.typeName)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const formattedPosts = posts.map(post => ({
    ...post,
    _id: post.id,
    image: post.image,
    media_type: post.media_type,
    likes: post.likes?.map(l => l.user_id) || [],
    comments: post.comments?.map(c => ({
      ...c,
      _id: c.id,
      user: c.user ? { ...c.user, _id: c.user.id } : null
    })) || [],
    author: post.author ? { ...post.author, _id: post.author.id } : null
  }));

  res.json(formattedPosts);
});

/* =========================
   ✅ CREATE POST
========================= */
export const createPost = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const { content, type, title, price, location, eventDate, visibility, category } = req.body;

  let mediaUrl = "";
  let mediaType = "none";

  if (req.file) {
    console.log(`📂 Processing file upload: ${req.file.originalname} (${req.file.mimetype})`);
    const bucketName = process.env.SUPABASE_BUCKET || process.env.VITE_SUPABASE_BUCKET || "uniconnect";
    
    // 🛡️ Ensure bucket exists (using service_role)
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
      console.log(`🏗️ Bucket '${bucketName}' not found. Attempting to create...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*'],
        fileSizeLimit: 52428800 // 50MB
      });
      if (createError) console.error("❌ Failed to auto-create bucket:", createError.message);
      else console.log(`✅ Bucket '${bucketName}' created successfully.`);
    }

    const sanitizedOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `${Date.now()}-${sanitizedOriginalName}`;
    
    try {
      console.log(`📤 Uploading to Supabase bucket: ${bucketName}, path: posts/${fileName}`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`posts/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error("❌ Supabase Storage Upload Error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`posts/${fileName}`);
      
      if (data?.publicUrl) {
        mediaUrl = data.publicUrl;
        console.log(`✅ Media Public URL generated: ${mediaUrl}`);
      } else {
        console.error("❌ Failed to generate Public URL for uploaded media.");
      }
      mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
    } catch (storageError) {
      console.error("⚠️ Supabase Storage Warning (Proceeding without media):", storageError.message);
    }
  } else {
    console.log("ℹ️ No media file detected in request body.");
  }

  const postId = uuidv4();
  const postData = {
    id: postId,
    content,
    author_id: req.user.id,
    type: type || "post",
    title: title || "Untitled",
    price: price || null,
    location: location || null,
    event_date: eventDate || null,
    category: category || null,
    visibility: visibility || "public",
    image: mediaUrl && mediaUrl !== "" ? mediaUrl : null,
    media_type: mediaType,
  };

  console.log("📝 Inserting post into database:", JSON.stringify(postData, null, 2));

  const { data: newPost, error: insertError } = await supabase
    .from("posts")
    .insert([postData])
    .select(`
      id, content, type, title, price, location, event_date, category, image, media_type, visibility, created_at,
      author:users(id, name, username, avatar)
    `)
    .single();

  if (insertError) {
    console.error("❌ Supabase Post Insertion Error:", insertError.message);
    throw insertError;
  }

  const formattedPost = {
    ...newPost,
    _id: newPost.id,
    image: newPost.image,
    media_type: newPost.media_type,
    author: { ...newPost.author, _id: newPost.author.id },
    likes: [],
    comments: []
  };

  io.emit("new_post", formattedPost);
  res.status(201).json(formattedPost);
});

/* =========================
   ❤️ LIKE POST
========================= */
export const likePost = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const postId = req.params.id;
  const userId = req.user.id;

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();

  if (existingLike) {
    // Unlike
    await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    // Like
    await supabase.from("likes").insert([{ post_id: postId, user_id: userId }]);
  }

  // Get updated likes
  const { data: allLikes } = await supabase
    .from("likes")
    .select("user_id")
    .eq("post_id", postId);

  const likesArray = allLikes.map(l => l.user_id);

  io.emit("like_updated", {
    postId: postId,
    likes: likesArray,
  });

  // Notify logic would go here (fetch post author first)
  const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).single();
  
  if (post && post.author_id !== userId) {
    const notifText = `❤️ ${req.user.name} liked your post`;
    const { data: notif } = await supabase.from("notifications").insert([{
      recipient_id: post.author_id,
      sender_id: userId,
      type: "like",
      post_id: postId,
      text: notifText
    }]).select().single();

    if (notif) {
      io.to(post.author_id).emit("notification", {
        _id: notif.id,
        type: "like",
        sender: req.user.name,
        text: notifText,
        createdAt: notif.created_at,
      });
    }
  }

  res.json({ _id: postId, likes: likesArray });
});

/* =========================
   💬 ADD COMMENT
========================= */
export const addComment = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const { text } = req.body;
  const postId = req.params.id;

  const { data: comment, error } = await supabase
    .from("comments")
    .insert([{
      post_id: postId,
      user_id: req.user.id,
      text
    }])
    .select(`
      *,
      user:users(id, name, username, avatar)
    `)
    .single();

  if (error) throw error;

  // Get all comments for this post to emit
  const { data: allComments } = await supabase
    .from("comments")
    .select(`
      *,
      user:users(id, name, username, avatar)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const formattedComments = allComments.map(c => ({
    ...c,
    _id: c.id,
    user: { ...c.user, _id: c.user.id }
  }));

  io.emit("new_comment", {
    postId: postId,
    comments: formattedComments,
  });

  // Notify logic
  const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).single();
  if (post && post.author_id !== req.user.id) {
    const notifText = `💬 ${req.user.name} commented on your post`;
    await supabase.from("notifications").insert([{
      recipient_id: post.author_id,
      sender_id: req.user.id,
      type: "comment",
      post_id: postId,
      text: notifText
    }]);
    
    io.to(post.author_id).emit("notification", {
      type: "comment",
      sender: req.user.name,
      text: notifText,
    });
  }

  res.json({ _id: postId, comments: formattedComments });
});

/* =========================
   ✅ ADMIN: GET ALL POSTS
========================= */
export const getAllPostsAdmin = catchAsync(async (req, res) => {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:users(id, name, username)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  res.json(posts.map(p => ({ ...p, _id: p.id, author: { ...p.author, _id: p.author.id } })));
});

/* =========================
   ✅ GET POSTS BY USER (GRID OPTIMIZED)
========================= */
export const getPostsByUser = catchAsync(async (req, res) => {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`id, content, title, image, media_type, type, author_id, created_at`)
    .eq("author_id", req.params.userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const formattedPosts = posts.map(post => ({
    ...post,
    _id: post.id,
  }));

  res.json(formattedPosts);
});

/* =========================
   ✅ APPLY TO POST (JOB/EVENT)
========================= */
export const applyToPost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { notes } = req.body;

  // Check if already applied
  const { data: existingApp } = await supabase
    .from("applications")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();

  if (existingApp) {
    return res.status(400).json({ error: "Already applied/registered for this node." });
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert([{
      post_id: postId,
      user_id: userId,
      notes: notes || ""
    }])
    .select()
    .single();

  if (error) throw error;

  // Notify author
  const { data: post } = await supabase.from("posts").select("author_id, title, type").eq("id", postId).single();
  if (post && post.author_id !== userId) {
    const actionWord = post.type === 'event' ? 'registered for' : 'applied to';
    const notifText = `🚀 ${req.user.name} ${actionWord} your ${post.type}: ${post.title}`;
    
    await supabase.from("notifications").insert([{
      recipient_id: post.author_id,
      sender_id: userId,
      type: "announcement",
      post_id: postId,
      text: notifText
    }]);

    const io = req.app.get("io");
    io.to(post.author_id).emit("notification", {
      type: "announcement",
      sender: req.user.name,
      text: notifText,
    });
  }

  res.json({ message: "Application/Registration successful", application });
});

/* =========================
   👥 GET APPLICANTS (FOR AUTHOR)
========================= */
export const getApplicants = catchAsync(async (req, res) => {
  const postId = req.params.id;

  // Verify authorship
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (!post || (post.author_id !== req.user.id && req.user.role !== "admin")) {
    return res.status(401).json({ error: "Unauthorized access to applicant data" });
  }

  const { data: applicants, error } = await supabase
    .from("applications")
    .select(`
      *,
      user:users(id, name, username, avatar, email)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  res.json(applicants.map(a => ({ 
    ...a, 
    _id: a.id, 
    user: { ...a.user, _id: a.user.id } 
  })));
});

/* =========================
   📊 GET MY EVENTS WITH APPLICANTS
========================= */
export const getMyEventsWithApplicants = catchAsync(async (req, res) => {
  const userId = req.user.id;
  console.log(`📊 Management sync requested for user node: ${userId}`);

  // 1. Fetch user's posts
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, title, content, created_at, type")
    .eq("author_id", userId)
    .in("type", ["event", "recruitment"])
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("❌ Posts Fetch Error:", postsError);
    throw postsError;
  }

  if (!posts || posts.length === 0) {
    console.log("ℹ️ No managed nodes found for this user.");
    return res.json([]);
  }

  // 2. Fetch all applications
  const postIds = posts.map(p => p.id);
  const { data: apps, error: appsError } = await supabase
    .from("applications")
    .select("id, post_id, user_id, notes, created_at")
    .in("post_id", postIds);

  if (appsError) {
    console.error("❌ Applications Fetch Error:", appsError);
    throw appsError;
  }

  // 3. Fetch unique users (ONLY if we have applications)
  let users = [];
  if (apps && apps.length > 0) {
    const applicantIds = [...new Set(apps.map(a => a.user_id))];
    const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, username, avatar")
        .in("id", applicantIds);

    if (usersError) {
        console.error("❌ Users Fetch Error:", usersError);
        throw usersError;
    }
    users = usersData || [];
  }

  // 4. Combine results manually
  const formatted = posts.map(post => {
    const postApps = apps.filter(a => a.post_id === post.id).map(app => {
      const userData = users.find(u => u.id === app.user_id);
      return {
        ...app,
        _id: app.id,
        user: userData ? { ...userData, _id: userData.id } : null
      };
    });

    return {
      ...post,
      _id: post.id,
      applicants: postApps
    };
  });

  console.log(`✅ Successfully synthesized ${formatted.length} management nodes.`);
  res.json(formatted);
});

/* =========================
   ❌ DELETE POST
========================= */
export const deletePost = catchAsync(async (req, res) => {
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", req.params.id)
    .single();

  if (fetchError || !post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.author_id !== req.user.id && req.user.role !== "admin") {
    res.status(401);
    throw new Error("User not authorized");
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", req.params.id);

  if (deleteError) throw deleteError;

  res.json({ message: "Post removed" });
});

/* =========================
   📝 UPDATE POST
========================= */
export const updatePost = catchAsync(async (req, res) => {
  const { content, title, price, location, eventDate, category, visibility } = req.body;
  const postId = req.params.id;

  // 1. Verify Ownership
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (fetchError || !post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.author_id !== req.user.id && req.user.role !== "admin") {
    res.status(401);
    throw new Error("User not authorized to edit this node.");
  }

  // 2. Perform Update
  const { data: updatedPost, error: updateError } = await supabase
    .from("posts")
    .update({
      content,
      title,
      price,
      location,
      event_date: eventDate,
      category,
      visibility,
      updated_at: new Date()
    })
    .eq("id", postId)
    .select(`
      id, content, type, title, price, location, event_date, category, image, media_type, visibility, created_at,
      author:users(id, name, username, avatar)
    `)
    .single();

  if (updateError) throw updateError;

  const formatted = {
    ...updatedPost,
    _id: updatedPost.id,
    author: { ...updatedPost.author, _id: updatedPost.author.id }
  };

  res.json(formatted);
});
