"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Phone, Mail, MapPin, Instagram, MessageCircle, ShoppingBag, Search, Menu, User, LogOut, X, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/actions/auth.actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import toast from "react-hot-toast";

const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string>("customer");
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      try {
        // 1. Try browser client first
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          setRole(user.user_metadata?.role ?? "customer");
        } else {
          // 2. Fallback to session API (server-side verified)
          const res = await fetch("/api/auth/session");
          const data = await res.json();
          if (data.user) {
            // We only have partial user info from API, but enough for Header
            setUser({ ...data.user, user_metadata: data.user } as any);
            setRole(data.user.role || "customer");
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth state changes for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role ?? "customer");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
      setUser(null);
      setUserMenuOpen(false);
      toast.success("Signed out successfully");
    });
  };

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Account";

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-xs sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-1 border-b border-secondary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><MapPin size={13} className="text-secondary" /><span>Shanthi Nagar, Dharmavaram - 515671</span></div>
          <div className="hidden md:flex items-center gap-1"><Phone size={13} className="text-secondary" /><span>8282824929</span></div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:flex items-center gap-1"><Mail size={13} className="text-secondary" /><span>royalnlksilks@gmail.com</span></div>
          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com/royal_nlksilks_dmm" target="_blank" className="hover:text-secondary transition-colors"><Instagram size={16} /></Link>
            <Link href="https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ" target="_blank" className="hover:text-secondary transition-colors"><MessageCircle size={16} /></Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-background/95 backdrop-blur-md py-3 md:py-4 px-4 md:px-6 flex justify-between items-center border-b border-secondary/10 sticky top-[36px] z-40 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
          </button>
          <Link href="/" className="flex flex-col items-start md:items-center">
            <h1 className="text-xl md:text-3xl font-serif font-bold text-primary tracking-wider leading-none">ROYAL NLK SILKS</h1>
            <span className="text-[8px] md:text-[10px] tracking-[0.3em] text-secondary font-bold -mt-0.5">DHARMAVARAM</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase text-primary">
          <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
          <Link href="/categories" className="hover:text-secondary transition-colors">Collections</Link>
          <Link href="/track-order" className="hover:text-secondary transition-colors">Order Status</Link>
          <Link href="/about" className="hover:text-secondary transition-colors">About Us</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hover:text-secondary text-primary hidden md:block"><Search size={20} /></button>
          <Link href="/cart" className="hover:text-secondary text-primary relative"><ShoppingBag size={20} /></Link>

          {loading ? (
            <div className="w-10 h-10 rounded-sm bg-gray-100 animate-pulse hidden md:block" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-primary px-3 py-2 rounded-sm transition-all font-bold text-xs border border-secondary/20"
              >
                {role === "admin" || role === "super_admin"
                  ? <Crown size={15} className="text-secondary" />
                  : <User size={15} />
                }
                <span className="hidden md:block max-w-[80px] truncate">{displayName}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-secondary/10 rounded-sm shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-primary truncate">{user.user_metadata?.name || displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${role === "admin" || role === "super_admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                      {role.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <Link href="/track-order" className="flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-secondary/5 font-bold" onClick={() => setUserMenuOpen(false)}>
                    <ShoppingBag size={16} /> Order Status
                  </Link>
                  {(role === "admin" || role === "super_admin") && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 font-bold" onClick={() => setUserMenuOpen(false)}>
                      <Crown size={14} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-100 disabled:opacity-50"
                  >
                    <LogOut size={14} /> {isPending ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-sm hover:bg-primary/90 transition-all hidden md:flex items-center gap-2">
              <User size={14} /> SIGN IN
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-secondary/10 shadow-lg animate-fade-in">
          <nav className="flex flex-col px-6 py-4 gap-3 text-sm font-bold tracking-widest uppercase text-primary">
            <Link href="/" className="py-2 border-b border-gray-100 hover:text-secondary" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/categories" className="py-2 border-b border-gray-100 hover:text-secondary" onClick={() => setMobileOpen(false)}>Collections</Link>
            <Link href="/track-order" className="py-2 border-b border-gray-100 hover:text-secondary" onClick={() => setMobileOpen(false)}>Order Status</Link>
            <Link href="/about" className="py-2 border-b border-gray-100 hover:text-secondary" onClick={() => setMobileOpen(false)}>About</Link>
            {!user
              ? <Link href="/login" className="bg-primary text-white text-center py-3 rounded-sm mt-2" onClick={() => setMobileOpen(false)}>SIGN IN</Link>
              : <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-red-500 text-left py-2">Sign Out ({displayName})</button>
            }
          </nav>
        </div>
      )}

      <div className="bg-secondary/10 text-primary py-1.5 text-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border-b border-secondary/10">
        ✨ Timeless Heritage • Exquisite Craftsmanship ✨
      </div>

      {/* Close dropdown on outside click */}
      {userMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />}
    </header>
  );
};

export default Header;
