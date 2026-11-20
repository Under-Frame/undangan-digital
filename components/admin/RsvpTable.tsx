"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { inputClass } from "@/components/ui/form";
import { ATTENDANCE, ATTENDANCE_LABEL, type AdminRsvp, type Attendance } from "@/lib/schemas";
import { cn, formatDateTime } from "@/lib/utils";

type Filter = "semua" | Attendance;

/** Nilai CSV aman: dikutip, dan diawali ' jika berpotensi dieksekusi sebagai formula di Excel. */
function csvCell(value: string | number) {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function RsvpTable({ slug, rsvp }: { slug: string; rsvp: AdminRsvp[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rsvp.filter((r) => (filter === "semua" || r.attendance === filter) && (!q || r.name.toLowerCase().includes(q)));
  }, [rsvp, query, filter]);

  const exportCsv = () => {
    const header = ["Nama", "Kehadiran", "Jumlah Tamu", "Waktu (WIB)"].map(csvCell).join(",");
    const lines = rows.map((r) =>
      [r.name, ATTENDANCE_LABEL[r.attendance], r.guestCount, formatDateTime(r.createdAt)].map(csvCell).join(","),
    );
    // BOM agar Excel membaca UTF-8 dengan benar.
    const blob = new Blob(["﻿" + [header, ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filters: Array<{ value: Filter; label: string }> = [
    { value: "semua", label: "Semua" },
    ...ATTENDANCE.map((a) => ({ value: a, label: ATTENDANCE_LABEL[a] })),
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="relative md:w-72">
          <label htmlFor="rsvp-search" className="sr-only">
            Cari nama tamu
          </label>
          <Search className="absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="rsvp-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama…"
            className={cn(inputClass, "pl-6")}
          />
        </div>
        <button type="button" onClick={exportCsv} disabled={rows.length === 0} className="btn-pill self-start hover:bg-fg hover:text-bg disabled:opacity-50">
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <div role="radiogroup" aria-label="Filter kehadiran" className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "btn-pill px-4 text-xs",
              filter === f.value ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-line">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Daftar RSVP ({rows.length} baris)</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="label-caps px-5 py-4 font-medium text-muted">Nama</th>
              <th scope="col" className="label-caps px-5 py-4 font-medium text-muted">Kehadiran</th>
              <th scope="col" className="label-caps px-5 py-4 text-right font-medium text-muted">Jumlah</th>
              <th scope="col" className="label-caps px-5 py-4 font-medium text-muted">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  {rsvp.length === 0 ? "Belum ada RSVP masuk." : "Tidak ada yang cocok dengan pencarian."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4 font-medium">{r.name}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs",
                        r.attendance === "hadir" ? "border-fg bg-fg text-bg" : "border-line text-muted",
                      )}
                    >
                      {ATTENDANCE_LABEL[r.attendance]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">{r.attendance === "tidak" ? "–" : r.guestCount}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
