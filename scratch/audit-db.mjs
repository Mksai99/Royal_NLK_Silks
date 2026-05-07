import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";
globalThis.WebSocket = ws;

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function audit() {
  const tables = ['categories', 'products', 'orders', 'order_items', 'profiles', 'cart_items'];
  
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: false }).limit(3);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${data.length} rows shown (total: ${count ?? 'unknown'})`);
      if (data.length > 0) {
        console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
      }
    }
  }

  // Check storage buckets
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.log(`\n❌ Storage: ${bucketsErr.message}`);
  } else {
    console.log(`\n📦 Storage Buckets: ${buckets.map(b => b.name).join(', ') || 'none'}`);
  }
}

audit();
