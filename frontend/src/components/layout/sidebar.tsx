"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  MessageSquare,
  Shield,
  Search,
  Box,
  Database,
  Settings,
  LogOut,
  UserCircle,
  X,
  Mail,
  Fingerprint,
  Calendar,
  Globe,
  Copy,
  Check,
} from "lucide-react";

const navItems = [
  { name: "Analytics Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Realtime Chat", href: "/chat", icon: MessageSquare },
  { name: "RLS Playground", href: "/rls-playground", icon: Shield },
  { name: "Semantic Search", href: "/ai-search", icon: Search },
  { name: "Storage Manager", href: "/storage", icon: Box },
  { name: "DB Benchmark", href: "/benchmark", icon: Database },
];

export function Sidebar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, [supabase]);

  const isAdmin = user?.email === 'admin@example.com';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied User ID to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex h-full w-64 flex-col border-r border-zinc-200">
      {/* Sibling background layer to isolate backdrop-blur and prevent trapping fixed modal */}
      <div className="absolute inset-0 -z-10 bg-zinc-50/50 backdrop-blur" />

      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <Database className="h-6 w-6 text-emerald-500" />
        <span className="ml-3 font-semibold text-zinc-950">Showcase</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          if (item.name === "Analytics Dashboard" && !isAdmin) return null;
          return <NavItem key={item.name} item={item} />;
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4">
        {user && (
          <div 
            onClick={() => setShowProfileModal(true)}
            className="mb-4 flex items-center rounded-lg bg-zinc-100 p-3 border border-zinc-200 cursor-pointer hover:bg-zinc-200/80 active:scale-[0.98] transition-all group"
            title="Click to view profile"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="User Avatar" 
                className="h-8 w-8 rounded-full object-cover border border-emerald-500/20" 
              />
            ) : (
              <UserCircle className="h-8 w-8 text-emerald-500" />
            )}
            <div className="ml-3 flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">
                {fullName}
              </span>
              <span className="text-xs text-zinc-500">
                {user.email === 'admin@example.com' ? 'Administrator' : 'Standard User'}
              </span>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-zinc-500 group-hover:text-zinc-700" />
          Logout
        </button>
      </div>

      {/* Profile Detail Modal */}
      {showProfileModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-emerald-500" />
                Thông Tin Cá Nhân
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors focus:outline-none"
                aria-label="Đóng"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center py-6 text-center">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Large User Avatar" 
                  className="h-20 w-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <UserCircle className="h-16 w-16" />
                </div>
              )}
              <h4 className="mt-3 text-xl font-bold text-zinc-900">{fullName}</h4>
              <span className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                user.email === 'admin@example.com' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {user.email === 'admin@example.com' ? 'Administrator' : 'Standard User'}
              </span>
            </div>

            {/* Details List */}
            <div className="space-y-4 rounded-xl bg-zinc-50 p-4 border border-zinc-150 text-sm">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-zinc-400 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</p>
                  <p className="text-zinc-900 truncate">{user.email}</p>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-4 w-4 text-zinc-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phương thức đăng nhập</p>
                  <p className="text-zinc-900 font-medium capitalize">
                    {user.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email & Password'}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-start gap-3">
                <Fingerprint className="mt-0.5 h-4 w-4 text-zinc-400 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mã định danh (User ID)</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-zinc-600 truncate">{user.id}</p>
                    <button 
                      onClick={() => copyToClipboard(user.id)}
                      className="text-zinc-400 hover:text-emerald-500 transition-colors p-1"
                      title="Sao chép User ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Sign In */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-zinc-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Đăng nhập gần nhất</p>
                  <p className="text-zinc-900">{formatDate(user.last_sign_in_at)}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ item }: { item: any }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-emerald-500/10 text-emerald-500"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
      }`}
    >
      <item.icon
        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
          isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-700"
        }`}
        aria-hidden="true"
      />
      {item.name}
    </Link>
  );
}
