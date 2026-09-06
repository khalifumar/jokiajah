import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORDER_STATUSES, formatDate, formatRupiah } from "@/lib/constants";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("semua");

  useEffect(() => {
    pb.collection("orders")
      .getFullList({ sort: "-created", expand: "service,client,provider" })
      .then(setOrders)
      .catch(() => toast.error("Gagal memuat daftar pesanan."))
      .finally(() => setLoading(false));
  }, []);

  const isProvider = user?.role === "provider";
  const filtered = tab === "semua" ? orders : orders.filter((o) => o.status === tab);

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Pesanan — TugasIn</title>
        <meta name="description" content="Pantau seluruh pesanan Anda: menunggu konfirmasi, diterima, sedang dikerjakan, menunggu revisi, selesai, dan dibatalkan." />
      </Helmet>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          {isProvider ? "Pesanan Masuk" : "Pesanan Saya"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isProvider ? "Kelola pesanan dari Client: terima, kerjakan, dan selesaikan." : "Pantau status dan riwayat pesanan Anda."}
        </p>

        <div className="mt-6 overflow-x-auto">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex w-max">
              <TabsTrigger value="semua">Semua</TabsTrigger>
              {Object.entries(ORDER_STATUSES).map(([key, s]) => (
                <TabsTrigger key={key} value={key}>{s.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Tidak ada pesanan"
              description={tab === "semua" ? "Belum ada pesanan yang tercatat untuk akun Anda." : `Tidak ada pesanan dengan status "${ORDER_STATUSES[tab]?.label}".`}
              action={!isProvider ? <Button asChild><Link to="/katalog">Jelajahi Katalog</Link></Button> : null}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((o) => (
                <Link
                  key={o.id}
                  to={`/pesanan/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-foreground">{o.expand?.service?.title || "Jasa"}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {isProvider ? `Client: ${o.expand?.client?.name || "-"}` : `Penyedia: ${o.expand?.provider?.name || "-"}`}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Dibuat {formatDate(o.created)} · Tenggat {formatDate(o.deadline)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-primary">{formatRupiah(o.price)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
