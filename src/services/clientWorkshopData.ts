import type { HouseFloorplan } from '../types/floorplan';

/**
 * Recreación 1:1 EXACTA del Taller a partir ÚNICAMENTE de las imágenes:
 * "entrada al taller.jpeg" y "entrada al taller 2.jpeg"
 *
 * Características críticas:
 * 1. UNA SOLA HABITACIÓN (sin divisiones internas):
 *    - Ancho: 4.15 metros
 *    - Fondo: 5.15 metros
 *    - Altura: 3.20 metros
 * 2. Ventanal / puerta-ventana del fondo en ángulo oblicuo de 45° uniendo pared izquierda y pared de fondo.
 * 3. Ventana lateral izquierda con cortinas blancas.
 * 4. Ventana de medio punto en la pared de fondo con maceta roja.
 * 5. Piso bicolor integrado (mitad izquierda oscura y mitad derecha de madera clara con alfombra beige).
 * 6. Gran mesa de corte a la izquierda, banco de trabajo con sensitiva y herramientas a la derecha,
 *    escritorio con flexo iluminado al fondo y banco de pallet en el acceso.
 */
export const clientWorkshopFloorplan: HouseFloorplan = {
  name: 'Taller de Oficios (Recreación Fiel 1:1)',
  totalAreaM2: 20.8,
  description:
    'Habitación única de 4.15m de ancho x 5.15m de fondo x 3.20m de alto. Vista desde el arco de entrada: ventanal a 45° en la esquina del fondo-izquierda con cortinas recogidas, ventana en pared izquierda, ventana de medio punto al fondo, banco de trabajo derecho con sensitiva turquesa y mesa de corte izquierda.',
  levels: [
    {
      levelIndex: 0,
      name: 'Planta Única',
      elevation: 0,
      rooms: [
        {
          id: 'room_taller_unico',
          name: 'Taller',
          floorMaterial: 'wood_parquet',
          floorColor: '#D2A472', // Tono madera clara predominante
          wallColor: '#DCD1E3',  // Lavanda / lila característico de las fotos
          wallHeight: 3.2,
          wallThickness: 0.18,
          // Polígono perimetral con el chaflán a 45° en la esquina fondo-izquierda:
          // 0: (0, 0)        -> Esquina frente-izquierda
          // 1: (4.15, 0)     -> Esquina frente-derecha (abertura arco de entrada)
          // 2: (4.15, 5.15)  -> Esquina fondo-derecha
          // 3: (1.20, 5.15)  -> Fin pared de fondo / Inicio pared diagonal 45°
          // 4: (0, 3.95)     -> Fin pared diagonal 45° / Inicio pared izquierda
          floorPolygon: [
            { x: 0, y: 0 },
            { x: 4.15, y: 0 },
            { x: 4.15, y: 5.15 },
            { x: 1.2, y: 5.15 },
            { x: 0, y: 3.95 },
          ],
          openings: [
            // 1. Arco de entrada frontal (desde donde se toman las fotos, pared 0 entre (0,0) y (4.15,0))
            {
              id: 'arch_main_entry',
              type: 'door',
              wallStartIndex: 0,
              offset: 0.5,
              width: 3.15,
              height: 2.7,
              sillHeight: 0,
            },
            // 2. Ventana de la pared izquierda (entre (0, 3.95) y (0, 0))
            {
              id: 'win_left_wall',
              type: 'window',
              wallStartIndex: 4,
              offset: 1.2,
              width: 0.95,
              height: 1.35,
              sillHeight: 1.1,
            },
            // 3. Ventanal / puerta-ventana a 45° en la esquina del fondo (entre (1.2, 5.15) y (0, 3.95))
            {
              id: 'french_door_45deg',
              type: 'door',
              wallStartIndex: 3,
              offset: 0.15,
              width: 1.4,
              height: 2.5,
              sillHeight: 0,
            },
            // 4. Ventana de medio punto en la pared del fondo (entre (4.15, 5.15) y (1.2, 5.15))
            {
              id: 'win_back_arch',
              type: 'window',
              wallStartIndex: 2,
              offset: 0.9,
              width: 0.75,
              height: 1.35,
              sillHeight: 1.15,
            },
          ],
          furniture: [
            /* -----------------------------------------------------------
               1. SUELO TÉCNICO OSCURO (Mitad izquierda como se ve en la foto)
            ----------------------------------------------------------- */
            {
              id: 'furn_dark_floor_mat',
              name: 'Suelo Técnico Oscuro (Zona Izquierda)',
              category: 'rug',
              dimensions: [1.8, 4.0, 0.005],
              position: [0.95, 0.002, 2.05],
              rotationY: 0,
              color: '#24272D',
            },

            /* -----------------------------------------------------------
               2. ZONA IZQUIERDA: GRAN MESA DE CORTE / DIBUJO
            ----------------------------------------------------------- */
            {
              id: 'furn_cutting_table',
              name: 'Mesa de Corte & Dibujo (Base Blanca y Tapa Madera)',
              category: 'table',
              dimensions: [1.85, 0.85, 0.82],
              position: [0.65, 0, 2.0],
              rotationY: 90,
              color: '#D4AA7D',
              secondaryColor: '#FFFFFF',
              materialType: 'wood',
            },
            // Silla plegable blanca frente a la mesa de corte
            {
              id: 'furn_chair_cutting',
              name: 'Silla Plegable Blanca (Mesa de Corte)',
              category: 'chair',
              dimensions: [0.45, 0.45, 0.8],
              position: [1.35, 0, 1.85],
              rotationY: 270,
              color: '#F2F2F2',
              secondaryColor: '#616161',
            },
            // Estantes flotantes sobre la mesa de corte en la pared izquierda
            {
              id: 'furn_wall_shelves_left',
              name: 'Estantes Flotantes de Pared con Insumos',
              category: 'wardrobe',
              dimensions: [1.2, 0.22, 0.55],
              position: [0.15, 1.6, 2.2],
              rotationY: 90,
              color: '#6D4C41',
              secondaryColor: '#3E2723',
            },

            /* -----------------------------------------------------------
               3. FONDO: ESCRITORIO CON LÁMPARA FLEXO & PANEL TRASERO
            ----------------------------------------------------------- */
            {
              id: 'furn_study_desk_back',
              name: 'Escritorio con Lámpara Flexo & Panel Trasero',
              category: 'desk',
              dimensions: [0.95, 0.65, 0.76],
              position: [1.85, 0, 4.75],
              rotationY: 180,
              color: '#E0C9A6',
              secondaryColor: '#212121',
            },
            // Silla plegable blanca del escritorio
            {
              id: 'furn_chair_study_back',
              name: 'Silla Plegable Blanca (Escritorio del Fondo)',
              category: 'chair',
              dimensions: [0.45, 0.45, 0.8],
              position: [1.85, 0, 4.15],
              rotationY: 0,
              color: '#F2F2F2',
              secondaryColor: '#616161',
            },
            // Objeto vertical de madera torneada en la esquina
            {
              id: 'furn_wood_bat',
              name: 'Pieza de Madera Torneada (Rincón)',
              category: 'decor',
              dimensions: [0.15, 0.15, 0.85],
              position: [0.35, 0, 3.85],
              rotationY: 0,
              color: '#8D6E63',
            },

            /* -----------------------------------------------------------
               4. ALFONDO DERECHA: VENTANA CON MACETA ROJA
            ----------------------------------------------------------- */
            {
              id: 'furn_window_plant_red',
              name: 'Planta en Maceta Roja (Alféizar Ventana)',
              category: 'plant',
              dimensions: [0.22, 0.22, 0.35],
              position: [2.95, 1.15, 5.08],
              rotationY: 0,
              color: '#C62828',
            },

            /* -----------------------------------------------------------
               5. ZONA DERECHA: BANCO DE TRABAJO, HERRAMIENTAS Y ESTANTERÍAS
            ----------------------------------------------------------- */
            // Estera / alfombra clara frente al banco
            {
              id: 'furn_rug_workbench',
              name: 'Alfombra / Estera Clara de Trabajo',
              category: 'rug',
              dimensions: [1.8, 1.3, 0.01],
              position: [2.75, 0.005, 3.0],
              rotationY: 0,
              color: '#E6E0D6',
            },
            // Banco de trabajo principal con sierra sensitiva turquesa y morsa azul
            {
              id: 'furn_workbench_main',
              name: 'Banco de Trabajo Principal con Sensitiva & Morsa',
              category: 'table',
              dimensions: [2.15, 0.85, 0.88],
              position: [3.65, 0, 2.95],
              rotationY: 90,
              color: '#D4C5A9',
              secondaryColor: '#2B2B2B',
              materialType: 'wood',
            },
            // Silla plegable frente al banco de trabajo
            {
              id: 'furn_chair_workbench',
              name: 'Silla Plegable Blanca (Banco de Trabajo)',
              category: 'chair',
              dimensions: [0.45, 0.45, 0.8],
              position: [2.95, 0, 2.95],
              rotationY: 90,
              color: '#F2F2F2',
              secondaryColor: '#616161',
            },
            // Cajonera de melamina de 3 cajones
            {
              id: 'furn_drawers_bench',
              name: 'Cajonera de Melamina (3 Cajones)',
              category: 'wardrobe',
              dimensions: [0.55, 0.55, 0.78],
              position: [3.75, 0, 4.2],
              rotationY: 270,
              color: '#C68B59',
              secondaryColor: '#4A3B32',
              materialType: 'wood',
            },
            // Panel mural de madera con herramientas en la pared derecha
            {
              id: 'furn_tool_wall_right',
              name: 'Panel Mural de Herramientas de Madera con Soldadora',
              category: 'decor',
              dimensions: [1.9, 0.06, 0.95],
              position: [4.1, 1.6, 2.95],
              rotationY: 90,
              color: '#9C5B28',
              secondaryColor: '#1A5D1A',
            },
            // Estanterías metálicas de pared
            {
              id: 'furn_shelves_right',
              name: 'Estanterías Metálicas de Pared con Herramientas',
              category: 'wardrobe',
              dimensions: [1.1, 0.38, 1.9],
              position: [3.95, 0, 1.3],
              rotationY: 90,
              color: '#262626',
              secondaryColor: '#C49A6C',
            },
            // Torre de valijas rojas/negras
            {
              id: 'furn_toolboxes_stack',
              name: 'Torre de Valijas Apilables (Rojo/Negro)',
              category: 'wardrobe',
              dimensions: [0.58, 0.48, 1.1],
              position: [3.55, 0, 4.65],
              rotationY: 0,
              color: '#D32F2F',
              secondaryColor: '#1E1E1E',
            },
            // Aspiradora industrial cilíndrica de acero inoxidable
            {
              id: 'furn_vacuum_cleaner',
              name: 'Aspiradora Industrial de Taller',
              category: 'appliance',
              dimensions: [0.38, 0.38, 0.65],
              position: [2.95, 0, 4.7],
              rotationY: 0,
              color: '#B0BEC5',
              secondaryColor: '#D32F2F',
            },
            // Banco bajo rústico de pallet de madera en el ingreso
            {
              id: 'furn_pallet_bench_front',
              name: 'Banco Bajo de Pallet de Madera',
              category: 'table',
              dimensions: [0.85, 0.55, 0.38],
              position: [3.55, 0, 0.55],
              rotationY: 0,
              color: '#B8926A',
              materialType: 'wood',
            },
            // Papelera / bote cilíndrico en el piso
            {
              id: 'furn_trash_can',
              name: 'Bote / Contenedor Cilíndrico de Piso',
              category: 'decor',
              dimensions: [0.3, 0.3, 0.4],
              position: [2.95, 0, 2.1],
              rotationY: 0,
              color: '#455A64',
            },

            /* -----------------------------------------------------------
               6. PRIMER PLANO: MATE CON BOMBILLA
            ----------------------------------------------------------- */
            {
              id: 'furn_mate_argentino',
              name: 'Mate Tradicional con Bombilla en Soporte',
              category: 'decor',
              dimensions: [0.16, 0.16, 0.22],
              position: [1.8, 0.85, 0.4],
              rotationY: 0,
              color: '#4E342E',
              secondaryColor: '#B0BEC5',
            },
          ],
        },
      ],
    },
  ],
};
