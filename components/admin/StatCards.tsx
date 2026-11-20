import type { AdminRsvp } from "@/lib/schemas";

export function StatCards({ rsvp }: { rsvp: AdminRsvp[] }) {
  const count = (a: AdminRsvp["attendance"]) => rsvp.filter((r) => r.attendance === a).length;
  const totalPeople = rsvp.filter((r) => r.attendance === "hadir").reduce((sum, r) => sum + r.guestCount, 0);

  const stats = [
    { label: "Total RSVP", value: rsvp.length },
    { label: "Hadir", value: count("hadir") },
    { label: "Tidak Hadir", value: count("tidak") },
    { label: "Masih Ragu", value: count("ragu") },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <div className="col-span-2 rounded-3xl bg-fg p-5 text-bg sm:p-6 lg:order-last lg:col-span-1">
        <p className="label-caps opacity-70">Total orang hadir</p>
        <p className="mt-4 font-serif text-6xl leading-none tabular-nums">{totalPeople}</p>
      </div>
      <dl className="contents">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-3xl border border-line p-5 sm:p-6">
            <dt className="label-caps text-muted">{s.label}</dt>
            <dd className="mt-4 font-serif text-4xl leading-none tabular-nums sm:text-5xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
