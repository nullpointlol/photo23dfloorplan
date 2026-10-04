import type { HouseFloorplan } from '../types/floorplan';

export const demoHouseFloorplan: HouseFloorplan = {
  name: 'Casa Residencial Escandinava',
  totalAreaM2: 78.5,
  description:
    'Vivienda unifamiliar de 1 planta: Living-comedor integrado, cocina con isla, dormitorio principal con vestidor y baño completo.',
  levels: [
    {
      levelIndex: 0,
      name: 'Planta Baja',
      elevation: 0,
      rooms: [
        // 1. LIVING & COMEDOR (6.0m x 4.8m)
        {
          id: 'room_living',
          name: 'Living & Comedor',
          floorMaterial: 'wood_parquet',
          floorColor: '#C49A6C',
          wallColor: '#F5F5F0',
          wallHeight: 2.6,
          wallThickness: 0.15,
          floorPolygon: [
            { x: 0, y: 0 },
            { x: 6.0, y: 0 },
            { x: 6.0, y: 4.8 },
            { x: 0, y: 4.8 },
          ],
          openings: [
            // Ventanal balcón en pared sur (offset 1.0m, ancho 2.8m)
            {
              id: 'win_living_main',
              type: 'window',
              wallStartIndex: 0,
              offset: 1.2,
              width: 2.8,
              height: 2.1,
              sillHeight: 0.1,
            },
            // Puerta de entrada principal en pared oeste
            {
              id: 'door_main_entrance',
              type: 'door',
              wallStartIndex: 3,
              offset: 1.0,
              width: 0.95,
              height: 2.15,
              sillHeight: 0,
            },
          ],
          furniture: [
            // Alfombra grande de living
            {
              id: 'furn_rug_living',
              name: 'Alfombra Nórdica',
              category: 'rug',
              dimensions: [3.2, 2.4, 0.02],
              position: [2.5, 0.01, 2.2],
              rotationY: 0,
              color: '#DDD8CE',
            },
            // Sillón esquinero modular en L (Gris marengo oscuro)
            {
              id: 'furn_sofa_l',
              name: 'Sillón Modular en L',
              category: 'sofa',
              shapeVariant: 'l_shape',
              dimensions: [2.7, 1.0, 0.85],
              position: [2.2, 0, 1.8],
              rotationY: 0,
              color: '#3F444C',
              secondaryColor: '#282C34',
              materialType: 'fabric',
            },
            // Mesa ratona centro
            {
              id: 'furn_coffee_table',
              name: 'Mesa Ratona de Roble',
              category: 'table',
              dimensions: [1.1, 0.65, 0.42],
              position: [2.2, 0, 2.7],
              rotationY: 0,
              color: '#A07855',
              materialType: 'wood',
            },
            // Mueble Rack y Smart TV 65"
            {
              id: 'furn_tv_unit',
              name: 'Rack TV + Pantalla 65"',
              category: 'tv_unit',
              dimensions: [2.0, 0.45, 1.2],
              position: [2.2, 0, 4.4],
              rotationY: 180,
              color: '#262626',
              secondaryColor: '#111111',
            },
            // Mesa de comedor
            {
              id: 'furn_dining_table',
              name: 'Mesa de Comedor 6 Personas',
              category: 'table',
              dimensions: [1.8, 0.95, 0.76],
              position: [4.7, 0, 2.4],
              rotationY: 90,
              color: '#8D6E63',
              materialType: 'wood',
            },
            // Silla Comedor 1
            {
              id: 'furn_chair_1',
              name: 'Silla Eames Gris',
              category: 'chair',
              dimensions: [0.45, 0.45, 0.82],
              position: [4.7, 0, 1.6],
              rotationY: 0,
              color: '#E0E0E0',
            },
            // Silla Comedor 2
            {
              id: 'furn_chair_2',
              name: 'Silla Eames Gris',
              category: 'chair',
              dimensions: [0.45, 0.45, 0.82],
              position: [4.7, 0, 3.2],
              rotationY: 180,
              color: '#E0E0E0',
            },
            // Planta decorativa de interior
            {
              id: 'furn_plant_corner',
              name: 'Monstera en Maceta Cerámica',
              category: 'plant',
              dimensions: [0.65, 0.65, 1.2],
              position: [0.5, 0, 0.6],
              rotationY: 45,
              color: '#FFFFFF',
            },
          ],
        },

        // 2. COCINA INTEGRADA (4.0m x 3.2m)
        {
          id: 'room_kitchen',
          name: 'Cocina & Barra',
          floorMaterial: 'tile_ceramic',
          floorColor: '#E8ECEF',
          wallColor: '#FAFAFA',
          wallHeight: 2.6,
          wallThickness: 0.15,
          floorPolygon: [
            { x: 6.0, y: 0 },
            { x: 10.0, y: 0 },
            { x: 10.0, y: 3.2 },
            { x: 6.0, y: 3.2 },
          ],
          openings: [
            // Ventana sobre la bacha
            {
              id: 'win_kitchen',
              type: 'window',
              wallStartIndex: 0,
              offset: 1.2,
              width: 1.5,
              height: 1.0,
              sillHeight: 1.1,
            },
          ],
          furniture: [
            // Mesada principal de cocina con bacha
            {
              id: 'furn_kitchen_counter',
              name: 'Mesada Principal con Bacha',
              category: 'kitchen',
              dimensions: [3.4, 0.65, 0.9],
              position: [8.0, 0, 0.4],
              rotationY: 0,
              color: '#2C3E50',
              secondaryColor: '#E0E0E0',
            },
            // Isla central / desayunador
            {
              id: 'furn_kitchen_island',
              name: 'Isla con Desayunador',
              category: 'table',
              dimensions: [1.8, 0.8, 0.92],
              position: [8.0, 0, 2.0],
              rotationY: 0,
              color: '#EAEAEA',
              materialType: 'marble',
            },
            // Heladera no-frost
            {
              id: 'furn_fridge',
              name: 'Heladera Doble Puerta Inox',
              category: 'appliance',
              dimensions: [0.85, 0.75, 1.85],
              position: [9.4, 0, 0.45],
              rotationY: 0,
              color: '#A8B2B8',
              secondaryColor: '#333333',
            },
          ],
        },

        // 3. DORMITORIO PRINCIPAL (4.2m x 3.6m)
        {
          id: 'room_bedroom',
          name: 'Dormitorio Principal',
          floorMaterial: 'wood_parquet',
          floorColor: '#C49A6C',
          wallColor: '#F0EBE5',
          wallHeight: 2.6,
          wallThickness: 0.15,
          floorPolygon: [
            { x: 0, y: 4.8 },
            { x: 4.2, y: 4.8 },
            { x: 4.2, y: 8.4 },
            { x: 0, y: 8.4 },
          ],
          openings: [
            // Ventana luminosa hacia el jardín
            {
              id: 'win_bed_garden',
              type: 'window',
              wallStartIndex: 2,
              offset: 1.1,
              width: 2.0,
              height: 1.4,
              sillHeight: 0.8,
            },
            // Puerta paso desde el pasillo
            {
              id: 'door_bed_hall',
              type: 'door',
              wallStartIndex: 0,
              offset: 0.8,
              width: 0.85,
              height: 2.1,
              sillHeight: 0,
            },
          ],
          furniture: [
            // Cama King Size
            {
              id: 'furn_bed_king',
              name: 'Cama King Size Sommier',
              category: 'bed',
              dimensions: [2.0, 2.0, 1.1],
              position: [2.1, 0, 6.4],
              rotationY: 0,
              color: '#F5F5F5',
              secondaryColor: '#8C7862',
              materialType: 'wood',
            },
            // Placard / Vestidor de piso a techo
            {
              id: 'furn_wardrobe_bed',
              name: 'Placard Corredizo 3 Puertas',
              category: 'wardrobe',
              dimensions: [2.6, 0.65, 2.4],
              position: [0.4, 0, 6.4],
              rotationY: 90,
              color: '#E3DFD8',
              secondaryColor: '#5C5446',
            },
            // Escritorio de trabajo
            {
              id: 'furn_desk_bed',
              name: 'Escritorio con Laptop',
              category: 'desk',
              dimensions: [1.2, 0.6, 0.75],
              position: [3.4, 0, 7.8],
              rotationY: 180,
              color: '#424242',
            },
          ],
        },

        // 4. BAÑO COMPLETO EN SUITE (2.6m x 2.2m)
        {
          id: 'room_bathroom',
          name: 'Baño Completo',
          floorMaterial: 'marble',
          floorColor: '#F8F9FA',
          wallColor: '#FFFFFF',
          wallHeight: 2.6,
          wallThickness: 0.15,
          floorPolygon: [
            { x: 4.2, y: 4.8 },
            { x: 6.8, y: 4.8 },
            { x: 6.8, y: 7.0 },
            { x: 4.2, y: 7.0 },
          ],
          openings: [
            {
              id: 'door_bath_hall',
              type: 'door',
              wallStartIndex: 0,
              offset: 0.5,
              width: 0.75,
              height: 2.1,
              sillHeight: 0,
            },
          ],
          furniture: [
            // Inodoro
            {
              id: 'furn_toilet',
              name: 'Inodoro con Mochila',
              category: 'bathroom',
              dimensions: [0.45, 0.65, 0.8],
              position: [4.7, 0, 6.5],
              rotationY: 0,
              color: '#FFFFFF',
            },
            // Vanitory suspendido con espejo
            {
              id: 'furn_vanity',
              name: 'Vanitory con Espejo LED',
              category: 'bathroom',
              dimensions: [0.95, 0.5, 0.85],
              position: [5.8, 0, 6.5],
              rotationY: 0,
              color: '#3B4252',
            },
          ],
        },
      ],
    },
  ],
};
