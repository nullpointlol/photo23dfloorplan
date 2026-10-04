import React, { useState } from 'react';
import {
  AlertCircle,
  Camera,
  FileText,
  Key,
  Layers,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  generateFloorplanWithGemini,
  getStoredApiKey,
  saveStoredApiKey,
  type IngestionInput,
} from '../services/gemini';
import { clientWorkshopFloorplan } from '../services/clientWorkshopData';
import { demoHouseFloorplan } from '../services/mockData';
import type { HouseFloorplan } from '../types/floorplan';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFloorplanLoaded: (floorplan: HouseFloorplan) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onFloorplanLoaded,
}) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [planDescription, setPlanDescription] = useState(
    'Living comedor de 6.0m de largo por 4.8m de ancho con piso de parquet claro. Sillón en L gris marengo contra la pared, mesa ratona y mueble rack con TV de 65". Cocina integrada de 4.0m x 3.2m con isla blanca desayunadora y mesada de cuarzo con bajomesada gris. Dormitorio de 4.2m x 3.6m con cama King Size, respaldo tapizado y placard de 3 puertas. Baño de 2.6m x 2.2m con vanitory moderno e inodoro.'
  );

  const [blueprintFile, setBlueprintFile] = useState<{
    name: string;
    dataBase64: string;
    mimeType: string;
  } | null>(null);

  const [roomPhotos, setRoomPhotos] = useState<
    { id: string; roomName: string; name: string; dataBase64: string; mimeType: string }[]
  >([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    saveStoredApiKey(val);
  };

  const handleBlueprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setBlueprintFile({
        name: file.name,
        dataBase64: base64,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const defaultNames = ['Living', 'Cocina', 'Dormitorio', 'Baño'];
        const assignedName = defaultNames[idx % defaultNames.length] || `Habitación ${idx + 1}`;

        setRoomPhotos((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            roomName: assignedName,
            name: file.name,
            dataBase64: base64,
            mimeType: file.type || 'image/jpeg',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    setRoomPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleProcessWithGemini = async () => {
    if (!apiKey) {
      setErrorMessage('Ingresa tu Gemini API Key para procesar los planos.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      setProgressStep('Enviando planos y fotos a Gemini 3.8 Flash...');

      const input: IngestionInput = {
        blueprintImage: blueprintFile
          ? {
              dataBase64: blueprintFile.dataBase64,
              mimeType: blueprintFile.mimeType,
            }
          : undefined,
        planDescription,
        roomPhotos: roomPhotos.map((p) => ({
          roomName: p.roomName,
          dataBase64: p.dataBase64,
          mimeType: p.mimeType,
        })),
      };

      setProgressStep('Reconociendo cotas métricas y extrayendo mobiliario 1:1...');
      const result = await generateFloorplanWithGemini(input, apiKey);

      setProgressStep('Construyendo geometría 3D estilo Los Sims...');
      onFloorplanLoaded(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la vivienda.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  const handleLoadDemo = () => {
    onFloorplanLoaded(demoHouseFloorplan);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-title">
            <Sparkles className="text-accent" size={20} />
            <h2>Digitalizar Vivienda en 3D (Circuito Gratuito)</h2>
          </div>
          <button className="btn-close-icon" onClick={onClose} disabled={isProcessing}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* PASO 0: API KEY GRATUITA */}
          <div className="input-card">
            <div className="card-header-icon">
              <Key size={16} className="text-accent" />
              <span className="card-title">Google Gemini API Key (100% Gratuito)</span>
            </div>
            <p className="card-hint">
              Utiliza el tier gratuito de Google AI Studio (15 RPM y 1M tokens/min sin costo).
            </p>
            <input
              type="password"
              className="text-input"
              placeholder="Pega aquí tu clave AIzaSy..."
              value={apiKey}
              onChange={handleApiKeyChange}
            />
          </div>

          {/* PASO 1: PLANO / DIBUJO CON MEDIDAS */}
          <div className="input-card">
            <div className="card-header-icon">
              <Layers size={16} className="text-accent" />
              <span className="card-title">1. Plano o Croquis con Cotas (Opcional si describes abajo)</span>
            </div>
            <label className="file-dropzone">
              <Upload size={22} className="dropzone-icon" />
              <span className="dropzone-text">
                {blueprintFile ? `Plano cargado: ${blueprintFile.name}` : 'Arrastra o haz clic para subir plano (JPG, PNG)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBlueprintUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* PASO 2: DESCRIPCIÓN CON MEDIDAS */}
          <div className="input-card">
            <div className="card-header-icon">
              <FileText size={16} className="text-accent" />
              <span className="card-title">2. Medidas y Detalles por Escrito</span>
            </div>
            <p className="card-hint">
              Indica las dimensiones de cada habitación, colores y muebles para lograr fidelidad 1:1.
            </p>
            <textarea
              className="textarea-input"
              rows={4}
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="Ej: Living de 5x4m con sofá gris y ventana al frente..."
            />
          </div>

          {/* PASO 3: FOTOS POR HABITACIÓN */}
          <div className="input-card">
            <div className="card-header-icon">
              <Camera size={16} className="text-accent" />
              <span className="card-title">3. Fotos por Habitación (al menos 1 por ambiente)</span>
            </div>
            <p className="card-hint">
              Sube fotos para que la IA identifique los muebles, colores y texturas reales.
            </p>
            <label className="file-dropzone compact">
              <Upload size={18} className="dropzone-icon" />
              <span className="dropzone-text">Seleccionar fotos de habitaciones</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>

            {roomPhotos.length > 0 && (
              <div className="photos-grid">
                {roomPhotos.map((photo) => (
                  <div key={photo.id} className="photo-tag-card">
                    <input
                      type="text"
                      className="room-tag-input"
                      value={photo.roomName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRoomPhotos((prev) =>
                          prev.map((p) => (p.id === photo.id ? { ...p, roomName: val } : p))
                        );
                      }}
                      placeholder="Nombre ambiente"
                    />
                    <span className="photo-filename">{photo.name}</span>
                    <button
                      className="btn-remove-photo"
                      onClick={() => handleRemovePhoto(photo.id)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="error-alert">
              <AlertCircle size={16} className="icon-mr" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isProcessing && (
            <div className="processing-indicator">
              <div className="spinner" />
              <div className="processing-text">
                <strong>Digitalizando casa con IA...</strong>
                <span>{progressStep}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => {
                onFloorplanLoaded(clientWorkshopFloorplan);
                onClose();
              }}
              disabled={isProcessing}
            >
              🔨 Cargar Taller Real (4.15x5.15m)
            </button>
            <button className="btn-secondary" onClick={handleLoadDemo} disabled={isProcessing}>
              Casa Demo
            </button>
          </div>

          <button
            className="btn-primary-action"
            onClick={handleProcessWithGemini}
            disabled={isProcessing}
          >
            <Sparkles size={16} className="icon-mr" />
            {isProcessing ? 'Procesando...' : 'Generar Casa 3D con IA'}
          </button>
        </div>
      </div>
    </div>
  );
};
