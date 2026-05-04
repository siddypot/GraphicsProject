import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { samplePixelColor } from '../utils/sampleImage';

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function getContainerPixelSize(containerEl) {
  let w = Math.round(containerEl.clientWidth);
  let h = Math.round(containerEl.clientHeight);
  if (w < 2 || h < 2) {
    const rect = containerEl.getBoundingClientRect();
    w = Math.round(rect.width);
    h = Math.round(rect.height);
  }
  if (w < 2 || h < 2) {
    const sidePanel = 340;
    w = Math.max(320, Math.round(window.innerWidth - sidePanel));
    h = Math.max(320, Math.round(window.innerHeight));
  }
  return { w: Math.max(2, w), h: Math.max(2, h) };
}

const VOLUME_SIZE = 40;

function apexHeightForSymmetricPyramid(baseHalf) {
  return baseHalf;
}

function sampleFaceColors(px, py, pz, volumeHalf, imagesLocal) {
  const inv = 1 / VOLUME_SIZE;
  const nx = (px + volumeHalf) * inv;
  const ny = (py + volumeHalf) * inv;
  const nz = (pz + volumeHalf) * inv;
  const uFromX = nx;
  const vFromY = 1 - ny;
  const uFromZ = nz;

  return {
    front: imagesLocal.front ? samplePixelColor(imagesLocal.front, uFromX, vFromY) : null,
    back: imagesLocal.back ? samplePixelColor(imagesLocal.back, uFromX, vFromY) : null,
    right: imagesLocal.right ? samplePixelColor(imagesLocal.right, uFromZ, vFromY) : null,
    left: imagesLocal.left ? samplePixelColor(imagesLocal.left, uFromZ, vFromY) : null,
    bottom: imagesLocal.bottom ? samplePixelColor(imagesLocal.bottom, uFromX, 1 - nz) : null,
  };
}

function createPyramid(px, py, pz, baseHalf, apexHeight, volumeHalf, imagesRef) {
  const pyramid = new THREE.Group();
  pyramid.position.set(px, py, pz);

  const imagesLocal = imagesRef.current;
  const colors = sampleFaceColors(px, py, pz, volumeHalf, imagesLocal);

  const v0 = new THREE.Vector3(-baseHalf, 0, -baseHalf);
  const v1 = new THREE.Vector3(baseHalf, 0, -baseHalf);
  const v2 = new THREE.Vector3(baseHalf, 0, baseHalf);
  const v3 = new THREE.Vector3(-baseHalf, 0, baseHalf);
  const apex = new THREE.Vector3(0, apexHeight, 0);

  const neutral = { r: 0.45, g: 0.42, b: 0.4 };

  const sideFaces = [
    { vertices: [v2, v3, apex], color: colors.front },
    { vertices: [v1, v2, apex], color: colors.right },
    { vertices: [v0, v1, apex], color: colors.back },
    { vertices: [v3, v0, apex], color: colors.left },
  ];

  sideFaces.forEach((face) => {
    const [va, vb, vc] = face.vertices;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      va.x, va.y, va.z,
      vb.x, vb.y, vb.z,
      vc.x, vc.y, vc.z,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();

    const c = face.color || neutral;
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(c.r, c.g, c.b),
      side: THREE.DoubleSide, // grazing angles
    });

    const mesh = new THREE.Mesh(geometry, material);
    pyramid.add(mesh);
  });

  const bottomColor = colors.bottom || neutral;
  const bottomGeom = new THREE.BufferGeometry();
  bottomGeom.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        v0.x, v0.y, v0.z,
        v1.x, v1.y, v1.z,
        v2.x, v2.y, v2.z,
        v0.x, v0.y, v0.z,
        v2.x, v2.y, v2.z,
        v3.x, v3.y, v3.z,
      ]),
      3
    )
  );
  bottomGeom.computeVertexNormals();
  const bottomMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(bottomColor.r, bottomColor.g, bottomColor.b),
    side: THREE.FrontSide,
  });
  pyramid.add(new THREE.Mesh(bottomGeom, bottomMat));

  return pyramid;
}

const SNAP_SPHERICAL = {
  front: new THREE.Spherical(1, Math.PI / 2, 0),
  right: new THREE.Spherical(1, Math.PI / 2, Math.PI / 2),
  back: new THREE.Spherical(1, Math.PI / 2, Math.PI),
  left: new THREE.Spherical(1, Math.PI / 2, -Math.PI / 2),
  bottom: new THREE.Spherical(1, Math.PI, 0),
};

function shortestAngleDiff(a, b) {
  let d = b - a;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  return d;
}

