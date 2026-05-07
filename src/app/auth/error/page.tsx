"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error_description") || searchParams.get("error") || "Authentication failed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-white rounded-sm shadow-2xl border border-red-100 p-10 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">Authentication Error</h1>
        <div className="w-12 h-[2px] bg-red-200 mx-auto mb-6" />
        <p className="text-muted-foreground text-sm mb-8 bg-red-50 p-4 rounded-sm border border-red-100">
          {error}
        </p>
        <div className="flex flex-col gap-4">
          <Link 
            href="/login" 
            className="bg-primary text-white font-bold py-3 rounded-sm shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> BACK TO LOGIN
          </Link>
          <p className="text-xs text-muted-foreground">
            If this persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
