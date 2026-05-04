import { useState, useRef, useEffect } from 'react';
import './App.css';
import { ImageUploadSlot } from './components/ImageUploadSlot';
import { usePyramidScene } from './hooks/usePyramidScene';

function App() {
  const containerRef = useRef(null);
  const [images, setImages] = useState({
    front: null,
    right: null,
    back: null,
    left: null,
    bottom: null,
  });

  const [pyramidCount, setPyramidCount] = useState(400);
  const [pyramidSize, setPyramidSize] = useState(0.35);
  const [hasImages, setHasImages] = useState(false);

  const { updatePyramidCount, updatePyramidSize, snapToView } = usePyramidScene(containerRef, images);

  useEffect(() => {
    const imageCount = Object.values(images).filter((img) => img !== null).length;
    setHasImages(imageCount > 0);
  }, [images]);

  const handleImageSelect = (position, bitmap) => {
    setImages((prev) => ({
      ...prev,
      [position]: bitmap,
    }));
  };

  const handleImageClear = (position) => {
    setImages((prev) => ({
      ...prev,
      [position]: null,
    }));
  };

  const handlePyramidCountChange = (e) => {
    const n = parseInt(e.target.value, 10);
    setPyramidCount(n);
    updatePyramidCount(n);
  };

  const handlePyramidSizeChange = (e) => {
    const s = parseFloat(e.target.value);
    setPyramidSize(s);
    updatePyramidSize(s);
  };

  const handleSnap = (direction) => {
    snapToView(direction);
  };

  return (
    <div className="app">
      <div className="canvas-container" ref={containerRef}></div>

      <div className="controls-panel">
        <div className="section">
          <h2>Image Upload</h2>
          <div className="image-slots image-slots-five">
            <ImageUploadSlot
              position="front"
              label="Front"
              image={images.front}
              onImageSelect={(bitmap) => handleImageSelect('front', bitmap)}
              onImageClear={() => handleImageClear('front')}
            />
            <ImageUploadSlot
              position="right"
              label="Right"
              image={images.right}
              onImageSelect={(bitmap) => handleImageSelect('right', bitmap)}
              onImageClear={() => handleImageClear('right')}
            />
            <ImageUploadSlot
              position="back"
              label="Back"
              image={images.back}
              onImageSelect={(bitmap) => handleImageSelect('back', bitmap)}
              onImageClear={() => handleImageClear('back')}
            />
            <ImageUploadSlot
              position="left"
              label="Left"
              image={images.left}
              onImageSelect={(bitmap) => handleImageSelect('left', bitmap)}
              onImageClear={() => handleImageClear('left')}
            />
            <ImageUploadSlot
              position="bottom"
              label="Bottom"
              image={images.bottom}
              onImageSelect={(bitmap) => handleImageSelect('bottom', bitmap)}
              onImageClear={() => handleImageClear('bottom')}
            />
          </div>
        </div>

        <div className="section">
          <h2>Pyramid count</h2>
          <div className="slider-control">
            <input
              type="range"
              min="50"
              max="20000"
              step="50"
              value={pyramidCount}
              onChange={handlePyramidCountChange}
              className="slider"
            />
            <span className="slider-value">{pyramidCount.toLocaleString()} pyramids</span>
          </div>
        </div>

        <div className="section">
          <h2>Pyramid size</h2>
          <div className="slider-control">
            <input
              type="range"
              min="0.08"
              max="1.6"
              step="0.02"
              value={pyramidSize}
              onChange={handlePyramidSizeChange}
              className="slider"
            />
            <span className="slider-value">{pyramidSize.toFixed(2)}×</span>
          </div>
        </div>

        {hasImages && (
          <div className="section">
            <h2>View angles</h2>
            <div className="snap-buttons snap-buttons-five">
              <button
                type="button"
                onClick={() => handleSnap('front')}
                className={images.front ? 'snap-btn' : 'snap-btn disabled'}
                disabled={!images.front}
              >
                Front (+Z)
              </button>
              <button
                type="button"
                onClick={() => handleSnap('right')}
                className={images.right ? 'snap-btn' : 'snap-btn disabled'}
                disabled={!images.right}
              >
                Right (+X)
              </button>
              <button
                type="button"
                onClick={() => handleSnap('back')}
                className={images.back ? 'snap-btn' : 'snap-btn disabled'}
                disabled={!images.back}
              >
                Back (−Z)
              </button>
              <button
                type="button"
                onClick={() => handleSnap('left')}
                className={images.left ? 'snap-btn' : 'snap-btn disabled'}
                disabled={!images.left}
              >
                Left (−X)
              </button>
              <button
                type="button"
                onClick={() => handleSnap('bottom')}
                className={images.bottom ? 'snap-btn' : 'snap-btn disabled'}
                disabled={!images.bottom}
              >
                Bottom (−Y)
              </button>
            </div>
          </div>
        )}

        <div className="info-section">
          <p>Drag to orbit, wheel to zoom. Use snap when you want a flat view of one face.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
