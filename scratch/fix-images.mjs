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

// Working Unsplash images of silk/saree
const imageMap = {
  "photo-1583391733956-6c78276477e2": "photo-1617627143750-d86bc21e42bb",
  "photo-1610030469668-93510ef2d32e": "photo-1617627143750-d86bc21e42bb",
};

async function fixImages() {
  // Fix categories
  const { data: cats } = await supabase.from("categories").select("*");
  for (const cat of (cats || [])) {
    if (cat.image_url && cat.image_url.includes("photo-1583391733956")) {
      await supabase.from("categories").update({ image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop" }).eq("id", cat.id);
      console.log(`Fixed category: ${cat.name}`);
    }
  }

  // Fix products
  const { data: prods } = await supabase.from("products").select("*");
  for (const prod of (prods || [])) {
    if (prod.images && Array.isArray(prod.images)) {
      let changed = false;
      const newImages = prod.images.map(url => {
        if (url.includes("photo-1583391733956") || url.includes("photo-1610030469668")) {
          changed = true;
          return "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop";
        }
        return url;
      });
      if (changed) {
        await supabase.from("products").update({ images: newImages }).eq("id", prod.id);
        console.log(`Fixed product: ${prod.name}`);
      }
    }
  }

  console.log("Done fixing image URLs!");
}

fixImages();
