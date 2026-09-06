import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { RotateCcw, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import ServiceCard from "@/components/ServiceCard";
import EmptyState from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    pb.collection("categories")
      .getFullList({ sort: "name" })
      .then((cats) => {
        setCategories(cats);
        const slug = searchParams.get("kategori");
        if (slug) {
          const found = cats.find((c) => c.slug === slug);
          if (found) setCategory(found.id);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const conditions = ["status = 'aktif'"];
        const params = {};
        if (q.trim()) {
          conditions.push("(title ~ {:q} || description ~ {:q})");
          params.q = q.trim();
        }
        if (category !== "all") {
          conditions.push("category = {:cat}");
          params.cat = category;
        }
        if (level !== "all") {
          conditions.push("education_level = {:lvl}");
          params.lvl = level;
        }
        if (minPrice) {
          conditions.push("price >= {:min}");
          params.min = Number(minPrice);
        }
        if (maxPrice) {
          conditions.push("price <= {:max}");
          params.max = Number(maxPrice);
        }
        const res = await pb.collection("services").getList(1, 24, {
          filter: pb.filter(conditions.join(" && "), params),
          sort: "-created",
          expand: "provider,category",
        });
        setServices(res.items);
      } catch (e) {
        toast.error("Gagal memuat katalog jasa. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q, category, level, minPrice, maxPrice]);

  const resetFilters = () => {
    setQ("");
    setCategory("all");
    setLevel("all");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Katalog Jasa — TugasIn</title>
        <meta name="description" content="Jelajahi katalog jasa bantuan tugas sekolah dan kuliah. Cari berdasarkan kata kunci, kategori, tingkat pendidikan, dan rentang harga." />
      </Helmet>

      <div className="border-b bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Katalog Jasa</h1>
          <p className="mt-2 text-muted-foreground">Temukan bantuan dan bimbingan tugas yang sesuai kebutuhanmu.</p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari jasa, misal: matematika, esai, pemrograman..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border bg-white p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Filter</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Semua kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tingkat Pendidikan</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue placeholder="Semua tingkat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua tingkat</SelectItem>
                  <SelectItem value="sekolah">Sekolah</SelectItem>
                  <SelectItem value="kuliah">Kuliah</SelectItem>
                  <SelectItem value="umum">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rentang Harga (Rp)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input type="number" min="0" placeholder="Maks" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Tidak ada jasa yang cocok"
              description="Coba ubah kata kunci atau longgarkan filter pencarianmu."
              action={<Button variant="outline" onClick={resetFilters}>Reset Filter</Button>}
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">{services.length} jasa ditemukan</p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((s) => <ServiceCard key={s.id} service={s} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
