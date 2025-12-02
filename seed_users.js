// seed_users.js
import { supabase } from "./supabaseClient.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function seedUsers() {
  console.log("=== Seeding users table ===");

  const seedData = [
    {
      email: "admin@example.com",
      password: "AdminPass123!",
      role: "admin",
    },
    {
      email: "doctor@example.com",
      password: "DoctorPass123!",
      role: "doctor",
    },
    {
      email: "nurse@example.com",
      password: "NursePass123!",
      role: "nurse",
    },
    {
      email: "user@example.com",
      password: "UserPass123!",
      role: "user",
    },
  ];

  for (const user of seedData) {
    const hashedPw = await hashPassword(user.password);

    const { error } = await supabase
      .from("users")
      .upsert(
        {
          email: user.email,
          password: hashedPw,
          role: user.role,
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error(`❌ Failed to insert ${user.email}:`, error.message);
      process.exit(1);
    }

    console.log(`✅ Inserted/Updated: ${user.email}`);
  }

  console.log("🎉 Finished seeding users!");
  process.exit(0);
}

seedUsers().catch((err) => console.error(err));
