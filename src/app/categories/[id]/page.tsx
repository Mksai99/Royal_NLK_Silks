"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ProductImage { url: string; order: number; }
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stockQty: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  images: ProductImage[];
  category: { name: string };
}
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  products: Product[];
}

const FALLBACK = "https://images.unsplash.com/photo-1610030469668-93510ef2d32e?q=80&w=800&auto=format&fit=crop";

export default function CategoryDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("default");

  useEffect(() => {
    fetch(`/api/categories/${id}`)
      .then((r) => r.json())
      .then((d) => { setCategory(d.category || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase">Loading Collection...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 py-20 px-6">
        <h1 className="text-3xl font-serif font-bold text-primary">Collection Not Found</h1>
        <Link href="/categories" className="bg-primary text-white font-bold px-8 py-3 rounded-sm hover:bg-primary/90 transition-all">
          View All Collections
        </Link>
      </div>
    );
  }

  // Fallback demo products when DB is empty
  const rawProducts = category.products.length > 0 ? category.products : Array.from({ length: 8 }).map((_, i) => ({
    id: `demo-${i}`,
    name: `${category.name} — Design ${i + 1}`,
    price: 8500 + i * 1500,
    description: "Exquisite handloom silk saree with traditional motifs.",
    stockQty: i % 4 === 0 ? 0 : i % 3 === 0 ? 2 : 10,
    isFeatured: i < 2,
    isNewArrival: i < 3,
    images: [{ url: FALLBACK, order: 0 }],
    category: { name: category.name },
  }));

  // Sort
  const displayProducts = [...rawProducts].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen">
      {/* Category Hero Banner */}
      <section className="relative h-64 md:h-72 overflow-hidden">
        <Image src={category.imageUrl || FALLBACK} alt={category.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-primary/65 backdrop-blur-[1px]" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
          <button onClick={() => router.back()} className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs md:text-sm transition-colors">
            <ArrowLeft size={14} /> Collections
          </button>
          <nav className="text-white/50 text-[9px] md:text-[10px] tracking-widest uppercase mb-3 px-2">
            <Link href="/" className="hover:text-white">Home</Link> / <Link href="/categories" className="hover:text-white mx-1">Collections</Link> / <span className="text-white truncate max-w-[100px] inline-block align-bottom">{category.name}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 md:mb-3">{category.name}</h1>
          {category.description && <p className="text-white/70 max-w-xl text-xs md:text-sm line-clamp-2 md:line-clamp-none">{category.description}</p>}
          <div className="mt-4 bg-white/10 backdrop-blur-sm px-4 md:px-5 py-1 md:py-1.5 rounded-full text-white text-[10px] md:text-xs font-bold border border-white/20">
            {displayProducts.length} Designs
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="bg-white border-b border-secondary/10 sticky top-[68px] md:top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3 flex justify-between items-center">
          <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {displayProducts.length} items
          </p>
          <div className="flex items-center gap-2 md:gap-3">
            <SlidersHorizontal size={14} className="text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[10px] md:text-sm font-bold text-primary border border-secondary/20 rounded-sm px-2 md:px-4 py-1.5 md:py-2 outline-none bg-white"
            >
              <option value="default">Sort</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, i) => {
            const imgUrl = product.images?.[0]?.url || FALLBACK;
            const isDemo = product.id.startsWith("demo-");
            const outOfStock = product.stockQty === 0;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-lg bg-muted border border-secondary/5">
                  <Image src={imgUrl} alt={product.name} fill className="object-cover transition-transform duration-700 md:group-hover:scale-110" />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1">
                    {product.isNewArrival && <span className="bg-secondary text-primary text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-sm uppercase">New</span>}
                    {product.isFeatured && <span className="bg-primary text-white text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-sm uppercase">Featured</span>}
                    {outOfStock && <span className="bg-red-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-sm uppercase">Out of Stock</span>}
                  </div>
                  {/* Interaction overlay */}
                  <div className="absolute inset-0 bg-primary/30 opacity-0 md:group-hover:opacity-100 transition-all flex items-end justify-center pb-4 md:pb-6">
                    <Link href={isDemo ? "#" : `/product/${product.id}`} className="bg-white text-primary font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-sm shadow-xl hover:bg-secondary hover:text-white transition-colors text-xs md:text-sm transform translate-y-4 md:group-hover:translate-y-0 transition-transform">
                      VIEW DETAILS
                    </Link>
                  </div>
                  <button className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100 shadow-sm">
                    <Heart size={12} className="md:w-[14px]" />
                  </button>
                </div>
                <div className="pt-4 pb-2 flex flex-col gap-1 px-1">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{product.category?.name || category.name}</span>
                  <h3 className="font-serif font-bold text-primary text-sm leading-tight line-clamp-2 group-hover:text-secondary transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-secondary font-bold">₹{product.price.toLocaleString("en-IN")}</span>
                    {!outOfStock && product.stockQty <= 5 && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Only {product.stockQty} left</span>
                    )}
                  </div>
                  {!isDemo && (
                    <Link
                      href={`/product/${product.id}`}
                      className={`mt-3 w-full text-xs font-bold py-2.5 rounded-sm text-center transition-all active:scale-95 flex items-center justify-center gap-2 ${outOfStock ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}
                    >
                      <ShoppingBag size={13} />
                      {outOfStock ? "OUT OF STOCK" : "BUY NOW"}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
