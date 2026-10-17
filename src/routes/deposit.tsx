import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, Fingerprint, Lock, Smartphone, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppBar, Frame, PrimaryButton } from "@/components/rhino/AppFrame";
import { DEPOSIT_FEE, deposit, depositNet, haptic } from "@/lib/store";

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Save Expiring Data — RHINO DATABANK" },
      { name: "description", content: "Deposit expiring bundles and keep 90% of your data." },
      { property: "og:title", content: "Save Expiring Data — RHINO DATABANK" },
      { property: "og:description", content: "Deposit MTN, Airtel or Africell data before it expires." },
    ],
  }),
  component: Deposit,
});

const sources = [
  { id: "MTN", label: "MTN Expiring", icon: Smartphone },
  { id: "Airtel", label: "Airtel Expiring", icon: Smartphone },
  { id: "Manual", label: "Manual Upload Screenshot", icon: Upload },
];

function Deposit() {
  const nav = useNavigate();
  const [gb, setGb] = useState(5);
  const [src, setSrc] = useState("MTN");
  const [expiry, setExpiry] = useState("");
  const fee = +(gb * DEPOSIT_FEE).toFixed(2);
  const confirm = () => {
    haptic();
    if (!(gb > 0)) { toast.error("Enter an amount"); return; }
    deposit(gb, src);
    toast.success(`${depositNet(gb)}GB saved to your vault`);
    nav({ to: "/dashboard" });
  };
  return (
    <Frame className="pb-10">
      <AppBar title="Save Expiring Data" />
      <div className="flex flex-col gap-5 p-5">
        <p className="text-sm font-bold text-ink">Amount to Save</p>
        <div className="flex items-baseline justify-center gap-2 rounded-3xl bg-card py-6 shadow-elegant">
          <input inputMode="decimal" value={gb} onChange={(e) => setGb(Number(e.target.value) || 0)} className="w-32 bg-transparent text-right text-[32px] font-extrabold text-ink outline-none" />
          <span className="text-xl font-bold text-muted-foreground">GB</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 20, 50].map((n) => (
            <button key={n} onClick={() => { haptic(); setGb(+(gb + n).toFixed(2)); }} className="rounded-full border border-input bg-card px-3 py-1.5 text-xs font-bold text-ink active:bg-primary-soft">+{n}GB</button>
          ))}
        </div>
        <p className="text-sm font-bold text-ink">Source</p>
        <div className="flex flex-col gap-3">
          {sources.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSrc(id)} className={`flex items-center gap-3 rounded-[14px] border-[1.5px] bg-card p-4 text-left ${src === id ? "border-primary" : "border-input"}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${src === id ? "border-primary" : "border-muted-foreground"}`}>
                {src === id && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-bold text-ink">{label}</span>
            </button>
          ))}
        </div>
        <label className="flex h-14 items-center gap-3 rounded-[14px] border border-input bg-card px-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <input type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="flex-1 bg-transparent text-sm text-ink outline-none" aria-label="Expiry date/time" />
        </label>
        <div className="flex flex-col gap-2 rounded-[14px] bg-surface p-4">
          <Row l="You save" r={`${gb}GB`} />
          <Row l="Fee 10%" r={`${fee}GB`} />
          <div className="flex justify-between text-base font-extrabold text-primary"><span>You get</span><span>{depositNet(gb)}GB</span></div>
        </div>
        <PrimaryButton onClick={confirm}><Fingerprint className="h-5 w-5" />Confirm Deposit</PrimaryButton>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="h-3.5 w-3.5" />Bank-grade encryption</p>
      </div>
    </Frame>
  );
}

function Row({ l, r }: { l: string; r: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className="font-bold text-ink">{r}</span></div>;
}
