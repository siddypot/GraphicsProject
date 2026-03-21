import { useRef, useEffect, useState } from 'react';
import './ImageUploadSlot.css';

async function fileToImageBitmap(file) {
  try {
    return await createImageBitmap(file);
  } catch {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img)
          .then((bitmap) => {
            URL.revokeObjectURL(url);
            resolve(bitmap);
          })
          .catch(reject);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };
      img.src = url;
    });
  }
}

export function ImageUploadSlot({ label, image, onImageSelect, onImageClear }) {
  const inputRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (!image) {
      setThumbnail(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setThumbnail(null);
      return;
    }
    ctx.drawImage(image, 0, 0, 100, 100);
    setThumbnail(canvas.toDataURL('image/jpeg', 0.88));
  }, [image]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      fileToImageBitmap(file)
        .then((bitmap) => {
          onImageSelect(bitmap);
        })
        .catch((err) => {
          console.error('Failed to create image bitmap:', err);
        });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onImageClear();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="image-upload-slot" onClick={handleClick}>
      {thumbnail ? (
        <div className="slot-preview">
          <img src={thumbnail} alt={label} />
          <button className="clear-btn" onClick={handleClear}>
            ×
          </button>
        </div>
      ) : (
        <div className="slot-placeholder">
          <span className="plus">+</span>
        </div>
      )}
      <label className="slot-label">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
