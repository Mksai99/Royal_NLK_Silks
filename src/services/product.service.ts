import "server-only";
import { prisma } from "@/lib/prisma";
import type { Product, PaginatedResponse } from "@/types/database.types";

export interface ProductFilters {
  categoryId?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const ProductService = {

  async list(filters: ProductFilters = {}): Promise<PaginatedResponse<any>> {
    const { page = 1, pageSize = 20, categoryId, isFeatured, isNewArrival, minPrice, maxPrice, search } = filters;

    const where: any = { isVisible: true };
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured) where.isFeatured = true;
    if (isNewArrival) where.isNewArrival = true;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, count] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.product.count({ where })
    ]);

    const transformedData = data.map(p => ({
      ...p,
      images: p.images.map((url, i) => ({ url, order: i }))
    }));

    return {
      data: transformedData,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  },

  async getById(id: string): Promise<any | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!product) return null;
    return {
      ...product,
      images: product.images.map((url, i) => ({ url, order: i }))
    };
  },

  async getBySlug(slug: string): Promise<any | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true }
    });
    if (!product) return null;
    return {
      ...product,
      images: product.images.map((url, i) => ({ url, order: i }))
    };
  },

  async create(product: any) {
    return prisma.product.create({ data: product });
  },

  async update(id: string, updates: any) {
    return prisma.product.update({
      where: { id },
      data: updates
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  async updateStock(id: string, qty: number) {
    const status = qty === 0 ? "out_of_stock" : qty <= 5 ? "low_stock" : "in_stock";
    return prisma.product.update({
      where: { id },
      data: { stockQty: qty, stockStatus: status }
    });
  },

  async adminList(page = 1, pageSize = 50) {
    const [data, count] = await Promise.all([
      prisma.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } }
      }),
      prisma.product.count()
    ]);
    return { data, total: count };
  },
};
