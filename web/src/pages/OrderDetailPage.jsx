import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck, Download, SearchX, Send } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_FLOW, ORDER_STATUSES, formatDate, formatDateTime, formatRupiah } from "@/lib/constants";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const rec = await pb.collection("orders").getOne(id, { expand: "service,client,provider" });
        setOrder(rec);
        setNotes(rec.notes || "");
        const msgs = await pb.collection("messages").getFullList({
          filter: pb.filter("order = {:oid}", { oid: id }),
          sort: "created",
        });
        setMessages(msgs);
        const unread = msgs.filter((m) => m.sender !== user.id && !m.read);
        unread.forEach((m) => {
          pb.collection("messages").update(m.id, { read: true }, { requestKey: `read-${m.id}` }).catch(() => {});
        });
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user.id]);

  useEffect(() => {
    void pb
      .collection("messages")
      .subscribe("*", (e) => {
        if (e.record.order !== id) return;
        if (e.action === "create") {
          setMessages((prev) => (prev.some((m) => m.id === e.record.id) ? prev : [...prev, e.record]));
          if (e.record.sender !== user.id) {
            pb.collection("messages").update(e.record.id, { read: true }, { requestKey: `read-${e.record.id}` }).catch(() => {});
          }
        }
        if (e.action === "update") {
          setMessages((prev) => prev.map((m) => (m.id === e.record.id ? { ...m, ...e.record } : m)));
        }
      })
      .catch((err) => console.error("Langganan realtime gagal", err));
    return () => {
      void pb.collection("messages").unsubscribe("*").catch(() => {});
    };
  }, [id, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const updateStatus = async (status) => {
    setActing(true);
    try {
      const rec = await pb.collection("orders").update(order.id, { status });
      setOrder((prev) => ({ ...prev, status: rec.status, updated: rec.updated }));
      toast.success(`Status diperbarui: ${ORDER_STATUSES[status]?.label || status}`);
    } catch (e) {
      toast.error("Gagal memperbarui status pesanan.");
    } finally {
      setActing(false);
    }
  };

  const saveNotes = async () => {
    setActing(true);
    try {
      await pb.collection("orders").update(order.id, { notes });
      toast.success("Catatan progres berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan catatan.");
    } finally {
      setActing(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const rec = await pb.collection("messages").create({ order: id, sender: user.id, text: text.trim(), read: false });
      setMessages((prev) => (prev.some((m) => m.id === rec.id) ? prev : [...prev, rec]));
      setText("");
    } catch (err) {
      toast.error("Pesan gagal dikirim. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Skeleton className="h-8 w-56" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <EmptyState
          icon={SearchX}
          title="Pesanan tidak ditemukan"
          description="Pesanan ini tidak ada atau Anda tidak memiliki akses untuk melihatnya."
          action={<Button asChild><Link to="/pesanan">Kembali ke Pesanan</Link></Button>}
        />
      </div>
    );
  }

  const isProvider = user.id === order.provider;
  const isClient = user.id === order.client;
  const isAdmin = user.role === "admin";
  const otherParty = isProvider ? order.expand?.client : order.expand?.provider;
  const flowIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const terminal = order.status === "dibatalkan" || order.status === "ditolak";

  const providerActions = [];
  if ((isProvider || isAdmin) && order.status === "menunggu") {
    providerActions.push({ label: "Terima Pesanan", status: "diterima", variant: "default" });
    providerActions.push({ label: "Tolak Pesanan", status: "ditolak", variant: "destructive" });
  }
  if ((isProvider || isAdmin) && order.status === "diterima") {
    providerActions.push({ label: "Mulai Kerjakan", status: "dikerjakan", variant: "default" });
  }
  if ((isProvider || isAdmin) && order.status === "dikerjakan") {
    providerActions.push({ label: "Kirim Hasil & Minta Tinjauan", status: "revisi", variant: "default" });
    providerActions.push({ label: "Tandai Selesai", status: "selesai", variant: "outline" });
  }
  if ((isProvider || isAdmin) && order.status === "revisi") {
    providerActions.push({ label: "Lanjutkan Pengerjaan", status: "dikerjakan", variant: "outline" });
  }
  const clientActions = [];
  if ((isClient || isAdmin) && (order.status === "menunggu" || order.status === "diterima")) {
    clientActions.push({ label: "Batalkan Pesanan", status: "dibatalkan", variant: "destructive" });
  }
  if ((isClient || isAdmin) && order.status === "revisi") {
    clientActions.push({ label: "Terima Hasil & Selesaikan", status: "selesai", variant: "default" });
    clientActions.push({ label: "Minta Perbaikan", status: "dikerjakan", variant: "outline" });
  }

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Detail Pesanan — TugasIn</title>
        <meta name="description" content="Detail pesanan, status pengerjaan, catatan progres, dan chat dengan pihak terkait." />
      </Helmet>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Link to="/pesanan" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Pesanan
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{order.expand?.service?.title || "Pesanan"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isProvider ? `Client: ${order.expand?.client?.name || "-"}` : `Penyedia Jasa: ${order.expand?.provider?.name || "-"}`}
              {" · "}Dibuat {formatDate(order.created)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Alur status */}
        {!terminal ? (
          <div className="mt-6 rounded-xl border bg-white p-5">
            <div className="flex items-center">
              {ORDER_STATUS_FLOW.map((s, i) => {
                const reached = flowIndex >= i;
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                        reached ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground",
                      )}>
                        {reached ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className={cn("mt-2 hidden text-center text-[11px] font-medium sm:block", reached ? "text-primary" : "text-muted-foreground")}>
                        {ORDER_STATUSES[s].label}
                      </span>
                    </div>
                    {i < ORDER_STATUS_FLOW.length - 1 && (
                      <div className={cn("mx-2 h-0.5 flex-1", flowIndex > i ? "bg-primary" : "bg-muted-foreground/20")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Pesanan ini telah {order.status === "dibatalkan" ? "dibatalkan" : "ditolak"} dan tidak dapat dilanjutkan.
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Detail & aksi */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="font-bold text-foreground">Detail Kebutuhan</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">{order.details}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Tenggat Waktu</div>
                  <div className="mt-0.5 font-semibold text-foreground">{formatDate(order.deadline)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Biaya</div>
                  <div className="mt-0.5 font-extrabold text-primary">{formatRupiah(order.price)}</div>
                </div>
              </div>
              {order.attachment ? (
                <a
                  href={pb.files.getURL(order, order.attachment)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-primary hover:bg-secondary"
                >
                  <Download className="h-4 w-4" /> Unduh Lampiran
                </a>
              ) : null}
            </div>

            {(providerActions.length > 0 || clientActions.length > 0) && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="font-bold text-foreground">Tindakan</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...providerActions, ...clientActions].map((a) => (
                    <Button key={a.status + a.label} variant={a.variant} disabled={acting} onClick={() => updateStatus(a.status)}>
                      {a.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-white p-6">
              <h2 className="font-bold text-foreground">Catatan Progres</h2>
              {isProvider || isAdmin ? (
                <div className="mt-3 space-y-3">
                  <Label htmlFor="notes" className="sr-only">Catatan progres</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tulis progres pengerjaan atau catatan untuk Client..."
                  />
                  <Button variant="outline" onClick={saveNotes} disabled={acting}>Simpan Catatan</Button>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {order.notes || "Belum ada catatan dari Penyedia Jasa."}
                </p>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex h-[560px] flex-col rounded-xl border bg-white">
            <div className="border-b px-5 py-4">
              <h2 className="font-bold text-foreground">Chat Pesanan</h2>
              <p className="text-xs text-muted-foreground">Diskusi dengan {otherParty?.name || "pihak terkait"}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
              {messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada pesan. Mulai diskusi tentang pesanan ini.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender === user.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border bg-white text-foreground",
                      )}>
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", mine ? "text-blue-100" : "text-muted-foreground")}>
                          {formatDateTime(m.created)}
                          {mine && <CheckCheck className={cn("h-3.5 w-3.5", m.read ? "text-sky-300" : "text-blue-200/60")} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t p-3">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis pesan..."
                maxLength={1000}
              />
              <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Kirim pesan">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
