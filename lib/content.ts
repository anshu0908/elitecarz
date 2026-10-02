import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getFaqs = cache(() => db.faq.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }));

export const getReviews = cache(() =>
  db.review.findMany({ where: { isPublished: true }, orderBy: [{ isFeatured: "desc" }], select: { id: true, author: true, body: true, source: true, isParaphrase: true, carLabel: true, reviewedOn: true } }),
);

export const getPage = cache((slug: string) => db.page.findUnique({ where: { slug } }));

export const getLenders = cache(() => db.lender.findMany({ where: { isActive: true }, orderBy: { minRate: "asc" } }));

export const getTeam = cache(() => db.teamMember.findMany({ orderBy: { sortOrder: "asc" } }));
