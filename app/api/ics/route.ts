import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { buildIcs } from "@/lib/calendar";
import { getWeddingConfig } from "@/lib/config";

const querySchema = z.object({
  slug: z.string().min(1).max(80),
  event: z.coerce.number().int().min(0).max(20),
});

/** GET /api/ics?slug=rina-dimas&event=0 → unduh file .ics untuk satu acara. */
export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  }

  const { slug, event: index } = parsed.data;
  const config = await getWeddingConfig(slug);
  const event = config?.events[index];
  if (!config || !event) {
    return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
  }

  const couple = `${config.bride.nickname} & ${config.groom.nickname}`;
  const ics = buildIcs({
    uid: `${slug}-${index}@undangan-digital`,
    title: `${event.type} ${couple}`,
    start: event.start,
    end: event.end,
    location: `${event.venue}, ${event.address}`,
    description: `Undangan ${event.type} ${couple}`,
    url: `${request.nextUrl.origin}/${slug}`,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${index + 1}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
