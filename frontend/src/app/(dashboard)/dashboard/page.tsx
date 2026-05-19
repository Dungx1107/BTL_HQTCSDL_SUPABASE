"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Cpu, Users, Server } from "lucide-react";

interface SystemMetric {
  id: number;
  cpu_usage: number;
  memory_usage: number;
  active_users: number;
  recorded_at: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial data
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from("system_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(20);

      if (data && !error) {
        // Reverse to show oldest to newest left to right
        setMetrics(data.reverse());
      }
      setLoading(false);
    };

    fetchMetrics();

    // Subscribe to real-time inserts
    const channel = supabase
      .channel("realtime-metrics")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_metrics",
        },
        (payload) => {
          const newMetric = payload.new as SystemMetric;
          setMetrics((prev) => {
            const updated = [...prev, newMetric];
            if (updated.length > 20) {
              return updated.slice(updated.length - 20); // Keep only last 20
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const latestMetric = metrics[metrics.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-zinc-9500 mt-2">
          Real-time system metrics powered by Supabase Realtime subscriptions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="CPU Usage"
          value={latestMetric ? `${latestMetric.cpu_usage}%` : "--"}
          icon={<Cpu className="h-4 w-4 text-emerald-500" />}
          trend="+2.1% from last hour"
        />
        <MetricCard
          title="Memory Usage"
          value={latestMetric ? `${latestMetric.memory_usage}%` : "--"}
          icon={<Server className="h-4 w-4 text-emerald-500" />}
          trend="-1.4% from last hour"
        />
        <MetricCard
          title="Active Users"
          value={latestMetric ? latestMetric.active_users.toString() : "--"}
          icon={<Users className="h-4 w-4 text-emerald-500" />}
          trend="Live"
        />
        <MetricCard
          title="Database Latency"
          value="< 50ms"
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
          trend="Stable"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization (Realtime)</CardTitle>
            <CardDescription>
              CPU and Memory usage over time. Automatically updates on INSERT.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-zinc-9500">
                Loading data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="recorded_at" 
                    stroke="#a1a1aa" 
                    tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
                    fontSize={12}
                  />
                  <YAxis stroke="#a1a1aa" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpu_usage" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="CPU (%)"
                    isAnimationActive={false} // Disable to show smooth realtime append better
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory_usage" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Memory (%)"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Concurrent Users</CardTitle>
            <CardDescription>
              Live user count tracking via presence and metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-zinc-9500">
                Loading data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="recorded_at" 
                    stroke="#a1a1aa" 
                    tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
                    fontSize={12}
                  />
                  <YAxis stroke="#a1a1aa" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="active_users" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    name="Users"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-9500">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-zinc-9500 mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
