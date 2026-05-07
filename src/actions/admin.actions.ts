"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StorageService } from "@/services/storage.service";

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories;
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = imageFile.name.split(".").pop();
    const path = `categories/${slug}.${ext}`;
    imageUrl = await StorageService.upload("products", path, buffer, imageFile.type);
  }

  await prisma.category.create({
    data: { name, slug, description, imageUrl, isVisible: true },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;

  const data: any = { name, description };

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = imageFile.name.split(".").pop();
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const path = `categories/${slug}.${ext}`;
    data.imageUrl = await StorageService.upload("products", path, buffer, imageFile.type);
  }

  await prisma.category.update({ where: { id }, data });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  // Check for products first
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { error: `Cannot delete: ${count} products still use this category.` };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function toggleCategoryVisibility(id: string) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return;
  await prisma.category.update({
    where: { id },
    data: { isVisible: !cat.isVisible },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });
  return products;
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  const sku = formData.get("sku") as string || null;
  const stockQty = parseInt(formData.get("stockQty") as string) || 0;
  const isFeatured = formData.get("isFeatured") === "true";
  const isNewArrival = formData.get("isNewArrival") === "true";

  // Handle image uploads
  const imageFiles = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const path = `products/${slug}-${i}.${ext}`;
      const url = await StorageService.upload("products", path, buffer, file.type);
      imageUrls.push(url);
    }
  }

  const stockStatus = stockQty === 0 ? "out_of_stock" : stockQty <= 5 ? "low_stock" : "in_stock";

  await prisma.product.create({
    data: {
      name, slug, description, categoryId, price, comparePrice, sku,
      stockQty, stockStatus, images: imageUrls, isVisible: true,
      isFeatured, isNewArrival, tags: [],
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  const sku = formData.get("sku") as string || null;
  const stockQty = parseInt(formData.get("stockQty") as string) || 0;
  const isFeatured = formData.get("isFeatured") === "true";
  const isNewArrival = formData.get("isNewArrival") === "true";

  const data: any = {
    name, description, categoryId, price, comparePrice, sku,
    stockQty, isFeatured, isNewArrival,
    stockStatus: stockQty === 0 ? "out_of_stock" : stockQty <= 5 ? "low_stock" : "in_stock",
  };

  // Handle new image uploads
  const imageFiles = formData.getAll("images") as File[];
  const existingImages = formData.get("existingImages") as string;
  let imageUrls: string[] = existingImages ? JSON.parse(existingImages) : [];

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const path = `products/${slug}-${Date.now()}-${i}.${ext}`;
      const url = await StorageService.upload("products", path, buffer, file.type);
      imageUrls.push(url);
    }
  }
  data.images = imageUrls;

  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  // Delete images from storage
  const product = await prisma.product.findUnique({ where: { id } });
  if (product) {
    for (const url of product.images) {
      try {
        const path = StorageService.extractPath(url, "products");
        await StorageService.delete("products", path);
      } catch { /* ignore if image doesn't exist */ }
    }
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProductStock(id: string, qty: number) {
  const status = qty === 0 ? "out_of_stock" : qty <= 5 ? "low_stock" : "in_stock";
  await prisma.product.update({
    where: { id },
    data: { stockQty: qty, stockStatus: status },
  });
  revalidatePath("/admin/products");
}

export async function toggleProductVisibility(id: string) {
  const prod = await prisma.product.findUnique({ where: { id } });
  if (!prod) return;
  await prisma.product.update({
    where: { id },
    data: { isVisible: !prod.isVisible },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders;
}

export async function updateOrderStatus(id: string, status: string) {
  await prisma.order.update({
    where: { id },
    data: { status: status as any },
  });
  revalidatePath("/admin/orders");
}

export async function updatePaymentStatus(id: string, paymentStatus: string, adminNote?: string) {
  const data: any = { paymentStatus: paymentStatus as any };
  if (adminNote) data.adminNote = adminNote;

  await prisma.order.update({ where: { id }, data });
  revalidatePath("/admin/orders");
}

// ─── Users / Profiles ────────────────────────────────────────────────────────

export async function getProfiles() {
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return profiles;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [totalProducts, totalCategories, pendingPayments, ordersThisMonth, lowStockProducts, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count({ where: { paymentStatus: "pending" } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.product.findMany({
        where: { stockQty: { lte: 5 } },
        orderBy: { stockQty: "asc" },
        take: 5,
        select: { id: true, name: true, stockQty: true, sku: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
    ]);

  return {
    totalProducts,
    totalCategories,
    pendingPayments,
    ordersThisMonth,
    lowStockProducts,
    recentOrders,
  };
}

// ─── Store Config ────────────────────────────────────────────────────────────

export async function getStoreConfig() {
  let store = await prisma.store.findUnique({ where: { id: "default" } });
  if (!store) {
    store = await prisma.store.create({ data: { id: "default" } });
  }
  return store;
}

export async function updateStoreConfig(formData: FormData) {
  const data: any = {};
  
  const fields = [
    "name", "address", "phone", "email", "instagram", "whatsapp",
    "accentColor", "upiId", "paymentInstructions", "heroHeadline",
    "heroSubtext", "heroCTA", "announcementText", "aboutText"
  ];

  fields.forEach(f => {
    const val = formData.get(f);
    if (val !== null) data[f] = val as string;
  });

  const announcementVisible = formData.get("announcementVisible");
  if (announcementVisible !== null) data.announcementVisible = announcementVisible === "true";

  // Handle image uploads
  const imageFields = ["logoUrl", "upiQrUrl", "heroImage", "aboutImage"];
  for (const f of imageFields) {
    const file = formData.get(f) as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const path = `store/${f}-${Date.now()}.${ext}`;
      data[f] = await StorageService.upload("banners", path, buffer, file.type);
    }
  }

  await prisma.store.update({
    where: { id: "default" },
    data
  });

  revalidatePath("/");
  revalidatePath("/admin/customization");
}

