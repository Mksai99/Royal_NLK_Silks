"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/actions/auth.actions";
import { Lock, Eye, EyeOff, ChevronRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirm", confirmPassword);

    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.error) {
        toast.error(result.error);
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
        <div className="bg-white rounded-sm shadow-2xl border border-secondary/10 p-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary tracking-wider uppercase">Set New Password</h1>
            <div className="w-16 h-[2px] bg-secondary mx-auto mt-4" />
            <p className="text-muted-foreground text-sm mt-4">
              Please enter your new secure password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Lock size={13} className="text-secondary" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-secondary/20 p-3 pr-12 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all text-sm"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Lock size={13} className="text-secondary" /> Confirm New Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-secondary/20 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white font-bold py-4 rounded-sm shadow-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
              {!isPending && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
