"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction } from "@/actions/auth.actions";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ChevronRight, Eye, EyeOff, ArrowLeft, Chrome } from "lucide-react";
import toast from "react-hot-toast";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const message = searchParams.get("message");

  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("callbackUrl", callbackUrl);
    setError(null);

    startTransition(async () => {
      const result = await signInAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-6">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      <div className="absolute -top-32 -left-32 w-96 h-96 border border-secondary/10 rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 border border-secondary/10 rounded-full" />

      <div className="w-full max-w-md z-10">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-sm mb-8 hover:text-secondary transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="bg-white rounded-sm shadow-2xl border border-secondary/10 p-6 md:p-10 animate-fade-in">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-serif font-bold text-primary tracking-wider">ROYAL NLK SILKS</h1>
              <p className="text-[10px] tracking-[0.3em] text-secondary font-bold uppercase mt-1">DHARMAVARAM</p>
            </Link>
            <div className="w-16 h-[2px] bg-secondary mx-auto mt-4" />
            <p className="text-muted-foreground text-sm mt-4">Sign in to your account</p>
            {message && (
              <p className="mt-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-2 rounded-sm">{message}</p>
            )}
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border-2 border-gray-200 py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-3 hover:border-secondary/30 hover:bg-secondary/5 transition-all mb-6"
          >
            <Chrome size={18} className="text-red-500" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Mail size={13} className="text-secondary" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="border border-secondary/20 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Lock size={13} className="text-secondary" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  className="w-full border border-secondary/20 p-3 pr-12 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <Link href="/forgot-password" className="text-xs text-secondary font-bold hover:underline self-end">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-sm border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white font-bold py-4 rounded-sm shadow-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? "SIGNING IN..." : "SIGN IN"}
              {!isPending && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                className="text-secondary font-bold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
          <div className="mt-3 text-center">
            <Link href="/track-order" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Just want to track an order? →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
