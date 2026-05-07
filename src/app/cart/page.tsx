"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

// Cart is session-based (localStorage) for now
// Future: connect to DB cart on login
export default function CartPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-8 border-2 border-secondary/20">
        <ShoppingBag size={40} className="text-secondary" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">Your Cart is Empty</h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        Discover our exquisite collection of handloom silk sarees and find your perfect piece.
      </p>
      <Link
        href="/categories"
        className="bg-primary text-white font-bold px-10 py-4 rounded-sm hover:bg-primary/90 transition-all active:scale-95 shadow-xl flex items-center gap-3 text-sm tracking-widest uppercase"
      >
        SHOP COLLECTION <ArrowRight size={18} />
      </Link>
      <p className="mt-8 text-xs text-muted-foreground">
        Want to place an order directly?{" "}
        <Link href="/categories" className="text-secondary font-bold hover:underline">
          Browse products →
        </Link>
      </p>
    </div>
  );
}
