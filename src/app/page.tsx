"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShieldCheck, MessageCircle, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?isFeatured=true&pageSize=4")
        ]);
        
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        setCategories(catData.data || []);
        setFeaturedProducts(prodData.products || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback data if DB is empty or still loading
  const defaultCategories = [
    { name: "Kanchipuram Silk", imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop", description: "Regal borders and rich pallus for weddings." },
    { name: "Banarasi Weaves", imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop", description: "The intricate gold and silver brocade work." },
    { name: "Dharmavaram Specials", imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop", description: "Our hometown's legendary handloom heritage." }
  ];

  const displayCategories = categories.length > 0 ? categories.slice(0, 3) : defaultCategories;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop"
            alt="Royal NLK Silks Collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h2 className="text-secondary font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
              The Finest Dharmavaram Heritage
            </h2>
            <h1 className="text-white text-4xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Royal Elegance in <br />
              <span className="text-secondary italic">Every Thread</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-lg leading-relaxed">
              Discover our exclusive collection of handloom silk sarees, where traditional craftsmanship meets modern sophistication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/categories" 
                className="bg-secondary text-primary font-bold px-8 py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all active:scale-95 shadow-xl group"
              >
                SHOP COLLECTION
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/about" 
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold px-8 py-4 rounded-sm flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 shadow-xl"
              >
                OUR STORY
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Gold Border */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-primary text-3xl md:text-5xl font-serif font-bold mb-4">Timeless Collections</h2>
          <div className="w-24 h-1 bg-secondary mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto italic text-sm md:text-base">
            "Handpicked excellence for your most cherished moments."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {displayCategories.map((cat, i) => (
            <motion.div
              key={cat.id || i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/categories/${cat.id || ''}`} className="group relative h-[400px] md:h-[500px] block overflow-hidden rounded-sm shadow-2xl">
                <Image 
                   src={(cat.imageUrl && cat.imageUrl !== "") ? cat.imageUrl : (cat.image && cat.image !== "") ? cat.image : "/placeholder-saree.jpg"} 
                   alt={cat.name} 
                   fill 
                   className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-white text-xl md:text-2xl font-serif font-bold mb-2">{cat.name}</h3>
                  <p className="text-white/70 text-xs md:text-sm mb-4 line-clamp-2">{cat.description || cat.desc}</p>
                  <span className="text-secondary font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                    EXPLORE NOW <ArrowRight size={14} />
                  </span>
                </div>
                <div className="absolute top-4 right-4 border border-secondary/50 p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                   <div className="border border-secondary/50 p-2 text-secondary">
                      <Heart size={16} />
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
              <Star size={24} className="text-secondary" />
            </div>
            <h4 className="text-white font-serif font-bold text-lg">Authentic Quality</h4>
            <p className="text-white/60 text-sm">100% genuine handloom silk certified by master weavers.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
              <Crown size={24} className="text-secondary" />
            </div>
            <h4 className="text-white font-serif font-bold text-lg">Expert Craftsmanship</h4>
            <p className="text-white/60 text-sm">Directly from the looms of Dharmavaram with generational expertise.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
              <ShieldCheck size={24} className="text-secondary" />
            </div>
            <h4 className="text-white font-serif font-bold text-lg">Secure Payment</h4>
            <p className="text-white/60 text-sm">Verified UPI transactions for a seamless shopping experience.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
              <Heart size={24} className="text-secondary" />
            </div>
            <h4 className="text-white font-serif font-bold text-lg">Customer Love</h4>
            <p className="text-white/60 text-sm">Over 5000+ happy customers across the globe.</p>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="py-12 md:py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6">
          <div>
            <h2 className="text-primary text-3xl md:text-5xl font-serif font-bold mb-4">New Arrivals</h2>
            <div className="w-24 h-1 bg-secondary" />
          </div>
          <Link href="/categories" className="text-primary font-bold border-b-2 border-secondary pb-1 hover:text-secondary transition-colors tracking-widest text-xs md:text-sm uppercase">
            VIEW ALL PRODUCTS
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(featuredProducts.length > 0 ? featuredProducts : Array.from({ length: 4 })).map((product, i) => (
            <div key={product?.id || i} className="group flex flex-col gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted shadow-lg">
                <Image 
                  src={(product?.images && product?.images[0] && product.images[0] !== "") ? product.images[0] : `https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop&sig=${i}`}
                  alt={product?.name || "Product"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product?.isNewArrival !== false && (
                  <div className="absolute top-3 left-3 bg-secondary text-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter">
                    NEW ARRIVAL
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link 
                    href={`/product/${product?.id || '1'}`}
                    className="bg-white text-primary font-bold px-6 py-2 rounded-sm shadow-xl hover:bg-secondary hover:text-white transition-colors"
                  >
                    QUICK VIEW
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{product?.category?.name || "Silk Saree"}</span>
                <h3 className="text-primary font-serif font-bold text-lg line-clamp-1">{product?.name || "Golden Brocade Bridal Saree"}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-secondary font-bold">₹{(product?.price || 12499).toLocaleString()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${product?.stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {product?.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative h-[600px]">
            <div className="absolute top-8 left-8 w-full h-full border-2 border-secondary z-0" />
            <Image 
              src="https://images.unsplash.com/photo-1590736962236-4d0092305530?q=80&w=1964&auto=format&fit=crop"
              alt="Our Workshop"
              fill
              className="object-cover relative z-10 shadow-2xl"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <div>
              <h2 className="text-secondary font-bold tracking-[0.3em] uppercase mb-4 text-sm">OUR LEGACY</h2>
              <h3 className="text-primary text-4xl md:text-5xl font-serif font-bold leading-tight">
                Authentic Dharmavaram <br /> Silk Craftsmanship
              </h3>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed italic">
              "ROYAL NLK SILKS is more than just a brand; it's a celebration of heritage. Based in the heart of Dharmavaram, we have been connecting master weavers with saree connoisseurs for generations."
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every saree in our collection is a masterpiece of design and dedication. From the selection of pure mulberry silk to the intricate gold zari work, we ensure that every thread tells a story of royalty and grace.
            </p>
            <Link 
              href="/about" 
              className="inline-flex items-center gap-2 text-primary font-bold border-b-2 border-secondary pb-1 w-fit hover:text-secondary transition-colors"
            >
              LEARN MORE ABOUT US <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <Link 
        href="https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ"
        target="_blank"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
      >
        <MessageCircle size={28} className="md:w-8 md:h-8" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-primary px-4 py-2 rounded-md shadow-lg text-sm font-bold whitespace-nowrap opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:block">
          Join our WhatsApp Community
        </span>
      </Link>
    </div>
  );
}
