"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { X, Save, LogOut, Loader2, Mail, User as UserIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileModal({ user, onClose, onLogout }: ProfileModalProps) {
  const metadata = user?.user_metadata || {};
  const [fullName, setFullName] = useState(metadata.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(metadata.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setMessage({ type: "error", text: "Image must be less than 2MB." });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error("Storage bucket 'avatars' not found. Please create a public bucket named 'avatars' in your Supabase dashboard.");
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setMessage({ type: "success", text: "Image uploaded! Save changes to apply." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-surface flex items-center justify-center shadow-inner relative">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                  onError={() => setAvatarUrl("")}
                />
              ) : (
                <UserIcon className="w-10 h-10 text-muted group-hover:opacity-40 transition-opacity" />
              )}
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-accent" />
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground truncate max-w-[280px]">
            {fullName || "User Profile"}
          </h2>
          <p className="text-muted text-sm mt-1">Manage your Aura identity</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted ml-1 flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email Address
            </label>
            <div className="px-4 py-3 bg-surface-hover/50 border border-border rounded-2xl text-muted text-sm select-none truncate">
              {user?.email}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted ml-1 flex items-center gap-2">
              <UserIcon className="w-3 h-3" />
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-foreground"
            />
          </div>

          {message && (
            <div className={cn(
              "p-3 rounded-xl text-sm font-medium animate-in slide-in-from-top-2",
              message.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
            )}>
              {message.text}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-accent text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-4 bg-surface hover:bg-danger-transparent text-muted hover:text-danger border border-border rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
