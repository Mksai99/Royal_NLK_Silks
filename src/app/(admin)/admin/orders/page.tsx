"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Eye, CheckCircle2, XCircle, Clock, Package, MessageCircle, Download } from "lucide-react";
import Image from "next/image";
import { getOrders, updateOrderStatus, updatePaymentStatus } from "@/actions/admin.actions";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchPay = !payFilter || o.paymentStatus === payFilter;
    const matchOrder = !orderFilter || o.status === orderFilter;
    return matchSearch && matchPay && matchOrder;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'verified': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleVerifyPayment = async (id: string) => {
    startTransition(async () => {
      await updatePaymentStatus(id, "verified");
      toast.success("Payment verified!");
      fetchOrders();
      setSelectedOrder(null);
    });
  };

  const handleRejectPayment = async (id: string) => {
    startTransition(async () => {
      await updatePaymentStatus(id, "rejected");
      toast.success("Payment rejected");
      fetchOrders();
      setSelectedOrder(null);
    });
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    startTransition(async () => {
      await updateOrderStatus(id, status);
      toast.success("Order status updated");
      fetchOrders();
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Order Management</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Verify payments and manage customer orders.</p>
      </div>

      <div className="bg-white rounded-sm shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm focus:ring-1 focus:ring-secondary outline-none text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="flex-1 border border-gray-200 px-4 py-2 rounded-sm text-sm font-bold text-gray-600 outline-none">
              <option value="">All Payment</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} className="flex-1 border border-gray-200 px-4 py-2 rounded-sm text-sm font-bold text-gray-600 outline-none">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">No orders found</p>
            <p className="text-sm mt-1">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-4 md:px-6 py-4">Order ID</th>
                  <th className="px-4 md:px-6 py-4">Customer</th>
                  <th className="px-4 md:px-6 py-4">Total</th>
                  <th className="px-4 md:px-6 py-4">Payment</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Status</th>
                  <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Date</th>
                  <th className="px-4 md:px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order: any) => (
                  <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-primary text-xs">{order.orderNumber}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{order.customerName}</span>
                        <span className="text-[10px] text-gray-400">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-bold">₹{Number(order.totalAmount).toLocaleString()}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm border text-[10px] font-bold uppercase ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <select
                        value={order.status}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                        disabled={isPending}
                        className="border border-gray-200 p-1 rounded-sm text-xs font-bold outline-none capitalize"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-secondary font-bold hover:underline flex items-center gap-1 ml-auto text-xs"
                      >
                        <Eye size={16} /> VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-primary text-white sticky top-0 z-10">
              <h2 className="text-lg md:text-2xl font-serif font-bold">Order: {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-white/60 hover:text-white"><XCircle size={24} /></button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 flex flex-col gap-2 text-sm">
                    <p><span className="font-bold">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-bold">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="font-bold">Phone:</span> {selectedOrder.customerPhone}</p>
                  </div>
                </div>

                {selectedOrder.paymentScreenshotUrl && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Screenshot</h3>
                    <div className="relative aspect-video rounded-sm overflow-hidden border border-gray-200">
                      <Image src={selectedOrder.paymentScreenshotUrl || "/placeholder-saree.jpg"} alt="Payment Screenshot" fill className="object-cover" sizes="400px" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verify Payment</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVerifyPayment(selectedOrder.id)}
                      disabled={isPending}
                      className="flex-1 bg-green-600 text-white font-bold py-3 rounded-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} /> VERIFY ✅
                    </button>
                    <button
                      onClick={() => handleRejectPayment(selectedOrder.id)}
                      disabled={isPending}
                      className="flex-1 bg-red-600 text-white font-bold py-3 rounded-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={18} /> REJECT ❌
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Items</h3>
                  <div className="border border-gray-100 rounded-sm overflow-hidden">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center gap-3 border-b border-gray-100 last:border-0">
                        <div className="w-10 h-12 bg-gray-100 shrink-0 rounded-sm overflow-hidden relative">
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{item.productName}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity} x ₹{Number(item.unitPrice).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-gray-50 text-right font-bold text-primary">
                      Total: ₹{Number(selectedOrder.totalAmount).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Update Order Status</h3>
                  <select
                    defaultValue={selectedOrder.status}
                    onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full border border-gray-200 p-3 rounded-sm text-sm font-bold outline-none mb-4 capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={`https://wa.me/91${selectedOrder.customerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border-2 border-secondary text-secondary font-bold py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all"
                  >
                    <MessageCircle size={18} /> WHATSAPP CUSTOMER
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
