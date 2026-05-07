"use client";

import { useState, useEffect, Suspense, use } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, ChevronRight, CheckCircle2, ShieldCheck, Copy, Phone, ArrowLeft, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Fetch product and user session
    const initCheckout = async () => {
      if (!productId) {
        toast.error("No product selected");
        router.push("/categories");
        return;
      }

      try {
        const [prodRes, userRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch("/api/auth/session")
        ]);

        const prodData = await prodRes.json();
        const userData = await userRes.json();

        if (prodData.product) setProduct(prodData.product);
        if (userData.user) {
          setUser(userData.user);
          setFormData(prev => ({
            ...prev,
            name: userData.user.name || "",
            email: userData.user.email || ""
          }));
        } else {
          // Gated by middleware, but extra safety
          router.push(`/login?callbackUrl=${encodeURIComponent(`/checkout?productId=${productId}`)}`);
        }
      } catch (error) {
        toast.error("Failed to initialize checkout");
      } finally {
        setLoadingProduct(false);
      }
    };

    initCheckout();
  }, [productId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleNext = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill your name and phone number");
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentScreenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload screenshot to Supabase Storage
      const screenshotFormData = new FormData();
      screenshotFormData.append("file", paymentScreenshot);
      screenshotFormData.append("bucket", "product-images"); // Reuse bucket or create orders one
      screenshotFormData.append("path", `orders/${Date.now()}-${paymentScreenshot.name}`);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: screenshotFormData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      // 2. Place Order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: "Website Order - Contact on WhatsApp",
          items: [{
            productId: product.id,
            productName: product.name,
            productImage: (product.images && product.images[0]) ? product.images[0] : null,
            quantity: 1,
            unitPrice: Number(product.price)
          }],
          paymentMethod: "upi",
          paymentScreenshotUrl: uploadData.url
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Order placement failed");

      setOrderId(orderData.order.order_number);
      setStep(3);
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  const copyUPI = () => {
    navigator.clipboard.writeText("royalnlk@upi");
    toast.success("UPI ID copied to clipboard");
  };

  if (loadingProduct) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-serif font-bold text-primary">Product not found</h2>
      <Link href="/categories" className="text-secondary font-bold hover:underline">Back to Collections</Link>
    </div>
  );

  if (step === 3 && orderId) {
    return (
      <div className="py-24 px-6 max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 size={64} />
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold text-primary mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for choosing Royal NLK Silks. Your order has been received. Please chat with us on WhatsApp to confirm your order details and status.
        </p>
        
        <div className="bg-secondary/10 border-2 border-secondary/20 p-8 rounded-sm mb-12">
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-2 block">YOUR ORDER ID</span>
          <div className="text-3xl font-bold text-primary tracking-wider">{orderId}</div>
        </div>

        <div className="text-left bg-white shadow-xl p-8 rounded-sm border border-secondary/10 mb-8">
          <h3 className="font-bold text-primary mb-4 uppercase tracking-widest text-sm">What to do next?</h3>
          <ul className="flex flex-col gap-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary text-primary rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
              <p>Click the <b>Chat with Owner</b> button below to share your Order ID via WhatsApp.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary text-primary rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
              <p>Our team will verify your payment and confirm your order directly with you.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary text-primary rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
              <p>We will keep you updated on your order status through our WhatsApp chat.</p>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <a 
            href={`https://wa.me/918282824929?text=${encodeURIComponent(`Hello, I just placed an order! \nOrder ID: ${orderId} \nPlease confirm my payment and order status.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white font-bold py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg transition-all"
          >
            <MessageCircle size={20} /> CHAT WITH OWNER
          </a>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex-1 border-2 border-primary text-primary font-bold py-4 rounded-sm hover:bg-primary hover:text-white transition-all"
          >
            CONTINUE SHOPPING
          </button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          For queries, WhatsApp us or call 8282824929
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto w-full">
      <h1 className="text-4xl font-serif font-bold text-primary mb-12 text-center">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Forms */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-muted'}`}>1</div>
              <span className="font-bold text-sm">Delivery Info</span>
            </div>
            <div className="h-[2px] w-12 bg-muted" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-muted'}`}>2</div>
              <span className="font-bold text-sm">Payment</span>
            </div>
          </div>

          {step === 1 ? (
            <div className="bg-white p-8 rounded-sm shadow-xl border border-secondary/10 animate-fade-in">
              <h2 className="text-xl font-serif font-bold text-primary mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-primary">Full Name *</label>
                  <input type="text" id="name" value={formData.name} onChange={handleInputChange} className="border border-secondary/20 p-3 rounded-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="Enter your full name" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-primary">Phone Number *</label>
                  <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="border border-secondary/20 p-3 rounded-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="For order updates" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-primary">Email Address</label>
                  <input type="email" id="email" value={formData.email} onChange={handleInputChange} className="border border-secondary/20 p-3 rounded-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="For order confirmation" />
                </div>
              </div>
              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold py-4 mt-12 rounded-sm shadow-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
              >
                PROCEED TO PAYMENT <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-sm shadow-xl border border-secondary/10 animate-fade-in">
              <h2 className="text-xl font-serif font-bold text-primary mb-6">Payment Method: UPI</h2>
              
              <div className="flex flex-col md:flex-row gap-12 items-center mb-12">
                <div className="w-full md:w-1/2 flex flex-col items-center bg-secondary/5 p-8 rounded-sm border-2 border-dashed border-secondary/20">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Scan QR to Pay</span>
                  <div className="relative w-48 h-48 bg-white p-2 shadow-lg mb-4">
                    <Image 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=royalnlk@upi&pn=Royal NLK Silks&am=${Number(product.price)}`)}`}
                      alt="UPI QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">Scan using GPay, PhonePe, Paytm or any UPI App</p>
                </div>
                
                <div className="w-full md:w-1/2">
                  <div className="bg-secondary/10 p-6 rounded-sm mb-6 border border-secondary/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Or Pay to UPI ID</span>
                    <div className="flex items-center justify-between bg-white p-3 rounded-sm border border-secondary/10">
                      <span className="font-bold text-primary">royalnlk@upi</span>
                      <button onClick={copyUPI} className="text-secondary hover:text-primary transition-colors">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                    <p className="font-bold text-primary">Instructions:</p>
                    <ul className="list-disc pl-4 flex flex-col gap-2">
                      <li>Pay the exact amount: <span className="text-primary font-bold">₹{(Number(product.price)).toLocaleString()}</span></li>
                      <li>Take a screenshot of the successful transaction.</li>
                      <li>Upload the screenshot below to confirm your order.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-secondary/10 pt-8">
                <label className="text-xs font-bold uppercase tracking-widest text-primary">Upload Payment Screenshot *</label>
                <div 
                  className={`border-2 border-dashed rounded-sm p-12 text-center transition-all cursor-pointer ${paymentScreenshot ? 'border-green-500 bg-green-50' : 'border-secondary/20 hover:border-secondary hover:bg-secondary/5'}`}
                  onClick={() => document.getElementById('screenshot-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="screenshot-upload" 
                    hidden 
                    accept="image/*" 
                    onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                  />
                  {paymentScreenshot ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={32} className="text-green-500" />
                      <span className="text-sm font-bold text-green-700">{paymentScreenshot.name}</span>
                      <button className="text-xs text-red-500 underline mt-2" onClick={(e) => { e.stopPropagation(); setPaymentScreenshot(null); }}>Remove</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={32} className="text-secondary mb-2" />
                      <span className="text-sm font-bold text-primary">Click to upload screenshot</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG or WebP</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-4 border-2 border-primary text-primary font-bold rounded-sm hover:bg-primary/5 transition-all"
                >
                  BACK
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-sm shadow-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "PROCESSING..." : "CONFIRM ORDER & PAY"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-primary text-white p-8 rounded-sm shadow-2xl sticky top-40">
            <h2 className="text-xl font-serif font-bold text-secondary mb-8 pb-4 border-b border-secondary/20">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex gap-4">
                <div className="relative w-20 h-24 rounded-sm overflow-hidden border border-secondary/20">
                  <Image 
                    src={(product.images && product.images[0]) ? product.images[0] : "/placeholder-saree.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <h4 className="text-sm font-bold leading-tight">{product.name}</h4>
                  <span className="text-xs text-secondary">Qty: 1</span>
                  <span className="font-bold text-secondary">₹{(Number(product.price)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-secondary/20 pt-6">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Subtotal</span>
                <span>₹{(Number(product.price)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Tax</span>
                <span className="text-green-400 font-bold uppercase text-[10px]">INCLUDED</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4 border-t border-secondary/20">
                <span className="text-secondary">TOTAL</span>
                <span className="text-secondary">₹{(Number(product.price)).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs opacity-70">
                <ShieldCheck size={16} className="text-secondary" />
                <span>Secure SSL encrypted payment</span>
              </div>
              <div className="flex items-center gap-3 text-xs opacity-70">
                <Phone size={16} className="text-secondary" />
                <span>Support: 8282824929</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
