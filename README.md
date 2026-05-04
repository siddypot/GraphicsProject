# Pyramid image mosaic

Web app using Three.js: many square pyramids in a volume. Each visible face can show a color sampled from one of your images (front, right, back, left, bottom), so the mosaic changes as you orbit the camera.

## Features

- **Multi-view mosaic**: Up to five images (Front, Right, Back, Left, Bottom). Orbit to see different faces dominate.
- **Controls**: Drag to orbit, scroll to zoom, snap buttons to animate the camera to a cardinal view.
- **Sliders**: Pyramid count (how many instances in the volume) and pyramid size (base / height of each solid).

## How it works

Each pyramid:

1. Has four triangular side faces (front / right / back / left in world space) and a square bottom.
2. Colors each face from one sample per pyramid, based on that pyramid’s position inside a fixed volume (normalized coordinates map to UVs on each image).
3. With images loaded, a head-on snap toward a face reads as a coarse mosaic of that image; off-axis views look like a scattered cloud of solids.

### Sampling

Images are drawn to an offscreen raster (see `SAMPLE_GRID_SIZE` in `src/utils/sampleImage.js`). Pixel data is cached per `ImageBitmap` so rebuilds do not redraw unnecessarily.

## Usage

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in the browser.

### Images

1. Click a slot (Front, Right, Back, Left, or Bottom) and pick a file.
2. Thumbnails update in the UI; the scene rebuilds when images change.
3. Use the clear control on a slot to remove an image.

### View

- Orbit: drag on the canvas.
- Zoom: mouse wheel.
- Snap: use the view buttons when the matching image is present (disabled otherwise).

### Parameters

- **Pyramid count**: More pyramids fill the volume more densely (heavier GPU work).
- **Pyramid size**: Larger solids overlap more and read as chunkier geometry.

### Tips

- Lower pyramid counts are easier on the GPU while tuning layout.
- Very high counts with large size may stress weaker machines.

## Performance

- The pyramid group is rebuilt when images change or when count/size sliders change, not every frame.
- Orbit and snap animation run each frame; sampling uses cached raster data.

## Browsers

Chrome, Safari, and Firefox are reasonable targets. Internet Explorer is not supported. Desktop is what this was tested on; mobile is untested.

## Stack

- React (UI)
- Three.js (scene, meshes, OrbitControls)
- Vite (dev server and build)

## Layout

```
src/
├── App.jsx
├── App.css
├── components/
│   ├── ImageUploadSlot.jsx
│   └── ImageUploadSlot.css
├── hooks/
│   └── usePyramidScene.js
├── utils/
│   └── sampleImage.js
├── index.css
└── main.jsx
```

## License

Open source for personal and educational use.
