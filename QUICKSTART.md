# Quick start

## Run locally

```bash
cd GraphicsProject
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Basic use

1. **Images** — Click a slot (Front, Right, Back, Left, Bottom), choose a file. Repeat for any face you care about.
2. **Camera** — Drag to orbit, scroll to zoom. Snap buttons move the camera toward that face when that slot has an image.
3. **Sliders** — Pyramid count sets how many pyramids are placed in the volume; pyramid size sets how large each one is.

## Simple color test

Use five solid-color images (or fewer) and assign them to different slots. Orbit or snap so each face of the volume lines up with the camera to see which image drives which direction.

## Production build

```bash
npm run build
npm run preview
```

Output is under `dist/`.
