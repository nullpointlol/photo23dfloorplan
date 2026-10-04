import { GoogleGenAI, Type } from '@google/genai';
import type { HouseFloorplan } from '../types/floorplan';

const LOCAL_STORAGE_KEY = 'gemini_api_key_photo23d';

export function getStoredApiKey(): string {
  return (
    localStorage.getItem(LOCAL_STORAGE_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export function saveStoredApiKey(key: string): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
}

export interface IngestionInput {
  blueprintImage?: { dataBase64: string; mimeType: string };
  planDescription: string;
  roomPhotos: {
    roomName: string;
    dataBase64: string;
    mimeType: string;
  }[];
}

const FLOORPLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Nombre descriptivo de la vivienda' },
    totalAreaM2: { type: Type.NUMBER, description: 'Superficie total estimada en m²' },
    description: { type: Type.STRING, description: 'Resumen arquitectónico de la vivienda' },
    levels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          levelIndex: { type: Type.INTEGER, description: '0 para planta baja, 1 para planta alta' },
          name: { type: Type.STRING, description: 'Planta Baja, etc.' },
          elevation: { type: Type.NUMBER, description: 'Elevación en metros (0 para PB)' },
          rooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'ID único ej: room_living' },
                name: { type: Type.STRING, description: 'Nombre del ambiente ej: Living' },
                floorPolygon: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER, description: 'Coordenada X en metros' },
                      y: { type: Type.NUMBER, description: 'Coordenada Y/Z en metros en el plano horizontal' },
                    },
                    required: ['x', 'y'],
                  },
                },
                floorMaterial: {
                  type: Type.STRING,
                  enum: ['wood_parquet', 'tile_ceramic', 'marble', 'carpet', 'concrete'],
                  description: 'Material del piso',
                },
                floorColor: { type: Type.STRING, description: 'Color hexadecimal del piso (#RRGGBB)' },
                wallColor: { type: Type.STRING, description: 'Color hexadecimal de las paredes (#RRGGBB)' },
                wallHeight: { type: Type.NUMBER, description: 'Altura de muros en metros (ej 2.6)' },
                wallThickness: { type: Type.NUMBER, description: 'Espesor de muro (ej 0.15)' },
                openings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['door', 'window'] },
                      wallStartIndex: { type: Type.INTEGER, description: 'Índice del vértice donde inicia el muro' },
                      offset: { type: Type.NUMBER, description: 'Distancia en metros desde el vértice' },
                      width: { type: Type.NUMBER, description: 'Ancho del vano en metros' },
                      height: { type: Type.NUMBER, description: 'Alto del vano en metros' },
                      sillHeight: { type: Type.NUMBER, description: 'Antepecho (0 para puertas, 0.9 para ventanas)' },
                    },
                    required: ['id', 'type', 'wallStartIndex', 'offset', 'width', 'height'],
                  },
                },
                furniture: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING, description: 'Descripción del mueble visto en la foto' },
                      category: {
                        type: Type.STRING,
                        enum: [
                          'sofa',
                          'bed',
                          'table',
                          'chair',
                          'kitchen',
                          'wardrobe',
                          'tv_unit',
                          'bathroom',
                          'desk',
                          'appliance',
                          'plant',
                          'rug',
                        ],
                      },
                      dimensions: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER },
                        description: '[ancho, profundidad, alto] en metros a escala 1:1',
                      },
                      position: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER },
                        description: '[x, 0, z] coordenadas dentro de la casa en metros',
                      },
                      rotationY: { type: Type.NUMBER, description: 'Rotación en grados (0 a 360)' },
                      color: { type: Type.STRING, description: 'Color hexadecimal principal' },
                      secondaryColor: { type: Type.STRING, description: 'Color hexadecimal secundario' },
                      shapeVariant: {
                        type: Type.STRING,
                        enum: ['standard', 'l_shape', 'round', 'minimal', 'modern'],
                      },
                    },
                    required: ['id', 'name', 'category', 'dimensions', 'position', 'rotationY', 'color'],
                  },
                },
              },
              required: ['id', 'name', 'floorPolygon', 'floorMaterial', 'floorColor', 'wallColor', 'wallHeight', 'furniture'],
            },
          },
        },
        required: ['levelIndex', 'name', 'elevation', 'rooms'],
      },
    },
  },
  required: ['name', 'levels'],
};