export function usePyramidScene(containerRef, images) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const pyramidGroupRef = useRef(null);
  const snapAnimRef = useRef({ active: false, targetKey: 'front' });
  const configRef = useRef({
    pyramidCount: 400,
    pyramidSize: 0.35,
  });
  const imagesRef = useRef(images);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);
  const aliveRef = useRef(false);

  const [scene, setScene] = useState(null);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const buildPyramidVolume = useCallback(() => {
    const pyramidGroup = pyramidGroupRef.current;
    if (!pyramidGroup) return;

    const { pyramidCount, pyramidSize } = configRef.current;

    try {
      disposeObject3D(pyramidGroup);
      pyramidGroup.clear();

      const volumeHalf = VOLUME_SIZE * 0.5;
      const baseHalf = pyramidSize;
      const apexHeight = apexHeightForSymmetricPyramid(baseHalf);

      for (let i = 0; i < pyramidCount; i += 1) {
        const px = (Math.random() - 0.5) * VOLUME_SIZE;
        const py = (Math.random() - 0.5) * VOLUME_SIZE;
        const pz = (Math.random() - 0.5) * VOLUME_SIZE;

        const pyramid = createPyramid(
          px,
          py,
          pz,
          baseHalf,
          apexHeight,
          volumeHalf,
          imagesRef
        );

        pyramidGroup.add(pyramid);
      }
    } catch (err) {
      console.error('buildPyramidVolume failed', err);
    }
  }, []);

  useLayoutEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    isInitializedRef.current = true;
    aliveRef.current = true;

    const containerEl = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    sceneRef.current = scene;

    const { w: initialW, h: initialH } = getContainerPixelSize(containerEl);

    const camera = new THREE.PerspectiveCamera(45, initialW / initialH, 0.05, 5000);
    const initialDistance = 32;
    camera.position.set(0, 10, initialDistance);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
      });
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.setSize(initialW, initialH);
    containerEl.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const fitRendererToContainer = () => {
      if (!aliveRef.current || !containerRef.current) return;
      const { w, h } = getContainerPixelSize(containerRef.current);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0, 0);
    controls.minDistance = 10;
    controls.maxDistance = 160;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pyramidGroup = new THREE.Group();
    scene.add(pyramidGroup);
    pyramidGroupRef.current = pyramidGroup;

    const offsetTmp = new THREE.Vector3();
    const sphericalCur = new THREE.Spherical();
    const sphericalTarget = new THREE.Spherical();

    const onControlsStart = () => {
      snapAnimRef.current.active = false;
    };
    controls.addEventListener('start', onControlsStart);

    controls.update();

    setScene(scene);

    fitRendererToContainer();

    requestAnimationFrame(() => {
      fitRendererToContainer();
      buildPyramidVolume();
    });

    const handleResize = () => {
      fitRendererToContainer();
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        fitRendererToContainer();
      });
      resizeObserver.observe(containerEl);
    }

    const animate = () => {
      if (!aliveRef.current) {
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);

      const controlsInstance = controlsRef.current;
      const cam = cameraRef.current;
      const rend = rendererRef.current;

      if (!controlsInstance || !cam || !rend) {
        return;
      }

      if (snapAnimRef.current.active) {
        offsetTmp.subVectors(cam.position, controlsInstance.target);
        sphericalCur.setFromVector3(offsetTmp);
        const radius = sphericalCur.radius;
        const key = snapAnimRef.current.targetKey;
        const t = SNAP_SPHERICAL[key];
        if (t) {
          sphericalTarget.copy(t);
          sphericalTarget.radius = radius;

          const dPhi = shortestAngleDiff(sphericalCur.phi, sphericalTarget.phi);
          const dTheta = shortestAngleDiff(sphericalCur.theta, sphericalTarget.theta);

          if (Math.abs(dPhi) < 0.004 && Math.abs(dTheta) < 0.004) {
            sphericalCur.phi = sphericalTarget.phi;
            sphericalCur.theta = sphericalTarget.theta;
            snapAnimRef.current.active = false;
          } else {
            sphericalCur.phi += dPhi * 0.14;
            sphericalCur.theta += dTheta * 0.14;
          }

          sphericalCur.radius = radius;
          offsetTmp.setFromSpherical(sphericalCur);
          cam.position.copy(controlsInstance.target).add(offsetTmp);
        }
      }

      offsetTmp.subVectors(cam.position, controlsInstance.target);
      if (offsetTmp.lengthSq() > 1e-8) {
        offsetTmp.normalize();
        const alignY = Math.abs(offsetTmp.y);
        if (alignY > 0.995) {
          cam.up.set(0, 0, 1); // top/bottom snap
        } else {
          cam.up.set(0, 1, 0);
        }
      }

      controlsInstance.update();
      rend.render(scene, cam);
    };

    animate();

    return () => {
      aliveRef.current = false;
      isInitializedRef.current = false;

      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (pyramidGroupRef.current) {
        disposeObject3D(pyramidGroupRef.current);
        pyramidGroupRef.current.clear();
        pyramidGroupRef.current = null;
      }

      controls.removeEventListener('start', onControlsStart);
      controlsRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;

      renderer.dispose();
      rendererRef.current = null;

      const el = containerRef.current;
      if (el?.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [buildPyramidVolume, containerRef]);

  useEffect(() => {
    if (!scene || !pyramidGroupRef.current) return;
    buildPyramidVolume();
  }, [scene, buildPyramidVolume, images]);

  const updatePyramidCount = useCallback(
    (n) => {
      configRef.current.pyramidCount = n;
      buildPyramidVolume();
    },
    [buildPyramidVolume]
  );

  const updatePyramidSize = useCallback(
    (s) => {
      configRef.current.pyramidSize = s;
      buildPyramidVolume();
    },
    [buildPyramidVolume]
  );

  const snapToView = useCallback((directionKey) => {
    if (!SNAP_SPHERICAL[directionKey]) return;
    snapAnimRef.current.active = true;
    snapAnimRef.current.targetKey = directionKey;
  }, []);

  return {
    scene,
    updatePyramidCount,
    updatePyramidSize,
    snapToView,
  };
}
