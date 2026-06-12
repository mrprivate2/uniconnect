/**
 * 🔄 UniConnect Database Reset Script
 * 
 * WARNING: This deletes ALL data in all tables and creates fresh accounts.
 * Run with: node reset_db.js
 */

import "./config/loadEnv.js";
import { supabase } from "./config/supabase.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const ADMIN_EMAIL = "admin@uniconnect.app";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_USERNAME = "admin";
const ADMIN_NAME = "System Admin";

const USER_EMAIL = "user@uniconnect.app";
const USER_PASSWORD = "User@123";
const USER_USERNAME = "student1";
const USER_NAME = "Alex Student";

async function resetDatabase() {
  console.log("=".repeat(60));
  console.log("🔄 UniConnect Database Reset");
  console.log("=".repeat(60));

  try {
    // ── Step 1: Delete all data from all tables (order matters for FK constraints) ──
    console.log("\n📦 Clearing all existing data...");

    const tables = [
      "password_resets",
      "reports",
      "applications",
      "saved_posts",
      "notifications",
      "messages",
      "comments",
      "likes",
      "followers",
      "posts",
      "users",
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        // Some tables may not exist yet, that's ok
        console.log(`  ⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: cleared`);
      }
    }

    // ── Step 2: Create Admin User ──
    console.log("\n👑 Creating admin account...");

    const adminId = uuidv4();
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, adminSalt);

    const { error: adminError } = await supabase.from("users").insert([
      {
        id: adminId,
        name: ADMIN_NAME,
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: adminHash,
        role: "admin",
        bio: "System administrator of UniConnect",
      },
    ]);

    if (adminError) {
      throw new Error(`Failed to create admin: ${adminError.message}`);
    }
    console.log(`  ✅ Admin created: ${ADMIN_EMAIL}`);

    // ── Step 3: Create Regular User ──
    console.log("\n👤 Creating user account...");

    const userId = uuidv4();
    const userSalt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash(USER_PASSWORD, userSalt);

    const { error: userError } = await supabase.from("users").insert([
      {
        id: userId,
        name: USER_NAME,
        username: USER_USERNAME,
        email: USER_EMAIL,
        password: userHash,
        role: "user",
        bio: "Student at university",
      },
    ]);

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }
    console.log(`  ✅ User created: ${USER_EMAIL}`);

    // ── Step 4: Verify ──
    console.log("\n🔍 Verifying...");

    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    console.log(`  ✅ Total users in database: ${userCount}`);

    // ── Done ──
    console.log("\n" + "=".repeat(60));
    console.log("✅ RESET COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 CREDENTIALS:\n");
    console.log("  ┌─────────────────────────────────────────────────────┐");
    console.log("  │                    ADMIN                           │");
    console.log("  ├─────────────────────────────────────────────────────┤");
    console.log(`  │  Username/Email:  ${ADMIN_EMAIL.padEnd(31)}│`);
    console.log(`  │  Password:        ${ADMIN_PASSWORD.padEnd(31)}│`);
    console.log(`  │  Role:            admin                             │`);
    console.log("  ├─────────────────────────────────────────────────────┤");
    console.log("  │                    USER                             │");
    console.log("  ├─────────────────────────────────────────────────────┤");
    console.log(`  │  Username/Email:  ${USER_EMAIL.padEnd(31)}│`);
    console.log(`  │  Password:        ${USER_PASSWORD.padEnd(31)}│`);
    console.log(`  │  Role:            user                              │`);
    console.log("  └─────────────────────────────────────────────────────┘\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ RESET FAILED:", err.message);
    process.exit(1);
  }
}

resetDatabase();
