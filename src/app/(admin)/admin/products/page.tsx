"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Edit2, Trash2, Search, Filter, CheckCircle, XCircle, X } from "lucide-react";
import Image from "next/image";
import { getProducts, getCategories, createProduct, deleteProduct, updateProductStock, toggleProductVisibility } from "@/actions/admin.actions";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !catFilter || p.categoryId === catFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      await createProduct(formData);
      toast.success("Product created!");
      setShowForm(false);
      fetchData();
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchData();
    });
  };

  const handleStockUpdate = async (id: string, qty: number) => {
    startTransition(async () => {
      await updateProductStock(id, qty);
      fetchData();
    });
  };

  const handleToggleVisibility = async (id: string) => {
    startTransition(async () => {
      await toggleProductVisibility(id);
      fetchData();
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Product Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Add, edit and manage your inventory items.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg"
        >
          <Plus size={18} /> ADD PRODUCT
        </button>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary text-white sticky top-0 z-10">
              <h2 className="text-lg font-serif font-bold">Add New Product</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form action={handleCreate} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Name*</label>
                  <input name="name" required className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none focus:ring-1 focus:ring-secondary" placeholder="Product name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Category*</label>
                  <select name="categoryId" required className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Description</label>
                <textarea name="description" rows={3} className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none focus:ring-1 focus:ring-secondary" placeholder="Product description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Price (₹)*</label>
                  <input name="price" type="number" step="0.01" required className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Compare Price</label>
                  <input name="comparePrice" type="number" step="0.01" className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none" placeholder="MRP" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Stock Qty</label>
                  <input name="stockQty" type="number" defaultValue={0} className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">SKU</label>
                  <input name="sku" className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none" placeholder="e.g. KS-001" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Images</label>
                  <input name="images" type="file" accept="image/*" multiple className="w-full border border-gray-200 p-3 rounded-sm text-sm" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" name="isFeatured" value="true" className="accent-secondary" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" name="isNewArrival" value="true" className="accent-secondary" /> New Arrival
                </label>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-white font-bold py-3 rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isPending ? "Creating..." : "CREATE PRODUCT"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm focus:ring-1 focus:ring-secondary outline-none text-sm"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="border border-gray-200 px-4 py-2 rounded-sm text-sm font-bold text-gray-600 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="font-bold">No products found</p>
            <p className="text-sm mt-1">Add your first product to start selling.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-4 md:px-6 py-4">Product</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Category</th>
                  <th className="px-4 md:px-6 py-4">Price</th>
                  <th className="px-4 md:px-6 py-4">Stock</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Visibility</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((prod: any) => (
                  <tr key={prod.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-sm overflow-hidden border border-gray-100 shrink-0 bg-gray-100">
                          {prod.images?.[0] ? (
                            <Image src={(prod.images && prod.images[0]) ? prod.images[0] : "/placeholder-saree.jpg"} alt={prod.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary line-clamp-1">{prod.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">SKU: {prod.sku ?? prod.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                      <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-sm text-[10px] font-bold uppercase">{prod.category?.name ?? "—"}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-bold">₹{Number(prod.price).toLocaleString()}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={prod.stockQty}
                          onBlur={e => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val !== prod.stockQty) handleStockUpdate(prod.id, val);
                          }}
                          className="w-16 border border-gray-200 p-1 rounded-sm text-center font-bold text-sm"
                        />
                        <span className={`w-2 h-2 rounded-full ${prod.stockQty === 0 ? 'bg-red-500' : prod.stockQty <= 5 ? 'bg-amber-500' : 'bg-green-500'}`} />
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <button onClick={() => handleToggleVisibility(prod.id)} disabled={isPending}>
                        {prod.isVisible ? (
                          <span className="text-green-600 flex items-center gap-1 font-bold text-xs"><CheckCircle size={14} /> ACTIVE</span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1 font-bold text-xs"><XCircle size={14} /> HIDDEN</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          disabled={isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
