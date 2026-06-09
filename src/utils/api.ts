import type { Entry } from "../types";
import { AUTH_PW_KEY } from "../components/PasswordGate";

const headers = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem(AUTH_PW_KEY) ?? ""}`,
});

export async function apiList(): Promise<Entry[]> {
  const r = await fetch("/api/entries", { headers: headers() });
  if (!r.ok) throw new Error(`GET /api/entries → ${r.status}`);
  return (await r.json()) as Entry[];
}

export async function apiUpsert(e: Entry): Promise<void> {
  const r = await fetch("/api/entries", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(e),
  });
  if (!r.ok) throw new Error(`POST /api/entries → ${r.status}`);
}

export async function apiDelete(id: string): Promise<void> {
  const r = await fetch(`/api/entries?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!r.ok) throw new Error(`DELETE /api/entries → ${r.status}`);
}
