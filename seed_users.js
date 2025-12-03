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
      email: "alice.anderson@email.com",
      password: "123r",
      role:"patient",
    },
    {
      email: "sarah.johnson@mediconnect.com",
      password: "3456",
      role:"doctor",
    },
    {
      email: "david.jones@mediconnect.com",
      password: "45678",
      role:"nurse",
    },
    {
      email: "john.smith@mediconnect.com",
      password: "doc123",
      role:"doctor",
    },
    {
      email: "james.rodriguez@mediconnect.com",
      password: "doc123",
      role:"doctor",
    },
    {
      email: "jessica.garcia@mediconnect.com",
      password: "nur123",
      role:"nurse",
    }
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
