import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
globalThis.WebSocket = ws;

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function check() {
  const { data, error } = await supabase.from('categories').select('*').limit(1);
  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log("Categories:", data);
  }
}

check();
