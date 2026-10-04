import React from 'react';
import {
  Box,
  Camera,
  Compass,
  Download,
  Eye,
  Layers,
  Maximize2,
  PlusCircle,
} from 'lucide-react';
import type { CameraViewMode, HouseFloorplan, WallDisplayMode } from '../types/floorplan';

interface ViewerControlsProps {
  wallMode: WallDisplayMode;
  onWallModeChange: (mode: WallDisplayMode) => void;
  viewMode: CameraViewMode;
  onViewModeChange: (mode: CameraViewMode) => void;
  floorplan: HouseFloorplan;
  activeLevel: number;
  onLevelChange: (levelIndex: number) => void;
  onCenterCamera: () => void;
  onExportGlb: () => void;
  onOpenUpload: () => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  wallMode,
  onWallModeChange,
  viewMode,
  onViewModeChange,
  floorplan,
  activeLevel,
  onLevelChange,
  onCenterCamera,
  onExportGlb,
  onOpenUpload,
}) => {
  return (
    <div className="viewer-controls-bar">
      {/* 1. MODO SIMS / ALTURA DE MUROS */}
      <div className="control-group">
        <span className="control-label">
          <Layers size={14} className="icon-mr" /> Muros
        </span>
        <div className="btn-segmented">
          <button
            className={`btn-toggle ${wallMode === 'dollhouse' ? 'active' : ''}`}
            onClick={() => onWallModeChange('dollhouse')}
            title="Corte estilo Los Sims a 1.15m para ver todo el interior"
          >
            Modo Sims (1.1m)
          </button>
          <button
            className={`btn-toggle ${wallMode === 'full' ? 'active' : ''}`}
            onClick={() => onWallModeChange('full')}
            title="Muros a altura de techo completa (2.6m)"
          >
            Completos
          </button>
          <button
            className={`btn-toggle ${wallMode === 'cutout' ? 'active' : ''}`}
            onClick={() => onWallModeChange('cutout')}
            title="Solo zócalos de piso"
          >
            Zócalo
          </button>
        </div>
      </div>

      {/* 2. CÁMARAS Y PERSPECTIVA */}
      <div className="control-group">
        <span className="control-label">
          <Camera size={14} className="icon-mr" /> Vista
        </span>
        <div className="btn-segmented">
          <button
            className={`btn-toggle ${viewMode === 'isometric' ? 'active' : ''}`}
            onClick={() => onViewModeChange('isometric')}
            title="Corte axonométrico / isométrico 45°"
          >
            <Compass size={13} className="btn-icon" /> Isométrica
          </button>
          <button
            className={`btn-toggle ${viewMode === 'topdown' ? 'active' : ''}`}
            onClick={() => onViewModeChange('topdown')}
            title="Planta cenital 2D desde arriba"
          >
            <Box size={13} className="btn-icon" /> Plano 2D
          </button>
          <button
            className={`btn-toggle ${viewMode === 'perspective' ? 'active' : ''}`}
            onClick={() => onViewModeChange('perspective')}
            title="Órbita 3D libre"
          >
            <Eye size={13} className="btn-icon" /> Libre 3D
          </button>
        </div>
      </div>

      {/* 3. SELECTOR DE PLANTAS (si hay más de 1 piso) */}
      {floorplan.levels.length > 1 && (
        <div className="control-group">
          <span className="control-label">Planta</span>
          <div className="btn-segmented">
            {floorplan.levels.map((lvl) => (
              <button
                key={lvl.levelIndex}
                className={`btn-toggle ${activeLevel === lvl.levelIndex ? 'active' : ''}`}
                onClick={() => onLevelChange(lvl.levelIndex)}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. ACCIONES */}
      <div className="control-actions">
        <button className="btn-action" onClick={onCenterCamera} title="Centrar encuadre">
          <Maximize2 size={15} />
          <span>Centrar</span>
        </button>

        <button className="btn-action" onClick={onExportGlb} title="Descargar modelo en formato 3D GLB">
          <Download size={15} />
          <span>Descargar 3D (.glb)</span>
        </button>

        <button className="btn-action primary" onClick={onOpenUpload} title="Subir nuevos planos o fotos">
          <PlusCircle size={15} />
          <span>Nueva Casa / Fotos</span>
        </button>
      </div>
    </div>
  );
};
