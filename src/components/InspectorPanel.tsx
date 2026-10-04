import React from 'react';
import {
  Armchair,
  Check,
  ChevronRight,
  Home,
  Info,
  Maximize,
  RotateCw,
  X,
} from 'lucide-react';
import type { FurnitureItem, HouseFloorplan, Room } from '../types/floorplan';

interface InspectorPanelProps {
  floorplan: HouseFloorplan;
  selectedRoom: Room | null;
  selectedFurniture: FurnitureItem | null;
  onClose: () => void;
  onUpdateFurniture?: (item: FurnitureItem) => void;
  onUpdateRoom?: (room: Room) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  floorplan,
  selectedRoom,
  selectedFurniture,
  onClose,
  onUpdateFurniture,
  onUpdateRoom,
}) => {
  const currentLevel = floorplan.levels[0];
  const totalFurnitureCount = currentLevel
    ? currentLevel.rooms.reduce((acc, r) => acc + r.furniture.length, 0)
    : 0;

  return (
    <aside className="inspector-panel">
      <div className="inspector-header">
        <div className="inspector-title-row">
          {selectedFurniture ? (
            <span className="badge badge-accent">
              <Armchair size={13} className="icon-mr" /> Mueble 1:1
            </span>
          ) : selectedRoom ? (
            <span className="badge badge-blue">
              <Home size={13} className="icon-mr" /> Habitación
            </span>
          ) : (
            <span className="badge badge-gray">
              <Info size={13} className="icon-mr" /> Información
            </span>
          )}
          <button className="btn-close-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <h2 className="inspector-title">
          {selectedFurniture
            ? selectedFurniture.name
            : selectedRoom
            ? selectedRoom.name
            : floorplan.name}
        </h2>
      </div>

      <div className="inspector-content">
        {/* CASO 1: MUEBLE SELECCIONADO */}
        {selectedFurniture && (
          <div className="inspector-section">
            <h3 className="section-subtitle">Dimensiones a Medida (Escala 1:1)</h3>
            <div className="dimension-grid">
              <div className="dimension-card">
                <span className="dim-label">Ancho (X)</span>
                <span className="dim-val">{selectedFurniture.dimensions[0]} m</span>
              </div>
              <div className="dimension-card">
                <span className="dim-label">Fondo (Z)</span>
                <span className="dim-val">{selectedFurniture.dimensions[1]} m</span>
              </div>
              <div className="dimension-card">
                <span className="dim-label">Alto (Y)</span>
                <span className="dim-val">{selectedFurniture.dimensions[2]} m</span>
              </div>
            </div>

            <h3 className="section-subtitle">Posición & Orientación</h3>
            <div className="info-row">
              <span className="info-key">
                <Maximize size={14} className="icon-mr" /> Coordenadas [X, Z]:
              </span>
              <span className="info-val">
                [{selectedFurniture.position[0].toFixed(2)}, {selectedFurniture.position[2].toFixed(2)}] m
              </span>
            </div>
            <div className="info-row">
              <span className="info-key">
                <RotateCw size={14} className="icon-mr" /> Rotación:
              </span>
              <span className="info-val">{selectedFurniture.rotationY}°</span>
            </div>

            <h3 className="section-subtitle">Color y Acabado Identificado</h3>
            <div className="color-swatch-row">
              <div className="color-swatch-item">
                <div
                  className="color-circle"
                  style={{ backgroundColor: selectedFurniture.color }}
                />
                <span className="color-text">Principal: {selectedFurniture.color}</span>
              </div>
              {selectedFurniture.secondaryColor && (
                <div className="color-swatch-item">
                  <div
                    className="color-circle"
                    style={{ backgroundColor: selectedFurniture.secondaryColor }}
                  />
                  <span className="color-text">Detalle: {selectedFurniture.secondaryColor}</span>
                </div>
              )}
            </div>

            <div className="form-group mt-3">
              <label className="form-label">Ajustar Color en Vivo:</label>
              <div className="color-picker-input">
                <input
                  type="color"
                  value={selectedFurniture.color}
                  onChange={(e) => {
                    if (onUpdateFurniture) {
                      onUpdateFurniture({
                        ...selectedFurniture,
                        color: e.target.value,
                      });
                    }
                  }}
                />
                <span className="color-code">{selectedFurniture.color}</span>
              </div>
            </div>
          </div>
        )}

        {/* CASO 2: HABITACIÓN SELECCIONADA */}
        {selectedRoom && !selectedFurniture && (
          <div className="inspector-section">
            <h3 className="section-subtitle">Detalles de la Habitación</h3>
            <div className="info-row">
              <span className="info-key">Material del Piso:</span>
              <span className="info-val capitalized">
                {selectedRoom.floorMaterial.replace('_', ' ')}
              </span>
            </div>
            <div className="info-row">
              <span className="info-key">Altura de Techo:</span>
              <span className="info-val">{selectedRoom.wallHeight} m</span>
            </div>
            <div className="info-row">
              <span className="info-key">Muebles presentes:</span>
              <span className="info-val">{selectedRoom.furniture.length} piezas</span>
            </div>

            <h3 className="section-subtitle">Color de Muros</h3>
            <div className="color-picker-input">
              <input
                type="color"
                value={selectedRoom.wallColor}
                onChange={(e) => {
                  if (onUpdateRoom) {
                    onUpdateRoom({ ...selectedRoom, wallColor: e.target.value });
                  }
                }}
              />
              <span className="color-code">{selectedRoom.wallColor}</span>
            </div>

            <h3 className="section-subtitle">Mobiliario en este ambiente</h3>
            <div className="furniture-chips-list">
              {selectedRoom.furniture.map((f) => (
                <div key={f.id} className="furniture-chip">
                  <div
                    className="color-dot"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="chip-name">{f.name}</span>
                  <span className="chip-dim">
                    {f.dimensions[0]}x{f.dimensions[1]}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASO 3: RESUMEN DE LA CASA */}
        {!selectedRoom && !selectedFurniture && (
          <div className="inspector-section">
            <p className="house-desc">{floorplan.description}</p>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-num">{currentLevel?.rooms.length || 0}</span>
                <span className="stat-label">Ambientes</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{totalFurnitureCount}</span>
                <span className="stat-label">Muebles 1:1</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{floorplan.totalAreaM2 || '~78'}</span>
                <span className="stat-label">m² Totales</span>
              </div>
            </div>

            <h3 className="section-subtitle">Ambientes Digitalizados</h3>
            <div className="room-nav-list">
              {currentLevel?.rooms.map((room) => (
                <div key={room.id} className="room-nav-item">
                  <div className="room-nav-info">
                    <span className="room-nav-name">{room.name}</span>
                    <span className="room-nav-meta">
                      {room.furniture.length} muebles &bull; {room.floorMaterial.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronRight size={15} className="room-nav-arrow" />
                </div>
              ))}
            </div>

            <div className="tip-box">
              <Check size={14} className="icon-mr tip-icon" />
              <span>Haz clic sobre cualquier mueble o piso en el visor 3D para inspeccionarlo en detalle.</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
