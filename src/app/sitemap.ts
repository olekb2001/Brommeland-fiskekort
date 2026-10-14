import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/fiskekort", priority: 0.9, freq: "weekly" },
    { path: "/veibeskrivelse", priority: 0.6, freq: "yearly" },
    { path: "/regler", priority: 0.6, freq: "yearly" },
    { path: "/vilkar", priority: 0.2, freq: "yearly" },
  ];
  return pages.map((p) => ({
    url: `${site.url}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
