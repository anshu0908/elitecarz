import { formatInr } from "@/lib/format";

/** wa.me click-to-chat link with a pre-filled message. `number` is the 10-digit mobile. */
export function whatsappLink(number: string, text: string): string {
  const digits = number.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  return `https://wa.me/91${digits}?text=${encodeURIComponent(text)}`;
}

export function carWhatsappText(car: { title: string; priceInr: number; stockNo?: string | null }, url: string): string {
  return `Hi EliteCarz, I'm interested in the ${car.title} (${formatInr(car.priceInr)}${car.stockNo ? `, ${car.stockNo}` : ""}). Is it available?\n${url}`;
}

export function telLink(number: string): string {
  return `tel:+91${number.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "")}`;
}
