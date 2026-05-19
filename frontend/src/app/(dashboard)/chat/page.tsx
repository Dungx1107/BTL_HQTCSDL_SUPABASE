"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, UserCircle } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export default function ChatPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
        fetchUsers(data.user.id);
      }
    });

    const fetchUsers = async (currentUserId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUserId)
        .order("full_name", { ascending: true });
        
      if (data && data.length > 0) {
        setUsers(data);
        setActiveUserId(data[0].id);
      }
    };
  }, [supabase]);

  useEffect(() => {
    if (!activeUserId || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("direct_messages")
        .select(`
          id, content, created_at, sender_id, receiver_id,
          sender:profiles!sender_id ( id, full_name, avatar_url )
        `)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeUserId}),and(sender_id.eq.${activeUserId},receiver_id.eq.${currentUser.id})`)
        .order("created_at", { ascending: true });
      
      if (data) {
        setMessages(data as any);
      }
      setTimeout(() => scrollToBottom(), 100);
    };

    fetchMessages();

    // Subscribe to new direct messages
    const channel = supabase
      .channel(`direct_messages_${currentUser.id}_${activeUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          // Unfortunately, Supabase realtime filter currently only supports simple eq filters.
          // We will filter incoming payloads on the client.
        },
        async (payload) => {
          const newMsg = payload.new as DirectMessage;
          
          // Check if this message belongs to the current 1-on-1 conversation
          const isRelevant = 
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeUserId) ||
            (newMsg.sender_id === activeUserId && newMsg.receiver_id === currentUser.id);

          if (!isRelevant) return;

          // Fetch sender profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMsg.sender_id)
            .single();
          
          if (profile) {
            newMsg.sender = profile as Profile;
          }
          
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(() => scrollToBottom(), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeUserId, currentUser, supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId || !currentUser) return;

    const content = newMessage.trim();
    setNewMessage("");

    await supabase.from("direct_messages").insert({
      sender_id: currentUser.id,
      receiver_id: activeUserId,
      content,
    });
  };

  const activeUser = users.find(u => u.id === activeUserId);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Sidebar: User List */}
      <div className="w-64 border-r border-zinc-200 bg-zinc-50/50 flex flex-col">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="font-semibold text-zinc-900">Direct Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setActiveUserId(user.id)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                activeUserId === user.id
                  ? "bg-emerald-500/10 text-emerald-500 font-medium"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              }`}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-6 h-6 rounded-full mr-3 border border-zinc-300" />
              ) : (
                <UserCircle className="w-6 h-6 mr-3" />
              )}
              {user.full_name || "Unknown User"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-50">
        {/* Chat Header */}
        <div className="h-14 border-b border-zinc-200 flex items-center px-6">
          <h3 className="font-semibold text-zinc-900 flex items-center">
            {activeUser ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Chatting with {activeUser.full_name}
              </>
            ) : (
              "Select a user to chat"
            )}
          </h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              No messages yet. Say hi!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUser?.id === msg.sender_id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  {msg.sender?.avatar_url ? (
                    <img
                      src={msg.sender.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border border-zinc-300 bg-zinc-100"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-zinc-400" />
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-700">
                        {isMe ? "You" : (msg.sender?.full_name || "Unknown User")}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-md text-sm ${
                        isMe
                          ? "bg-emerald-600 text-zinc-50 rounded-tr-sm"
                          : "bg-zinc-100 text-zinc-800 rounded-tl-sm border border-zinc-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-full px-4 py-2 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              disabled={!currentUser || !activeUserId}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !currentUser || !activeUserId}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          {!currentUser && (
            <p className="text-xs text-red-500 mt-2 ml-4">
              You must be logged in to send messages.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
