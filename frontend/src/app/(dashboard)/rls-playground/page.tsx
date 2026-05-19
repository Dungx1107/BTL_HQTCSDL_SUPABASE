"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, ShieldCheck, DatabaseZap, Loader2 } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function RLSPlaygroundPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("guest");
  const [actionLog, setActionLog] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const fetchSessionAndData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id)
        .single();
      
      // @ts-ignore
      if (roleData?.roles?.name) setUserRole(roleData.roles.name);
    }

    // Fetch Orders - RLS will automatically filter this based on user!
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setActionLog({ type: "error", msg: `Fetch Error: ${error.message}` });
    } else if (ordersData) {
      setOrders(ordersData);
    }
    
    setLoading(false);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      setActionLog({ type: "error", msg: "Must be logged in to create orders." });
      return;
    }
    setActionLoading(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: Math.floor(Math.random() * 1000) + 10,
      status: "pending",
    });

    if (error) {
      setActionLog({ type: "error", msg: `RLS Error (Insert): ${error.message}` });
    } else {
      setActionLog({ type: "success", msg: "Order created successfully!" });
      fetchSessionAndData();
    }
    setActionLoading(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    setActionLoading(true);
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      setActionLog({ type: "error", msg: `RLS Error (Delete): ${error.message}` });
    } else {
      setActionLog({ type: "success", msg: "Order deleted successfully!" });
      fetchSessionAndData();
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Row Level Security (RLS)</h1>
        <p className="text-zinc-9500 mt-2">
          Test database-level security. Try logging in as different users. Notice how the query 
          <code className="mx-2 bg-zinc-100 px-1.5 py-0.5 rounded text-emerald-600">SELECT * FROM orders</code> 
          returns different results depending on who you are.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Context Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <h3 className="font-semibold text-zinc-100 flex items-center mb-4">
              <ShieldCheck className="w-5 h-5 mr-2 text-emerald-500" />
              Current Context
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-9500 uppercase font-semibold">User Status</label>
                <div className="mt-1 font-medium text-zinc-800">
                  {user ? user.email : "Not Authenticated (Guest)"}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-9500 uppercase font-semibold">Database Role</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userRole === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                    userRole === 'user' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                    'bg-zinc-100 text-zinc-9500 border border-zinc-300'
                  }`}>
                    {userRole.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <h4 className="text-sm font-medium text-zinc-700 mb-2">Active RLS Policies on `orders`:</h4>
              <ul className="text-xs text-zinc-9500 space-y-2 font-mono">
                <li>• SELECT: (auth.uid() = user_id OR is_admin())</li>
                <li>• INSERT: (auth.uid() = user_id)</li>
                <li>• UPDATE: (is_admin())</li>
                <li>• DELETE: (is_admin())</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <h3 className="font-semibold text-zinc-100 flex items-center mb-4">
              <DatabaseZap className="w-5 h-5 mr-2 text-amber-500" />
              Actions
            </h3>
            <button
              onClick={handleCreateOrder}
              disabled={actionLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Insert New Order"}
            </button>

            {actionLog && (
              <div className={`mt-4 p-3 rounded-md text-sm border ${
                actionLog.type === 'error' 
                  ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                <div className="flex items-start">
                  {actionLog.type === 'error' && <ShieldAlert className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
                  <span>{actionLog.msg}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Panel */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-white/50 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-100">Orders Table View</h3>
              <span className="text-xs text-zinc-9500">Showing {orders.length} records</span>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-zinc-9500">
                No orders found. (Either table is empty, or RLS blocked your SELECT).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-9500 uppercase bg-white/50 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">User ID</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-9500">{order.id.split('-')[0]}...</td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-700">
                          {order.user_id === user?.id ? (
                            <span className="text-emerald-500 bg-emerald-500/10 px-1 rounded">You</span>
                          ) : (
                            order.user_id.split('-')[0] + "..."
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-emerald-600">${order.total_amount}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-xs text-red-500 hover:text-red-400 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
