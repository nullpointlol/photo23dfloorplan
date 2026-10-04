import * as THREE from 'three';
import type { FloorMaterialType } from '../types/floorplan';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a procedural wood parquet texture canvas
 */
function createWoodTexture(baseColorHex: string): THREE.CanvasTexture {
  const cacheKey = `wood_${baseColorHex}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Planks
  const plankHeight = 32;
  const plankWidth = 128;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 2;

  for (let y = 0; y < 512; y += plankHeight) {
    const rowOffset = ((y / plankHeight) % 2) * (plankWidth / 2);
    for (let x = -plankWidth; x < 512 + plankWidth; x += plankWidth) {
      const rx = x + rowOffset;
      // Plank tone variation
      const shade = (Math.random() - 0.5) * 0.08;
      ctx.fillStyle = shade > 0 ? `rgba(255, 255, 255, ${shade})` : `rgba(0, 0, 0, ${-shade})`;
      ctx.fillRect(rx, y, plankWidth, plankHeight);
      ctx.strokeRect(rx, y, plankWidth, plankHeight);

      // Fine grain lines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for (let g = 0; g < 4; g++) {
        ctx.fillRect(rx, y + Math.random() * plankHeight, plankWidth, 1);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates a ceramic tile texture canvas
 */
function createTileTexture(baseColorHex: string): THREE.CanvasTexture {
  const cacheKey = `tile_${baseColorHex}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 64;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 3;

  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const shade = (Math.random() - 0.5) * 0.04;
      ctx.fillStyle = shade > 0 ? `rgba(255, 255, 255, ${shade})` : `rgba(0, 0, 0, ${-shade})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates a marble texture canvas
 */
function createMarbleTexture(baseColorHex: string): THREE.CanvasTexture {
  const cacheKey = `marble_${baseColorHex}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Organic veins
  ctx.strokeStyle = 'rgba(100, 100, 100, 0.12)';
  ctx.lineWidth = 3;
  ctx.filter = 'blur(2px)';

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 512) {
      y += 30 + Math.random() * 40;
      x += (Math.random() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.filter = 'none';

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates carpet texture
 */
function createCarpetTexture(baseColorHex: string): THREE.CanvasTexture {
  const cacheKey = `carpet_${baseColorHex}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 256, 256);

  // Micro fibers
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Returns a Three.js MeshStandardMaterial configured with the procedural texture
 */
export function getFloorMaterial(
  materialType: FloorMaterialType,
  colorHex: string
): THREE.MeshStandardMaterial {
  let texture: THREE.CanvasTexture | null = null;
  let roughness = 0.4;
  let metalness = 0.05;

  switch (materialType) {
    case 'wood_parquet':
      texture = createWoodTexture(colorHex || '#B8860B');
      roughness = 0.35;
      break;
    case 'tile_ceramic':
      texture = createTileTexture(colorHex || '#EDEDED');
      roughness = 0.2;
      break;
    case 'marble':
      texture = createMarbleTexture(colorHex || '#F5F5F5');
      roughness = 0.15;
      metalness = 0.1;
      break;
    case 'carpet':
      texture = createCarpetTexture(colorHex || '#7A8B99');
      roughness = 0.9;
      break;
    case 'concrete':
    default:
      roughness = 0.7;
      break;
  }

  return new THREE.MeshStandardMaterial({
    color: texture ? 0xffffff : new THREE.Color(colorHex),
    map: texture,
    roughness,
    metalness,
  });
}

/**
 * Returns a clean plaster architectural wall material
 */
export function getWallMaterial(colorHex: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex || '#F4F1EA'),
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}
