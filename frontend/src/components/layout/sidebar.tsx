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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, [supabase]);

  const isAdmin = user?.email === 'admin@example.com';

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
  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-zinc-50/50 backdrop-blur">
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
          <div className="mb-4 flex items-center rounded-lg bg-zinc-100 p-3 border border-zinc-200">
            <UserCircle className="h-8 w-8 text-emerald-500" />
            <div className="ml-3 flex flex-col">
              <span className="text-sm font-semibold text-zinc-900">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
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
