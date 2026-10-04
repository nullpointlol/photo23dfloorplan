export interface Point2D {
  x: number;
  y: number;
}

export type FurnitureCategory =
  | 'sofa'
  | 'bed'
  | 'table'
  | 'chair'
  | 'kitchen'
  | 'wardrobe'
  | 'tv_unit'
  | 'bathroom'
  | 'desk'
  | 'appliance'
  | 'plant'
  | 'rug'
  | 'decor';

export type MaterialType =
  | 'wood'
  | 'fabric'
  | 'leather'
  | 'metal'
  | 'glass'
  | 'ceramic'
  | 'marble'
  | 'plastic';

export type FloorMaterialType =
  | 'wood_parquet'
  | 'tile_ceramic'
  | 'marble'
  | 'carpet'
  | 'concrete';

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  dimensions: [number, number, number]; // [width (X), depth (Z), height (Y)] in meters
  position: [number, number, number];   // [X, Y (elevation), Z] in meters
  rotationY: number;                    // in degrees (0 - 360)
  color: string;                        // hex format #RRGGBB
  secondaryColor?: string;
  materialType?: MaterialType;
  shapeVariant?: 'standard' | 'l_shape' | 'round' | 'minimal' | 'modern';
  notes?: string;
}

export interface WallOpening {
  id: string;
  type: 'door' | 'window';
  wallStartIndex: number; // index of vertex in floorPolygon
  offset: number;         // distance from start vertex in meters
  width: number;          // width of opening in meters
  height: number;         // height in meters
  sillHeight?: number;    // antepecho / distance from floor in meters (default 0 for doors, ~0.9 for windows)
}

export interface Room {
  id: string;
  name: string;
  floorPolygon: Point2D[]; // Counter-clockwise or clockwise 2D polygon vertices in meters
  floorMaterial: FloorMaterialType;
  floorColor: string;
  wallColor: string;
  wallHeight: number;      // default 2.6m
  wallThickness?: number;  // default 0.15m
  openings?: WallOpening[];
  furniture: FurnitureItem[];
}

export interface FloorLevel {
  levelIndex: number;
  name: string;
  elevation: number;
  rooms: Room[];
}

export interface HouseFloorplan {
  name: string;
  totalAreaM2?: number;
  description?: string;
  levels: FloorLevel[];
}

export type WallDisplayMode = 'dollhouse' | 'full' | 'cutout';
export type CameraViewMode = 'isometric' | 'topdown' | 'perspective';
