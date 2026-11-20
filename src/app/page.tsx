"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useBaraStore } from "@/store/bara";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Philosophy from "@/components/sections/Philosophy";
import TastingMenu from "@/components/sections/TastingMenu";
import HearthBento from "@/components/sections/HearthBento";
import Reservation from "@/components/sections/Reservation";

// Dynamic import with ssr:false — R3F Canvas requires browser globals (WebGL)
const SceneCanvas = dynamic(
  () => import("@/components/canvas/SceneCanvas"),
  { ssr: false, loading: () => null }
);

export default function Home() {
  const { ambiance } = useBaraStore();

  // Keep <html data-theme> in sync on first mount and whenever ambiance changes
  useEffect(() => {
    document.documentElement.dataset.theme =
      ambiance === "dinner" ? "dinner" : "";
  }, [ambiance]);

  return (
    <>
      {/*
       * z-0 — persistent fixed 3D canvas mounted behind all UI.
       * Framed to the right half of the viewport inside SceneCanvas.
       */}
      <SceneCanvas />

      {/* ── Fixed chrome (z-30) ────────────────────────────────────── */}
      <Navbar />

      {/*
       * z-10 — scrollable UI layer.
       * Every section constrains content to max-w-xl (left column) so
       * the right viewport stays clear for the 3D Chef's Counter scene.
       */}
      <main className="relative z-10">
        <Hero />
        <Philosophy />
        <TastingMenu />
        <HearthBento />
        <Reservation />
      </main>

      <Footer />
    </>
  );
}
