import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Check, CircleCheck, CircleX, Edit3, Loader2, LockKeyhole, Smartphone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Receipt } from "./Receipt";
import { useRhinoAuth } from "./AuthProvider";
import { bundleName, canPay, createPurchase, DEMO_REQUEST_MS, DEMO_VERIFY_MS, demoPinAccepted, detectNetwork, money, paymentName, PIN_WAIT_SECONDS, savePurchase, validPhone, type Bundle, type PaymentMethod, type Purchase } from "@/lib/purchases";

type Stage = "details" | "sending" | "pin" | "verifying" | "success" | "failed" | "receipt";
export function Checkout({ bundle, onClose }: { bundle: Bundle; onClose: () => void }) {
  const { user } = useRhinoAuth();
  const owner = user?.id ?? "guest";
  const [recipient, setRecipient] = useState("");
  const [payer, setPayer] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("MTN");
  const [stage, setStage] = useState<Stage>("details");
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [pin, setPin] = useState("");
  const [seconds, setSeconds] = useState(PIN_WAIT_SECONDS);
  const [error, setError] = useState("");
  const deadline = useRef(0);
  const recipientInput = useRef<HTMLInputElement>(null);
  useEffect(() => { const phone = user?.user_metadata?.['phone']; if (typeof phone === "string" && validPhone(phone)) { setRecipient(phone); setPayer(phone); } }, [user]);
  function persist(row: Purchase) { try { savePurchase(owner, row); return true; } catch { setError("Could not save this purchase. Enable browser storage and try again."); return false; } }
  useEffect(() => {
    if (stage === "sending") { const timer = setTimeout(() => { deadline.current = Date.now() + PIN_WAIT_SECONDS * 1000; setSeconds(PIN_WAIT_SECONDS); setStage("pin"); }, DEMO_REQUEST_MS); return () => clearTimeout(timer); }
    if (stage === "verifying" && purchase) {
      const timer = setTimeout(() => {
        const success = demoPinAccepted(pin);
        const row: Purchase = { ...purchase, status: success ? "Success" : "Failed", reason: success ? undefined : "Wrong demo PIN" };
        if (persist(row)) { setPurchase(row); setPin(""); setStage(success ? "success" : "failed"); }
        else setStage("failed");
      }, DEMO_VERIFY_MS); return () => clearTimeout(timer);
    }
    if (stage === "pin" && purchase) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(remaining);
        if (remaining === 0) { const row: Purchase = { ...purchase, status: "Failed", reason: "Payment request expired" }; persist(row); setPurchase(row); setPin(""); setStage("failed"); }
      }, 250); return () => clearInterval(timer);
    }
    return undefined;
  }, [stage, purchase, pin, owner]);
  function pay() {
    if (!canPay(payer, recipient, method)) return;
    const row = createPurchase(bundle, payer, recipient, method);
    if (!persist(row)) return;
    setPurchase(row); setPin(""); setError(""); setStage("sending");
  }
  function close() {
    if (purchase?.status === "Pending") persist({ ...purchase, status: "Failed", reason: "Cancelled" });
    onClose();
  }
  const detected = detectNetwork(payer);
  const warning = validPhone(payer) && detected && detected !== method;
  return <Dialog.Root open onOpenChange={open => { if (!open) close(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-checkout-overlay" /><Dialog.Content aria-describedby="checkout-disclaimer" className="pro-theme checkout-sheet fixed inset-y-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col bg-background text-foreground outline-none">
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-4"><Button variant="ghost" size="icon" aria-label="Back from purchase" onClick={stage === "receipt" ? () => setStage("success") : close}><ArrowLeft className="size-5" /></Button><Dialog.Title className="text-base font-bold">Complete Purchase</Dialog.Title><span className="flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" />Secure</span></header>
    <div className="min-h-0 flex-1 overflow-y-auto p-5"><p id="checkout-disclaimer" className="mb-5 rounded-lg bg-gold-soft p-3 text-xs font-semibold text-gold-ink">Demo payment · No money charged or bundle delivered. Never enter your real MoMo PIN here.</p>
    {stage === "details" && <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{bundle.network} bundle</p><h2 className="mt-1 text-xl font-bold">{bundleName(bundle)}</h2></div><span className="text-lg font-bold text-gold">{money(bundle.price)}</span></div><label className="mt-5 block text-xs font-semibold" htmlFor="recipient">{bundle.network === "Lyca" ? "Lyca number to receive bundle" : "Number to receive bundle"}</label><div className="mt-2 flex items-center gap-2"><input ref={recipientInput} id="recipient" className="pro-input" type="tel" inputMode="numeric" maxLength={10} placeholder="07XXXXXXXX" value={recipient} onChange={e => setRecipient(e.target.value.replace(/\D/g, ""))} /><Button variant="ghost" size="icon" title="Change recipient number" aria-label="Change recipient number" onClick={() => recipientInput.current?.focus()}><Edit3 className="size-4" /></Button></div>{detectNetwork(recipient) && <p className="mt-2 text-xs text-muted-foreground">Detected: {detectNetwork(recipient)}</p>}{recipient && !validPhone(recipient) && <p className="mt-2 text-xs text-destructive">Use 10 digits starting with 07.</p>}</section>
      <section><h2 className="mb-3 text-sm font-bold">Choose Payment Method</h2><div className="space-y-3">{(["MTN", "Airtel"] as const).map(option => <Button key={option} variant="outline" className={`h-auto w-full justify-start whitespace-normal rounded-2xl p-4 text-left ${method === option ? "border-gold bg-gold-soft" : "bg-card"}`} onClick={() => setMethod(option)}><span className={`network-mark ${option === "MTN" ? "network-mtn" : "network-airtel"}`}>{option === "MTN" ? <span className="rounded-[50%] border-2 border-current px-1 italic">MTN</span> : "airtel"}</span><span className="min-w-0 flex-1"><span className="block font-bold">{paymentName(option)}</span><span className="block text-xs text-muted-foreground">Pay with {option} Mobile Money</span></span><span className={`grid size-5 shrink-0 place-items-center rounded-full border ${method === option ? "border-gold bg-gold text-gold-ink" : "border-input"}`}>{method === option && <Check className="size-3" />}</span></Button>)}</div><label htmlFor="payer" className="mb-2 mt-4 block text-xs font-semibold">Enter {method === "MTN" ? "MoMo" : "Airtel Money"} Number</label><input id="payer" className="pro-input" type="tel" inputMode="numeric" maxLength={10} placeholder="07XXXXXXXX" value={payer} onChange={e => setPayer(e.target.value.replace(/\D/g, ""))} />{payer && !validPhone(payer) && <p className="mt-2 text-xs text-destructive">Use 10 digits starting with 07.</p>}{warning && <div className="mt-3 text-xs text-gold"><p>{detected === "Lyca" ? "Lyca has no MoMo. Enter an MTN or Airtel payment number." : `This looks like ${detected} number, switch to ${paymentName(detected === "Airtel" ? "Airtel" : "MTN")}?`}</p>{detected !== "Lyca" && <Button variant="link" className="h-8 px-0 text-gold" onClick={() => setMethod(detected === "Airtel" ? "Airtel" : "MTN")}>Switch to {detected}</Button>}</div>}</section>
      <aside className="rounded-2xl border border-lyca/30 bg-lyca-soft p-4"><div className="mb-2 flex items-center gap-2"><span className="network-mark network-lyca">Lyca</span><h3 className="text-sm font-bold">Lyca Mobile</h3></div><p className="text-xs leading-relaxed text-muted-foreground">Lyca has no MoMo. Choose MTN or Airtel to pay for Lyca bundle.</p></aside>
      <div className="flex items-start justify-between gap-3 text-center text-xs text-muted-foreground">{["Enter number", "We send prompt", "Enter PIN on phone"].map((text, i) => <div key={text} className="flex-1"><span className="mx-auto mb-2 grid size-7 place-items-center rounded-full bg-card text-gold">{i + 1}</span>{text}</div>)}</div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button disabled={!canPay(payer, recipient, method)} onClick={pay} className="h-14 w-full whitespace-normal rounded-2xl bg-gold text-gold-ink hover:bg-gold/90">Pay {money(bundle.price)} with {paymentName(method)}</Button>
    </div>}
    {(stage === "sending" || stage === "verifying") && <div role="status" className="flex min-h-[380px] flex-col items-center justify-center gap-5 text-center">{stage === "sending" ? <Smartphone className="phone-shake size-20 text-gold" /> : <Loader2 className="size-16 animate-spin text-gold" />}<h2 className="text-xl font-bold">{stage === "sending" ? `Sending demo request to ${payer}…` : "Verifying demo payment…"}</h2><p className="text-sm text-muted-foreground">Please wait…</p></div>}
    {stage === "pin" && <div className="space-y-5 text-center"><div className="relative mx-auto w-fit"><Smartphone className="size-20 text-gold" /><span className="absolute right-0 top-0 grid size-6 place-items-center rounded-full bg-gold text-gold-ink">1</span></div><h2 className="text-2xl font-bold">Check Your Phone! 📱</h2><p className="text-sm text-muted-foreground">In live mode, {method} sends a payment prompt to {payer}. This is a simulation.</p><div className="rounded-2xl bg-gold-soft p-4 text-left text-sm leading-7 text-gold-ink"><p>1. You will see: “Pay {money(bundle.price)} to RHINO DATABANK”</p><p>2. Enter your {paymentName(method)} PIN on your phone: ****</p><p>3. Press OK to confirm</p></div><p className="text-sm text-muted-foreground">Waiting for confirmation <strong className="text-gold">{seconds}s</strong></p><label className="block text-left text-xs font-semibold" htmlFor="demo-pin">Simulate PIN Entry · use demo code 1234 only</label><input id="demo-pin" className="pro-input" inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} placeholder="Enter 1234 — not your real PIN" /><Button disabled={pin.length !== 4} className="h-14 w-full bg-gold text-gold-ink hover:bg-gold/90" onClick={() => setStage("verifying")}>Confirm demo PIN</Button><Button variant="outline" className="h-12 w-full" onClick={() => { if (pin.length === 4) setStage("verifying"); else setError("Enter demo code 1234 to simulate phone confirmation."); }}>I have entered PIN</Button>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</div>}
    {stage === "success" && purchase && <div className="space-y-5"><CircleCheck className="mx-auto size-20 text-success" /><h2 className="text-center text-2xl font-bold">Payment Successful!</h2><p className="text-center text-sm text-muted-foreground">Demo complete — no money charged.</p><Receipt purchase={purchase} /><p className="text-xs leading-relaxed text-muted-foreground">Live delivery target: 2–5 minutes with SMS confirmation. Demo bundles are not delivered.</p><Button className="h-12 w-full bg-gold text-gold-ink hover:bg-gold/90" onClick={() => setStage("receipt")}>View Receipt</Button><Button variant="outline" className="h-12 w-full" onClick={onClose}>Buy Another</Button><Button variant="ghost" asChild className="h-12 w-full"><Link to="/dashboard" onClick={onClose}>Go Home</Link></Button></div>}
    {stage === "failed" && <div className="space-y-5 py-10 text-center"><CircleX className="mx-auto size-20 text-destructive" /><h2 className="text-2xl font-bold">Payment Failed</h2><p className="text-sm text-muted-foreground">{purchase?.reason === "Payment request expired" ? "Payment request expired. No money charged." : "Wrong demo PIN. Live payments may also fail for insufficient balance."}</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button className="h-14 w-full bg-gold text-gold-ink hover:bg-gold/90" onClick={() => { setStage("details"); setPin(""); setError(""); }}>Try Again</Button><Button variant="outline" className="h-12 w-full" onClick={() => { setStage("details"); setPayer(""); }}>Change Number</Button></div>}
    {stage === "receipt" && purchase && <Receipt purchase={purchase} />}
    </div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}