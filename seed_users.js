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
    // --- Patients ---
    {
      email: "alice.anderson@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "bob.baker@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "carol.clark@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "daniel.davis@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "emma.evans@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "frank.foster@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "grace.green@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "henry.harris@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "iris.irving@email.com",
      password: "123r",
      role: "patient",
    },
    {
      email: "jack.jackson@email.com",
      password: "123r",
      role: "patient",
    },

    // --- Doctors ---
    {
      email: "john.smith@mediconnect.com",
      password: "doc123",
      role: "doctor",
    },
    {
      email: "sarah.johnson@mediconnect.com",
      password: "doc123",
      role: "doctor",
    },
    {
      email: "michael.williams@mediconnect.com",
      password: "doc123",
      role: "doctor",
    },
    {
      email: "robert.miller@mediconnect.com",
      password: "doc123",
      role: "doctor",
    },
    {
      email: "james.rodriguez@mediconnect.com",
      password: "doc123",
      role: "doctor",
    },

    // --- Nurses ---
    {
      email: "emily.brown@mediconnect.com",
      password: "nur123",
      role: "nurse",
    },
    {
      email: "david.jones@mediconnect.com",
      password: "nur123",
      role: "nurse",
    },
    {
      email: "jessica.garcia@mediconnect.com",
      password: "nur123",
      role: "nurse",
    },
    {
      email: "lisa.davis@mediconnect.com",
      password: "nur123",
      role: "nurse",
    },
    {
      email: "maria.martinez@mediconnect.com",
      password: "nur123",
      role: "nurse",
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
