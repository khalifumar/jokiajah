import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/constants";

export default function ChatPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ords = await pb.collection("orders").getFullList({ sort: "-updated", expand: "service,client,provider" });
        setOrders(ords);
        const msgs = await pb.collection("messages").getFullList({ sort: "-created" });
        const map = {};
        for (const m of msgs) {
          if (!map[m.order]) map[m.order] = { last: m, unread: 0 };
          if (m.sender !== user.id && !m.read) map[m.order].unread += 1;
        }
        setPreviews(map);
      } catch (e) {
        toast.error("Gagal memuat daftar percakapan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Chat — TugasIn</title>
        <meta name="description" content="Daftar percakapan Anda dengan Client atau Penyedia Jasa terkait pesanan." />
      </Helmet>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Percakapan dua arah yang terikat pada setiap pesanan.</p>

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Belum ada percakapan"
              description="Percakapan akan muncul setelah ada pesanan yang dibuat."
            />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const other = user.id === o.client ? o.expand?.provider : o.expand?.client;
                const preview = previews[o.id];
                const initial = (other?.name || "?").charAt(0).toUpperCase();
                return (
                  <Link
                    key={o.id}
                    to={`/pesanan/${o.id}`}
                    className="flex items-center gap-4 rounded-xl border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback className="bg-primary/10 font-bold text-primary">{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-bold text-foreground">{other?.name || "Pengguna"}</span>
                        {preview?.last ? (
                          <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(preview.last.created)}</span>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{o.expand?.service?.title || "Pesanan"}</div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", preview?.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {preview?.last
                            ? `${preview.last.sender === user.id ? "Anda: " : ""}${preview.last.text}`
                            : "Belum ada pesan — mulai diskusi"}
                        </span>
                        {preview?.unread > 0 ? (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                            {preview.unread}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
