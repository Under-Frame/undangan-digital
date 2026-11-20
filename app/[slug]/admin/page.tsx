import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { adminPasswordEnvName, getAdminPassword, isAdmin } from "@/lib/admin-auth";
import { getWeddingConfig } from "@/lib/config";
import { listAllWishes, listRsvp } from "@/lib/store";
import { isDemoMode } from "@/lib/supabase";
import { formatDateLong } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ params }: PageProps) {
  const { slug } = await params;
  const config = await getWeddingConfig(slug);
  if (!config) notFound();

  const coupleNames = `${config.bride.nickname} & ${config.groom.nickname}`;

  if (!getAdminPassword(config)) {
    return (
      <div data-palette={config.palette} className="min-h-dvh bg-bg text-fg">
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
          <p className="label-caps text-muted">Dashboard · {coupleNames}</p>
          <h1 className="mt-4 text-4xl">Password admin belum diatur.</h1>
          <p className="mt-4 text-muted">
            Isi env var <code className="rounded bg-line px-1.5 py-0.5 text-fg">{adminPasswordEnvName(config)}</code>{" "}
            di <code className="rounded bg-line px-1.5 py-0.5 text-fg">.env.local</code> (lokal) atau di pengaturan
            Environment Variables Vercel, lalu jalankan ulang server.
          </p>
        </main>
      </div>
    );
  }

  if (!(await isAdmin(config))) {
    return (
      <div data-palette={config.palette} className="min-h-dvh bg-bg text-fg">
        <AdminLogin slug={slug} coupleNames={coupleNames} />
      </div>
    );
  }

  const [rsvp, wishes] = await Promise.all([listRsvp(slug), listAllWishes(slug)]);
  const firstEvent = [...config.events].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];

  return (
    <div data-palette={config.palette} className="min-h-dvh bg-bg text-fg">
      <AdminDashboard
        slug={slug}
        coupleNames={coupleNames}
        fullNames={`${config.bride.name} & ${config.groom.name}`}
        dateLabel={formatDateLong(firstEvent.start)}
        initialRsvp={rsvp}
        initialWishes={wishes}
        demo={isDemoMode()}
      />
    </div>
  );
}
