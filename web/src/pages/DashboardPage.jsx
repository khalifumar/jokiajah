import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Briefcase, CheckCircle2, ClipboardList, Hourglass, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS, formatDate, formatRupiah } from "@/lib/constants";

const ACTIVE_STATUSES = ["menunggu", "diterima", "dikerjakan", "revisi"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ords = await pb.collection("orders").getFullList({ sort: "-created", expand: "service,client,provider" });
        setOrders(ords);
        if (user.role === "provider") {
          const svcs = await pb.collection("services").getFullList({
            filter: pb.filter("provider = {:uid}", { uid: user.id }),
          });
          setServices(svcs);
        }
      } catch (e) {
        toast.error("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id, user.role]);

  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  const isProvider = user?.role === "provider";
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const doneOrders = orders.filter((o) => o.status === "selesai");
  const newOrders = orders.filter((o) => o.status === "menunggu");
  const activeServices = services.filter((s) => s.status === "aktif");

  const stats = isProvider
    ? [
        { icon: Briefcase, label: "Jasa Aktif", value: activeServices.length },
        { icon: Hourglass, label: "Pesanan Baru", value: newOrders.length },
        { icon: ClipboardList, label: "Sedang Berjalan", value: activeOrders.length },
        { icon: CheckCircle2, label: "Pesanan Selesai", value: doneOrders.length },
      ]
    : [
        { icon: ClipboardList, label: "Total Pesanan", value: orders.length },
        { icon: Hourglass, label: "Pesanan Aktif", value: activeOrders.length },
        { icon: CheckCircle2, label: "Pesanan Selesai", value: doneOrders.length },
      ];

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Dashboard — TugasIn</title>
        <meta name="description" content="Dashboard TugasIn: pantau pesanan, jasa, dan aktivitas akunmu." />
      </Helmet>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Halo, {user?.name || "Pengguna"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Anda masuk sebagai <span className="font-semibold text-primary">{ROLE_LABELS[user?.role]}</span>
            </p>
          </div>
          {isProvider ? (
            <Button asChild>
              <Link to="/kelola-jasa"><Plus className="mr-1 h-4 w-4" /> Tambah Jasa</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/katalog"><Search className="mr-1 h-4 w-4" /> Cari Jasa</Link>
            </Button>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              {loading ? <Skeleton className="mt-2 h-8 w-16" /> : (
                <div className="mt-2 text-3xl font-extrabold text-foreground">{s.value}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {isProvider ? "Pesanan Terbaru Masuk" : "Pesanan Terakhir Anda"}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pesanan">Lihat semua <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title={isProvider ? "Belum ada pesanan masuk" : "Belum ada pesanan"}
                description={isProvider ? "Pesanan dari Client akan muncul di sini." : "Mulai jelajahi katalog dan buat pesanan pertamamu."}
                action={!isProvider ? <Button asChild><Link to="/katalog">Jelajahi Katalog</Link></Button> : null}
              />
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    to={`/pesanan/${o.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">{o.expand?.service?.title || "Jasa"}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {isProvider ? `Client: ${o.expand?.client?.name || "-"}` : `Penyedia: ${o.expand?.provider?.name || "-"}`}
                        {" · "}Tenggat {formatDate(o.deadline)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{formatRupiah(o.price)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
