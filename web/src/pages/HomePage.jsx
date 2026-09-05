import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calculator,
  CheckCircle2,
  Code2,
  GraduationCap,
  Languages,
  MessageSquare,
  Presentation,
  Search,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HERO_IMAGE = "https://images.hostinger.com/dfc29dc4-dac7-4822-a99c-5e2d51dfff8c.png";

const CATEGORY_ICONS = {
  "matematika-sains": Calculator,
  "bahasa-sastra": Languages,
  "informatika-pemrograman": Code2,
  "ekonomi-bisnis": Briefcase,
  "tugas-akhir-penelitian": GraduationCap,
  "presentasi-laporan": Presentation,
};

const STEPS = [
  {
    icon: UserPlus,
    title: "1. Daftar sebagai Client",
    text: "Buat akun gratis dalam satu menit dan lengkapi profilmu. Penyedia Jasa juga mendaftar lewat jalur yang sama.",
  },
  {
    icon: Search,
    title: "2. Temukan jasa & kirim kebutuhan",
    text: "Cari berdasarkan kategori, tingkat pendidikan, dan harga. Kirim detail tugas, tenggat waktu, dan lampiran.",
  },
  {
    icon: CheckCircle2,
    title: "3. Pantau progres & terima hasil",
    text: "Diskusikan lewat chat terintegrasi, pantau status pesanan yang transparan, dan terima hasil tepat waktu.",
  },
];

const FAQS = [
  {
    q: "Apa itu TugasIn?",
    a: "TugasIn adalah marketplace yang mempertemukan Client yang membutuhkan bantuan tugas sekolah atau kuliah dengan Penyedia Jasa yang kompeten. Seluruh proses — dari pemesanan, diskusi, hingga penyelesaian — tercatat rapi dalam satu platform.",
  },
  {
    q: "Bagaimana cara memesan jasa?",
    a: "Daftar sebagai Client, buka katalog jasa, pilih jasa yang sesuai, lalu kirim detail kebutuhan, tenggat waktu, dan lampiran bila ada. Penyedia Jasa akan mengonfirmasi pesananmu.",
  },
  {
    q: "Bagaimana saya memantau status pesanan?",
    a: "Setiap pesanan memiliki alur status yang jelas: menunggu konfirmasi, diterima, sedang dikerjakan, menunggu revisi, selesai, atau dibatalkan. Kamu bisa memantau semuanya dari halaman Pesanan.",
  },
  {
    q: "Apakah saya bisa berdiskusi dengan Penyedia Jasa?",
    a: "Bisa. Setiap pesanan memiliki ruang chat dua arah dengan penanda pesan terbaca, sehingga komunikasi kebutuhan dan revisi berjalan jelas.",
  },
  {
    q: "Bagaimana kebijakan penggunaan yang bertanggung jawab?",
    a: "Layanan di TugasIn diposisikan sebagai bantuan, bimbingan, dan dukungan pengerjaan — bukan jalan pintas akademik. Kami mendorong pengguna memahami hasil pekerjaan dan mematuhi aturan integritas di institusinya masing-masing.",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection("categories")
      .getFullList({ sort: "name" })
      .then(setCategories)
      .catch(() => {});
    pb.collection("services")
      .getList(1, 6, { filter: "status = 'aktif'", sort: "-created", expand: "provider,category" })
      .then((res) => {
        setFeatured(res.items);
        setServiceCount(res.totalItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>TugasIn — Marketplace Bantuan Tugas Sekolah & Kuliah</title>
        <meta
          name="description"
          content="TugasIn mempertemukan Client dengan Penyedia Jasa untuk bantuan dan bimbingan tugas sekolah serta kuliah secara terstruktur, aman, dan transparan."
        />
      </Helmet>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-secondary/60 to-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Platform bantuan tugas yang terstruktur
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              Bantuan tugas sekolah & kuliah, dari penyedia jasa{" "}
              <span className="text-primary">tepercaya</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Temukan bimbingan dan dukungan pengerjaan tugas yang bertanggung jawab. Pesan dengan jelas,
              diskusikan lewat chat, dan pantau setiap progres secara transparan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/katalog">
                  Jelajahi Katalog <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/daftar">Daftar Sekarang</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Status pesanan transparan</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-emerald-600" /> Chat dua arah</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Akses berbasis peran</span>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative">
              <img
                src={HERO_IMAGE}
                alt="Mahasiswa Indonesia belajar bersama dengan laptop di perpustakaan"
                className="w-full rounded-2xl border object-cover shadow-xl"
              />
              <div className="absolute -bottom-5 -left-3 rounded-xl border bg-white px-4 py-3 shadow-lg md:-left-8">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-foreground">Pesanan Selesai</div>
                    <div className="text-xs text-muted-foreground">Tepat sebelum tenggat</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-5 right-4 rounded-xl border bg-white px-4 py-3 shadow-lg">
                <div className="text-xs text-muted-foreground">Status pesanan</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-indigo-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" /> Sedang Dikerjakan
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Statistik */}
      <section className="border-b bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3">
          {[
            { value: serviceCount, suffix: "+", label: "Jasa aktif di katalog" },
            { value: categories.length, suffix: "", label: "Kategori tugas tersedia" },
            { value: 7, suffix: "", label: "Status pesanan yang transparan" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-primary md:text-4xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="bg-muted/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">Cara kerja dalam 3 langkah</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Alur yang jelas dari pendaftaran hingga hasil diterima.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="h-full rounded-xl border bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori populer */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Kategori populer</h2>
                <p className="mt-2 text-muted-foreground">Pilih bidang yang paling sesuai dengan tugasmu.</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/katalog">Lihat semua <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.slug] || BookOpen;
              return (
                <Reveal key={c.id} delay={i * 0.05}>
                  <Link
                    to={`/katalog?kategori=${c.slug}`}
                    className="flex h-full items-start gap-4 rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-foreground">{c.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{c.description}</span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Jasa unggulan */}
      <section className="border-y bg-muted/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Jasa unggulan</h2>
                <p className="mt-2 text-muted-foreground">Layanan terbaru dari Penyedia Jasa kami.</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/katalog">Jelajahi katalog <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)
              : featured.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground md:text-4xl">
              Siap menyelesaikan tugasmu hari ini?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Daftar gratis sebagai Client untuk memesan, atau sebagai Penyedia Jasa untuk menawarkan keahlianmu.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/daftar">Daftar Gratis</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link to="/katalog">Lihat Katalog</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 lg:py-20">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">Pertanyaan umum</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
