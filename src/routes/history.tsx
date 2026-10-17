import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Banknote, FileText, Gift, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Frame } from "@/components/rhino/AppFrame";
import { timeAgo, useBank, type TxType } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Transaction History — RHINO DATABANK" },
      { name: "description", content: "Every deposit, withdrawal, reward and sale in one place." },
      { property: "og:title", content: "Transaction History — RHINO DATABANK" },
      { property: "og:description", content: "Search and export your data bank transactions." },
    ],
  }),
  component: HistoryPage,
});

const tabs: { id: TxType | "all"; label: string }[] = [
  { id: "all", label: "All" }, { id: "deposit", label: "Deposits" }, { id: "withdrawal", label: "Withdrawals" }, { id: "reward", label: "Rewards" }, { id: "sale", label: "Sales" },
];
const style = {
  deposit: { icon: ArrowDown, dot: "bg-success", soft: "bg-success-soft", fg: "text-success", sign: "+" },
  withdrawal: { icon: ArrowUp, dot: "bg-destructive", soft: "bg-destructive-soft", fg: "text-destructive", sign: "-" },
  reward: { icon: Gift, dot: "bg-gold", soft: "bg-gold-soft", fg: "text-gold", sign: "+" },
  sale: { icon: Banknote, dot: "bg-primary", soft: "bg-primary-soft", fg: "text-primary", sign: "+" },
};

function HistoryPage() {
  const { txs } = useBank();
  const [tab, setTab] = useState<TxType | "all">("all");
  const [q, setQ] = useState("");
  const list = txs.filter((t) => (tab === "all" || t.type === tab) && `${t.label} ${t.network}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Frame className="pb-28">
      <h1 className="px-5 pt-6 text-2xl font-extrabold text-ink">History</h1>
      <div className="flex gap-2 overflow-x-auto px-5 py-4">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-gold-soft text-ink"}`}>{t.label}</button>
        ))}
      </div>
      <label className="mx-5 flex h-12 items-center gap-3 rounded-[14px] border border-input bg-card px-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions" className="flex-1 bg-transparent text-sm outline-none" />
        <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
      </label>
      <ul className="mt-4 flex flex-col gap-3 px-5">
        {list.map((t) => {
          const s = style[t.type]; const Icon = s.icon;
          return (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft animate-rise">
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${s.soft}`}><Icon className={`h-5 w-5 ${s.fg}`} /></span>
              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <p className="break-words text-sm font-bold text-ink">{t.label}</p>
                  <p className={`text-sm font-bold ${s.fg}`}>{s.sign}{t.unit === "UGX" ? `UGX ${t.amount.toLocaleString()}` : `${t.amount}GB`}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{timeAgo(t.at)} · {t.network}</p>
              </div>
            </li>
          );
        })}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No transactions found</p>}
      </ul>
      <button onClick={() => window.print()} className="mx-5 mt-5 flex h-12 w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-[14px] border border-input bg-card text-sm font-bold text-ink">
        <FileText className="h-5 w-5 text-destructive" />Export PDF
      </button>
    </Frame>
  );
}
