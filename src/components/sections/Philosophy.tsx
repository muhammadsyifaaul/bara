"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const METRICS = [
  {
    value: "680°C",
    label: "Open-Hearth Ember Core",
    desc: "Coffee wood and coconut-shell coals sustain a constant 680 °C radiant core — the precise temperature at which the Maillard reaction peaks without charring.",
    code: "HEARTH TEMP",
  },
  {
    value: "45 Days",
    label: "In-House Dry-Aging",
    desc: "Every cut is dry-aged in our custom microclimate chamber — humidity-controlled himalayan salt walls, airflow at 0.5 m/s, 2 °C ambient — until enzymatic breakdown reaches its flavour zenith.",
    code: "DRY-AGE CYCLE",
  },
  {
    value: "8 Seats",
    label: "Intimate Counter Service",
    desc: "A single counter of eight places faces the open hearth directly. No pass, no distance — the cook's hand sets the plate before you while the dish is still alive with heat.",
    code: "COUNTER CAPACITY",
  },
];

export default function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = { trigger: sectionRef.current!, start: "top 80%", once: true };

      gsap.fromTo(".phil-eyebrow",
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.55, ease: "power2.out", scrollTrigger: st }
      );

      gsap.fromTo(".phil-heading",
        { y: "105%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { ...st, start: "top 78%" } }
      );

      gsap.fromTo(".phil-copy",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { ...st, start: "top 75%" } }
      );

      // Stagger the 3 horizontal cards — slide up from y:24
      gsap.fromTo(".phil-card",
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.12,
          duration: 0.6,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { ...st, start: "top 70%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="py-20 md:py-28 scroll-mt-20"
    >
      <div className="max-w-xl px-6 md:px-10">

        {/* Eyebrow */}
        <div className="phil-eyebrow flex items-center gap-3 mb-4 opacity-0">
          <span className="brass-rule" />
          <span className="telemetry text-brass">Culinary Philosophy</span>
        </div>

        {/* Heading */}
        <div className="overflow-hidden mb-5">
          <h2
            className="phil-heading text-5xl md:text-6xl font-light text-ink-primary opacity-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Art of&nbsp;
            <em className="font-semibold not-italic">Restraint</em>
          </h2>
        </div>

        {/* Body copy — tightened bottom margin */}
        <p className="phil-copy text-ink-muted leading-relaxed mb-8 max-w-md opacity-0">
          We source a single protein per week from farms within 300 km. The
          hearth, the aging chamber, and the hands of one chef are the only
          transformations it undergoes. Nothing is hidden; everything is
          intentional.
        </p>

        {/* ── Horizontal metric card stack ──────────────────────────── */}
        <div className="grid grid-cols-1 gap-3.5">
          {METRICS.map(({ value, label, desc, code }) => (
            <div
              key={code}
              className="phil-card glass-card flex flex-col sm:flex-row sm:items-center
                         gap-4 sm:gap-5 p-5 opacity-0"
            >
              {/* Left stat column — fixed width, no wrapping */}
              <div className="sm:w-44 shrink-0">
                <span className="telemetry text-brass block mb-1">{code}</span>
                <p
                  className="text-4xl font-semibold text-ink-primary leading-none
                             whitespace-nowrap mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value}
                </p>
                <p className="text-xs font-semibold text-ink-primary tracking-wide leading-snug">
                  {label}
                </p>
              </div>

              {/* Vertical hairline divider (desktop only) */}
              <div className="hidden sm:block w-px self-stretch opacity-20 bg-current" />

              {/* Right description column */}
              <p className="flex-1 text-sm text-ink-muted leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
