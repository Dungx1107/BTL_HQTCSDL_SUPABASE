"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileUp, File, Trash2, Download, ExternalLink, Loader2 } from "lucide-react";

export default function StoragePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const BUCKET_NAME = "public-files";

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    // Ensure bucket exists first (normally done in dashboard/migrations)
    // For demo, we just try to list files
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list("uploads", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      if (error.message.includes("Bucket not found")) {
        setError("Bucket 'public-files' not found. Please create it in Supabase Studio and make it public.");
      } else {
        setError(error.message);
      }
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
    } else {
      fetchFiles();
    }
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([`uploads/${fileName}`]);
    if (error) setError(error.message);
    else fetchFiles();
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`uploads/${fileName}`);
    return data.publicUrl;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Manager</h1>
        <p className="text-zinc-9500 mt-2">
          Demonstrating Supabase Storage capabilities: CDN integration, public buckets, and file management.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <FileUp className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100">Upload File</h3>
              <p className="text-sm text-zinc-9500 mt-1">Select an image or document to upload to the public bucket.</p>
            </div>
            
            <label className="w-full relative">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/*,.pdf,.txt"
              />
              <div className={`w-full cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium py-2 px-4 rounded-md transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Choose File"}
              </div>
            </label>

            {error && (
              <p className="text-sm text-red-500 mt-4">{error}</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-white/50">
              <h3 className="font-semibold text-zinc-100">Files in `public-files/uploads`</h3>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : files.filter(f => f.name !== '.emptyFolderPlaceholder').length === 0 ? (
              <div className="p-12 text-center text-zinc-9500">
                No files uploaded yet.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {files.filter(f => f.name !== '.emptyFolderPlaceholder').map((file) => (
                  <li key={file.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white rounded-lg">
                        <File className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-800 truncate max-w-[200px] sm:max-w-[300px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-9500">
                          {(file.metadata?.size / 1024).toFixed(2)} KB • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={getPublicUrl(file.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-zinc-9500 hover:text-emerald-500 transition-colors"
                        title="View File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="p-2 text-zinc-9500 hover:text-red-500 transition-colors"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
