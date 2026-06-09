import { useEffect, useRef, useState, type ReactNode } from "react";
import { Truck } from "../icons";

const HASH = "7e11bc65a7852d1c5833549ad3a1bbc743deac167c2f18ae11b7b2784dd8d00d";
export const AUTH_KEY = "vydelkomat_auth_v1";

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(() => sessionStorage.getItem(AUTH_KEY) === "1");
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authed) ref.current?.focus();
  }, [authed]);

  if (authed) return <>{children}</>;

  const submit = async () => {
    setPending(true);
    setErr(false);
    const h = await sha256(val);
    if (h === HASH) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
    } else {
      setErr(true);
      setVal("");
      ref.current?.focus();
    }
    setPending(false);
  };

  return (
    <div className="od-gate">
      <div className="od-gate-card">
        <div className="od-gate-ico"><Truck size={32} /></div>
        <h1>Vydělkomat</h1>
        <p>Zadejte heslo pro vstup do aplikace.</p>
        <input
          ref={ref}
          className={"od-gate-input mono" + (err ? " is-err" : "")}
          type="password"
          placeholder="Heslo"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            if (err) setErr(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && val && !pending && submit()}
          autoComplete="current-password"
        />
        {err && <p className="od-gate-err">Špatné heslo, zkuste to znovu.</p>}
        <button className="od-gate-btn" onClick={submit} disabled={!val || pending}>
          {pending ? "…" : "Pokračovat"}
        </button>
      </div>
    </div>
  );
}
