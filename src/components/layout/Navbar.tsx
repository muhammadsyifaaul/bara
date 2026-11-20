"use client";

import { useEffect, useRef } from "react";
import { useBaraStore, type Ambiance } from "@/store/bara";

const NAV_LINKS = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Tasting Menu", href: "#tasting-menu" },
  { label: "The Hearth", href: "#hearth" },
  { label: "Reserve", href: "#reserve" },
];

export default function Navbar() {
  const { ambiance, setAmbiance, toggleCloche, clocheOpen } = useBaraStore();
  const navRef = useRef<HTMLElement>(null);

  // Scroll-driven backdrop opacity
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const handler = () => {
      const scrolled = window.scrollY > 20;
      el.classList.toggle("shadow-sm", scrolled);
      el.style.setProperty(
        "--nav-opacity",
        scrolled ? "0.95" : "0.72"
      );
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      ref={navRef}
      style={{ "--nav-opacity": "0.72" } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center px-6 md:px-10
                 backdrop-blur-[18px] border-b
                 border-[rgba(120,72,40,0.12)]
                 bg-[rgba(255,252,247,var(--nav-opacity))]
                 transition-shadow duration-300
                 [html[data-theme=dinner]_&]:bg-[rgba(28,19,14,var(--nav-opacity))]
                 [html[data-theme=dinner]_&]:border-[rgba(217,130,54,0.18)]"
    >
      {/* ── Wordmark ───────────────────────────────────────────────── */}
      <a
        href="#"
        className="flex-shrink-0 flex flex-col leading-none mr-auto"
        aria-label="BARA home"
      >
        <span
          className="text-2xl font-semibold tracking-[0.18em] text-ink-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          BARA
        </span>
        <span className="telemetry text-ink-muted mt-[2px]">
          Wood-Fired Gastronomy
        </span>
      </a>

      {/* ── Smooth-scroll anchor links (desktop) ───────────────────── */}
      <nav className="hidden md:flex items-center gap-7 mx-auto">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-sm font-medium text-ink-muted hover:text-brass
                       transition-colors duration-200 tracking-wide"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* ── Right controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Ambiance toggle */}
        <div
          className="hidden sm:flex items-center glass-card px-1 py-1 gap-1 rounded-full"
          role="group"
          aria-label="Ambiance mode"
        >
          {(["lunch", "dinner"] as Ambiance[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setAmbiance(mode)}
              className={`telemetry px-3 py-1 rounded-full transition-all duration-300 capitalize
                ${ambiance === mode
                  ? "bg-[var(--color-brass)] text-white shadow-sm"
                  : "text-ink-muted hover:text-ink-primary"
                }`}
            >
              {mode === "lunch" ? "Lunch" : "Dinner"}
            </button>
          ))}
        </div>

        {/* Lift Cloche button */}
        <button
          onClick={toggleCloche}
          className="telemetry glass-card px-4 py-2 text-brass border-[var(--color-brass)]
                     hover:bg-[var(--color-brass)] hover:text-white
                     transition-all duration-300 rounded-lg flex items-center gap-2"
          aria-label={clocheOpen ? "Lower Cloche" : "Lift Cloche"}
        >
          <span className="text-base leading-none">◎</span>
          <span>{clocheOpen ? "Lower Cloche" : "Lift Cloche"}</span>
        </button>
      </div>
    </header>
  );
}
