"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useBaraStore } from "@/store/bara";

gsap.registerPlugin(ScrollTrigger);

const BADGES = [
  "680°C Coffee-Wood Hearth",
  "45-Day Dry-Aged",
  "8-Seat Chef's Counter",
];

export default function Hero() {
  const { openCloche } = useBaraStore();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      // Brass rule slides in
      tl.fromTo(".hero-rule",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.6, ease: "power2.out" }
      );

      // Telemetry label fades up
      tl.fromTo(".hero-telemetry",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );

      // Headline — masked line reveal (each line clips up from overflow:hidden wrapper)
      tl.fromTo(".hero-headline",
        { y: "105%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.9, ease: "power3.out" },
        "-=0.2"
      );

      // Sub-copy
      tl.fromTo(".hero-copy",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", clearProps: "transform" },
        "-=0.5"
      );

      // Badges stagger
      tl.fromTo(".hero-badge",
        { opacity: 0, y: 10, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.45, ease: "power2.out", clearProps: "transform" },
        "-=0.4"
      );

      // CTA buttons
      tl.fromTo(".hero-cta",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out", clearProps: "transform" },
        "-=0.3"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center pt-16"
    >
      <div className="relative z-10 max-w-xl px-6 md:px-10 py-12 md:py-16">
        {/* Pre-heading telemetry */}
        <div className="flex items-center gap-3 mb-4">
          <span className="brass-rule hero-rule" />
          <span className="telemetry text-brass hero-telemetry opacity-0">
            Open-Hearth Chef&apos;s Table · Senopati, Jakarta
          </span>
        </div>

        {/* Headline — overflow hidden wrapper for mask reveal */}
        <div className="overflow-hidden mb-4">
          <h1
            className="hero-headline text-5xl md:text-6xl lg:text-7xl font-light text-ink-primary
                       leading-[1.0] opacity-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fire,
            <br />
            <em className="font-semibold not-italic text-brass">Patience,</em>
            <br />
            and the&nbsp;Honest&nbsp;Plate.
          </h1>
        </div>

        <p className="hero-copy text-sm md:text-base text-ink-muted leading-relaxed mb-5 max-w-sm opacity-0">
          Every course emerges from a single living hearth — coffee wood and
          coconut-shell coals held at 680 °C, coaxing flavour that no other
          heat source can render.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="hero-badge telemetry glass-card px-3 py-1 text-ink-muted rounded-full
                         text-[0.6rem] opacity-0"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="#reserve"
            className="hero-cta inline-flex items-center gap-2 px-6 py-3 rounded-lg
                       bg-[var(--color-brass)] text-white font-semibold text-sm
                       hover:brightness-110 transition-all duration-200 shadow-md opacity-0"
          >
            Reserve a Seat <span className="text-xs opacity-80">→</span>
          </a>
          <a
            href="#tasting-menu"
            onClick={(e) => {
              e.preventDefault();
              openCloche();
              document.getElementById("tasting-menu")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hero-cta inline-flex items-center gap-2 px-6 py-3 rounded-lg
                       glass-card text-brass font-semibold text-sm
                       hover:bg-[rgba(200,138,54,0.1)] transition-all duration-200 opacity-0"
          >
            Explore Tasting Menu <span className="text-xs opacity-80">↓</span>
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg-primary))" }}
      />
    </section>
  );
}
