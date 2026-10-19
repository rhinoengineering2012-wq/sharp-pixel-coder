import { detectNetwork } from "@/lib/purchases";

export function PhoneNumberField({ id, label, value, onChange, error, helper }: {
  id: string; label: string; value: string; onChange: (phone: string) => void; error: string; helper: string;
}) {
  const network = detectNetwork(value);
  return <div>
    <label htmlFor={id} className="mb-2 block text-sm font-bold">{label}</label>
    <div className="relative">
      <input id={id} className="pro-input momo-input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="07XX XXX XXX" value={value} onChange={event => onChange(event.target.value.replace(/\D/g, "").slice(0, 10))} aria-invalid={Boolean(error)} aria-describedby={`${id}-helper${error ? ` ${id}-error` : ""}`} />
      {network && <span aria-label={`Detected network: ${network}`} className={`network-mark pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${network === "MTN" ? "network-mtn" : network === "Airtel" ? "network-airtel" : "network-lyca"}`}>{network === "MTN" ? <span className="rounded-full border-2 border-current px-1 italic">MTN</span> : network === "Airtel" ? "airtel" : "Lyca"}</span>}
    </div>
    <p id={`${id}-helper`} className="mt-2 text-xs text-muted-foreground">{helper}</p>
    {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
  </div>;
}