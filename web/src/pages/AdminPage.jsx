import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Briefcase, ClipboardList, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { slugify } from "@/lib/format";
import { ORDER_STATUSES, ROLE_LABELS, formatDate, formatRupiah } from "@/lib/constants";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catDialog, setCatDialog] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [savingCat, setSavingCat] = useState(false);

  const load = async () => {
    try {
      const [u, s, o, c] = await Promise.all([
        pb.collection("users").getFullList({ sort: "-created" }),
        pb.collection("services").getFullList({ sort: "-created", expand: "provider,category" }),
        pb.collection("orders").getFullList({ sort: "-created", expand: "service,client,provider" }),
        pb.collection("categories").getFullList({ sort: "name" }),
      ]);
      setUsers(u);
      setServices(s);
      setOrders(o);
      setCategories(c);
    } catch (e) {
      toast.error("Gagal memuat data admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countByRole = (role) => users.filter((u) => u.role === role).length;
  const activeServices = services.filter((s) => s.status === "aktif").length;
  const countByStatus = (st) => orders.filter((o) => o.status === st).length;

  const changeRole = async (target, role) => {
    try {
      await pb.collection("users").update(target.id, { role });
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role } : u)));
      toast.success(`Peran ${target.name || target.email} diubah menjadi ${ROLE_LABELS[role]}.`);
    } catch (e) {
      toast.error("Gagal mengubah peran pengguna.");
    }
  };

  const deleteUser = async (target) => {
    if (!window.confirm(`Hapus pengguna "${target.name || target.email}"? Seluruh jasa dan pesanannya ikut terhapus.`)) return;
    try {
      await pb.collection("users").delete(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toast.success("Pengguna berhasil dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus pengguna.");
    }
  };

  const changeServiceStatus = async (s, status) => {
    try {
      await pb.collection("services").update(s.id, { status });
      setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, status } : x)));
      toast.success("Status jasa diperbarui.");
    } catch (e) {
      toast.error("Gagal mengubah status jasa.");
    }
  };

  const deleteService = async (s) => {
    if (!window.confirm(`Hapus jasa "${s.title}"?`)) return;
    try {
      await pb.collection("services").delete(s.id);
      setServices((prev) => prev.filter((x) => x.id !== s.id));
      toast.success("Jasa berhasil dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus jasa. Jasa mungkin masih terkait pesanan.");
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.error("Nama kategori wajib diisi.");
    setSavingCat(true);
    try {
      const rec = await pb.collection("categories").create({
        name: catForm.name.trim(),
        slug: slugify(catForm.name),
        description: catForm.description.trim(),
      });
      setCategories((prev) => [...prev, rec].sort((a, b) => a.name.localeCompare(b.name)));
      setCatDialog(false);
      setCatForm({ name: "", description: "" });
      toast.success("Kategori berhasil ditambahkan.");
    } catch (err) {
      toast.error("Gagal menambah kategori. Nama mungkin sudah digunakan.");
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCategory = async (c) => {
    if (!window.confirm(`Hapus kategori "${c.name}"?`)) return;
    try {
      await pb.collection("categories").delete(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      toast.success("Kategori berhasil dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus kategori. Masih ada jasa yang memakainya.");
    }
  };

  const statCards = [
    { icon: Users, label: "Total Pengguna", value: users.length, sub: `${countByRole("client")} Client · ${countByRole("provider")} Penyedia · ${countByRole("admin")} Admin` },
    { icon: Briefcase, label: "Jasa Aktif", value: activeServices, sub: `${services.length} total jasa terdaftar` },
    { icon: ClipboardList, label: "Total Pesanan", value: orders.length, sub: `${countByStatus("menunggu")} menunggu konfirmasi` },
  ];

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Dashboard Admin — TugasIn</title>
        <meta name="description" content="Dashboard Admin TugasIn: ringkasan aktivitas, kelola pengguna, jasa, pesanan, dan kategori." />
      </Helmet>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pantau dan kelola seluruh aktivitas platform.</p>

        <Tabs defaultValue="ringkasan" className="mt-8">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max">
              <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              <TabsTrigger value="pengguna">Pengguna</TabsTrigger>
              <TabsTrigger value="jasa">Jasa</TabsTrigger>
              <TabsTrigger value="pesanan">Pesanan</TabsTrigger>
              <TabsTrigger value="kategori">Kategori</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ringkasan" className="mt-6">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {statCards.map((s) => (
                    <div key={s.label} className="rounded-xl border bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{s.label}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <s.icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="mt-2 text-3xl font-extrabold text-foreground">{s.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border bg-white p-6">
                    <h2 className="font-bold text-foreground">Pesanan Berdasarkan Status</h2>
                    <div className="mt-4 space-y-3">
                      {Object.entries(ORDER_STATUSES).map(([key, s]) => {
                        const count = countByStatus(key);
                        const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{s.label}</span>
                              <span className="font-bold text-foreground">{count}</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-muted">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white p-6">
                    <h2 className="font-bold text-foreground">Aktivitas Terbaru</h2>
                    {orders.length === 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">Belum ada aktivitas pesanan.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {orders.slice(0, 5).map((o) => (
                          <Link key={o.id} to={`/pesanan/${o.id}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:border-primary/40">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-foreground">{o.expand?.service?.title || "Jasa"}</div>
                              <div className="text-xs text-muted-foreground">
                                {o.expand?.client?.name || "-"} → {o.expand?.provider?.name || "-"} · {formatDate(o.created)}
                              </div>
                            </div>
                            <StatusBadge status={o.status} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="pengguna" className="mt-6">
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Peran</th>
                    <th className="px-4 py-3">Terdaftar</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-semibold text-foreground">{u.name || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <Select value={u.role} onValueChange={(v) => changeRole(u, v)} disabled={u.id === user.id}>
                          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="provider">Penyedia Jasa</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={u.id === user.id} onClick={() => deleteUser(u)} aria-label="Hapus pengguna">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="jasa" className="mt-6">
            {services.length === 0 && !loading ? (
              <EmptyState icon={Briefcase} title="Belum ada jasa terdaftar" />
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Jasa</th>
                      <th className="px-4 py-3">Penyedia</th>
                      <th className="px-4 py-3">Harga</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="max-w-[240px] px-4 py-3">
                          <div className="truncate font-semibold text-foreground">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{s.expand?.category?.name || "-"}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.expand?.provider?.name || "-"}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{formatRupiah(s.price)}</td>
                        <td className="px-4 py-3">
                          <Select value={s.status} onValueChange={(v) => changeServiceStatus(s, v)}>
                            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aktif">Aktif</SelectItem>
                              <SelectItem value="nonaktif">Nonaktif</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteService(s)} aria-label="Hapus jasa">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pesanan" className="mt-6">
            {orders.length === 0 && !loading ? (
              <EmptyState icon={ClipboardList} title="Belum ada pesanan" />
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Jasa</th>
                      <th className="px-4 py-3">Client → Penyedia</th>
                      <th className="px-4 py-3">Biaya</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0">
                        <td className="max-w-[220px] px-4 py-3">
                          <div className="truncate font-semibold text-foreground">{o.expand?.service?.title || "Jasa"}</div>
                          <div className="text-xs text-muted-foreground">Tenggat {formatDate(o.deadline)}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.expand?.client?.name || "-"} → {o.expand?.provider?.name || "-"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary">{formatRupiah(o.price)}</td>
                        <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/pesanan/${o.id}`}>Lihat</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="kategori" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setCatDialog(true)}><Plus className="mr-1 h-4 w-4" /> Tambah Kategori</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground">{c.name}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.description || "Tanpa deskripsi"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {services.filter((s) => s.category === c.id).length} jasa
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => deleteCategory(c)} aria-label="Hapus kategori">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Kategori</DialogTitle>
            <DialogDescription>Kategori baru akan langsung tersedia untuk Penyedia Jasa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveCategory} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori *</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="Contoh: Desain Grafis" required />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={catForm.description} onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} placeholder="Deskripsi singkat kategori" />
            </div>
            <Button type="submit" className="w-full" disabled={savingCat}>
              {savingCat ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
