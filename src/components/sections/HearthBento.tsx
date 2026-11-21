"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import EmberSchematic from "@/components/svg/EmberSchematic";
import AgingChamberSchematic from "@/components/svg/AgingChamberSchematic";
import StonewareSchematic from "@/components/svg/StonewareSchematic";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: "embers",
    code: "FIG. 1",
    title: "Coffee-Wood & Coconut-Shell Embers",
    desc: "A blend of Robusta coffee wood and coconut-shell coals achieves the 680 °C radiant core with zero acrid phenol — only stone-fruit and caramel volatiles.",
    Schematic: EmberSchematic,
    span: "col-span-1",
  },
  {
    id: "aging",
    code: "FIG. 2",
    title: "Dry-Aging Microclimate Chamber",
    desc: "Himalayan salt walls, 2 °C ambient, 78 % relative humidity, 0.5 m/s laminar airflow. 45 days of enzymatic transformation under total control.",
    Schematic: AgingChamberSchematic,
    span: "col-span-1",
  },
  {
    id: "stoneware",
    code: "FIG. 3",
    title: "Hand-Thrown Lombok Stoneware",
    desc: "Each plate is wheel-thrown from Lombok stoneware clay, fired to Cone 10 at 1,280 °C, and finished with a rice-husk ash glaze. Diameter 28 cm, wall depth 3.2 cm.",
    Schematic: StonewareSchematic,
    span: "col-span-1 sm:col-span-2",
  },
] as const;

export default function HearthBento() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = { trigger: sectionRef.current!, start: "top 80%", once: true };

      gsap.fromTo(".hearth-eyebrow",
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", scrollTrigger: st }
      );

      gsap.fromTo(".hearth-heading",
        { y: "105%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { ...st, start: "top 78%" } }
      );

      gsap.fromTo(".hearth-copy",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { ...st, start: "top 75%" } }
      );

      // Bento cards stagger with alternating directions
      gsap.fromTo(".hearth-card",
        { opacity: 0, y: 32, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          stagger: { each: 0.14, from: "start" },
          duration: 0.7, ease: "power3.out", clearProps: "transform",
          scrollTrigger: { ...st, start: "top 72%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="hearth" className="py-24 md:py-32 scroll-mt-24">
      <div className="max-w-xl px-6 md:px-10">
        <div className="hearth-eyebrow flex items-center gap-3 mb-4 opacity-0">
          <span className="brass-rule" />
          <span className="telemetry text-brass">The Hearth &amp; Craft</span>
        </div>

        <div className="overflow-hidden mb-4">
          <h2
            className="hearth-heading text-5xl md:text-6xl font-light text-ink-primary opacity-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built from&nbsp;
            <em className="font-semibold not-italic">First Principles</em>
          </h2>
        </div>

        <p className="hearth-copy text-ink-muted leading-relaxed mb-12 max-w-md opacity-0">
          The fire, the aging, and the vessel are not set-dressing — they are
          the technique. Each is engineered to a specification and held to it
          every service.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          {CARDS.map(({ id, code, title, desc, Schematic, span }) => (
            <div
              key={id}
              className={`hearth-card glass-card p-5 flex flex-col gap-4 rounded-xl opacity-0 ${span}`}
            >
              <div className="flex items-center gap-2">
                <span className="telemetry text-brass">{code}</span>
                <span className="brass-rule flex-1 opacity-40" />
              </div>
              <div className="w-full text-ink-muted" style={{ aspectRatio: "4/3" }}>
                <Schematic />
              </div>
              <div>
                <h3
                  className="text-xl font-semibold text-ink-primary mb-2 leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
