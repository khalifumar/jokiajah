import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_LEVELS, formatRupiah } from "@/lib/constants";

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  price: "",
  duration_days: "",
  education_level: "sekolah",
  support_info: "",
  status: "aktif",
};

export default function ManageServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      const [svcs, cats] = await Promise.all([
        pb.collection("services").getFullList({
          filter: pb.filter("provider = {:uid}", { uid: user.id }),
          sort: "-created",
          expand: "category",
        }),
        pb.collection("categories").getFullList({ sort: "name" }),
      ]);
      setServices(svcs);
      setCategories(cats);
    } catch (e) {
      toast.error("Gagal memuat data jasa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title,
      category: s.category,
      description: s.description,
      price: String(s.price),
      duration_days: String(s.duration_days),
      education_level: s.education_level,
      support_info: s.support_info || "",
      status: s.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Nama jasa wajib diisi.");
    if (!form.category) return toast.error("Kategori wajib dipilih.");
    if (!form.description.trim()) return toast.error("Deskripsi wajib diisi.");
    if (!form.price || Number(form.price) < 1000) return toast.error("Harga minimal Rp1.000.");
    if (!form.duration_days || Number(form.duration_days) < 1) return toast.error("Estimasi pengerjaan minimal 1 hari.");

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      duration_days: Number(form.duration_days),
      education_level: form.education_level,
      support_info: form.support_info.trim(),
      status: form.status,
    };
    try {
      if (editing) {
        await pb.collection("services").update(editing.id, payload);
        toast.success("Jasa berhasil diperbarui.");
      } else {
        await pb.collection("services").create({ ...payload, provider: user.id });
        toast.success("Jasa baru berhasil dibuat.");
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error("Gagal menyimpan jasa. Periksa kembali isianmu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await pb.collection("services").delete(deleting.id);
      toast.success("Jasa berhasil dihapus.");
      setServices((prev) => prev.filter((s) => s.id !== deleting.id));
    } catch (err) {
      toast.error("Gagal menghapus jasa. Jasa mungkin masih terkait pesanan.");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (s, status) => {
    try {
      await pb.collection("services").update(s.id, { status });
      setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, status } : x)));
      toast.success(`Jasa ${status === "aktif" ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch (err) {
      toast.error("Gagal mengubah status jasa.");
    }
  };

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Kelola Jasa — TugasIn</title>
        <meta name="description" content="Kelola jasa yang Anda tawarkan di TugasIn: buat, ubah, atur status, dan hapus jasa." />
      </Helmet>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Kelola Jasa</h1>
            <p className="mt-1 text-sm text-muted-foreground">Buat dan kelola layanan yang Anda tawarkan kepada Client.</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Tambah Jasa</Button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Belum ada jasa"
              description="Buat jasa pertamamu agar Client dapat menemukan dan memesannya di katalog."
              action={<Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Tambah Jasa</Button>}
            />
          ) : (
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{s.title}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${s.status === "aktif" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}>
                        {s.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {s.expand?.category?.name || "-"} · {EDUCATION_LEVELS[s.education_level]} · {s.duration_days} hari ·{" "}
                      <span className="font-semibold text-primary">{formatRupiah(s.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={s.status} onValueChange={(v) => handleStatusChange(s, v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => openEdit(s)} aria-label="Ubah jasa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleting(s)} aria-label="Hapus jasa">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Jasa" : "Tambah Jasa Baru"}</DialogTitle>
            <DialogDescription>Lengkapi informasi layanan yang Anda tawarkan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Jasa *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Contoh: Bimbingan Matematika SMA" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={form.category || undefined} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tingkat Pendidikan *</Label>
                <Select value={form.education_level} onValueChange={(v) => set("education_level", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sekolah">Sekolah</SelectItem>
                    <SelectItem value="kuliah">Kuliah</SelectItem>
                    <SelectItem value="umum">Umum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi *</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Jelaskan layanan, cakupan, dan hasil yang diterima Client..." required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Harga (Rp) *</Label>
                <Input type="number" min="1000" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="150000" required />
              </div>
              <div className="space-y-2">
                <Label>Estimasi Pengerjaan (hari) *</Label>
                <Input type="number" min="1" max="90" value={form.duration_days} onChange={(e) => set("duration_days", e.target.value)} placeholder="3" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Informasi Pendukung</Label>
              <Input value={form.support_info} onChange={(e) => set("support_info", e.target.value)} placeholder="Contoh: Termasuk revisi minor 2x" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif (tampil di katalog)</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif (disembunyikan)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Jasa"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus jasa ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Jasa &quot;{deleting?.title}&quot; akan dihapus permanen dan tidak lagi tampil di katalog. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
