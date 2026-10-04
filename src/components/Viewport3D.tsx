import React, { useEffect, useRef } from 'react';
import { HouseSceneManager } from '../engine3d/SceneManager';
import type {
  CameraViewMode,
  FurnitureItem,
  HouseFloorplan,
  WallDisplayMode,
} from '../types/floorplan';

interface Viewport3DProps {
  floorplan: HouseFloorplan;
  wallMode: WallDisplayMode;
  viewMode: CameraViewMode;
  activeLevel: number;
  onSelectFurniture: (item: FurnitureItem | null) => void;
  onSelectRoom: (roomId: string | null) => void;
  sceneManagerRef: React.MutableRefObject<HouseSceneManager | null>;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  floorplan,
  wallMode,
  viewMode,
  activeLevel,
  onSelectFurniture,
  onSelectRoom,
  sceneManagerRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new HouseSceneManager(containerRef.current, {
      onSelectFurniture,
      onSelectRoom,
    });
    sceneManagerRef.current = manager;
    manager.setFloorplan(floorplan);
    manager.setWallMode(wallMode);
    manager.setViewMode(viewMode);
    manager.setActiveLevel(activeLevel);

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync floorplan changes
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setFloorplan(floorplan);
    }
  }, [floorplan]);

  // Sync wall mode
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setWallMode(wallMode);
    }
  }, [wallMode]);

  // Sync view mode
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setViewMode(viewMode);
    }
  }, [viewMode]);

  // Sync active level
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setActiveLevel(activeLevel);
    }
  }, [activeLevel]);

  return (
    <div className="viewport-container" ref={containerRef}>
      <div className="viewport-watermark">
        <span className="watermark-brand">Modo Sims 3D &bull; Vista Axonométrica</span>
      </div>
    </div>
  );
};
