import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://keca.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "/",
    "/about",
    "/about/vision",
    "/about/organization",
    "/about/history",
    "/about/achievements",
    "/about/location",
    "/about/benefits",
    "/programs",
    "/expert",
    "/certification",
    "/certification/standards",
    "/certification/apply",
    "/certification/graduates",
    "/instructors",
    "/community/notice",
    "/community/schedule",
    "/community/review",
    "/community/gallery",
    "/community/videos",
    "/community/resources",
    "/inquiry",
    "/login",
    "/register",
  ];

  return staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
