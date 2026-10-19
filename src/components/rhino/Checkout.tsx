import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleX, Loader2, LockKeyhole, RectangleEllipsis, Smartphone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Receipt } from "./Receipt";
import { PhoneNumberField } from "./PhoneNumberField";
import { useRhinoAuth } from "./AuthProvider";
import { bundleName, canPay, createPurchase, DEMO_REQUEST_MS, DEMO_VERIFY_MS, detectNetwork, money, payerError, paymentName, PIN_WAIT_SECONDS, resolveRecipient, savePurchase, validPhone, validRecipient, type Bundle, type PaymentMethod, type Purchase } from "@/lib/purchases";

type Stage = "details" | "sending" | "pin" | "verifying" | "success" | "failed" | "receipt";
export function Checkout({ bundle, onClose }: { bundle: Bundle; onClose: () => void }) {
  const { user } = useRhinoAuth();
  const owner = user?.id ?? "guest";
  const [recipient, setRecipient] = useState("");
  const [payer, setPayer] = useState("");
  const [sameNumber, setSameNumber] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>("MTN");
  const [stage, setStage] = useState<Stage>("details");
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [seconds, setSeconds] = useState(PIN_WAIT_SECONDS);
  const [error, setError] = useState("");
  const deadline = useRef(0);
  useEffect(() => {
    const phone = user?.user_metadata?.['phone'];
    if (typeof phone === "string" && validPhone(phone)) {
      setRecipient(phone); setPayer(phone);
      if (detectNetwork(phone) === "Airtel") setMethod("Airtel");
    }
  }, [user]);
  function persist(row: Purchase) {
    try { savePurchase(owner, row); return true; }
    catch { setError("Could not save this purchase. Enable browser storage and try again."); return false; }
  }
  useEffect(() => {
    if (stage === "sending") {
      const timer = setTimeout(() => { deadline.current = Date.now() + PIN_WAIT_SECONDS * 1000; setSeconds(PIN_WAIT_SECONDS); setStage("pin"); }, DEMO_REQUEST_MS);
      return () => clearTimeout(timer);
    }
    if (stage === "verifying" && purchase) {
      const timer = setTimeout(() => {
        const row: Purchase = { ...purchase, status: "Success", reason: undefined };
        if (persist(row)) { setPurchase(row); setStage("success"); }
        else setStage("failed");
      }, DEMO_VERIFY_MS);
      return () => clearTimeout(timer);
    }
    if (stage === "pin" && purchase) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(remaining);
        if (remaining === 0) {
          const row: Purchase = { ...purchase, status: "Failed", reason: "Payment request expired" };
          persist(row); setPurchase(row); setStage("failed");
        }
      }, 250);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [stage, purchase, owner]);
  const receiver = resolveRecipient(payer, recipient, sameNumber);
  const paymentError = payer ? payerError(payer, method) : "";
  const receiverError = recipient && !validRecipient(recipient) ? "Enter a 10-digit MTN, Airtel or Lyca number starting with 07." : "";
  const detected = detectNetwork(payer);
  function pay() {
    if (!canPay(payer, receiver, method)) return;
    const row = createPurchase(bundle, payer, receiver, method);
    if (!persist(row)) return;
    setPurchase(row); setError(""); setStage("sending");
  }
  function close() {
    if (purchase?.status === "Pending") persist({ ...purchase, status: "Failed", reason: "Cancelled" });
    onClose();
  }
  function confirmOnPhone() {
    if (Date.now() >= deadline.current && purchase) {
      const row: Purchase = { ...purchase, status: "Failed", reason: "Payment request expired" };
      persist(row); setPurchase(row); setStage("failed"); return;
    }
    setStage("verifying");
  }
  return <Dialog.Root open onOpenChange={open => { if (!open) close(); }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-40 bg-checkout-overlay" />
    <Dialog.Content aria-describedby="checkout-disclaimer" className="pro-theme checkout-sheet fixed inset-y-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col bg-background text-foreground outline-none">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-4"><Button variant="ghost" size="icon" aria-label="Back from purchase" onClick={stage === "receipt" ? () => setStage("success") : close}><ArrowLeft className="size-5" /></Button><Dialog.Title className="text-base font-bold">Complete Purchase</Dialog.Title><span className="flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" />Secure</span></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <p id="checkout-disclaimer" className="mb-5 rounded-lg bg-gold-soft p-3 text-xs font-semibold text-gold-ink">Demo payment · No money charged or bundle delivered. No real phone prompt is sent.</p>
        {stage === "details" && <div className="space-y-6">
          <section className="flex items-start justify-between gap-3 border-b border-border pb-5"><div className="min-w-0"><p className="text-xs text-muted-foreground">{bundle.network} bundle</p><h2 className="mt-1 text-xl font-bold">{bundleName(bundle)}</h2></div><span className="shrink-0 text-lg font-bold text-gold">{money(bundle.price)}</span></section>
          <section><h2 className="mb-3 text-sm font-bold">Choose Payment Method</h2><div className="grid grid-cols-2 gap-3">{(["MTN", "Airtel"] as const).map(option => <Button key={option} variant="outline" className={`h-auto min-w-0 flex-col whitespace-normal rounded-lg p-3 ${method === option ? "border-gold bg-gold-soft text-gold-ink hover:bg-gold-soft hover:text-gold-ink" : "bg-card"}`} onClick={() => setMethod(option)} aria-pressed={method === option}><span className={`network-mark ${option === "MTN" ? "network-mtn" : "network-airtel"}`}>{option === "MTN" ? <span className="rounded-full border-2 border-current px-1 italic">MTN</span> : "airtel"}</span><span className="flex items-center gap-2 text-sm font-bold">{paymentName(option)}{method === option && <Check className="size-4 shrink-0" />}</span></Button>)}</div></section>
          <section className="space-y-4 border-l-2 border-gold pl-4"><h2 className="text-lg font-bold">Where to deduct money from?</h2>
            <PhoneNumberField id="payer" label="Enter MoMo Number to PAY FROM" value={payer} onChange={setPayer} error={paymentError} helper={`This number will be charged ${money(bundle.price)} (live payments only).`} />
            {detected && detected !== "Lyca" && detected !== method && <Button variant="outline" className="border-gold text-gold" onClick={() => setMethod(detected)}>Switch to {paymentName(detected)}</Button>}
          </section>
          <section className="space-y-4 border-t border-border pt-5"><div className="flex min-h-11 items-center gap-3"><Checkbox id="same-number" className="size-6 border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-ink" checked={sameNumber} onCheckedChange={checked => setSameNumber(checked === true)} /><label htmlFor="same-number" className="text-sm font-semibold">Data bundle for same number?</label></div>
            {sameNumber ? <p className="text-xs text-muted-foreground">The payer number will also receive the data bundle.</p> : <PhoneNumberField id="recipient" label="Enter number to RECEIVE DATA BUNDLE" value={recipient} onChange={setRecipient} error={receiverError} helper="Bundle will be sent to this number" />}
          </section>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button disabled={!canPay(payer, receiver, method)} onClick={pay} className="h-14 w-full whitespace-normal rounded-lg bg-gold text-gold-ink hover:bg-gold/90">Pay {money(bundle.price)} with {paymentName(method)}</Button>
        </div>}
        {(stage === "sending" || stage === "verifying") && <div role="status" className="flex min-h-[380px] flex-col items-center justify-center gap-5 text-center">{stage === "sending" ? <Smartphone className="phone-shake size-20 text-gold" /> : <Loader2 className="size-16 animate-spin text-gold" />}<h2 className="text-2xl font-bold">{stage === "sending" ? "Sending request…" : "Verifying demo payment…"}</h2><p className="text-sm text-muted-foreground">{stage === "sending" ? `Sending MoMo request to ${purchase?.payer}…` : "Please wait…"}</p><p className="text-xs text-muted-foreground">Sandbox simulation · no real charge</p></div>}
        {stage === "pin" && purchase && <div className="space-y-5 text-center">
          <div aria-hidden="true" className="flex items-center justify-center gap-3 text-gold"><Smartphone className="size-12" /><ArrowRight className="size-8" /><RectangleEllipsis className="size-12" /></div><p className="text-sm font-extrabold text-gold">ENTER PIN ON YOUR PHONE</p><h2 className="text-2xl font-extrabold text-destructive">Check your phone NOW!</h2>
          <div className="space-y-3 rounded-lg bg-gold-soft p-4 text-left text-sm leading-6 text-gold-ink"><p className="text-xs font-extrabold">DEMO PREVIEW — no pop-up was sent</p><p>In live payments, {method} sends a pop-up to <strong>{purchase.payer}</strong>.</p><p>It says: <strong>“Pay {money(bundle.price)} to RHINO DATABANK”</strong></p><p className="font-bold">ENTER YOUR 5-DIGIT MoMo PIN on that pop-up and press OK.</p></div>
          <p className="text-sm leading-6 text-muted-foreground">For security, PIN is entered only on the MTN/Airtel prompt, not in this app.</p>
          <p role="status" className="text-sm text-muted-foreground">Waiting <strong className="text-gold">{seconds}s</strong>…</p>
          <Button className="min-h-14 w-full whitespace-normal rounded-lg bg-gold px-4 py-3 text-gold-ink hover:bg-gold/90" onClick={confirmOnPhone}>I have entered PIN on my phone</Button>
          <Button variant="outline" className="min-h-11 w-full whitespace-normal rounded-lg border-gold text-xs text-gold" onClick={confirmOnPhone}>Simulate I entered PIN</Button>
          <p className="text-xs text-muted-foreground">Both buttons simulate confirmation in this sandbox.</p>
        </div>}
        {stage === "success" && purchase && <div className="space-y-5"><CircleCheck className="mx-auto size-20 text-success" /><h2 className="text-center text-2xl font-bold">Payment Successful!</h2><p className="text-center text-sm text-muted-foreground">Demo complete — no money charged.</p><Receipt purchase={purchase} /><p className="text-xs leading-relaxed text-muted-foreground">Live delivery target: 2–5 minutes with SMS confirmation. Demo bundles are not delivered.</p><Button className="h-12 w-full bg-gold text-gold-ink hover:bg-gold/90" onClick={() => setStage("receipt")}>View Receipt</Button><Button variant="outline" className="h-12 w-full" onClick={onClose}>Buy Another</Button><Button variant="ghost" asChild className="h-12 w-full"><Link to="/dashboard" onClick={onClose}>Go Home</Link></Button></div>}
        {stage === "failed" && <div className="space-y-5 py-10 text-center"><CircleX className="mx-auto size-20 text-destructive" /><h2 className="text-2xl font-bold">Payment Failed</h2><p className="text-sm text-muted-foreground">{purchase?.reason === "Payment request expired" ? "Payment request expired. No money charged." : "Demo payment could not be completed. No money charged."}</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button className="h-14 w-full bg-gold text-gold-ink hover:bg-gold/90" onClick={() => { setStage("details"); setError(""); }}>Try Again</Button><Button variant="outline" className="h-12 w-full" onClick={() => { setStage("details"); setPayer(""); setError(""); }}>Change Number</Button></div>}
        {stage === "receipt" && purchase && <Receipt purchase={purchase} />}
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
