import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Fingerprint, Store, User, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppBar, Frame, PrimaryButton } from "@/components/rhino/AppFrame";
import { haptic, useBank, withdraw, withdrawFeeUGX } from "@/lib/store";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw Data — RHINO DATABANK" },
      { name: "description", content: "Withdraw as data, MoMo cash, or sell on the Rhino Market." },
      { property: "og:title", content: "Withdraw Data — RHINO DATABANK" },
      { property: "og:description", content: "Get your saved data back on any network, instantly." },
    ],
  }),
  component: Withdraw,
});

const dests = [
  { id: "My Number", icon: User, tone: "text-primary" },
  { id: "Other Number", icon: Users, tone: "text-primary" },
  { id: "Convert to MoMo Cash", icon: Wallet, tone: "text-success" },
  { id: "Sell to Rhino Market", icon: Store, tone: "text-gold" },
];
const nets = ["MTN", "Airtel", "Lyca Mobile"];

function Withdraw() {
  const b = useBank();
  const nav = useNavigate();
  const [gb, setGb] = useState(3);
  const [dest, setDest] = useState("My Number");
  const [net, setNet] = useState("MTN");
  const [step, setStep] = useState(-1);
  const confirm = () => {
    haptic();
    try { withdraw(gb, net, `Withdraw — ${dest}`); } catch (e) { toast.error((e as Error).message); return; }
    setStep(0);
    setTimeout(() => setStep(1), 600);
    setTimeout(() => { setStep(2); toast.success(`${gb}GB sent via ${net}`); }, 1400);
    setTimeout(() => nav({ to: "/history" }), 2300);
  };
  return (
    <Frame className="pb-10">
      <AppBar title="Withdraw Data" right={<span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{b.balance}GB</span>} />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-baseline justify-center gap-2 rounded-3xl bg-card py-6 shadow-elegant">
          <input inputMode="decimal" value={gb} onChange={(e) => setGb(Number(e.target.value) || 0)} className="w-32 bg-transparent text-right text-[32px] font-extrabold text-ink outline-none" />
          <span className="text-xl font-bold text-muted-foreground">GB</span>
        </div>
        <div className="flex gap-2">
          {[1, 3, 5].map((n) => <button key={n} onClick={() => setGb(n)} className="rounded-full border border-input bg-card px-3 py-1.5 text-xs font-bold text-ink">+{n}GB</button>)}
        </div>
        <p className="text-sm font-bold text-ink">Withdraw To</p>
        <div className="grid grid-cols-2 gap-3">
          {dests.map(({ id, icon: Icon, tone }) => (
            <button key={id} onClick={() => setDest(id)} className={`flex flex-col items-start gap-2 rounded-[14px] border-[1.5px] bg-card p-4 text-left ${dest === id ? "border-primary" : "border-input"}`}>
              <Icon className={`h-6 w-6 ${tone}`} />
              <span className="text-sm font-bold text-ink">{id}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {nets.map((n) => (
            <button key={n} onClick={() => setNet(n)} className={`rounded-full px-4 py-2 text-xs font-bold ${net === n ? "bg-gold text-ink" : "bg-success-soft text-ink"}`}>{n}</button>
          ))}
        </div>
        <div className="flex justify-between rounded-[14px] bg-surface p-4 text-sm">
          <span className="text-muted-foreground">Fee 5%</span>
          <span className="font-bold text-ink">UGX {withdrawFeeUGX(gb).toLocaleString()}</span>
        </div>
        <PrimaryButton onClick={confirm} disabled={step >= 0}><Fingerprint className="h-5 w-5" />Confirm Withdrawal</PrimaryButton>
        <div className="flex items-center justify-between gap-1">
          {["Pending", "Processing", "Complete"].map((s, k) => (
            <div key={s} className={`flex flex-1 items-center justify-center gap-1 text-xs font-semibold ${step >= k ? "text-success" : "text-muted-foreground"}`}>
              <CheckCircle2 className="h-4 w-4" />{s}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
