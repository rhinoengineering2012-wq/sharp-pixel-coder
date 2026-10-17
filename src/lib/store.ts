import { useSyncExternalStore } from "react";

export type TxType = "deposit" | "withdrawal" | "reward" | "sale";
export type Tx = { id: string; type: TxType; amount: number; unit: "GB" | "UGX"; network: string; label: string; at: number };

export const UGX_PER_GB = 4000;
export const DEPOSIT_FEE = 0.1;
export const WITHDRAW_FEE = 0.05;

/** Net GB credited after the 10% deposit fee. */
export const depositNet = (gb: number) => Math.round(gb * (1 - DEPOSIT_FEE) * 100) / 100;
/** Withdrawal fee in UGX (5% of the withdrawn data's value). */
export const withdrawFeeUGX = (gb: number) => Math.round(gb * UGX_PER_GB * WITHDRAW_FEE);

const h = 3600_000;
const now = Date.now();
type State = { balance: number; stored: number; withdrawn: number; earned: number; txs: Tx[] };
let state: State = {
  balance: 15.5,
  stored: 12.3,
  withdrawn: 4.2,
  earned: 3.0,
  txs: [
    { id: "1", type: "deposit", amount: 5, unit: "GB", network: "MTN", label: "Deposit from MTN", at: now - 2 * h },
    { id: "2", type: "withdrawal", amount: 3, unit: "GB", network: "Airtel", label: "Withdraw to my number", at: now - 6 * h },
    { id: "3", type: "reward", amount: 1, unit: "GB", network: "RHINO", label: "Referral reward", at: now - 26 * h },
    { id: "4", type: "sale", amount: 10000, unit: "UGX", network: "Market", label: "Sold 2.5GB on market", at: now - 50 * h },
    { id: "5", type: "deposit", amount: 2.5, unit: "GB", network: "Lyca Mobile", label: "Deposit from Lyca Mobile", at: now - 72 * h },
  ],
};
const subs = new Set<() => void>();
const set = (s: State) => { state = s; subs.forEach((f) => f()); };

export const useBank = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state, () => state);

export function deposit(gb: number, network: string) {
  const net = depositNet(gb);
  set({
    ...state,
    balance: +(state.balance + net).toFixed(2),
    stored: +(state.stored + net).toFixed(2),
    txs: [{ id: crypto.randomUUID(), type: "deposit", amount: net, unit: "GB", network, label: `Deposit from ${network}`, at: Date.now() }, ...state.txs],
  });
}

export function withdraw(gb: number, network: string, dest: string) {
  if (gb > state.balance) throw new Error("Insufficient balance");
  set({
    ...state,
    balance: +(state.balance - gb).toFixed(2),
    withdrawn: +(state.withdrawn + gb).toFixed(2),
    txs: [{ id: crypto.randomUUID(), type: "withdrawal", amount: gb, unit: "GB", network, label: dest, at: Date.now() }, ...state.txs],
  });
}

export function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const hr = Math.round(m / 60);
  if (hr < 24) return `${hr}hrs ago`;
  return `${Math.round(hr / 24)}d ago`;
}

export const haptic = () => { try { navigator.vibrate?.(10); } catch { /* noop */ } };
