import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import pb from "@/lib/pocketbaseClient";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";

export default function Layout() {
  const { user, isAuthed, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const publicLinks = [
    { to: "/", label: "Beranda" },
    { to: "/katalog", label: "Katalog Jasa" },
    { to: "/tentang", label: "Tentang" },
  ];
  const authLinks = isAuthed
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/pesanan", label: "Pesanan" },
        { to: "/chat", label: "Chat" },
        ...(user?.role === "provider" ? [{ to: "/kelola-jasa", label: "Kelola Jasa" }] : []),
        ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
      ]
    : [];
  const links = [...publicLinks, ...authLinks];

  const navClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground",
    );

  const handleLogout = () => {
    logout();
    toast.success("Anda telah keluar.");
    navigate("/");
  };

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Tugas<span className="text-primary">In</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {!isAuthed ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/masuk">Masuk</Link>
                </Button>
                <Button asChild>
                  <Link to="/daftar">Daftar Sekarang</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-colors hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      {user?.avatar ? <AvatarImage src={pb.files.getURL(user, user.avatar)} alt={user?.name || "Pengguna"} /> : null}
                      <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">{initial}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-sm font-medium">{user?.name || "Pengguna"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="truncate">{user?.name || "Pengguna"}</span>
                      <span className="text-xs font-normal text-muted-foreground">{ROLE_LABELS[user?.role] || user?.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profil")}>
                    <User className="mr-2 h-4 w-4" /> Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium",
                        isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted",
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <div className="mt-4 border-t pt-4">
                  {!isAuthed ? (
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link to="/daftar" onClick={() => setOpen(false)}>Daftar Sekarang</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/masuk" onClick={() => setOpen(false)}>Masuk</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild>
                        <Link to="/profil" onClick={() => setOpen(false)}>Profil Saya</Link>
                      </Button>
                      <Button variant="destructive" onClick={() => { setOpen(false); handleLogout(); }}>
                        Keluar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold text-white">
                Tugas<span className="text-blue-400">In</span>
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Marketplace yang mempertemukan Client dengan Penyedia Jasa untuk bantuan, bimbingan, dan
              dukungan pengerjaan tugas sekolah dan kuliah secara terstruktur, transparan, dan bertanggung jawab.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Navigasi</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Beranda</Link></li>
              <li><Link to="/katalog" className="hover:text-white">Katalog Jasa</Link></li>
              <li><Link to="/tentang" className="hover:text-white">Tentang Kami</Link></li>
              <li><Link to="/kebijakan" className="hover:text-white">Kebijakan Penggunaan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Akun</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/masuk" className="hover:text-white">Masuk</Link></li>
              <li><Link to="/daftar" className="hover:text-white">Daftar sebagai Client</Link></li>
              <li><Link to="/daftar" className="hover:text-white">Daftar sebagai Penyedia Jasa</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TugasIn. Seluruh layanan bersifat bantuan dan bimbingan belajar yang bertanggung jawab.
          </div>
        </div>
      </footer>
    </div>
  );
}
