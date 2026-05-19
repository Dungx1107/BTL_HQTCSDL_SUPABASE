"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Activity, Play, Zap, Clock, Database, BarChart3, Loader2 } from "lucide-react";

export default function BenchmarkPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const supabase = createClient();

  const runBenchmark = async () => {
    setRunning(true);
    setResults([]);

    try {
      // Test 1: Simple Select
      const t1Start = performance.now();
      await supabase.from("products").select("*").limit(100);
      const t1End = performance.now();
      
      setResults(prev => [...prev, {
        name: "Simple Select (Products)",
        type: "SELECT",
        latency: (t1End - t1Start).toFixed(2),
        status: "success"
      }]);

      // Test 2: Complex Join
      const t2Start = performance.now();
      await supabase.from("orders").select(`
        id, total_amount, status,
        profiles ( full_name ),
        order_items ( quantity, price_at_time, products(name) )
      `).limit(50);
      const t2End = performance.now();

      setResults(prev => [...prev, {
        name: "Complex Join (Orders + Items + Users)",
        type: "JOIN",
        latency: (t2End - t2Start).toFixed(2),
        status: "success"
      }]);

      // Test 3: Aggregation (Via Backend REST API if running, else simulate)
      const t3Start = performance.now();
      try {
        const res = await fetch("http://localhost:8081/api/analytics/sales");
        if (res.ok) await res.json();
        const t3End = performance.now();
        setResults(prev => [...prev, {
          name: "Spring Boot Analytics Aggregation",
          type: "REST API",
          latency: (t3End - t3Start).toFixed(2),
          status: "success"
        }]);
      } catch (e) {
        // Fallback if backend is not running
        const { data } = await supabase.from("orders").select("total_amount");
        const sum = data?.reduce((acc: number, curr: any) => acc + curr.total_amount, 0) || 0;
        const t3End = performance.now();
        setResults(prev => [...prev, {
          name: "Client-side Aggregation (Fallback)",
          type: "JS AGG",
          latency: (t3End - t3Start).toFixed(2),
          status: "success"
        }]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Benchmark</h1>
          <p className="text-zinc-9500 mt-2">
            Measure query latency, test complex joins, and monitor API performance in real-time.
          </p>
        </div>
        <button
          onClick={runBenchmark}
          disabled={running}
          className="flex items-center justify-center h-12 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {running ? <Activity className="w-5 h-5 animate-pulse mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {running ? "Running Tests..." : "Run Benchmark Suite"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <h3 className="font-semibold text-zinc-100 flex items-center mb-4">
              <Database className="w-5 h-5 mr-2 text-emerald-500" />
              Instance Details
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                <span className="text-zinc-9500">Provider</span>
                <span className="font-medium text-zinc-800">Supabase Local</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                <span className="text-zinc-9500">PostgreSQL</span>
                <span className="font-medium text-zinc-800">v15+</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                <span className="text-zinc-9500">Extensions</span>
                <span className="font-medium text-zinc-800">pgvector, pg_stat_statements</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-9500">Region</span>
                <span className="font-medium text-emerald-600 flex items-center"><Zap className="w-3 h-3 mr-1" /> localhost</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-sm text-zinc-9500">
            <p>
              To get true <code className="text-emerald-600">EXPLAIN ANALYZE</code> metrics, use the Supabase Studio SQL editor. This dashboard measures end-to-end network latency including the PostgREST API overhead.
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-zinc-200 bg-white/50 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-100 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-zinc-9500" />
                Live Results
              </h3>
            </div>
            
            <div className="p-0">
              {results.length === 0 && !running ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-zinc-600">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p>Click "Run Benchmark Suite" to start.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {results.map((result, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {result.type}
                          </span>
                          <h4 className="font-medium text-zinc-800">{result.name}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-2xl font-bold text-zinc-100 font-mono">
                          {result.latency} <span className="text-sm text-zinc-9500 ml-1 mt-1">ms</span>
                        </div>
                        <p className="text-xs flex items-center justify-end mt-1 text-zinc-9500">
                          <Clock className="w-3 h-3 mr-1" /> End-to-end
                        </p>
                      </div>
                    </div>
                  ))}
                  {running && (
                    <div className="p-6 flex items-center gap-4 text-zinc-9500 animate-pulse">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                      Executing next query...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
