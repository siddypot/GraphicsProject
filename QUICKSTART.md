# Quick Start Guide

## Run the App

```bash
# Navigate to project directory
cd /Users/sidu/Documents/graphicsproject

# Start development server
npm run dev
```

**Open browser to**: `http://localhost:5173`

## How to Use (30 seconds)

1. **Upload Images**
   - Click any of the 4 colored slots (Front, Right, Back, Left)
   - Select an image file
   - Repeat for up to 4 different images

2. **Explore the View**
   - **Drag mouse** to rotate around the grid
   - **Scroll** to zoom in/out
   - **Click snap buttons** to jump to specific angles

3. **Customize**
   - **Grid Size slider**: Make mosaic finer (more details) or coarser
   - **Pyramid Height slider**: Make pyramids taller for more 3D effect

## Quick Test

Create 4 simple solid-color images (400×400px each):
- `red.png` - solid red → upload to Front
- `blue.png` - solid blue → upload to Right  
- `green.png` - solid green → upload to Back
- `yellow.png` - solid yellow → upload to Left

Then rotate the view 90° at a time to see each color appear!

## Features Checklist

- [x] Upload 1-4 images
- [x] Rotate to see different images
- [x] Adjust grid density smoothly
- [x] Control pyramid height
- [x] Snap to cardinal angles
- [x] Works on Chrome and Safari
- [x] No seams between pyramids
- [x] Smooth animations

## Performance Tips

- Start with grid size **20-30** for smooth interaction
- Use **grid size 50+** only with simple images
- **Pyramid height 0.8-1.2×** looks best for most images
- No lag: rebuilds only on slider changes, not every frame

## Build for Production

```bash
npm run build
npm run preview  # test the build locally
```

Output: `dist/` folder ready to deploy

---

**All acceptance criteria met.** Enjoy the 3D pyramid mosaic! 🎉
