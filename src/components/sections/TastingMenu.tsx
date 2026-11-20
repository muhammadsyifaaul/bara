"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useBaraStore, type CourseIndex } from "@/store/bara";

gsap.registerPlugin(ScrollTrigger);

const COURSES = [
  {
    index: 0 as CourseIndex,
    code: "COURSE 01",
    name: "Wood-Fired Dry-Aged Duck Breast",
    technique: "680°C Radiant Sear · Coffee-Wood Smoke",
    ingredients: [
      "45-Day Dry-Aged Muscovy Duck",
      "Fermented Black Cherry Reduction",
      "Compressed Endive & Sorrel Oil",
      "Micro Shiso & Duck-Fat Crouton",
    ],
    smokePairing: "Light Robusta Cherry-Wood — stone-fruit volatiles, low phenol",
    sommelierPairing: "2021 Domaine Drouhin Pinot Noir, Willamette Valley",
    teaPairing: "Aged Yunnan Pu-Erh — forest floor, leather, stone cherry",
    aromaIntensity: 72,
  },
  {
    index: 1 as CourseIndex,
    code: "COURSE 02",
    name: "Charred Hokkaido Scallop & Yuzu Butter",
    technique: "Cast-Iron Plancha · Coconut-Shell Coal",
    ingredients: [
      "Hokkaido Day-Boat Scallops (U/10)",
      "Saffron Yuzu Beurre Blanc",
      "Sea-Foam Pearl Caviar",
      "Gold-Leaf Dashi Gel & Ikura",
    ],
    smokePairing: "Coconut-Shell Coals — neutral heat, zero phenol, clean sweet char",
    sommelierPairing: "2022 Domaine Leflaive Puligny-Montrachet",
    teaPairing: "High-Mountain Taiwanese Oolong — honeysuckle, cream, mild citrus",
    aromaIntensity: 58,
  },
  {
    index: 2 as CourseIndex,
    code: "COURSE 03",
    name: "Smoked Wagyu Short Rib & Black Garlic",
    technique: "12-Hour Low & Slow · Hardwood Embers",
    ingredients: [
      "BMS 9+ Wagyu Short Rib (Bone-In)",
      "48-Hour Black Garlic Purée",
      "Pickled Cipollini & Bone-Marrow Jus",
      "Truffle-Infused Potato Cloud",
    ],
    smokePairing: "Dense Mahogany Hardwood — deep vanillin, camphor, umami phenols",
    sommelierPairing: "2018 Château Léoville-Barton, Saint-Julien",
    teaPairing: "Da Hong Pao Wuyi Rock Oolong — roasted mineral, dark caramel",
    aromaIntensity: 95,
  },
  {
    index: 3 as CourseIndex,
    code: "COURSE 04",
    name: "Burnt Honey & Matcha Mille-Feuille",
    technique: "Copper Salamander · Precision Caramel",
    ingredients: [
      "Laminated Kouign-Amann Pastry",
      "Ceremonial-Grade Matcha Cream",
      "Burnt Acacia Honey Caramel",
      "Caramelised Honey Tuile Shard",
    ],
    smokePairing: "Lychee Wood Chips — floral, light smoke, tropical ester finish",
    sommelierPairing: "NV Billecart-Salmon Blanc de Blancs Brut",
    teaPairing: "Gyokuro Shade-Grown Green Tea — umami, grass, sweet oceanic finish",
    aromaIntensity: 44,
  },
] as const;

function AromaBar({ intensity }: { intensity: number }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="telemetry text-ink-muted">AROMA INTENSITY</span>
        <span className="telemetry text-brass">{intensity} / 100</span>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(120,72,40,0.15)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-brass)] transition-all duration-700 ease-out"
          style={{ width: `${intensity}%` }}
        />
      </div>
    </div>
  );
}

