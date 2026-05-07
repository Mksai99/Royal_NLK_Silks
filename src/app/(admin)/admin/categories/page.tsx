"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X } from "lucide-react";
import Image from "next/image";
import { getCategories, createCategory, deleteCategory, toggleCategoryVisibility } from "@/actions/admin.actions";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      await createCategory(formData);
      toast.success("Category created!");
      setShowForm(false);
      fetchCategories();
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted");
        fetchCategories();
      }
    });
  };

  const handleToggle = async (id: string) => {
    startTransition(async () => {
      await toggleCategoryVisibility(id);
      fetchCategories();
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Category Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your store&apos;s product categories and collections.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg"
        >
          <Plus size={18} /> ADD CATEGORY
        </button>
      </div>

      {/* Add Category Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary text-white">
              <h2 className="text-lg font-serif font-bold">Add New Category</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form action={handleCreate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Name</label>
                <input name="name" required className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none focus:ring-1 focus:ring-secondary" placeholder="e.g. Kanchipuram Silk" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Description</label>
                <textarea name="description" rows={3} className="w-full border border-gray-200 p-3 rounded-sm text-sm outline-none focus:ring-1 focus:ring-secondary" placeholder="Short description..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Image</label>
                <input name="image" type="file" accept="image/*" className="w-full border border-gray-200 p-3 rounded-sm text-sm" />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-white font-bold py-3 rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isPending ? "Creating..." : "CREATE CATEGORY"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm focus:ring-1 focus:ring-secondary outline-none text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading categories...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="font-bold">No categories found</p>
            <p className="text-sm mt-1">Create your first category to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-4 md:px-6 py-4">Image</th>
                  <th className="px-4 md:px-6 py-4">Name</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Description</th>
                  <th className="px-4 md:px-6 py-4">Products</th>
                  <th className="px-4 md:px-6 py-4">Status</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cat: any) => (
                  <tr key={cat.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="relative w-12 h-12 rounded-sm overflow-hidden border border-gray-100 bg-gray-100">
                        {cat.imageUrl ? (
                          <Image src={cat.imageUrl || "/placeholder-saree.jpg"} alt={cat.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-bold text-primary">{cat.name}</td>
                    <td className="px-4 md:px-6 py-4 text-gray-500 max-w-xs truncate hidden sm:table-cell">{cat.description || "—"}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded-sm font-bold text-gray-600">{cat._count?.products ?? 0}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <button
                        onClick={() => handleToggle(cat.id)}
                        disabled={isPending}
                        className={`flex items-center gap-1 font-bold text-xs ${cat.isVisible ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {cat.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        {cat.isVisible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
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
