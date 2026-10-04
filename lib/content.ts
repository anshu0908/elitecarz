import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getFaqs = cache(async () => {
  try {
    return await db.faq.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  } catch (err) {
    console.warn("getFaqs: DB query failed:", err instanceof Error ? err.message : err);
    return [];
  }
});

export const getReviews = cache(async () => {
  try {
    return await db.review.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }],
      select: { id: true, author: true, body: true, source: true, isParaphrase: true, carLabel: true, reviewedOn: true },
    });
  } catch (err) {
    console.warn("getReviews: DB query failed:", err instanceof Error ? err.message : err);
    return [];
  }
});

export const getPage = cache(async (slug: string) => {
  try {
    return await db.page.findUnique({ where: { slug } });
  } catch (err) {
    console.warn(`getPage(${slug}): DB query failed:`, err instanceof Error ? err.message : err);
    return null;
  }
});

export const getLenders = cache(async () => {
  try {
    return await db.lender.findMany({ where: { isActive: true }, orderBy: { minRate: "asc" } });
  } catch (err) {
    console.warn("getLenders: DB query failed:", err instanceof Error ? err.message : err);
    return [];
  }
});

export const getTeam = cache(async () => {
  try {
    return await db.teamMember.findMany({ orderBy: { sortOrder: "asc" } });
  } catch (err) {
    console.warn("getTeam: DB query failed:", err instanceof Error ? err.message : err);
    return [];
  }
});
