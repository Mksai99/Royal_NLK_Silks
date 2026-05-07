"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, Upload, CreditCard, Copy, Eye, QrCode, FileText } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { getStoreConfig, updateStoreConfig } from "@/actions/admin.actions";

export default function PaymentSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getStoreConfig().then(data => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateStoreConfig(formData);
        toast.success("Payment settings updated!");
        const updated = await getStoreConfig();
        setConfig(updated);
      } catch (err: any) {
        toast.error(err.message || "Failed to update settings");
      }
    });
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading settings...</div>;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Payment Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Configure your UPI details and payment instructions for customers.</p>
        </div>
        <button 
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-primary text-white font-bold px-8 py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg disabled:opacity-50"
        >
          <Save size={18} /> {isPending ? "SAVING..." : "SAVE SETTINGS"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Left: Configuration */}
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-xl border border-gray-100 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <CreditCard size={14} /> UPI ID
            </label>
            <div className="flex gap-2">
              <input 
                name="upiId"
                type="text" 
                defaultValue={config.upiId || ""} 
                className="flex-1 border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary font-bold text-sm"
              />
              <button type="button" className="bg-gray-100 p-3 rounded-sm text-gray-500"><Copy size={18} /></button>
            </div>
            <p className="text-[10px] text-gray-400">This ID will be shown on the checkout page for manual entry.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <QrCode size={14} /> UPI QR CODE
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-sm p-4 md:p-8 flex flex-col items-center justify-center gap-4 bg-gray-50">
              <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white p-2 shadow-md">
                <Image 
                  src={config.upiQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${config.upiId || 'royalnlk@upi'}`}
                  alt="Current QR"
                  fill
                  className="object-contain"
                />
              </div>
              <input name="upiQrUrl" type="file" accept="image/*" className="text-xs border border-gray-200 p-2 rounded w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <FileText size={14} /> PAYMENT INSTRUCTIONS
            </label>
            <textarea 
              name="paymentInstructions"
              rows={6} 
              defaultValue={config.paymentInstructions || "1. Scan the QR code below.\n2. Enter the total order amount.\n3. Complete the payment and take a screenshot.\n4. Upload the screenshot on the checkout page."}
              className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Storefront Preview</h3>
          <div className="bg-white p-6 md:p-8 rounded-sm shadow-2xl border border-secondary/20 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
             <h4 className="text-lg font-serif font-bold text-primary mb-6">Payment Method: UPI</h4>
             <div className="flex flex-col gap-6">
               <div className="bg-secondary/5 p-6 rounded-sm border border-secondary/20 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1 shadow-sm relative">
                    <Image 
                      src={config.upiQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${config.upiId || 'royalnlk@upi'}`}
                      alt="Preview QR"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-primary">SCAN TO PAY</span>
               </div>
               <div className="flex flex-col gap-3">
                 <p className="text-xs font-bold text-primary uppercase tracking-widest">Or Pay to UPI ID</p>
                 <div className="flex items-center justify-between border border-gray-100 p-3 rounded-sm text-sm">
                    <span className="font-bold text-primary">{config.upiId || "N/A"}</span>
                    <Copy size={14} className="text-secondary" />
                 </div>
               </div>
               <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-primary">Instructions:</p>
                  <div className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                    {config.paymentInstructions || "Payment instructions will appear here."}
                  </div>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 italic px-4">
            <Eye size={12} /> This is exactly how customers see the payment section during checkout.
          </div>
        </div>
      </div>
    </form>
  );
}
