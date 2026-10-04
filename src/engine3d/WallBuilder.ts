import * as THREE from 'three';
import type { Room, WallDisplayMode, WallOpening } from '../types/floorplan';
import { getWallMaterial } from './ProceduralMaterials';

interface WallSegmentData {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  openings: WallOpening[];
}

/**
 * Builds all 3D walls for a room respecting the selected display mode
 */
export function buildRoomWalls(
  room: Room,
  mode: WallDisplayMode,
  elevation = 0
): THREE.Group {
  const group = new THREE.Group();
  group.name = `room_walls_${room.id}`;

  const pts = room.floorPolygon;
  if (pts.length < 2) return group;

  const targetHeight =
    mode === 'dollhouse'
      ? 1.15
      : mode === 'cutout'
      ? 0.15
      : (room.wallHeight || 2.6);

  const thickness = room.wallThickness || 0.15;
  const wallMaterial = getWallMaterial(room.wallColor);

  // Group openings by wall index
  const openingsByWall = new Map<number, WallOpening[]>();
  if (room.openings) {
    for (const op of room.openings) {
      const list = openingsByWall.get(op.wallStartIndex) || [];
      list.push(op);
      openingsByWall.set(op.wallStartIndex, list);
    }
  }

  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const openings = openingsByWall.get(i) || [];

    const wallSubGroup = buildSingleWall(
      { p1, p2, openings },
      targetHeight,
      thickness,
      wallMaterial,
      mode
    );
    wallSubGroup.position.y = elevation;
    group.add(wallSubGroup);
  }

  return group;
}

/**
 * Builds a single wall segment between p1 and p2, placing openings if any
 */
function buildSingleWall(
  data: WallSegmentData,
  height: number,
  thickness: number,
  material: THREE.Material,
  mode: WallDisplayMode
): THREE.Group {
  const wallGroup = new THREE.Group();

  const dx = data.p2.x - data.p1.x;
  const dz = data.p2.y - data.p1.y;
  const length = Math.hypot(dx, dz);
  if (length < 0.05) return wallGroup;

  const angle = Math.atan2(dz, dx);

  // Position and rotate wall group at p1
  wallGroup.position.set(data.p1.x, 0, data.p1.y);
  wallGroup.rotation.y = -angle;

  // Filter openings that fit within this wall length
  const validOpenings = data.openings
    .filter((op) => op.offset >= 0 && op.offset + op.width <= length)
    .sort((a, b) => a.offset - b.offset);

  if (validOpenings.length === 0 || mode === 'cutout') {
    // Solid wall box
    const geom = new THREE.BoxGeometry(length, height, thickness);
    // Center geometry so it starts at offset 0 and sits on ground
    geom.translate(length / 2, height / 2, 0);

    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wallGroup.add(mesh);
    return wallGroup;
  }

  // Build segmented wall around openings
  let currentOffset = 0;

  for (const op of validOpenings) {
    // 1. Wall piece before opening
    const preLength = op.offset - currentOffset;
    if (preLength > 0.02) {
      const geom = new THREE.BoxGeometry(preLength, height, thickness);
      geom.translate(currentOffset + preLength / 2, height / 2, 0);
      const mesh = new THREE.Mesh(geom, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      wallGroup.add(mesh);
    }

    const opWidth = op.width;
    const opHeight = op.height;
    const sillHeight = op.sillHeight || 0;

    // 2. Wall below opening (window sill)
    if (sillHeight > 0.05 && mode !== 'dollhouse') {
      const subHeight = Math.min(sillHeight, height);
      const geom = new THREE.BoxGeometry(opWidth, subHeight, thickness);
      geom.translate(op.offset + opWidth / 2, subHeight / 2, 0);
      const mesh = new THREE.Mesh(geom, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      wallGroup.add(mesh);
    }

    // 3. Wall above opening (lintel / dintel) - only in full wall mode
    if (mode === 'full') {
      const topStart = sillHeight + opHeight;
      if (topStart < height) {
        const topHeight = height - topStart;
        const geom = new THREE.BoxGeometry(opWidth, topHeight, thickness);
        geom.translate(op.offset + opWidth / 2, topStart + topHeight / 2, 0);
        const mesh = new THREE.Mesh(geom, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        wallGroup.add(mesh);
      }
    }

    // 4. Architectural Frame & Glass
    const frame = buildOpeningFrame(op, thickness, mode);
    frame.position.x = op.offset + opWidth / 2;
    wallGroup.add(frame);

    currentOffset = op.offset + opWidth;
  }

  // Final wall piece after last opening
  const remLength = length - currentOffset;
  if (remLength > 0.02) {
    const geom = new THREE.BoxGeometry(remLength, height, thickness);
    geom.translate(currentOffset + remLength / 2, height / 2, 0);
    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wallGroup.add(mesh);
  }

  return wallGroup;
}

/**
 * Builds decorative frame and glass for doors or windows
 */
function buildOpeningFrame(
  op: WallOpening,
  wallThickness: number,
  mode: WallDisplayMode
): THREE.Group {
  const frameGroup = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({
    color: op.type === 'door' ? 0x4a3b32 : 0x222222,
    roughness: 0.5,
  });

  const sill = op.sillHeight || 0;
  const frameH = mode === 'dollhouse' ? Math.min(op.height, 1.15 - sill) : op.height;
  if (frameH <= 0.1) return frameGroup;

  // Outer frame molding
  const frameGeom = new THREE.BoxGeometry(op.width + 0.04, frameH, wallThickness + 0.02);
  const frameMesh = new THREE.Mesh(frameGeom, frameMat);
  frameMesh.position.y = sill + frameH / 2;
  frameMesh.castShadow = true;
  frameGroup.add(frameMesh);

  // If window, add glass pane
  if (op.type === 'window') {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x90caf9,
      transmission: 0.9,
      opacity: 0.4,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const glassGeom = new THREE.BoxGeometry(op.width - 0.06, frameH - 0.06, 0.02);
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.y = sill + frameH / 2;
    frameGroup.add(glassMesh);
  }

  return frameGroup;
}
