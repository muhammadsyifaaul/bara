"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { cameraProxyRef } from "@/components/canvas/SceneCanvas";
import { useBaraStore } from "@/store/bara";

gsap.registerPlugin(ScrollTrigger);

/**
 * Camera waypoints:
 *
 * HERO          — low eye-level across counter, cloche at rest
 *   pos  [0.0, 1.05, 4.2]   target [0.0, 0.25, 0.0]
 *
 * PHILOSOPHY    — elevated 3/4 chef's inspection, cloche open
 *   pos  [0.4, 2.20, 3.4]   target [0.1, 0.55, 0.0]
 *
 * TASTING MENU  — macro close-up beside course card
 *   pos  [0.5, 1.25, 2.4]   target [0.1, 0.35, 0.0]
 *
 * HEARTH/RESERVE — pull-back to warm full-counter framing
 *   pos  [-0.1, 1.40, 4.6]  target [0.0, 0.20, 0.0]
 */

interface Waypoint {
  posX: number; posY: number; posZ: number;
  targetX: number; targetY: number; targetZ: number;
}

const WP: Record<string, Waypoint> = {
  hero:        { posX:  0.0, posY: 1.05, posZ: 4.2, targetX:  0.0, targetY: 0.25, targetZ: 0.0 },
  philosophy:  { posX:  0.4, posY: 2.20, posZ: 3.4, targetX:  0.1, targetY: 0.55, targetZ: 0.0 },
  tastingMenu: { posX:  0.5, posY: 1.25, posZ: 2.4, targetX:  0.1, targetY: 0.35, targetZ: 0.0 },
  hearth:      { posX: -0.1, posY: 1.40, posZ: 4.6, targetX:  0.0, targetY: 0.20, targetZ: 0.0 },
};

export function useScrollCamera() {
  useEffect(() => {
    // Seed proxy at hero position immediately
    Object.assign(cameraProxyRef, WP.hero);

    const store = useBaraStore.getState;

    const ctx = gsap.context(() => {

      // ── Camera scrub: Hero → Philosophy ─────────────────────────────────
      gsap.to(cameraProxyRef, {
        ...WP.philosophy,
        ease: "none",
        scrollTrigger: {
          trigger: "#philosophy",
          start:   "top bottom",
          end:     "top top",
          scrub:   1.2,
        },
      });

      // ── Camera scrub: Philosophy → Tasting Menu ─────────────────────────
      gsap.to(cameraProxyRef, {
        ...WP.tastingMenu,
        ease: "none",
        scrollTrigger: {
          trigger: "#tasting-menu",
          start:   "top bottom",
          end:     "top top",
          scrub:   1.2,
        },
      });

      // ── Camera scrub: Tasting Menu → Hearth ─────────────────────────────
      gsap.to(cameraProxyRef, {
        ...WP.hearth,
        ease: "none",
        scrollTrigger: {
          trigger: "#hearth",
          start:   "top bottom",
          end:     "top top",
          scrub:   1.2,
        },
      });

      // ── Cloche: auto-open on entering Philosophy ─────────────────────────
      // Opens as user scrolls past the Hero boundary; closes when scrolling
      // back above Hero top. Manual clicks still take priority because they
      // write directly to the same Zustand flag — the next scroll event will
      // reconcile, which is intentional (scroll wins on deliberate navigation).
      ScrollTrigger.create({
        trigger:  "#philosophy",
        start:    "top 85%",    // open just before philosophy is fully in view
        end:      "top top",
        // onEnter: scroll down past threshold → open
        onEnter:  () => { store().openCloche(); },
        // onLeaveBack: scroll back above hero → close
        onLeaveBack: () => {
          // Only close when back near the very top (Hero section)
          if (window.scrollY < window.innerHeight * 0.5) {
            store().closeCloche();
          }
        },
      });

      // ── Cloche: keep open through Tasting Menu ───────────────────────────
      ScrollTrigger.create({
        trigger:     "#tasting-menu",
        start:       "top 85%",
        onEnter:     () => { store().openCloche(); },
        // Don't close when leaving tasting menu downward — user may still
        // want to see dishes in hearth section. Close handled by hero trigger.
      });

      // ── Cloche: close when user scrolls all the way back to Hero top ─────
      ScrollTrigger.create({
        trigger:     "#hero",
        start:       "top top",
        end:         "bottom top",
        // onLeave fires when hero scrolls out of view going DOWN — no-op
        // onEnterBack fires when user scrolls back UP into hero
        onEnterBack: () => { store().closeCloche(); },
      });

    });

    return () => ctx.revert();
  }, []);
}
