import * as THREE from 'three';
import type { Room } from '../types/floorplan';
import { getFloorMaterial } from './ProceduralMaterials';

/**
 * Builds the 3D floor geometry for a room based on its 2D polygon
 */
export function buildRoomFloor(room: Room, elevation = 0): THREE.Mesh {
  const shape = new THREE.Shape();
  const pts = room.floorPolygon;

  if (pts.length < 3) {
    // Fallback simple rectangle if polygon is malformed
    shape.moveTo(0, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 4);
    shape.lineTo(0, 4);
    shape.closePath();
  } else {
    shape.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, pts[i].y);
    }
    shape.closePath();
  }

  // Create geometry (extruded slightly downwards to prevent z-fighting with ground)
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.08,
    bevelEnabled: false,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Since Three.js 2D shape is in XY plane, we rotate it to lay flat on XZ plane
  geometry.rotateX(Math.PI / 2);

  // Fix UV coordinates to scale with real-world meters
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    uvs[i * 2] = x * 0.8;
    uvs[i * 2 + 1] = z * 0.8;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  const material = getFloorMaterial(room.floorMaterial, room.floorColor);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.position.y = elevation;

  mesh.userData = {
    type: 'floor',
    roomId: room.id,
    roomName: room.name,
  };

  return mesh;
}