/**
 * Calls Gemini 3.8 Flash to interpret blueprint + photos and generate the 3D Floorplan JSON
 */
export async function generateFloorplanWithGemini(
  input: IngestionInput,
  apiKey: string
): Promise<HouseFloorplan> {
  if (!apiKey) {
    throw new Error('Por favor ingresa tu Gemini API Key (es gratuita en Google AI Studio).');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare multimodal content parts
  const contents: Array<string | { inlineData: { data: string; mimeType: string } }> = [];

  const systemInstructions = `Eres un arquitecto experto en modelado BIM 3D y digitalización arquitectónica.
Tu tarea es tomar los planos con cotas, las especificaciones de medidas y las fotografías reales de las habitaciones de una casa, y generar un modelo digital espacial 1:1 en formato JSON con estética 'Los Sims'.

INSTRUCCIONES CLAVE:
1. SISTEMA DE COORDENADAS:
   - Todas las dimensiones y posiciones DEBEN ser en METROS (escala 1:1 exacta).
   - Usa un origen de coordenadas común [0,0] para la casa completa.
   - Las habitaciones deben ser polígonos contiguos y cerrados (floorPolygon) sin superponerse.
   - Si se indican medidas (ej. "Living 5m x 4m"), el polígono debe reflejar exactamente esas dimensiones métricas.

2. ABERTURAS (PUERTAS Y VENTANAS):
   - Coloca puertas y ventanas en los muros correspondientes con su ancho, alto y antepecho (sillHeight).

3. MOBILIARIO 1:1 BASADO EN LAS FOTOS:
   - Por cada habitación analizada en las fotos, identifica los muebles presentes.
   - Determina sus dimensiones métricas estimadas o reales [ancho, profundidad, alto].
   - Posiciona cada mueble [X, 0, Z] DENTRO del polígono de la habitación respectiva, respetando la orientación real que se ve en la foto.
   - Extrae el color hexadecimal exacto o más cercano de los muebles, paredes y pisos que se ven en las fotos.
   - Si un sillón es en 'L', usa shapeVariant: 'l_shape'. Si una mesa es redonda, usa shapeVariant: 'round'.`;

  let promptText = `ANALIZA ESTA VIVIENDA Y GENERA EL PLANO 3D JSON COMPLETO.\n\n`;

  if (input.planDescription) {
    promptText += `### ESPECIFICACIONES Y MEDIDAS ESCRITAS:\n${input.planDescription}\n\n`;
  }

  promptText += `### INSTRUCCIONES:\nPor favor genera la geometría de muros y los muebles 1:1 posicionados dentro de cada ambiente a partir de las imágenes provistas.`;

  contents.push(promptText);

  // Add blueprint image if provided
  if (input.blueprintImage) {
    contents.push({
      inlineData: {
        data: input.blueprintImage.dataBase64,
        mimeType: input.blueprintImage.mimeType,
      },
    });
  }

  // Add room photos
  for (const photo of input.roomPhotos) {
    contents.push(`[Foto de la habitación: "${photo.roomName}"]`);
    contents.push({
      inlineData: {
        data: photo.dataBase64,
        mimeType: photo.mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: 'application/json',
        responseJsonSchema: FLOORPLAN_SCHEMA as any,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('La respuesta del modelo estuvo vacía.');
    }

    const parsed = JSON.parse(responseText) as HouseFloorplan;
    return parsed;
  } catch (error: any) {
    console.error('Error al invocar Gemini API:', error);
    throw new Error(
      error.message || 'Error procesando los planos y fotos con Gemini. Verifica tu API Key y conexión.'
    );
  }
}
