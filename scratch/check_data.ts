import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ take: 5, select: { id: true, name: true, images: true } });
  const categories = await prisma.category.findMany({ take: 5, select: { id: true, name: true, imageUrl: true } });
  
  console.log("PRODUCTS:", JSON.stringify(products, null, 2));
  console.log("CATEGORIES:", JSON.stringify(categories, null, 2));
}

main().finally(() => prisma.$disconnect());
