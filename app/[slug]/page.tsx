import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvitationShell } from "@/components/InvitationShell";
import { Closing } from "@/components/sections/Closing";
import { Countdown } from "@/components/sections/Countdown";
import { Couple } from "@/components/sections/Couple";
import { Events } from "@/components/sections/Events";
import { Gallery } from "@/components/sections/Gallery";
import { Gift } from "@/components/sections/Gift";
import { Location } from "@/components/sections/Location";
import { LoveStory } from "@/components/sections/LoveStory";
import { Rsvp } from "@/components/sections/Rsvp";
import { Wishes } from "@/components/sections/Wishes";
import type { NavItem } from "@/components/ui/BottomNav";
import { getWeddingConfig } from "@/lib/config";
import { isDemoMode } from "@/lib/supabase";
import { DEFAULT_GUEST_NAME, formatDateDots, formatDateLong, sanitizeGuestName } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = await getWeddingConfig(slug);
  if (!config) return { title: "Undangan tidak ditemukan" };

  const couple = `${config.bride.nickname} & ${config.groom.nickname}`;
  return {
    title: `The Wedding of ${couple}`,
    description: `Undangan pernikahan ${couple} — ${formatDateLong(config.events[0].start)}.`,
  };
}

export default async function WeddingPage({ params, searchParams }: PageProps) {
  const [{ slug }, { to }] = await Promise.all([params, searchParams]);
  const config = await getWeddingConfig(slug);
  if (!config) notFound();

  const { bride, groom, events } = config;
  const coupleNames = `${bride.nickname} & ${groom.nickname}`;
  const firstEvent = [...events].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
  const dateLabel = formatDateDots(firstEvent.start);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const guestName = sanitizeGuestName(to);
  const prefillName = guestName === DEFAULT_GUEST_NAME ? "" : guestName;
  const demo = isDemoMode();

  const hasStory = Boolean(config.loveStory?.length);
  const hasGallery = config.gallery.length > 0;
  const hasGift = config.gifts.length > 0 || Boolean(config.qrisImage) || Boolean(config.giftAddress);

  // Hanya tampilkan menu untuk section yang ada.
  const navItems: NavItem[] = [
    { label: "Home", icon: "home", sectionIds: ["home"] },
    { label: "Mempelai", icon: "couple", sectionIds: ["mempelai", "countdown"] },
    { label: "Acara", icon: "events", sectionIds: ["acara", "lokasi"] },
    ...(hasGallery || hasStory
      ? [{ label: "Galeri", icon: "gallery", sectionIds: hasGallery ? ["galeri", "cerita"] : ["cerita"] } satisfies NavItem]
      : []),
    { label: "RSVP", icon: "rsvp", sectionIds: ["rsvp", "ucapan"] },
    ...(hasGift ? [{ label: "Hadiah", icon: "gift", sectionIds: ["hadiah"] } satisfies NavItem] : []),
  ];

  return (
    <div data-palette={config.palette} className="min-h-dvh bg-bg text-fg">
      <InvitationShell
        cover={{
          coupleNames,
          dateLabel,
          image: config.coverImage,
          guestName,
          nextSectionId: "mempelai",
        }}
        music={config.music}
        navItems={navItems}
      >
        <main>
          <Couple bride={bride} groom={groom} />
          <Countdown target={firstEvent.start} dateLabel={dateLabel} />
          <Events
            slug={slug}
            coupleNames={coupleNames}
            events={events}
            liveStreamUrl={config.liveStreamUrl}
            invitationUrl={`${siteUrl}/${slug}`}
          />
          <Location events={events} />
          {hasStory && config.loveStory ? <LoveStory stories={config.loveStory} /> : null}
          {hasGallery ? <Gallery images={config.gallery} coupleNames={coupleNames} /> : null}
          <Rsvp slug={slug} defaultName={prefillName} demo={demo} />
          <Wishes slug={slug} defaultName={prefillName} demo={demo} />
          {hasGift ? (
            <Gift
              gifts={config.gifts}
              qrisImage={config.qrisImage}
              giftAddress={config.giftAddress}
              coupleNames={coupleNames}
            />
          ) : null}
        </main>
        <Closing
          image={config.closingImage ?? config.coverImage}
          quote={config.quote}
          closing={config.closing}
          coupleNames={coupleNames}
        />
      </InvitationShell>
    </div>
  );
}
