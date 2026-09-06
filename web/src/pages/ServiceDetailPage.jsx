import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, FileText, GraduationCap, Info, SearchX, User } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EDUCATION_LEVELS, formatRupiah } from "@/lib/constants";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    pb.collection("services")
      .getOne(id, { expand: "provider,category" })
      .then(setService)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrderClick = () => {
    if (!isAuthed) {
      toast.error("Silakan masuk terlebih dahulu untuk memesan jasa.");
      navigate("/masuk");
      return;
    }
    if (user?.role !== "client") {
      toast.error("Hanya akun Client yang dapat memesan jasa.");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error("Detail kebutuhan wajib diisi.");
      return;
    }
    if (!deadline) {
      toast.error("Tenggat waktu wajib dipilih.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("service", service.id);
      fd.append("client", user.id);
      fd.append("provider", service.provider);
      fd.append("details", details.trim());
      fd.append("deadline", `${deadline} 23:59:00`);
      fd.append("status", "menunggu");
      fd.append("price", String(service.price));
      if (file) fd.append("attachment", file);
      const rec = await pb.collection("orders").create(fd);
      toast.success("Pesanan berhasil dibuat! Menunggu konfirmasi Penyedia Jasa.");
      navigate(`/pesanan/${rec.id}`);
    } catch (err) {
      toast.error("Gagal membuat pesanan. Periksa kembali isianmu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <EmptyState
          icon={SearchX}
          title="Jasa tidak ditemukan"
          description="Jasa ini mungkin sudah dinonaktifkan atau dihapus oleh Penyedia Jasa."
          action={<Button asChild><Link to="/katalog">Kembali ke Katalog</Link></Button>}
        />
      </div>
    );
  }

  const provider = service.expand?.provider;
  const category = service.expand?.category;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>{service.title} — TugasIn</title>
        <meta name="description" content={service.description.slice(0, 150)} />
      </Helmet>

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Link to="/katalog" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl border bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{category.name}</span>
              ) : null}
              <span className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> {EDUCATION_LEVELS[service.education_level] || service.education_level}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{service.title}</h1>

            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Deskripsi Layanan</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground">{service.description}</p>
            </div>

            {service.support_info ? (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <div className="text-sm font-semibold text-primary">Informasi Pendukung</div>
                    <p className="mt-1 text-sm text-blue-900">{service.support_info}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {provider ? (
              <div className="mt-8 flex items-center gap-3 border-t pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold text-foreground">{provider.name}</div>
                  <div className="text-sm text-muted-foreground">Penyedia Jasa</div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-xl border bg-white p-6 lg:sticky lg:top-24">
            <div className="text-sm text-muted-foreground">Harga mulai dari</div>
            <div className="mt-1 text-3xl font-extrabold text-primary">{formatRupiah(service.price)}</div>
            <div className="mt-4 space-y-3 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> Estimasi pengerjaan</span>
                <span className="font-semibold text-foreground">{service.duration_days} hari</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground"><GraduationCap className="h-4 w-4" /> Tingkat</span>
                <span className="font-semibold text-foreground">{EDUCATION_LEVELS[service.education_level] || service.education_level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground"><FileText className="h-4 w-4" /> Kategori</span>
                <span className="font-semibold text-foreground">{category?.name || "-"}</span>
              </div>
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={handleOrderClick}>
              Pesan Jasa Ini
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Pesanan dikonfirmasi dulu oleh Penyedia Jasa sebelum dikerjakan.
            </p>
          </aside>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Pesanan</DialogTitle>
            <DialogDescription>
              Jelaskan kebutuhanmu untuk jasa &quot;{service.title}&quot;. Penyedia Jasa akan meninjau dan mengonfirmasi pesananmu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="details">Detail Kebutuhan *</Label>
              <Textarea
                id="details"
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Contoh: Tugas matematika bab integral, 10 soal, mohon disertai langkah pengerjaan..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Tenggat Waktu *</Label>
              <Input id="deadline" type="date" min={today} value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachment">Lampiran (opsional, maks. 5 MB)</Label>
              <Input id="attachment" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">Estimasi biaya</span>
              <span className="font-extrabold text-primary">{formatRupiah(service.price)}</span>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Mengirim..." : "Kirim Pesanan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
