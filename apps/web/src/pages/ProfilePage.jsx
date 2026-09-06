import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, formatDate } from "@/lib/constants";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Nama wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (file) fd.append("avatar", file);
      await pb.collection("users").update(user.id, fd);
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      toast.error("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Profil Saya — TugasIn</title>
        <meta name="description" content="Kelola profil akun TugasIn Anda." />
      </Helmet>
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">Profil Saya</h1>

        <div className="mt-8 rounded-xl border bg-white p-6 md:p-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user?.avatar ? <AvatarImage src={pb.files.getURL(user, user.avatar)} alt={user?.name || "Pengguna"} /> : null}
              <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">{initial}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-bold text-foreground">{user?.name || "Pengguna"}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <span className="mt-1 inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-4 border-t pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Foto Profil (opsional)</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Terdaftar sejak</Label>
              <Input value={formatDate(user?.created)} disabled />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
