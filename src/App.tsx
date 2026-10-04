import React, { useRef, useState } from 'react';
import { Box, Layers } from 'lucide-react';
import { InspectorPanel } from './components/InspectorPanel';
import { UploadModal } from './components/UploadModal';
import { ViewerControls } from './components/ViewerControls';
import { Viewport3D } from './components/Viewport3D';
import { exportToGlb } from './engine3d/GlbExporter';
import type { HouseSceneManager } from './engine3d/SceneManager';
import { clientWorkshopFloorplan } from './services/clientWorkshopData';
import { demoHouseFloorplan } from './services/mockData';
import type {
  CameraViewMode,
  FurnitureItem,
  HouseFloorplan,
  Room,
  WallDisplayMode,
} from './types/floorplan';

export const App: React.FC = () => {
  // Inicializamos con el taller real del cliente a partir de sus fotos y medidas
  const [floorplan, setFloorplan] = useState<HouseFloorplan>(clientWorkshopFloorplan);
  const [wallMode, setWallMode] = useState<WallDisplayMode>('dollhouse');
  const [viewMode, setViewMode] = useState<CameraViewMode>('isometric');
  const [activeLevel, setActiveLevel] = useState<number>(0);

  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const sceneManagerRef = useRef<HouseSceneManager | null>(null);

  // Find selected room object
  const currentLevel = floorplan.levels[activeLevel] || floorplan.levels[0];
  const selectedRoom: Room | null =
    selectedRoomId && currentLevel
      ? currentLevel.rooms.find((r) => r.id === selectedRoomId) || null
      : null;

  const handleSelectFurniture = (item: FurnitureItem | null) => {
    setSelectedFurniture(item);
    if (item) {
      setSelectedRoomId(null);
      setIsInspectorOpen(true);
    }
  };

  const handleSelectRoom = (roomId: string | null) => {
    setSelectedRoomId(roomId);
    if (roomId) {
      setSelectedFurniture(null);
      setIsInspectorOpen(true);
    }
  };

  const handleUpdateFurniture = (updatedItem: FurnitureItem) => {
    setSelectedFurniture(updatedItem);
    setFloorplan((prev) => ({
      ...prev,
      levels: prev.levels.map((lvl) => ({
        ...lvl,
        rooms: lvl.rooms.map((rm) => ({
          ...rm,
          furniture: rm.furniture.map((f) => (f.id === updatedItem.id ? updatedItem : f)),
        })),
      })),
    }));
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setFloorplan((prev) => ({
      ...prev,
      levels: prev.levels.map((lvl) => ({
        ...lvl,
        rooms: lvl.rooms.map((rm) => (rm.id === updatedRoom.id ? updatedRoom : rm)),
      })),
    }));
  };

  const handleExportGlb = async () => {
    if (!sceneManagerRef.current) return;
    try {
      const sanitizedName = floorplan.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      await exportToGlb(sceneManagerRef.current.getExportObject(), `${sanitizedName}_sims3d.glb`);
    } catch (err) {
      console.error('Error al exportar GLB:', err);
      alert('Error exportando el archivo 3D GLB.');
    }
  };

  const handleCenterCamera = () => {
    sceneManagerRef.current?.centerCamera();
  };

  return (
    <div className="app-layout">
      {/* HEADER SUPERIOR */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <Box className="logo-icon" size={22} />
          </div>
          <div>
            <h1 className="app-title">Floorplan 3D Studio</h1>
            <p className="app-subtitle">Recreación estilo Los Sims desde Fotos & Planos (100% Gratuito)</p>
          </div>
        </div>

        <div className="header-right">
          {/* SELECTOR RÁPIDO ENTRE TALLER DEL CLIENTE Y DEMO */}
          <div className="btn-segmented" style={{ marginRight: '0.5rem' }}>
            <button
              className={`btn-toggle ${floorplan.name.includes('Taller') ? 'active' : ''}`}
              onClick={() => {
                setFloorplan(clientWorkshopFloorplan);
                setSelectedFurniture(null);
                setSelectedRoomId(null);
              }}
              title="Cargar el Taller Real del Cliente (4.15m x 5.15m)"
            >
              🔨 Taller del Cliente
            </button>
            <button
              className={`btn-toggle ${floorplan.name.includes('Escandinava') ? 'active' : ''}`}
              onClick={() => {
                setFloorplan(demoHouseFloorplan);
                setSelectedFurniture(null);
                setSelectedRoomId(null);
              }}
              title="Cargar Casa Modelo Escandinava"
            >
              🏡 Casa Demo
            </button>
          </div>

          <button
            className="btn-action primary"
            onClick={() => setIsUploadOpen(true)}
            style={{ fontWeight: 600, padding: '0.45rem 0.95rem' }}
            title="Subir fotos del cliente o nuevo plano"
          >
            <Layers size={15} className="icon-mr" />
            Subir Fotos / IA
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL: VISOR 3D + PANEL LATERAL */}
      <main className="main-content">
        <Viewport3D
          floorplan={floorplan}
          wallMode={wallMode}
          viewMode={viewMode}
          activeLevel={activeLevel}
          onSelectFurniture={handleSelectFurniture}
          onSelectRoom={handleSelectRoom}
          sceneManagerRef={sceneManagerRef}
        />

        {/* BARRA FLOTANTE DE CONTROLES SIMS */}
        <ViewerControls
          wallMode={wallMode}
          onWallModeChange={setWallMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          floorplan={floorplan}
          activeLevel={activeLevel}
          onLevelChange={setActiveLevel}
          onCenterCamera={handleCenterCamera}
          onExportGlb={handleExportGlb}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* PANEL LATERAL DE INSPECCIÓN */}
        {isInspectorOpen && (
          <InspectorPanel
            floorplan={floorplan}
            selectedRoom={selectedRoom}
            selectedFurniture={selectedFurniture}
            onClose={() => setIsInspectorOpen(false)}
            onUpdateFurniture={handleUpdateFurniture}
            onUpdateRoom={handleUpdateRoom}
          />
        )}
      </main>

      {/* MODAL DE SUBIDA DE PLANOS / FOTOS */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFloorplanLoaded={(newPlan) => {
          setFloorplan(newPlan);
          setSelectedFurniture(null);
          setSelectedRoomId(null);
        }}
      />
    </div>
  );
};

export default App;
