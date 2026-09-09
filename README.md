# શ્રી ગણપતિ પોસ્ટર જનરેટર (Next.js)

Photo upload karo, zoom/drag se adjust karo, aur poster download ya WhatsApp par share karo.

## Chalane ke liye (Run locally)

```bash
npm install
npm run dev
```

Fir browser mein kholo: http://localhost:3000

## Production build

```bash
npm run build
npm start
```

## Deploy

Ye ek standard Next.js (App Router) project hai — [Vercel](https://vercel.com) par ek click mein deploy ho jayega:

```bash
npx vercel
```

## Structure

- `app/page.tsx` — poster generator ka poora logic (canvas, zoom, drag, download, WhatsApp share)
- `app/globals.css` — styling
- `public/ganpati-template.jpg` — poster background template (photo circle isi image ke upar overlay hota hai)

## Photo circle position badalni ho

`app/page.tsx` mein top par ye constant hai:

```ts
const CIRCLE = { x: 846.5, y: 932.5, r: 292 };
```

Agar template image badloge, to naye circle ke coordinates (center x, y aur radius r, native image resolution mein) yaha update karo. `CANVAS_W` / `CANVAS_H` bhi naye image ke actual pixel dimensions ke barabar rakho.
