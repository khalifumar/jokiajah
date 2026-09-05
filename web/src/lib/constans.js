import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const ORDER_STATUSES = {
  menunggu: { label: "Menunggu Konfirmasi", color: "bg-amber-50 text-amber-800 border-amber-200" },
  diterima: { label: "Diterima", color: "bg-blue-50 text-blue-800 border-blue-200" },
  dikerjakan: { label: "Sedang Dikerjakan", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  revisi: { label: "Menunggu Revisi", color: "bg-purple-50 text-purple-800 border-purple-200" },
  selesai: { label: "Selesai", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  dibatalkan: { label: "Dibatalkan", color: "bg-slate-100 text-slate-600 border-slate-200" },
  ditolak: { label: "Ditolak", color: "bg-red-50 text-red-700 border-red-200" },
};

export const ORDER_STATUS_FLOW = ["menunggu", "diterima", "dikerjakan", "revisi", "selesai"];

export const EDUCATION_LEVELS = {
  sekolah: "Sekolah",
  kuliah: "Kuliah",
  umum: "Umum",
};

export const ROLE_LABELS = {
  client: "Client",
  provider: "Penyedia Jasa",
  admin: "Admin",
};

export const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) => (d ? format(new Date(d), "d MMMM yyyy", { locale: localeId }) : "-");

export const formatDateTime = (d) => (d ? format(new Date(d), "d MMM yyyy, HH:mm", { locale: localeId }) : "-");
