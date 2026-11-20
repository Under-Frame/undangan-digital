import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Dashboard admin & API tidak perlu diindeks mesin pencari.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/*/admin"] },
  };
}
