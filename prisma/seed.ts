import { PrismaClient, StockStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Categories
  const categories = [
    { 
      id: "kanchipuram-silk", 
      name: "Kanchipuram Silk", 
      slug: "kanchipuram-silk",
      description: "The gold standard of south Indian silk, known for durability and rich luster.", 
      imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1974&auto=format&fit=crop", 
      displayOrder: 1 
    },
    { 
      id: "banarasi-weaves", 
      name: "Banarasi Weaves", 
      slug: "banarasi-weaves",
      description: "Exquisite hand-woven patterns from Varanasi with gold and silver brocade.", 
      imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop", 
      displayOrder: 2 
    },
    { 
      id: "dharmavaram-silk", 
      name: "Dharmavaram Silk", 
      slug: "dharmavaram-silk",
      description: "Our pride. Magnificent handlooms with double-sided gold zari borders.", 
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1970&auto=format&fit=crop", 
      displayOrder: 3 
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // 2. Create Sample Products
  const products = [
    {
      name: "Golden Zari Bridal Kanchipuram",
      slug: "golden-zari-bridal-kanchipuram",
      description: "A masterpiece of traditional craftsmanship with pure gold zari.",
      categoryId: "kanchipuram-silk",
      price: 14500,
      comparePrice: 18500,
      stockQty: 10,
      stockStatus: StockStatus.in_stock,
      images: ["https://images.unsplash.com/photo-1610030469668-93510ef2d32e?q=80&w=1200&auto=format&fit=crop"],
      isFeatured: true,
      isNewArrival: true,
      tags: ["Pure Silk", "Bridal", "Gold Zari"]
    },
    {
      name: "Royal Blue Banarasi Brocade",
      slug: "royal-blue-banarasi-brocade",
      description: "Elegant silk saree with intricate silver floral motifs.",
      categoryId: "banarasi-weaves",
      price: 12499,
      comparePrice: 15999,
      stockQty: 5,
      stockStatus: StockStatus.in_stock,
      images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200&auto=format&fit=crop"],
      isFeatured: true,
      isNewArrival: false,
      tags: ["Banarasi", "Festive", "Silver Zari"]
    },
    {
      name: "Heritage Dharmavaram Special",
      slug: "heritage-dharmavaram-special",
      description: "The classic Dharmavaram handloom with double border.",
      categoryId: "dharmavaram-silk",
      price: 9800,
      comparePrice: 12000,
      stockQty: 15,
      stockStatus: StockStatus.in_stock,
      images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop"],
      isFeatured: false,
      isNewArrival: true,
      tags: ["Dharmavaram", "Handloom", "Daily Wear"]
    }
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
  }
  console.log("✅ Products seeded");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
