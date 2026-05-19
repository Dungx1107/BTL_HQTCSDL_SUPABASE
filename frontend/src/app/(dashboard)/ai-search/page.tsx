"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, BrainCircuit, Loader2, FileText, Settings } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Generate the embedding locally using Next.js API Route (which runs Xenova/all-MiniLM-L6-v2)
      const embeddingResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      });
      
      const { embedding, error: embedError } = await embeddingResponse.json();
      
      if (embedError) {
        throw new Error(embedError);
      }

      // 2. Call the pgvector semantic search function in Postgres
      const { data, error: rpcError } = await supabase.rpc("match_documents", {
        query_embedding: embedding, // This is now a 384d vector
        match_threshold: 0.1, // Adjusted threshold
        match_count: 5,
      });

      if (rpcError) {
        throw rpcError;
      }

      setResults(data || []);
      
      if (!data || data.length === 0) {
        setError("Không tìm thấy kết quả phù hợp. Hãy chắc chắn rằng bạn đã chạy script `seed-vectors.js` để nạp dữ liệu.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during semantic search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-2">
          <BrainCircuit className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">AI Semantic Search</h1>
        <p className="text-zinc-9500 max-w-2xl mx-auto">
          Powered by <code className="text-emerald-600">pgvector</code>. This demo takes your natural language query, converts it into a vector embedding, and performs a similarity search directly within PostgreSQL.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white/50 p-2 shadow-sm backdrop-blur-sm">
        <form onSubmit={handleSearch} className="flex relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-9500" />
          </div>
          <input
            type="text"
            className="block w-full bg-transparent border-0 py-4 pl-12 pr-32 text-zinc-950 placeholder:text-zinc-9500 focus:ring-0 sm:text-lg"
            placeholder="Search documents by meaning, not just keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute inset-y-2 right-2">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-full px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start">
          <Settings className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Configuration Needed</p>
            <p>{error}</p>
            <p className="mt-2 opacity-80 text-xs">Note: Cần chạy lệnh `node scripts/seed-vectors.js` để nạp vector vào CSDL.</p>
          </div>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="space-y-4 mt-8">
          <h3 className="font-semibold text-zinc-700">Top Semantic Matches</h3>
          <div className="grid gap-4">
            {results.map((doc, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-emerald-600 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {doc.title}
                  </h4>
                  <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full text-zinc-9500 border border-zinc-300">
                    Similarity: {(doc.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-zinc-700 text-sm leading-relaxed">{doc.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
