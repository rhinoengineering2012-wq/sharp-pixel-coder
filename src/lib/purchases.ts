import { z } from "zod";

export type Network = "MTN" | "Airtel" | "Lyca";
export type PaymentMethod = "MTN" | "Airtel";
export type Bundle = { id: string; gb: number; validity: string; price: number; network: Network; hot: boolean };
export const bundles: Bundle[] = (["MTN", "Airtel", "Lyca"] as const).flatMap(network => [
  { id: `${network}-daily`, gb: 1, validity: "Daily", price: 5000, network, hot: false },
  { id: `${network}-weekly`, gb: 5, validity: "Weekly", price: 15000, network, hot: true },
]);
export const validPhone = (phone: string) => /^07\d{8}$/.test(phone);
export function detectNetwork(phone: string): Network | null {
  if (/^07[78]/.test(phone)) return "MTN";
  if (/^07[05]/.test(phone)) return "Airtel";
  if (/^072/.test(phone)) return "Lyca";
  return null;
}
export const canPay = (payer: string, recipient: string, method: PaymentMethod) => validPhone(payer) && validPhone(recipient) && detectNetwork(payer) !== "Lyca" && (detectNetwork(payer) === null || detectNetwork(payer) === method);
export const DEMO_REQUEST_MS = 3000;
export const DEMO_VERIFY_MS = 2000;
export const PIN_WAIT_SECONDS = 60;
export const demoPinAccepted = (pin: string) => pin === "1234";
export const money = (amount: number) => `UGX ${amount.toLocaleString("en-UG")}`;
export const bundleName = (bundle: Bundle) => `${bundle.gb}GB ${bundle.validity}`;
export const paymentName = (method: PaymentMethod) => method === "MTN" ? "MTN MoMo" : "Airtel Money";

const purchaseSchema = z.object({
  id: z.string(), bundle: z.object({ id: z.string(), gb: z.number(), validity: z.string(), price: z.number(), network: z.enum(["MTN", "Airtel", "Lyca"]), hot: z.boolean() }),
  payer: z.string(), recipient: z.string(), method: z.enum(["MTN", "Airtel"]),
  at: z.number(), status: z.enum(["Success", "Pending", "Failed"]), demo: z.literal(true), reason: z.string().optional(),
});
export type Purchase = z.infer<typeof purchaseSchema>;
const key = (owner: string) => `rhino:demo-purchases:${owner}`;
export function readPurchases(owner: string): Purchase[] {
  try { const result = z.array(purchaseSchema).safeParse(JSON.parse(localStorage.getItem(key(owner)) ?? "[]")); return result.success ? result.data : []; }
  catch { return []; }
}
export function savePurchase(owner: string, purchase: Purchase) {
  const rows = readPurchases(owner);
  localStorage.setItem(key(owner), JSON.stringify([purchase, ...rows.filter(row => row.id !== purchase.id)]));
  window.dispatchEvent(new Event("rhino-purchases"));
}
export function createPurchase(bundle: Bundle, payer: string, recipient: string, method: PaymentMethod): Purchase {
  if (!canPay(payer, recipient, method)) throw new Error("Check your payment and recipient numbers.");
  return { id: `RND-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, bundle, payer, recipient, method, at: Date.now(), status: "Pending", demo: true };
}
// Future live adapter: POST /collection/v1_0/requesttopay from an authenticated
// server function only. Verify provider callbacks; never trust demo records or
// browser confirmations as payment evidence. No API request is made in demo mode.