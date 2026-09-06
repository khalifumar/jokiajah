import React from "react";
import { Helmet } from "react-helmet";
import Reveal from "@/components/Reveal";

const SECTIONS = [
  {
    title: "1. Ruang Lingkup Layanan",
    body: "TugasIn adalah platform marketplace yang mempertemukan Client dengan Penyedia Jasa untuk bantuan, bimbingan, dan dukungan pengerjaan tugas sekolah dan kuliah. Layanan diposisikan sebagai pendampingan belajar yang bertanggung jawab, bukan pengganti kewajiban akademik pengguna.",
  },
  {
    title: "2. Akun dan Peran Pengguna",
    body: "Platform memiliki tiga peran: Client (pemesan jasa), Penyedia Jasa (penawar layanan), dan Admin (pengelola platform). Setiap pengguna wajib menggunakan data yang benar, menjaga kerahasiaan kata sandi, dan hanya mengakses fitur sesuai perannya. Akses ke data dan tindakan dibatasi oleh sistem berdasarkan peran masing-masing.",
  },
  {
    title: "3. Pemesanan dan Status",
    body: "Client mengirimkan pesanan berisi detail kebutuhan, tenggat waktu, dan lampiran bila diperlukan. Penyedia Jasa berhak menerima atau menolak pesanan. Alur status pesanan meliputi: menunggu konfirmasi, diterima, sedang dikerjakan, menunggu revisi, selesai, dan dibatalkan. Kedua pihak diharapkan memperbarui dan memantau status secara berkala.",
  },
  {
    title: "4. Komunikasi",
    body: "Komunikasi antara Client dan Penyedia Jasa dilakukan melalui chat yang terikat pada pesanan. Pengguna dilarang menyampaikan ujaran kebencian, penipuan, ancaman, atau konten yang melanggar hukum. Admin berhak meninjau percakapan demi keamanan platform.",
  },
  {
    title: "5. Tanggung Jawab Akademik",
    body: "Pengguna bertanggung jawab penuh atas penggunaan hasil pekerjaan sesuai aturan integritas akademik di institusinya. TugasIn mendorong Penyedia Jasa menyertakan penjelasan atas hasil pekerjaan agar Client memahami materinya, dan tidak menjamin nilai atau hasil akademik tertentu.",
  },
  {
    title: "6. Larangan",
    body: "Dilarang menggunakan platform untuk penipuan, plagiarisme terencana, jual beli dokumen resmi palsu, tindakan ilegal, atau penyalahgunaan data pengguna lain. Pelanggaran dapat berakibat pada penonaktifan jasa, pembatasan akun, hingga penghapusan akun oleh Admin.",
  },
  {
    title: "7. Data dan Privasi",
    body: "Data pengguna (profil, jasa, pesanan, pesan, dan lampiran) disimpan dengan aman di sistem kami dan hanya dapat diakses oleh pihak yang berwenang sesuai perannya. Pengguna dapat memperbarui data profilnya kapan saja melalui halaman Profil.",
  },
  {
    title: "8. Perubahan Kebijakan",
    body: "Kebijakan ini dapat diperbarui sewaktu-waktu untuk meningkatkan keamanan dan kualitas layanan. Perubahan penting akan diumumkan melalui platform. Dengan terus menggunakan TugasIn, pengguna dianggap menyetujui kebijakan yang berlaku.",
  },
];

export default function PolicyPage() {
  return (
    <div className="bg-muted/40">
      <Helmet>
        <title>Kebijakan Penggunaan — TugasIn</title>
        <meta name="description" content="Kebijakan penggunaan dasar TugasIn: ruang lingkup layanan, peran pengguna, pemesanan, komunikasi, dan tanggung jawab akademik." />
      </Helmet>
      <div className="mx-auto w-full max-w-3xl px-4 py-14">
        <Reveal>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Kebijakan Penggunaan</h1>
          <p className="mt-3 text-muted-foreground">
            Ketentuan dasar penggunaan platform TugasIn agar tetap aman, tertib, dan bermanfaat bagi semua pihak.
          </p>
        </Reveal>
        <div className="mt-10 space-y-6">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.04}>
              <section className="rounded-xl border bg-white p-6">
                <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
