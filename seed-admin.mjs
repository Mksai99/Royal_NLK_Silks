import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

import ws from "ws";
globalThis.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  const email = "admin@nlksilks.com";
  const password = "admin123";

  console.log("Checking if admin exists...");
  
  // Try to create the user
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "Admin",
      role: "admin",
    },
  });

  if (createError) {
    if (createError.message.includes("already exists") || createError.message.includes("already registered")) {
       console.log("Admin user already exists. Updating role to ensure they have admin access...");
       // Get user ID
       const { data: usersData } = await supabase.auth.admin.listUsers();
       const existingAdmin = usersData.users.find(u => u.email === email);
       if (existingAdmin) {
         await supabase.auth.admin.updateUserById(existingAdmin.id, {
           user_metadata: { name: "Admin", role: "admin" }
         });
         console.log("Role updated successfully.");
       }
    } else {
       console.error("Error creating admin:", createError.message);
    }
  } else {
    console.log("Admin user created successfully!");
  }
}

seed();
