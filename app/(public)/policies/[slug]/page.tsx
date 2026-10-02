import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Section";
import { Markdown } from "@/components/site/Markdown";
import { getPage } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: page.seoTitle ?? page.title, description: page.seoDescription ?? undefined, alternates: { canonical: `/policies/${page.slug}` } } : {};
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const page = await getPage((await params).slug);
  if (!page) notFound();
  return (
    <div className="container-x max-w-3xl py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: page.title }]} />
      <h1 className="mb-6 mt-3 text-[2rem] font-extrabold">{page.title}</h1>
      <Markdown source={page.bodyMd} />
    </div>
  );
}
