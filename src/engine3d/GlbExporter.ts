import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';

/**
 * Exports a Three.js Object3D hierarchy as a binary .glb file download
 */
export function exportToGlb(object: THREE.Object3D, filename = 'casa_floorplan_3d.glb'): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    exporter.parse(
      object,
      (gltf) => {
        try {
          const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        reject(error);
      },
      { binary: true }
    );
  });
}
