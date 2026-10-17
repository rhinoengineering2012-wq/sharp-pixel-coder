import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Fingerprint, Gift, Mail, User, CheckSquare, Square } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Frame, PrimaryButton } from "@/components/rhino/AppFrame";
import { haptic } from "@/lib/store";

const BG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Create Account — RHINO DATABANK" },
      { name: "description", content: "Open your bank-grade data vault in seconds." },
      { property: "og:title", content: "Create Account — RHINO DATABANK" },
      { property: "og:description", content: "Sign up with your Ugandan number and start saving data." },
    ],
  }),
  component: Login,
});

function Field({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-[14px] border border-input bg-card px-4 focus-within:border-primary">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      {children}
    </label>
  );
}
const inputCls = "h-full flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-foreground";

function Login() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [phone, setPhone] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    haptic();
    if (phone.replace(/\D/g, "").length < 9) { toast.error("Enter a valid phone number"); return; }
    if (!agree) { toast.error("Please accept the Terms"); return; }
    nav({ to: "/dashboard" });
  };
  return (
    <Frame className="bg-card pb-10">
      <div className="relative h-[180px] overflow-hidden rounded-b-[32px] bg-gradient-primary">
        <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="relative flex h-full flex-col justify-end p-6">
          <h1 className="text-[28px] font-extrabold text-primary-foreground">Welcome Back</h1>
          <p className="text-sm text-primary-foreground/80">Secure Bank-Grade Data Bank</p>
        </div>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 p-6">
        <Field>
          <span className="text-lg">🇺🇬</span>
          <span className="font-bold text-ink">+256</span>
          <input inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="771 234 567" className={inputCls} />
        </Field>
        <Field icon={<User className="h-5 w-5" />}><input placeholder="Full Name" className={inputCls} /></Field>
        <Field icon={<Mail className="h-5 w-5" />}><input type="email" placeholder="Email" className={inputCls} /></Field>
        <Field>
          <input type={show ? "text" : "password"} placeholder="Password" className={inputCls} />
          <button type="button" aria-label="Toggle password" onClick={() => setShow(!show)} className="text-muted-foreground">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </Field>
        <Field icon={<Gift className="h-5 w-5" />}><input placeholder="Referral code (optional) RHINO-XXX" className={inputCls} /></Field>
        <button type="button" onClick={() => setAgree(!agree)} className="flex items-center gap-2 text-xs text-muted-foreground">
          {agree ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
          I agree to Terms and Privacy
        </button>
        <PrimaryButton type="submit"><Fingerprint className="h-5 w-5" />Create Account</PrimaryButton>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />Or<span className="h-px flex-1 bg-border" /></div>
        <button type="button" onClick={() => nav({ to: "/dashboard" })} className="flex h-14 items-center justify-center gap-3 rounded-[14px] border border-input bg-card font-semibold text-ink">
          <span className="text-lg font-extrabold text-primary">G</span>Sign in with Google
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <button type="button" onClick={() => nav({ to: "/dashboard" })} className="font-bold text-primary">Sign In</button>
        </p>
      </form>
    </Frame>
  );
}
