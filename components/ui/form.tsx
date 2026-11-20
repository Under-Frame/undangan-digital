import { CircleAlert } from "lucide-react";

/** Gaya input editorial: garis bawah tipis, teks 16 px (mencegah zoom otomatis di iOS). */
export const inputClass =
  "w-full rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base text-fg placeholder:text-muted/70 transition-colors focus:border-fg focus:ring-0 aria-[invalid=true]:border-fg";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-fg">
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
