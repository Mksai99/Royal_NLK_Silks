"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, CheckCircle2, Clock, Truck, MessageCircle } from "lucide-react";
import Link from "next/link";

interface OrderItem { name: string; qty: number; price: number; }
interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  admin_note?: string;
  items: any; // Can be string or JSON array
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrderData(null);
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      setOrderData(data.order);
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get("id")) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusStep = (status: string) => {
    const steps = ["pending", "processing", "completed"];
    return steps.indexOf(status?.toLowerCase() || "");
  };

  const parseItems = (items: any): OrderItem[] => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    try { return JSON.parse(items); } catch { return []; }
  };

  const statusSteps = [
    { label: "Pending", icon: Clock },
    { label: "Processing", icon: Package },
    { label: "Completed", icon: CheckCircle2 },
  ];

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto w-full min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-primary mb-4">Order Status</h1>
        <p className="text-muted-foreground">Enter your Order ID to check the current status of your purchase.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-16 max-w-xl mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID (e.g., RNLKS-2026-00001)"
            className="w-full border-2 border-secondary/20 p-4 pl-12 rounded-sm focus:ring-1 focus:ring-secondary outline-none font-bold text-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        </div>
        <button
          type="submit"
          className="bg-primary text-white font-bold px-8 py-4 rounded-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "SEARCHING..." : "TRACK"}
        </button>
      </form>

      {/* Result */}
      {orderData && (
        <div className="animate-fade-in flex flex-col gap-8">
          {/* Status Progress */}
          <div className="bg-white p-8 rounded-sm shadow-xl border border-secondary/10">
            <div className="flex justify-between items-center mb-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order ID</span>
                <h2 className="text-2xl font-bold text-primary">{orderData.order_number}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Date</span>
                <p className="font-bold text-primary">
                  {new Date(orderData.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="relative flex justify-between">
              <div className="absolute top-6 left-0 w-full h-[2px] bg-muted -z-0" />
              <div
                className="absolute top-6 left-0 h-[2px] bg-secondary transition-all duration-1000 -z-0"
                style={{ width: `${(getStatusStep(orderData.order_status) / 2) * 100}%` }}
              />
              {statusSteps.map((step, i) => {
                const isActive = getStatusStep(orderData.order_status) >= i;
                const Icon = step.icon;
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${isActive ? "bg-secondary border-primary text-primary shadow-lg" : "bg-white border-muted text-muted-foreground"}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="bg-white p-8 rounded-sm shadow-xl border border-secondary/10">
              <h3 className="font-serif font-bold text-xl text-primary mb-6 pb-2 border-b border-secondary/10">Order Details</h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold text-primary">{orderData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className={`font-bold capitalize ${orderData.payment_status === "verified" ? "text-green-600" : orderData.payment_status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
                    {orderData.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total:</span>
                  <span className="font-bold text-primary">₹{(Number(orderData.total_amount)).toLocaleString("en-IN")}</span>
                </div>
                {/* Order Items */}
                {parseItems(orderData.items).length > 0 && (
                  <div className="pt-4 border-t border-secondary/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Items Ordered:</p>
                    <div className="flex flex-col gap-2">
                      {parseItems(orderData.items).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span>{item.name} × {item.qty}</span>
                          <span className="font-bold">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {orderData.admin_note && (
                  <div className="pt-4 mt-2 border-t border-secondary/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Message from Royal NLK Silks:</p>
                    <p className="text-sm italic text-muted-foreground bg-secondary/5 p-4 rounded-sm border-l-4 border-secondary">
                      &ldquo;{orderData.admin_note}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-primary text-white p-8 rounded-sm shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-secondary mb-4">Need Assistance?</h3>
                <p className="text-sm opacity-80 mb-6">If you have any questions regarding your order, feel free to reach out to our support team.</p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/918282824929?text=${encodeURIComponent(`Hello, I'm checking the status of my order ${orderData.order_number}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary text-primary font-bold py-3 px-6 rounded-sm flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all"
                >
                  <MessageCircle size={18} /> CHAT ON WHATSAPP
                </a>
                <div className="text-center text-xs opacity-60">Available 10 AM – 8 PM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <div className="text-center py-12">
          <p className="text-red-500 font-bold mb-2">Order ID not found.</p>
          <p className="text-muted-foreground text-sm">Please double-check the ID or contact us if you need help.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" /></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
