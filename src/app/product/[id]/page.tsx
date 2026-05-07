"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Share2, ShieldCheck, Sparkles, RefreshCw, Star, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) setError("Product not found");
          else setError("Failed to load product");
          return;
        }
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleBuyNow = async () => {
    // Check if user is logged in
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    if (!data.user) {
      // Redirect to login with callback back to checkout
      router.push(`/login?callbackUrl=${encodeURIComponent(`/checkout?productId=${product?.id}`)}`);
      return;
    }
    router.push(`/checkout?productId=${product?.id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-serif font-bold text-primary">{error || "Product not found"}</h2>
      <Link href="/categories" className="text-secondary font-bold hover:underline">Back to Collections</Link>
    </div>
  );


  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary font-bold text-sm mb-8 hover:text-secondary transition-colors"
      >
        <ArrowLeft size={16} /> BACK TO COLLECTION
      </button>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="relative aspect-[4/5] max-h-[500px] lg:max-h-none overflow-hidden rounded-sm shadow-2xl border border-secondary/10">
            <Image 
              src={(typeof product.images?.[selectedImage] === 'string' ? product.images[selectedImage] : product.images?.[selectedImage]?.url) || "/placeholder-saree.jpg"}
              alt={product.name}
              fill
              className="object-cover transition-all duration-500 hover:scale-110 cursor-zoom-in"
            />
            {product.stockQty <= 5 && product.stockQty > 0 && (
              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-amber-500 text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-sm shadow-xl text-xs md:text-sm uppercase">
                ONLY {product.stockQty} LEFT!
              </div>
            )}
            {product.stockQty === 0 && (
              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-600 text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-sm shadow-xl text-xs md:text-sm uppercase">
                OUT OF STOCK
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {product.images?.map((img: any, i: number) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(i)}
                className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-secondary shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <Image 
                  src={(typeof img === 'string' ? img : img.url) || "/placeholder-saree.jpg"} 
                  alt={`Thumb ${i}`} 
                  fill 
                  className="object-cover" 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" />)}
              </div>
              <span className="text-[10px] font-bold tracking-widest">(FRESH COLLECTION)</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary leading-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₹{(Number(product.price)).toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="text-muted-foreground line-through text-lg">₹{(Number(product.comparePrice)).toLocaleString()}</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    {Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed italic">
            {product.description || "No description available for this exquisite piece."}
          </p>

          <div className="flex flex-col gap-4 py-6 border-y border-secondary/10">
            <h4 className="font-bold text-primary text-sm uppercase tracking-widest">PRODUCT DETAILS</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              {(product.tags || ["Pure Handloom", "Silk Mark Certified", "Authentic Design"]).map((detail: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  {detail}
                </li>
              ))}
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Dry Clean Only
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button 
                onClick={handleBuyNow}
                disabled={product.stockQty === 0}
                className={`flex-1 font-bold py-4 rounded-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${product.stockQty === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                {product.stockQty === 0 ? "OUT OF STOCK" : "BUY IT NOW"}
              </button>
              <button className="w-16 h-16 border-2 border-secondary/30 rounded-sm flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-all shadow-lg">
                <Heart size={24} />
              </button>
            </div>
            <Link 
              href="https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ"
              target="_blank"
              className="w-full border-2 border-[#25D366] text-[#25D366] font-bold py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all"
            >
              ENQUIRE ON WHATSAPP
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <ShieldCheck size={20} className="text-secondary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Authentic Silk</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Star size={20} className="text-secondary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Pure Handloom</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RefreshCw size={20} className="text-secondary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
