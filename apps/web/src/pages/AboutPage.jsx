import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Eye, HeartHandshake, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";

const ABOUT_IMAGE = "https://images.hostinger.com/10075d37-1fba-4ed1-bb91-8046963ee70d.png";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Aman & Terstruktur",
    text: "Setiap pesanan tercatat dengan alur status yang jelas, chat terdokumentasi, dan akses berbasis peran sehingga data tiap pengguna terlindungi.",
  },
  {
    icon: HeartHandshake,
    title: "Bertanggung Jawab",
    text: "Kami memposisikan layanan sebagai bantuan, bimbingan, dan dukungan belajar — bukan jalan pintas. Pengguna didorong memahami hasil pekerjaannya.",
  },
  {
    icon: Eye,
    title: "Transparan",
    text: "Harga, estimasi pengerjaan, dan progres pesanan terlihat jelas sejak awal. Tidak ada biaya atau status tersembunyi.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <Helmet>
        <title>Tentang Kami — TugasIn</title>
        <meta name="description" content="Kenali TugasIn, marketplace bantuan dan bimbingan tugas sekolah serta kuliah yang aman, terstruktur, dan bertanggung jawab." />
      </Helmet>

      <section className="border-b bg-gradient-to-b from-secondary/60 to-white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <Reveal>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Tentang TugasIn</h1>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              TugasIn lahir dari keresahan yang sederhana: banyak pelajar dan mahasiswa membutuhkan bantuan untuk
              memahami dan menyelesaikan tugasnya, sementara banyak pula orang berkompeten yang ingin membantu
              secara profesional. Kami mempertemukan keduanya dalam satu platform yang rapi dan aman.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Dengan tiga peran yang jelas — Client, Penyedia Jasa, dan Admin — setiap aktivitas di TugasIn
              berjalan terstruktur: dari katalog jasa, pemesanan dengan tenggat waktu, chat dua arah, hingga
              pemantauan oleh Admin demi keamanan bersama.
            </p>
            <Button className="mt-8" asChild>
              <Link to="/daftar">Bergabung Sekarang</Link>
            </Button>
          </Reveal>
          <Reveal delay={0.15}>
            <img
              src={ABOUT_IMAGE}
              alt="Pelajar Indonesia belajar dengan laptop di meja belajar"
              className="w-full rounded-2xl border object-cover shadow-xl"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">Nilai yang kami pegang</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="h-full rounded-xl border bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 text-center">
          <Reveal>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Komitmen penggunaan yang bertanggung jawab</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              TugasIn bukan layanan penjualan jawaban instan. Kami mendorong setiap bantuan disertai penjelasan
              agar pengguna benar-benar belajar, dan meminta seluruh pengguna mematuhi aturan integritas akademik
              di institusinya masing-masing. Baca selengkapnya di{" "}
              <Link to="/kebijakan" className="font-semibold text-primary hover:underline">Kebijakan Penggunaan</Link>.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
