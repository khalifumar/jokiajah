import React from "react";
import { ORDER_STATUSES } from "@/lib/constants";

export default function StatusBadge({ status }) {
  const s = ORDER_STATUSES[status] || { label: status, color: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}
