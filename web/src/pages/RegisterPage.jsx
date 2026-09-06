import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Kata sandi minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      await signup(form.email.trim(), form.password, { name: form.name.trim(), role });
      toast.success("Pendaftaran berhasil. Selamat bergabung di TugasIn!");
      navigate(role === "provider" ? "/kelola-jasa" : "/dashboard");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.email) {
        toast.error("Email sudah terdaftar. Silakan masuk atau gunakan email lain.");
      } else {
        toast.error("Pendaftaran gagal. Periksa kembali isianmu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "client", icon: User, title: "Client", text: "Saya butuh bantuan dan bimbingan untuk tugas saya." },
    { value: "provider", icon: Briefcase, title: "Penyedia Jasa", text: "Saya ingin menawarkan jasa bantuan tugas." },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/40 px-4 py-12">
      <Helmet>
        <title>Daftar — TugasIn</title>
        <meta name="description" content="Daftar akun TugasIn sebagai Client atau Penyedia Jasa dan mulai memesan atau menawarkan jasa bantuan tugas." />
      </Helmet>
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">Buat Akun TugasIn</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih peranmu, lalu lengkapi data di bawah.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  role === opt.value ? "border-primary bg-secondary/60 ring-2 ring-primary/30" : "hover:border-primary/40",
                )}
              >
                <opt.icon className={cn("h-5 w-5", role === opt.value ? "text-primary" : "text-muted-foreground")} />
                <div className="mt-2 text-sm font-bold text-foreground">{opt.title}</div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">{opt.text}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" required placeholder="Nama lengkapmu" value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" placeholder="nama@email.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" type="password" required autoComplete="new-password" placeholder="Min. 8 karakter" value={form.password} onChange={set("password")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Konfirmasi Kata Sandi</Label>
              <Input id="confirm" type="password" required autoComplete="new-password" placeholder="Ulangi kata sandi" value={form.confirm} onChange={set("confirm")} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : `Daftar sebagai ${role === "client" ? "Client" : "Penyedia Jasa"}`}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/masuk" className="font-semibold text-primary hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
