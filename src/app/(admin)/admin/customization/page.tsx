"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, Upload, Layout, ImageIcon, Megaphone, Info, Palette } from "lucide-react";
import toast from "react-hot-toast";
import { getStoreConfig, updateStoreConfig } from "@/actions/admin.actions";
import Image from "next/image";

export default function StorefrontCustomization() {
  const [activeTab, setActiveTab] = useState("hero");
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
        toast.success("Settings saved successfully!");
        const updated = await getStoreConfig();
        setConfig(updated);
      } catch (err: any) {
        toast.error(err.message || "Failed to save settings");
      }
    });
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading settings...</div>;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">Storefront Customization</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Tailor the look and feel of your online store.</p>
        </div>
        <button 
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-primary text-white font-bold px-8 py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg disabled:opacity-50"
        >
          <Save size={18} /> {isPending ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
        {/* Tabs */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-1 shrink-0 overflow-x-auto pb-2 lg:pb-0">
          {[
            { id: "hero", name: "Hero Banner", icon: ImageIcon },
            { id: "announcement", name: "Announcement Bar", icon: Megaphone },
            { id: "branding", name: "Branding & Colors", icon: Palette },
            { id: "about", name: "About & Footer", icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-sm text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-secondary text-primary shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-white rounded-sm shadow-xl border border-gray-100 p-6 md:p-8">
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary border-b border-gray-100 pb-4">Hero Banner Settings</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Headline</label>
                  <input name="heroHeadline" type="text" defaultValue={config.heroHeadline} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Sub-headline</label>
                  <textarea name="heroSubtext" rows={2} defaultValue={config.heroSubtext} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">CTA Button Text</label>
                    <input name="heroCTA" type="text" defaultValue={config.heroCTA} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Banner Image</label>
                    <input name="heroImage" type="file" accept="image/*" className="border border-gray-200 p-2 rounded-sm text-xs" />
                    {config.heroImage && (
                       <div className="mt-2 relative w-32 h-16 rounded overflow-hidden border border-gray-100">
                          <Image src={config.heroImage} alt="Hero" fill className="object-cover" />
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcement' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary border-b border-gray-100 pb-4">Announcement Bar</h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
                  <div>
                    <p className="text-sm font-bold text-primary">Show Bar</p>
                    <p className="text-[10px] text-gray-400">Show a top bar for important messages.</p>
                  </div>
                  <select name="announcementVisible" defaultValue={String(config.announcementVisible)} className="border border-gray-200 p-1 rounded text-xs">
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Message Text</label>
                  <input name="announcementText" type="text" defaultValue={config.announcementText} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary border-b border-gray-100 pb-4">Branding & Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Logo</label>
                  <input name="logoUrl" type="file" accept="image/*" className="border border-gray-200 p-2 rounded-sm text-xs" />
                  {config.logoUrl ? (
                    <div className="relative h-16 w-full border rounded flex items-center justify-center p-2">
                       <Image src={config.logoUrl} alt="Logo" width={150} height={50} className="object-contain" />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-sm aspect-video flex flex-col items-center justify-center gap-2 p-4">
                      <ImageIcon size={32} className="text-gray-200" />
                      <p className="text-[10px] text-gray-400">No logo uploaded</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-6">
                   <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Primary Color</label>
                    <div className="flex gap-4 items-center">
                      <input name="accentColor" type="color" defaultValue={config.accentColor || "#7B1C2E"} className="w-12 h-12 rounded-sm border-0 cursor-pointer" />
                      <span className="text-xs font-mono font-bold uppercase">{config.accentColor || "#7B1C2E"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <h3 className="text-lg md:text-xl font-serif font-bold text-primary border-b border-gray-100 pb-4">About Section & Socials</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">Store Story</label>
                  <textarea name="aboutText" rows={4} defaultValue={config.aboutText} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">WhatsApp Link</label>
                    <input name="whatsapp" type="text" defaultValue={config.whatsapp} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary">Instagram URL</label>
                    <input name="instagram" type="text" defaultValue={config.instagram} className="border border-gray-200 p-3 rounded-sm outline-none focus:ring-1 focus:ring-secondary text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-12 pt-8 border-t border-gray-100 text-right">
             <p className="text-[10px] text-gray-400 italic mb-4">All changes are reflected on the storefront immediately after saving.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
