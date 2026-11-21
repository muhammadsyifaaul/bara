"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { cameraProxyRef } from "@/components/canvas/SceneCanvas";
import { useBaraStore } from "@/store/bara";

gsap.registerPlugin(ScrollTrigger);

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
    Object.assign(cameraProxyRef, WP.hero);

    const store = useBaraStore.getState;

    const ctx = gsap.context(() => {

      // ── Camera scrubs ──────────────────────────────────────────────────
      gsap.to(cameraProxyRef, {
        ...WP.philosophy, ease: "none",
        scrollTrigger: { trigger: "#philosophy", start: "top bottom", end: "top top", scrub: 1.2 },
      });
      gsap.to(cameraProxyRef, {
        ...WP.tastingMenu, ease: "none",
        scrollTrigger: { trigger: "#tasting-menu", start: "top bottom", end: "top top", scrub: 1.2 },
      });
      gsap.to(cameraProxyRef, {
        ...WP.hearth, ease: "none",
        scrollTrigger: { trigger: "#hearth", start: "top bottom", end: "top top", scrub: 1.2 },
      });

      // ── Cloche: auto-open ONLY inside #tasting-menu ────────────────────
      //
      // onEnter      (scroll DOWN into tasting-menu)  → open
      // onEnterBack  (scroll UP back into tasting-menu) → open
      // onLeave      (scroll DOWN out of tasting-menu) → close
      // onLeaveBack  (scroll UP out of tasting-menu)   → close
      //
      // Manual clicks on the 3D dome or the [LIFT CLOCHE] button call
      // toggleCloche() directly and are NOT overridden until the user
      // crosses the #tasting-menu boundary again.
      ScrollTrigger.create({
        trigger:      "#tasting-menu",
        start:        "top 80%",
        end:          "bottom 20%",
        onEnter:      () => { store().openCloche(); },
        onEnterBack:  () => { store().openCloche(); },
        onLeave:      () => { store().closeCloche(); },
        onLeaveBack:  () => { store().closeCloche(); },
      });

    });

    return () => ctx.revert();
  }, []);
}
