"use client";

import { useState, useEffect } from "react";

type Seating = "18:00" | "20:30";
type PartySize = 1 | 2 | 3 | 4 | 5 | 6;

interface FormState {
  date: string;
  partySize: PartySize;
  seating: Seating;
  name: string;
  email: string;
}

const INITIAL: FormState = {
  date: "",
  partySize: 2,
  seating: "18:00",
  name: "",
  email: "",
};

export default function Reservation() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "submitting" | "confirmed">("idle");
  const [minDate, setMinDate] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Derive minDate on client only — avoids Next.js prerender guard
  useEffect(() => {
    setMinDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    // Simulate async confirmation (Phase 3 will wire real API)
    setTimeout(() => setStatus("confirmed"), 1200);
  };

  const labelCls =
    "telemetry text-ink-muted mb-1.5 block";
  const inputCls =
    "w-full glass-card px-4 py-3 text-sm text-ink-primary rounded-lg " +
    "border border-transparent focus:border-[var(--color-brass)] " +
    "outline-none transition-colors duration-200 bg-transparent " +
    "placeholder:text-ink-muted/50";

  return (
    <section id="reserve" className="py-24 md:py-32 scroll-mt-20">
      <div className="max-w-xl px-6 md:px-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="brass-rule" />
          <span className="telemetry text-brass">Table Reservation</span>
        </div>

        <h2
          className="text-5xl md:text-6xl font-light text-ink-primary mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Secure Your&nbsp;
          <em className="font-semibold not-italic">Seat</em>
        </h2>
        <p className="text-ink-muted leading-relaxed mb-10 max-w-md">
          Eight seats, two seatings per evening. Reservations are confirmed
          instantly — dietary requirements can be noted on arrival.
        </p>

        {status === "confirmed" ? (
          /* ── Confirmation state ──────────────────────────────── */
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-4xl mb-4">◎</div>
            <h3
              className="text-2xl font-semibold text-brass mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reservation Confirmed
            </h3>
            <p className="text-ink-muted text-sm mb-1">
              <span className="telemetry text-brass">GUEST</span>{" "}
              {form.name}
            </p>
            <p className="text-ink-muted text-sm mb-1">
              <span className="telemetry text-brass">DATE</span>{" "}
              {form.date}
            </p>
            <p className="text-ink-muted text-sm mb-1">
              <span className="telemetry text-brass">SEATING</span>{" "}
              {form.seating} · {form.partySize}{" "}
              {form.partySize === 1 ? "Guest" : "Guests"}
            </p>
            <p className="text-xs text-ink-muted mt-4 opacity-60">
              A confirmation will be sent to {form.email}
            </p>
            <button
              onClick={() => { setForm(INITIAL); setStatus("idle"); }}
              className="mt-6 telemetry text-brass hover:underline"
            >
              Make another reservation →
            </button>
          </div>
        ) : (
          /* ── Reservation form ────────────────────────────────── */
          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
              {/* Date */}
              <div>
                <label className={labelCls}>DATE</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  min={minDate || undefined}
                  onChange={(e) => set("date", e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Party size */}
              <div>
                <label className={labelCls}>PARTY SIZE</label>
                <div className="flex gap-2 flex-wrap">
                  {([1, 2, 3, 4, 5, 6] as PartySize[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("partySize", n)}
                      className={`flex-1 min-w-[2.4rem] py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 glass-card
                        ${form.partySize === n
                          ? "bg-[var(--color-brass)] text-white border-transparent"
                          : "text-ink-muted hover:text-brass"
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating time */}
              <div className="sm:col-span-2">
                <label className={labelCls}>SEATING</label>
                <div className="grid grid-cols-2 gap-3 items-stretch">
                  {(["18:00", "20:30"] as Seating[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("seating", s)}
                      className={`glass-card py-3 px-4 rounded-lg text-left transition-all duration-200
                        ${form.seating === s
                          ? "border-[var(--color-brass)] shadow-sm"
                          : "hover:border-[rgba(200,138,54,0.4)]"
                        }`}
                      style={form.seating === s ? { borderColor: "var(--color-brass)" } : {}}
                    >
                      <p className="telemetry text-brass">{s}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {s === "18:00" ? "First Seating" : "Second Seating"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>GUEST NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>EMAIL</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-4 rounded-lg bg-[var(--color-brass)] text-white
                           font-semibold text-sm tracking-wide
                           hover:brightness-110 disabled:opacity-60
                           transition-all duration-200 shadow-md"
              >
                {status === "submitting" ? "Confirming…" : "Confirm Reservation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
