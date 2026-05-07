"use client";

import { useState, useTransition } from "react";
import { signInAction } from "@/actions/auth.actions";
import { Lock, Mail, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("callbackUrl", "/admin");

    startTransition(async () => {
      const result = await signInAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
      <div className="absolute -top-24 -left-24 w-96 h-96 border-2 border-secondary/10 rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 border-2 border-secondary/10 rounded-full" />

      <div className="w-full max-w-md p-10 bg-white rounded-sm shadow-2xl border border-secondary/10 z-10 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-primary tracking-wider">ROYAL NLK SILKS</h1>
          <p className="text-[10px] tracking-[0.3em] text-secondary font-bold uppercase mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Mail size={14} className="text-secondary" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="border border-secondary/20 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all"
              placeholder="admin@nlksilks.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Lock size={14} className="text-secondary" /> Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="border border-secondary/20 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white font-bold py-4 rounded-sm shadow-xl mt-4 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? "AUTHENTICATING..." : "LOGIN TO DASHBOARD"}
            {!isPending && <ChevronRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Authorized Access Only
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Default: admin@nlksilks.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