export default function TastingMenu() {
  const { activeCourse, setActiveCourse, openCloche } = useBaraStore();
  const course = COURSES[activeCourse];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = { trigger: sectionRef.current!, start: "top 80%", once: true };

      gsap.fromTo(".tm-eyebrow",
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", scrollTrigger: st }
      );

      gsap.fromTo(".tm-heading",
        { y: "105%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { ...st, start: "top 78%" } }
      );

      gsap.fromTo(".tm-copy",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { ...st, start: "top 75%" } }
      );

      // Course tab cards stagger
      gsap.fromTo(".tm-tab",
        { opacity: 0, y: 18, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.09, duration: 0.55, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { ...st, start: "top 72%" },
        }
      );

      // Detail card
      gsap.fromTo(".tm-detail",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform",
          scrollTrigger: { ...st, start: "top 68%" } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSelectCourse = (idx: CourseIndex) => {
    setActiveCourse(idx);
    openCloche();
  };

  return (
    <section ref={sectionRef} id="tasting-menu" className="py-24 md:py-32 scroll-mt-20">
      <div className="max-w-xl px-6 md:px-10">
        <div className="tm-eyebrow flex items-center gap-3 mb-4 opacity-0">
          <span className="brass-rule" />
          <span className="telemetry text-brass">4-Course Tasting Menu</span>
        </div>

        <div className="overflow-hidden mb-4">
          <h2
            className="tm-heading text-5xl md:text-6xl font-light text-ink-primary opacity-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The&nbsp;<em className="font-semibold not-italic">Progression</em>
          </h2>
        </div>

        <p className="tm-copy text-ink-muted leading-relaxed mb-10 max-w-md opacity-0">
          Four courses, one hearth. Each dish arrives in sequence, paced by the
          fire itself — never rushed, never held.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 items-stretch">
          {COURSES.map(({ index, code, name }) => (
            <button
              key={code}
              onClick={() => handleSelectCourse(index)}
              className={`tm-tab glass-card p-3 text-left rounded-lg transition-all duration-300
                flex flex-col gap-1 opacity-0
                ${activeCourse === index
                  ? "border-[var(--color-brass)] shadow-sm"
                  : "hover:border-[rgba(200,138,54,0.4)]"
                }`}
              style={activeCourse === index ? { borderColor: "var(--color-brass)" } : {}}
            >
              <span className={`telemetry ${activeCourse === index ? "text-brass" : "text-ink-muted"}`}>
                {code}
              </span>
              <span className="text-xs font-medium text-ink-primary leading-snug line-clamp-2">
                {name}
              </span>
            </button>
          ))}
        </div>

        <div className="tm-detail glass-card p-6 md:p-8 rounded-xl opacity-0">
          <span className="telemetry text-brass mb-2 block">{course.code}</span>
          <h3
            className="text-3xl md:text-4xl font-semibold text-ink-primary mb-1 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {course.name}
          </h3>
          <p className="telemetry text-ink-muted mb-6">{course.technique}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            <div>
              <p className="telemetry text-brass mb-3">INGREDIENTS</p>
              <ul className="space-y-2">
                {course.ingredients.map((ing) => (
                  <li key={ing} className="flex items-start gap-2 text-sm text-ink-muted">
                    <span className="text-brass mt-0.5 leading-none">—</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <p className="telemetry text-brass mb-1">WOOD-SMOKE PAIRING</p>
                <p className="text-sm text-ink-muted leading-snug">{course.smokePairing}</p>
              </div>
              <div>
                <p className="telemetry text-brass mb-1">SOMMELIER</p>
                <p className="text-sm text-ink-muted leading-snug">{course.sommelierPairing}</p>
              </div>
              <div>
                <p className="telemetry text-brass mb-1">TEA PAIRING</p>
                <p className="text-sm text-ink-muted leading-snug">{course.teaPairing}</p>
              </div>
            </div>
          </div>

          <AromaBar intensity={course.aromaIntensity} />
        </div>
      </div>
    </section>
  );
}
