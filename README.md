# BARA — Wood-Fired Gastronomy & Open-Hearth Dining

An intimate 8-seat chef's counter powered by a 680 °C coffee-wood hearth, built as an interactive 3D showcase with procedural Three.js / React Three Fiber scenes, Lenis smooth scroll, and GSAP choreography.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (TypeScript) |
| Styling | Tailwind CSS v4 |
| 3D | Three.js 0.187 · React Three Fiber 9 · Drei 10 |
| Animation | GSAP 3 · ScrollTrigger · Lenis 1.3 |
| State | Zustand 5 |
| Fonts | Cormorant Garamond · Plus Jakarta Sans · JetBrains Mono |

## Development

```bash
npm install
npm run dev        # http://localhost:3000  (Turbopack)
```

## Production build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo in [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — no extra settings needed.
4. Set the **Node.js version** to **20.x** in Project → Settings → General if not auto-detected.

> Region is pre-set to `sin1` (Singapore) in `vercel.json`. Change to your preferred region before importing.
