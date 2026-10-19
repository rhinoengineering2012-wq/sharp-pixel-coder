import { beforeEach, describe, expect, it } from "vitest";
import { bundles, canPay, createPurchase, DEMO_REQUEST_MS, DEMO_VERIFY_MS, demoPinAccepted, detectNetwork, PIN_WAIT_SECONDS, readPurchases, savePurchase, validPhone } from "@/lib/purchases";
describe("PRO purchase rules", () => {
  beforeEach(() => localStorage.clear());
  it("requires 10 digits starting with 07", () => { expect(validPhone("0772123456")).toBe(true); expect(validPhone("077212345")).toBe(false); expect(validPhone("0872123456")).toBe(false); expect(validPhone("07721234567")).toBe(false); });
  it.each([["0772123456", "MTN"], ["0782123456", "MTN"], ["0702123456", "Airtel"], ["0752123456", "Airtel"], ["0722123456", "Lyca"]])("detects %s as %s", (phone, network) => { expect(detectNetwork(phone)).toBe(network); });
  it("Lyca recipients can receive bundles paid with MTN or Airtel", () => { expect(canPay("0772123456", "0722123456", "MTN")).toBe(true); expect(canPay("0752123456", "0722123456", "Airtel")).toBe(true); });
  it("Lyca cannot be a mobile money payer", () => { expect(canPay("0722123456", "0722123456", "MTN")).toBe(false); });
  it("requires a valid recipient", () => { expect(canPay("0772123456", "123", "MTN")).toBe(false); });
  it("blocks provider mismatch until switched", () => { expect(canPay("0772123456", "0722123456", "Airtel")).toBe(false); });
  it("only accepts demo code 1234", () => { expect(demoPinAccepted("1234")).toBe(true); expect(demoPinAccepted("9999")).toBe(false); });
  it("sends demo request after 3 seconds", () => expect(DEMO_REQUEST_MS).toBe(3000));
  it("verifies demo payment after 2 seconds", () => expect(DEMO_VERIFY_MS).toBe(2000));
  it("expires prompt after 60 seconds", () => expect(PIN_WAIT_SECONDS).toBe(60));
  it("prices daily 1GB at UGX 5000", () => { expect(bundles.filter(b => b.gb === 1).every(b => b.price === 5000 && b.validity === "Daily")).toBe(true); expect(bundles.filter(b => b.gb === 1)).toHaveLength(3); });
  it("prices weekly 5GB at UGX 15000", () => { expect(bundles.filter(b => b.gb === 5).every(b => b.price === 15000 && b.validity === "Weekly")).toBe(true); expect(bundles.filter(b => b.gb === 5)).toHaveLength(3); });
  it("persists outcomes without PIN and isolates account records", () => {
    const bundle = bundles[0]; if (!bundle) throw new Error("Missing bundle");
    const row = createPurchase(bundle, "0772123456", "0722123456", "MTN");
    savePurchase("a", row); savePurchase("a", { ...row, status: "Success" });
    expect(readPurchases("a")).toHaveLength(1); expect(readPurchases("a")[0]?.status).toBe("Success"); expect(readPurchases("b")).toEqual([]);
    expect(Object.keys(readPurchases("a")[0] ?? {})).not.toContain("pin");
  });
});