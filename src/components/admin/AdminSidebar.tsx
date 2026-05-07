"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Tag, 
  Package, 
  Image as ImageIcon, 
  CreditCard, 
  ClipboardList, 
  LogOut,
  Settings,
  Store,
  Users,
  Menu,
  X
} from "lucide-react";

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Tag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Storefront", href: "/admin/customization", icon: ImageIcon },
    { name: "Payment Settings", href: "/admin/payments", icon: CreditCard },
  ];

  const handleLogout = async () => {
    const { signOutAction } = await import("@/actions/auth.actions");
    await signOutAction();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-primary text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div>
          <h1 className="text-lg font-serif font-bold text-secondary">ROYAL NLK</h1>
          <p className="text-[9px] tracking-widest opacity-60">ADMIN PORTAL</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-white hover:text-secondary transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-primary text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif font-bold text-secondary">ROYAL NLK</h1>
            <p className="text-[10px] tracking-widest opacity-60">ADMIN PORTAL</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 -mr-4 text-white hover:text-secondary">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 mt-4 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold transition-all ${isActive ? 'bg-secondary text-primary' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold opacity-70 hover:opacity-100 hover:bg-white/10 transition-all"
          >
            <Store size={18} />
            View Storefront
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold opacity-70 hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;