import { FlaskConical } from "lucide-react";

/** Banner kecil saat database belum disambungkan (penyimpanan in-memory). */
export function DemoBadge() {
  return (
    <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
      <FlaskConical className="size-3.5" aria-hidden="true" />
      Mode demo · data tersimpan sementara
    </p>
  );
}
