# Pyramid Image Mosaic — 3D Multi-View Image Renderer

A web-based Three.js visualization that renders a grid of 3D pyramids, where each pyramid face displays a different image when viewed from the corresponding angle.

## Features

✨ **Multi-View Mosaic**: Upload up to 4 images (Front, Right, Back, Left) and see the grid transform as you orbit around it. Each view reveals a different image mosaic.

🎮 **Interactive Controls**:
- **Mouse drag** to orbit around the pyramid grid
- **Scroll** to zoom in/out
- **Snap buttons** for instant transitions to specific viewing angles

⚙️ **Customizable Grid**:
- **Grid size slider** (5-80): Control the density and detail of the mosaic (default: 20×20)
- **Pyramid height slider** (0.5x-3x): Adjust the 3D depth of each pyramid (default: 1x)

📊 **Image Upload**:
- Drag-and-drop or click to upload images to any of the 4 views
- Live thumbnail previews with quick-remove buttons
- Automatic pixel sampling from uploaded images

## How It Works

Each pyramid in the grid:
1. Has 4 triangular faces pointing toward Front, Right, Back, and Left
2. Each face is colored with a single pixel sampled from the corresponding image
3. When you view the grid head-on, you see a low-poly mosaic of the Front image
4. Rotate 90° to see the Right image, 180° for Back, 270° for Left

### Color Sampling

The app:
1. Draws each uploaded image onto a 256×256 offscreen canvas
2. For each pyramid cell at grid position (col, row), samples the pixel at UV coordinates:
   - U = (col + 0.5) / gridSize
   - V = (row + 0.5) / gridSize
3. Caches the pixel data for performance

## Usage

### Installation & Running

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Uploading Images

1. Click any of the 4 image slots (Front, Right, Back, Left)
2. Select an image file from your computer
3. The thumbnail appears, and the grid updates immediately
4. Click the **×** button to remove an image

### Controlling the View

- **Orbit**: Click and drag with your mouse to rotate around the grid
- **Zoom**: Scroll your mouse wheel to zoom in/out
- **Snap to angle**: Click a snap button (Front, Right, Back, Left) to smoothly animate the camera to that view

### Adjusting Parameters

- **Grid Size**: Use the slider to change the grid resolution (5-80). Higher values = more detail but more geometry
- **Pyramid Height**: Use the slider to adjust how tall each pyramid is (0.5x-3x of cell size)

### Tips

- Start with a grid size of 20-30 for best performance
- For high-resolution grid sizes (50+), consider using simple, high-contrast images
- When no images are loaded, the pyramids are very flat (height ≈ 0.1×)
- The app automatically disables snap buttons that don't have images loaded

## Performance Notes

- Full mesh rebuilds only happen when:
  - An image is added or removed
  - The grid size slider changes
  - The pyramid height slider changes
- Camera orbiting and animation happen every frame at 60 FPS
- Pixel sampling is cached per image to avoid repeated canvas reads

## Browser Support

✅ Chrome / Chromium-based browsers
✅ Safari
✅ Firefox
❌ Internet Explorer (not supported)

Desktop-only recommended (mobile is untested).

## Technical Stack

- **React 19** for UI components
- **Three.js r183** for 3D rendering
- **OrbitControls** for camera manipulation
- **Vite** for fast development and building

## File Structure

```
src/
├── App.jsx                    # Main app layout and image management
├── App.css                    # App styling
├── components/
│   ├── ImageUploadSlot.jsx   # Image upload UI component
│   └── ImageUploadSlot.css   # Upload slot styling
├── hooks/
│   └── usePyramidScene.js    # Three.js scene setup and mesh building
├── utils/
│   └── sampleImage.js        # Off-canvas pixel sampling with caching
├── index.css                 # Global styles
└── main.jsx                  # React entry point
```

## Project Requirements Met

✅ Upload 1 image → flat-looking grid of colored triangles  
✅ Upload 2-4 images → rotate scene to reveal different images  
✅ Grid slider live-updates density  
✅ Snap buttons smoothly animate camera  
✅ No visible seams or gaps between pyramids  
✅ Works on Chrome and Safari (desktop)  

## License

This project is open source and available for personal and educational use.
