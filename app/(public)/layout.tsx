import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBar } from "@/components/site/MobileBar";
import { ConsentBanner } from "@/components/site/ConsentBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { DemoBadge } from "@/components/site/DemoBadge";
import { getPublicSettings } from "@/lib/settings";
import { autoDealerJsonLd } from "@/lib/seo";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-text">
        Skip to content
      </a>
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <MobileBar whatsapp={settings.business.whatsapp} phone={settings.business.phone} />
      <ConsentBanner ga4Id={settings.tracking.ga4Id} />
      <DemoBadge />
      <JsonLd data={autoDealerJsonLd(settings)} />
    </>
  );
}
