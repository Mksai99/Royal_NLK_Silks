"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth.actions";
import { Mail, ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("email", email);

    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsSent(true);
        toast.success("Reset link sent to your email!");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-6">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      <div className="absolute -top-32 -left-32 w-96 h-96 border border-secondary/10 rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 border border-secondary/10 rounded-full" />

      <div className="w-full max-w-md z-10">
        <Link href="/login" className="flex items-center gap-2 text-primary font-bold text-sm mb-8 hover:text-secondary transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="bg-white rounded-sm shadow-2xl border border-secondary/10 p-10 animate-fade-in">
          {isSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-primary mb-4">Check Your Email</h1>
              <p className="text-muted-foreground text-sm mb-8">
                We&apos;ve sent a password reset link to <br />
                <span className="font-bold text-primary">{email}</span>
              </p>
              <button 
                onClick={() => setIsSent(false)}
                className="text-secondary font-bold text-sm hover:underline"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-primary tracking-wider uppercase">Reset Password</h1>
                <div className="w-16 h-[2px] bg-secondary mx-auto mt-4" />
                <p className="text-muted-foreground text-sm mt-4">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Mail size={13} className="text-secondary" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-secondary/20 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-white font-bold py-4 rounded-sm shadow-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "SENDING LINK..." : "SEND RESET LINK"}
                  {!isPending && <ChevronRight size={18} />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
