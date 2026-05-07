import {
  Package,
  Tag,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/actions/admin.actions";

export default async function AdminDashboard() {
  const { totalProducts, totalCategories, pendingPayments, ordersThisMonth, lowStockProducts, recentOrders } =
    await getDashboardStats();

  const stats = [
    { name: "Total Products", value: String(totalProducts), icon: Package, color: "bg-blue-500" },
    { name: "Total Categories", value: String(totalCategories), icon: Tag, color: "bg-purple-500" },
    { name: "Pending Payments", value: String(pendingPayments), icon: Clock, color: "bg-amber-500" },
    { name: "Orders This Month", value: String(ordersThisMonth), icon: TrendingUp, color: "bg-green-500" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Overview of your store&apos;s performance and operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-sm shadow-md border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-sm ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-sm shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-primary flex items-center gap-2">
              <ClipboardList size={18} /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-secondary hover:underline">VIEW ALL</Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{order.orderNumber}</td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4 font-bold">₹{Number(order.totalAmount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">No orders yet</p>
                <p className="text-sm mt-1">Orders will appear here when customers place them.</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-sm shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-red-50">
            <h2 className="font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle size={18} /> Low Stock Alerts
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-sm bg-gray-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary line-clamp-1">{item.name}</span>
                    <span className="text-[10px] text-gray-400">SKU: {item.sku ?? item.id.slice(0, 6)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-sm text-[10px] font-bold ${item.stockQty === 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {item.stockQty === 0 ? 'OOS' : `${item.stockQty} Left`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
                <p className="text-sm font-bold">All stock levels healthy!</p>
              </div>
            )}
            <Link href="/admin/products" className="text-center text-xs font-bold text-primary hover:bg-primary hover:text-white py-3 rounded-sm border-2 border-primary transition-all mt-4">
              MANAGE INVENTORY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
