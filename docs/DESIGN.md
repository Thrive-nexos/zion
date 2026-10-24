# LUMEN LEARN design system: "Danfo & Chalk"

## Why this direction

The first visual pass used deep indigo, violet gradients, gold italic serif accents, frosted glass
and soft rounded cards. Recent writing on why AI-generated sites look the same names almost exactly
that combination as the main "AI tells":

* a purple-to-blue gradient hero with a soft glow and a centred headline
* Inter or other default sans type, and a row of three rounded cards
* glassmorphism, blurred colour blobs, neon glow, and sparkle or emoji icons
* generic copy that could describe any product, with heavy use of em dashes

These sources also warn that switching to the next default (cream + terracotta, or near-black with
one acid-green accent) is just another tell. Their consistent advice is to derive every visual
choice from the product's own context and purpose. (21st.dev, *Website not look AI generated*;
Capital & Compute, *How to fix AI slop in web design, tell by tell*; 925 Studios, *AI slop design
tells*; codemyspec, *Vibe-coded websites look the same*.)

The 2026 "anti-AI crafting" movement (Creative Bloq, Setproduct, Web Designer Depot) favours
deliberate, human-feeling work: confident type, flat bold colour, visible structure and sharp
geometry. Those sources describe it as "brutalist but readable", applied with intent rather than
noise.

## Where the palette comes from

Lagos, not a template. The brand pair is **danfo yellow and ink black**, the colours of the Lagos
minibuses. The accents are **Ankara-print brights** on clean white paper.

| Token | Hex | Role |
|---|---|---|
| `gold` (danfo yellow) | `#FFC800` | Brand, hero, footer, primary highlight, marker stroke |
| `ink` | `#111111` | Type, outlines, hard shadows, dark sections |
| `iris` (electric blue) | `#1F5BFF` | Links, primary actions, school portal |
| `azure` (Naija green) | `#00B85C` | Learner portal, success |
| `pink` | `#FF3D8B` | Tutor portal, emphasis markers, final CTA |
| `tangerine` | `#FF6A13` | Teacher portal, accents |
| `white` / `sand` | `#FFFFFF` / `#F2F2EF` | Paper and alternate bands |

Token names stayed the same during the re-skin (for example `iris` is now blue). The values in
`tailwind.config.ts` are the source of truth.

## Shape and depth

* **Corners:** 3–10 px. Only pills and avatars are round.
* **Outlines:** 2 px ink keylines on cards, inputs, photos and stickers.
* **Depth:** hard offset shadows (`4px 4px 0 #111`). Cards lift up and to the left on hover and
  press down on click. There are no blurs, glass or gradients.
* **Texture:** a faint graph-paper grid (exercise-book squares) on hero surfaces, plus a mono
  subject ticker.

## Type

* **Archivo**, variable width, for everything. Headlines are expanded (116–125%) and heavy (800–900);
  the hero and key statements are uppercase.
* **IBM Plex Mono** for eyebrows, labels, data and the ticker: the "spec sheet" voice.
* **Emphasis** is a marker stroke under the words (yellow by default, pink on yellow), never a
  coloured italic.

## Motion

* The hero's 3D scene is flat toon colour with ink edges (books, Yorùbá/Igbo/Hausa glyphs,
  molecules, solids, a low-poly globe), shown through a transparent canvas on yellow. It runs only
  while visible and falls back to a matching SVG poster.
* Reveals are short (0.6–0.9 s) and start from visible content. There's no cursor-following
  light, no background parallax noise and no scroll-jacking. The hero pins with CSS `sticky`.

## Portal identities

| Portal | Sidebar | Active item |
|---|---|---|
| Learner | Naija green | Ink |
| Guardian | Danfo yellow | Ink |
| School | Electric blue | White |
| Teacher | Tangerine | Ink |
| Tutor | Pink | Ink |
| Platform admin | Ink | Yellow |

## Copy rules

* Write specifically: name the place, the exam and the person ("a nurse refreshing her dosing maths
  in Kaduna").
* Use full stops and commas over em dashes. Avoid "seamless", "unlock" and "elevate"-style filler.
* Label anything simulated or sample data right where it appears.
