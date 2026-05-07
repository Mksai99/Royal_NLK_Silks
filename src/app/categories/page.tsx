"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-secondary font-bold tracking-[0.3em] uppercase mb-4 text-xs md:text-sm">EXPLORE COLLECTIONS</h2>
        <h1 className="text-primary text-3xl md:text-6xl font-serif font-bold mb-6">Our Heritage Weaves</h1>
        <div className="w-24 h-1 bg-secondary mx-auto mb-6 md:mb-8" />
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          Each category represents a distinct tradition of Indian weaving, curated with precision and passion by our master artisans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {categories.map((cat) => (
          <Link 
            href={`/categories/${cat.id}`} 
            key={cat.id} 
            className="group block bg-white rounded-sm overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-secondary/10"
          >
            <div className="relative h-[300px] md:h-[400px] overflow-hidden">
              <Image 
                src={(cat.imageUrl && cat.imageUrl !== "") ? cat.imageUrl : (cat.image_url && cat.image_url !== "") ? cat.image_url : "/placeholder-saree.jpg"} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors duration-500" />
              <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-sm text-primary font-bold text-[10px] md:text-xs tracking-widest shadow-lg">
                {cat._count?.products || 0} DESIGNS
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-serif font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                {cat.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
                {cat.description || "Explore our exquisite collection of handcrafted silk sarees."}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold text-xs tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                   VIEW COLLECTION <ArrowRight size={14} className="text-secondary" />
                </span>
                <div className="w-10 h-[1px] bg-secondary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
