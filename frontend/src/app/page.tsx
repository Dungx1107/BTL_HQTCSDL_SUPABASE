import Link from "next/link";
import { ArrowRight, Database, MessageSquare, Shield, Activity, Search, Box } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Database className="h-6 w-6 text-emerald-500" />
          <span>Supabase Showcase</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-emerald-500 transition-colors" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:text-emerald-500 transition-colors" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              The Ultimate <span className="text-emerald-500">Supabase</span> Showcase
            </h1>
            <p className="mx-auto max-w-[700px] text-zinc-9500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Explore the full power of Supabase including Realtime, pgvector, Row Level Security, Edge Functions, and Advanced PostgreSQL features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-500 px-8 text-sm font-medium text-zinc-950 shadow transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              >
                Explore Authentication
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<MessageSquare className="h-10 w-10 text-emerald-500" />}
                title="Realtime Chat & Presence"
                description="Instant messaging using Supabase Realtime subscriptions and PostgreSQL triggers."
                href="/chat"
              />
              <FeatureCard 
                icon={<Shield className="h-10 w-10 text-emerald-500" />}
                title="Row Level Security (RLS)"
                description="Database-level security policies restricting access to rows based on user roles."
                href="/rls-playground"
              />
              <FeatureCard 
                icon={<Activity className="h-10 w-10 text-emerald-500" />}
                title="Analytics & Materialized Views"
                description="Concurrent view refreshes and real-time dashboard updates for large datasets."
                href="/dashboard"
              />
              <FeatureCard 
                icon={<Search className="h-10 w-10 text-emerald-500" />}
                title="pgvector Semantic Search"
                description="AI-powered similarity search using vector embeddings directly in Postgres."
                href="/ai-search"
              />
              <FeatureCard 
                icon={<Box className="h-10 w-10 text-emerald-500" />}
                title="Storage & Transactions"
                description="File uploads, signed URLs, and complex multi-table transactions with rollback."
                href="/storage"
              />
              <FeatureCard 
                icon={<Database className="h-10 w-10 text-emerald-500" />}
                title="Performance Benchmarks"
                description="Compare query execution times (EXPLAIN ANALYZE) with and without indexing."
                href="/benchmark"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border/40">
        <p className="text-xs text-zinc-9500">
          © 2026 Supabase Showcase. Built for HQTCSDL.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <div className="flex flex-col items-start p-6 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-500/50 transition-colors group">
      <div className="mb-4 p-3 bg-white rounded-lg group-hover:bg-emerald-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-9500 mb-4 flex-1">{description}</p>
      <Link href={href} className="text-sm font-medium text-emerald-500 hover:text-emerald-600 inline-flex items-center">
        Explore Demo <ArrowRight className="ml-1 h-3 w-3" />
      </Link>
    </div>
  );
}
