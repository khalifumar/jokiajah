import React from "react";
import { Link } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { EDUCATION_LEVELS, formatRupiah } from "@/lib/constants";

export default function ServiceCard({ service }) {
  const provider = service.expand?.provider;
  const category = service.expand?.category;

  return (
    <Link
      to={`/jasa/${service.id}`}
      className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        {category ? (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            {category.name}
          </span>
        ) : null}
        <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {EDUCATION_LEVELS[service.education_level] || service.education_level}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
        {service.title}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div>
          <div className="text-base font-extrabold text-primary">{formatRupiah(service.price)}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {service.duration_days} hari pengerjaan
          </div>
        </div>
        {provider ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <User className="h-3.5 w-3.5" /> {provider.name}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
