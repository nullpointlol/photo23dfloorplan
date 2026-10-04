import * as THREE from 'three';
import type { FurnitureItem } from '../types/floorplan';

/**
 * Creates a parametric 1:1 3D furniture group based on exact dimensions and colors
 */
export function createFurnitureMesh(item: FurnitureItem): THREE.Group {
  const group = new THREE.Group();
  group.name = `furniture_${item.id}`;

  const [w, d, h] = item.dimensions;
  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(item.color || '#5A5A5A'),
    roughness: 0.6,
    metalness: 0.1,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(item.secondaryColor || '#2B2B2B'),
    roughness: 0.5,
    metalness: 0.2,
  });

  const woodLegMat = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.7,
  });

  switch (item.category) {
    case 'sofa':
      buildSofa(group, w, d, h, primaryMat, secondaryMat, item.shapeVariant);
      break;

    case 'bed':
      buildBed(group, w, d, h, primaryMat, secondaryMat);
      break;

    case 'table':
      if (item.name?.toLowerCase().includes('banco de trabajo')) {
        buildWorkbench(group, w, d, h, primaryMat, secondaryMat);
      } else if (item.name?.toLowerCase().includes('pallet')) {
        buildPalletBench(group, w, d, h, woodLegMat);
      } else {
        buildTable(group, w, d, h, primaryMat, woodLegMat, item.shapeVariant);
      }
      break;

    case 'chair':
      buildChair(group, w, d, h, primaryMat, woodLegMat);
      break;

    case 'kitchen':
      buildKitchenCounter(group, w, d, h, primaryMat, secondaryMat);
      break;

    case 'wardrobe':
      if (item.name?.toLowerCase().includes('valijas')) {
        buildToolboxStack(group, w, d, h);
      } else {
        buildWardrobe(group, w, d, h, primaryMat, secondaryMat);
      }
      break;

    case 'tv_unit':
      buildTvUnit(group, w, d, h, primaryMat, secondaryMat);
      break;

    case 'bathroom':
      buildBathroomFixture(group, w, d, h, primaryMat, secondaryMat, item.name);
      break;

    case 'desk':
      buildDesk(group, w, d, h, primaryMat, woodLegMat);
      break;

    case 'appliance':
      if (item.name?.toLowerCase().includes('aspiradora')) {
        buildIndustrialVacuum(group, w, d, h);
      } else {
        buildFridge(group, w, d, h, primaryMat, secondaryMat);
      }
      break;

    case 'plant':
      buildPlant(group, w, d, h);
      break;

    case 'decor':
      if (
        item.name?.toLowerCase().includes('panel mural') ||
        item.name?.toLowerCase().includes('herramientas')
      ) {
        buildToolBoard(group, w, d, h, primaryMat, secondaryMat);
      } else if (item.name?.toLowerCase().includes('torneada')) {
        buildTurnedWood(group, w, d, h, woodLegMat);
      } else if (item.name?.toLowerCase().includes('mate')) {
        buildMate(group, w, d, h);
      } else {
        const boxGeom = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(boxGeom, primaryMat);
        mesh.position.y = h / 2;
        group.add(mesh);
      }
      break;

    case 'rug':
      buildRug(group, w, d, primaryMat);
      break;

    default: {
      // Clean fallback cabinet/box with bevelled appearance
      const boxGeom = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(boxGeom, primaryMat);
      mesh.position.y = h / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      break;
    }
  }

  // Set position and rotation
  group.position.set(item.position[0], item.position[1], item.position[2]);
  group.rotation.y = (item.rotationY * Math.PI) / 180;

  // Metadata for clicking & inspection
  group.userData = {
    type: 'furniture',
    itemData: item,
  };

  return group;
}

/* ----------------------------------------------------
   INDIVIDUAL PARAMETRIC BUILDERS
---------------------------------------------------- */

function buildSofa(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  primaryMat: THREE.Material,
  secondaryMat: THREE.Material,
  variant?: string
) {
  const seatH = h * 0.45;
  const backH = h * 0.55;
  const backDepth = d * 0.25;
  const armWidth = Math.min(0.2, w * 0.12);

  // Seat cushion base
  const seatGeom = new THREE.BoxGeometry(w - armWidth * 2, seatH, d - backDepth);
  const seat = new THREE.Mesh(seatGeom, primaryMat);
  seat.position.set(0, seatH / 2, backDepth / 2);
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const backGeom = new THREE.BoxGeometry(w, backH, backDepth);
  const back = new THREE.Mesh(backGeom, primaryMat);
  back.position.set(0, seatH + backH / 2, -d / 2 + backDepth / 2);
  back.castShadow = true;
  group.add(back);

  // Left armrest
  const armLGeom = new THREE.BoxGeometry(armWidth, h * 0.7, d);
  const armL = new THREE.Mesh(armLGeom, secondaryMat);
  armL.position.set(-w / 2 + armWidth / 2, (h * 0.7) / 2, 0);
  armL.castShadow = true;
  group.add(armL);

  // Right armrest (or Chaise Lounge if L-shape)
  if (variant === 'l_shape') {
    const chaiseDepth = d * 1.8;
    const chaiseGeom = new THREE.BoxGeometry(armWidth * 2.5, seatH, chaiseDepth);
    const chaise = new THREE.Mesh(chaiseGeom, primaryMat);
    chaise.position.set(w / 2 - (armWidth * 2.5) / 2, seatH / 2, chaiseDepth / 2 - d / 2);
    chaise.castShadow = true;
    group.add(chaise);
  } else {
    const armRGeom = new THREE.BoxGeometry(armWidth, h * 0.7, d);
    const armR = new THREE.Mesh(armRGeom, secondaryMat);
    armR.position.set(w / 2 - armWidth / 2, (h * 0.7) / 2, 0);
    armR.castShadow = true;
    group.add(armR);
  }
}

function buildBed(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  sheetMat: THREE.Material,
  woodMat: THREE.Material
) {
  const frameH = 0.25;
  const mattressH = 0.22;
  const headboardH = h;

  // Bed frame base
  const frameGeom = new THREE.BoxGeometry(w, frameH, d);
  const frame = new THREE.Mesh(frameGeom, woodMat);
  frame.position.set(0, frameH / 2, 0);
  frame.castShadow = true;
  group.add(frame);

  // Mattress
  const matGeom = new THREE.BoxGeometry(w * 0.95, mattressH, d * 0.95);
  const mattress = new THREE.Mesh(matGeom, sheetMat);
  mattress.position.set(0, frameH + mattressH / 2, 0);
  mattress.castShadow = true;
  group.add(mattress);

  // Headboard
  const headGeom = new THREE.BoxGeometry(w * 1.02, headboardH, 0.1);
  const headboard = new THREE.Mesh(headGeom, woodMat);
  headboard.position.set(0, headboardH / 2, -d / 2 + 0.05);
  headboard.castShadow = true;
  group.add(headboard);

  // Pillows
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const pillowW = (w * 0.8) / 2;
  const pillowGeom = new THREE.BoxGeometry(pillowW * 0.9, 0.1, 0.4);

  const pillowL = new THREE.Mesh(pillowGeom, pillowMat);
  pillowL.position.set(-pillowW / 2, frameH + mattressH + 0.05, -d / 2 + 0.35);
  pillowL.castShadow = true;
  group.add(pillowL);

  const pillowR = new THREE.Mesh(pillowGeom, pillowMat);
  pillowR.position.set(pillowW / 2, frameH + mattressH + 0.05, -d / 2 + 0.35);
  pillowR.castShadow = true;
  group.add(pillowR);
}

function buildTable(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  topMat: THREE.Material,
  legMat: THREE.Material,
  variant?: string
) {
  const topThickness = 0.04;

  if (variant === 'round') {
    const radius = Math.min(w, d) / 2;
    const topGeom = new THREE.CylinderGeometry(radius, radius, topThickness, 32);
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.set(0, h - topThickness / 2, 0);
    top.castShadow = true;
    group.add(top);

    // Center pedestal
    const pedGeom = new THREE.CylinderGeometry(0.08, 0.25, h - topThickness, 16);
    const ped = new THREE.Mesh(pedGeom, legMat);
    ped.position.set(0, (h - topThickness) / 2, 0);
    ped.castShadow = true;
    group.add(ped);
    return;
  }

  // Rectangular Table
  const topGeom = new THREE.BoxGeometry(w, topThickness, d);
  const top = new THREE.Mesh(topGeom, topMat);
  top.position.set(0, h - topThickness / 2, 0);
  top.castShadow = true;
  group.add(top);

  // 4 Legs
  const legW = 0.05;
  const legH = h - topThickness;
  const legGeom = new THREE.BoxGeometry(legW, legH, legW);
  const xOffset = w / 2 - legW;
  const zOffset = d / 2 - legW;

  const offsets = [
    [-xOffset, -zOffset],
    [xOffset, -zOffset],
    [-xOffset, zOffset],
    [xOffset, zOffset],
  ];

  for (const [lx, lz] of offsets) {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(lx, legH / 2, lz);
    leg.castShadow = true;
    group.add(leg);
  }
}

function buildChair(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  seatMat: THREE.Material,
  legMat: THREE.Material
) {
  const seatH = h * 0.5;
  const seatGeom = new THREE.BoxGeometry(w, 0.04, d);
  const seat = new THREE.Mesh(seatGeom, seatMat);
  seat.position.set(0, seatH, 0);
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const backGeom = new THREE.BoxGeometry(w, h * 0.45, 0.03);
  const back = new THREE.Mesh(backGeom, seatMat);
  back.position.set(0, seatH + (h * 0.45) / 2, -d / 2 + 0.02);
  back.castShadow = true;
  group.add(back);

  // 4 legs
  const legGeom = new THREE.CylinderGeometry(0.02, 0.015, seatH, 8);
  const ox = w * 0.4;
  const oz = d * 0.4;
  for (const [lx, lz] of [[-ox, -oz], [ox, -oz], [-ox, oz], [ox, oz]]) {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(lx, seatH / 2, lz);
    leg.castShadow = true;
    group.add(leg);
  }
}

function buildKitchenCounter(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  cabinetMat: THREE.Material,
  counterTopMat: THREE.Material
) {
  const counterH = 0.05;
  const baseH = h - counterH;

  // Base Cabinet
  const baseGeom = new THREE.BoxGeometry(w, baseH, d);
  const base = new THREE.Mesh(baseGeom, cabinetMat);
  base.position.set(0, baseH / 2, 0);
  base.castShadow = true;
  group.add(base);

  // Countertop
  const topGeom = new THREE.BoxGeometry(w * 1.02, counterH, d * 1.02);
  const top = new THREE.Mesh(topGeom, counterTopMat);
  top.position.set(0, baseH + counterH / 2, 0);
  top.castShadow = true;
  group.add(top);

  // Stainless sink
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
  const sinkGeom = new THREE.BoxGeometry(Math.min(0.6, w * 0.4), 0.02, Math.min(0.4, d * 0.6));
  const sink = new THREE.Mesh(sinkGeom, sinkMat);
  sink.position.set(0, baseH + counterH + 0.01, 0);
  group.add(sink);
}

function buildWardrobe(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  mat: THREE.Material,
  accentMat: THREE.Material
) {
  const mainGeom = new THREE.BoxGeometry(w, h, d);
  const main = new THREE.Mesh(mainGeom, mat);
  main.position.set(0, h / 2, 0);
  main.castShadow = true;
  group.add(main);

  // Door vertical line divider
  const lineGeom = new THREE.BoxGeometry(0.01, h * 0.95, 0.01);
  const line = new THREE.Mesh(lineGeom, accentMat);
  line.position.set(0, h / 2, d / 2 + 0.01);
  group.add(line);
}

function buildTvUnit(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  unitMat: THREE.Material,
  screenMat: THREE.Material
) {
  const standH = Math.min(0.45, h * 0.5);

  // Low shelf
  const standGeom = new THREE.BoxGeometry(w, standH, d);
  const stand = new THREE.Mesh(standGeom, unitMat);
  stand.position.set(0, standH / 2, 0);
  stand.castShadow = true;
  group.add(stand);

  // TV Screen
  const tvW = Math.min(1.4, w * 0.85);
  const tvH = tvW * 0.56; // 16:9 aspect ratio
  const tvGeom = new THREE.BoxGeometry(tvW, tvH, 0.04);
  const tv = new THREE.Mesh(tvGeom, screenMat);
  tv.position.set(0, standH + tvH / 2 + 0.05, 0);
  tv.castShadow = true;
  group.add(tv);
}

function buildBathroomFixture(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  fixtureMat: THREE.Material,
  _accentMat: THREE.Material,
  name?: string
) {
  const isToilet = name?.toLowerCase().includes('inodoro') || name?.toLowerCase().includes('toilet');
  if (isToilet) {
    // Toilet tank + bowl
    const tankGeom = new THREE.BoxGeometry(0.4, 0.45, 0.2);
    const tank = new THREE.Mesh(tankGeom, fixtureMat);
    tank.position.set(0, 0.45 / 2 + 0.4, -0.15);
    tank.castShadow = true;
    group.add(tank);

    const bowlGeom = new THREE.CylinderGeometry(0.2, 0.15, 0.4, 16);
    const bowl = new THREE.Mesh(bowlGeom, fixtureMat);
    bowl.position.set(0, 0.2, 0.1);
    bowl.castShadow = true;
    group.add(bowl);
  } else {
    // Vanity unit + sink
    const vanityGeom = new THREE.BoxGeometry(w, h * 0.85, d);
    const vanity = new THREE.Mesh(vanityGeom, fixtureMat);
    vanity.position.set(0, (h * 0.85) / 2, 0);
    vanity.castShadow = true;
    group.add(vanity);

    // Mirror on top
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xddffff, metalness: 0.9, roughness: 0.1 });
    const mirrorGeom = new THREE.BoxGeometry(w * 0.8, 0.7, 0.02);
    const mirror = new THREE.Mesh(mirrorGeom, mirrorMat);
    mirror.position.set(0, h + 0.4, -d / 2);
    group.add(mirror);
  }
}

function buildDesk(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  topMat: THREE.Material,
  legMat: THREE.Material
) {
  buildTable(group, w, d, h, topMat, legMat);

  // Add Laptop
  const laptopMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
  const laptopBaseGeom = new THREE.BoxGeometry(0.3, 0.01, 0.22);
  const laptopBase = new THREE.Mesh(laptopBaseGeom, laptopMat);
  laptopBase.position.set(0, h + 0.005, 0);
  group.add(laptopBase);

  const screenGeom = new THREE.BoxGeometry(0.3, 0.2, 0.01);
  const screen = new THREE.Mesh(screenGeom, laptopMat);
  screen.position.set(0, h + 0.1, -0.1);
  screen.rotation.x = 0.2;
  group.add(screen);
}

function buildFridge(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  mat: THREE.Material,
  accentMat: THREE.Material
) {
  const bodyGeom = new THREE.BoxGeometry(w, h, d);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.set(0, h / 2, 0);
  body.castShadow = true;
  group.add(body);

  // Door handle
  const handleGeom = new THREE.BoxGeometry(0.02, h * 0.3, 0.03);
  const handle = new THREE.Mesh(handleGeom, accentMat);
  handle.position.set(w / 2 - 0.08, h * 0.5, d / 2 + 0.02);
  group.add(handle);
}

function buildPlant(group: THREE.Group, w: number, d: number, h: number) {
  const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 });

  const potH = h * 0.4;
  const potGeom = new THREE.CylinderGeometry(w / 2, w / 2.5, potH, 16);
  const pot = new THREE.Mesh(potGeom, potMat);
  pot.position.set(0, potH / 2, 0);
  pot.castShadow = true;
  group.add(pot);

  // Green foliage sphere
  const bushGeom = new THREE.DodecahedronGeometry(Math.max(w, d) * 0.6, 1);
  const bush = new THREE.Mesh(bushGeom, leafMat);
  bush.position.set(0, potH + (h - potH) / 2, 0);
  bush.castShadow = true;
  group.add(bush);
}

function buildRug(group: THREE.Group, w: number, d: number, mat: THREE.Material) {
  const rugGeom = new THREE.BoxGeometry(w, 0.01, d);
  const rug = new THREE.Mesh(rugGeom, mat);
  rug.position.set(0, 0.005, 0);
  rug.receiveShadow = true;
  group.add(rug);
}

/* ----------------------------------------------------
   ELEMENTOS ESPECÍFICOS DE TALLER (1:1 REPRODUCIDOS)
---------------------------------------------------- */

function buildWorkbench(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  woodMat: THREE.Material,
  _metalMat: THREE.Material
) {
  const topH = 0.06;
  const legH = h - topH;

  // Tapa gruesa de madera de banco de trabajo
  const topGeom = new THREE.BoxGeometry(w, topH, d);
  const top = new THREE.Mesh(topGeom, woodMat);
  top.position.set(0, h - topH / 2, 0);
  top.castShadow = true;
  group.add(top);

  // Estructura y patas metálicas
  const legMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
  const legW = 0.05;
  const legGeom = new THREE.BoxGeometry(legW, legH, legW);
  const xo = w / 2 - legW;
  const zo = d / 2 - legW;

  for (const [lx, lz] of [[-xo, -zo], [xo, -zo], [-xo, zo], [xo, zo]]) {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(lx, legH / 2, lz);
    leg.castShadow = true;
    group.add(leg);
  }

  // Travesaño de refuerzo
  const crossGeom = new THREE.BoxGeometry(w - legW * 2, 0.03, 0.03);
  const cross = new THREE.Mesh(crossGeom, legMat);
  cross.position.set(0, legH * 0.3, 0);
  group.add(cross);

  // 1. Sierra Sensitiva / Ingleteadora Turquesa sobre el banco
  const sawTurquoiseMat = new THREE.MeshStandardMaterial({ color: 0x00838f, roughness: 0.4 });
  const sawBaseGeom = new THREE.BoxGeometry(0.35, 0.05, 0.32);
  const sawBase = new THREE.Mesh(sawBaseGeom, sawTurquoiseMat);
  sawBase.position.set(-w * 0.25, h + 0.025, 0);
  sawBase.castShadow = true;
  group.add(sawBase);

  // Disco de corte de la sensitiva
  const sawArmGeom = new THREE.BoxGeometry(0.08, 0.28, 0.24);
  const sawArm = new THREE.Mesh(sawArmGeom, sawTurquoiseMat);
  sawArm.position.set(-w * 0.25, h + 0.16, 0);
  sawArm.rotation.z = -0.3;
  sawArm.castShadow = true;
  group.add(sawArm);

  // 2. Morsa de Banco Azul en la esquina
  const viseMat = new THREE.MeshStandardMaterial({ color: 0x1565c0, metalness: 0.7, roughness: 0.3 });
  const viseGeom = new THREE.BoxGeometry(0.18, 0.14, 0.16);
  const vise = new THREE.Mesh(viseGeom, viseMat);
  vise.position.set(w * 0.35, h + 0.07, d * 0.35);
  vise.castShadow = true;
  group.add(vise);
}

function buildToolBoard(
  group: THREE.Group,
  w: number,
  d: number,
  h: number,
  woodMat: THREE.Material,
  _accentMat: THREE.Material
) {
  // Tablero de madera de fondo
  const boardGeom = new THREE.BoxGeometry(w, h, Math.max(d, 0.03));
  const board = new THREE.Mesh(boardGeom, woodMat);
  board.position.set(0, h / 2, 0);
  board.castShadow = true;
  group.add(board);

  // Rieles de herramientas
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
  const railGeom = new THREE.BoxGeometry(w * 0.9, 0.03, 0.02);
  const rail = new THREE.Mesh(railGeom, metalMat);
  rail.position.set(0, h * 0.65, 0.02);
  group.add(rail);

  // Destornilladores / herramientas colgadas (pequeñas siluetas)
  const toolHandleMat = new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.5 });
  for (let i = 0; i < 12; i++) {
    const toolGeom = new THREE.BoxGeometry(0.03, 0.18, 0.02);
    const tool = new THREE.Mesh(toolGeom, toolHandleMat);
    tool.position.set(-w * 0.4 + i * (w * 0.07), h * 0.5, 0.03);
    group.add(tool);
  }

  // Soldadora Inverter Verde Parkside colgada con correa
  const welderMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
  const welderGeom = new THREE.BoxGeometry(0.32, 0.22, 0.16);
  const welder = new THREE.Mesh(welderGeom, welderMat);
  welder.position.set(w * 0.28, h * 0.35, 0.1);
  welder.castShadow = true;
  group.add(welder);
}

function buildToolboxStack(group: THREE.Group, w: number, d: number, h: number) {
  const numBoxes = 3;
  const boxH = h / numBoxes;
  const redMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.6 });
  const latchMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.9 });

  for (let i = 0; i < numBoxes; i++) {
    const yBase = i * boxH;
    // Caja roja principal
    const geom = new THREE.BoxGeometry(w, boxH * 0.85, d);
    const box = new THREE.Mesh(geom, redMat);
    box.position.set(0, yBase + (boxH * 0.85) / 2, 0);
    box.castShadow = true;
    group.add(box);

    // Tapa negra reforzada
    const lidGeom = new THREE.BoxGeometry(w * 1.02, boxH * 0.15, d * 1.02);
    const lid = new THREE.Mesh(lidGeom, blackMat);
    lid.position.set(0, yBase + boxH * 0.85 + (boxH * 0.15) / 2, 0);
    lid.castShadow = true;
    group.add(lid);

    // Broches metálicos
    const latchGeom = new THREE.BoxGeometry(w * 0.3, 0.04, 0.02);
    const latch = new THREE.Mesh(latchGeom, latchMat);
    latch.position.set(0, yBase + boxH * 0.5, d / 2 + 0.015);
    group.add(latch);
  }
}

function buildIndustrialVacuum(group: THREE.Group, w: number, d: number, h: number) {
  const radius = Math.min(w, d) / 2;
  const inoxMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85, roughness: 0.2 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.5 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });

  // Base con rueditas
  const baseGeom = new THREE.CylinderGeometry(radius * 1.1, radius * 1.1, h * 0.12, 16);
  const base = new THREE.Mesh(baseGeom, blackMat);
  base.position.set(0, (h * 0.12) / 2, 0);
  base.castShadow = true;
  group.add(base);

  // Tambor de acero inoxidable
  const drumH = h * 0.55;
  const drumGeom = new THREE.CylinderGeometry(radius, radius, drumH, 20);
  const drum = new THREE.Mesh(drumGeom, inoxMat);
  drum.position.set(0, h * 0.12 + drumH / 2, 0);
  drum.castShadow = true;
  group.add(drum);

  // Cabezal motor rojo
  const headH = h * 0.33;
  const headGeom = new THREE.CylinderGeometry(radius * 0.95, radius, headH, 20);
  const head = new THREE.Mesh(headGeom, redMat);
  head.position.set(0, h * 0.12 + drumH + headH / 2, 0);
  head.castShadow = true;
  group.add(head);
}

function buildPalletBench(group: THREE.Group, w: number, d: number, h: number, woodMat: THREE.Material) {
  const slatH = 0.03;
  const numLayers = 3;
  const layerGap = (h - slatH * numLayers) / (numLayers - 1);

  for (let l = 0; l < numLayers; l++) {
    const y = l * (slatH + layerGap);
    // Tablas longitudinales
    for (let s = -2; s <= 2; s++) {
      const slatGeom = new THREE.BoxGeometry(w, slatH, d * 0.16);
      const slat = new THREE.Mesh(slatGeom, woodMat);
      slat.position.set(0, y + slatH / 2, s * (d * 0.2));
      slat.castShadow = true;
      group.add(slat);
    }
  }

  // Tacos esquineros
  const blockGeom = new THREE.BoxGeometry(0.08, h, 0.08);
  for (const [bx, bz] of [[-w * 0.4, -d * 0.4], [w * 0.4, -d * 0.4], [-w * 0.4, d * 0.4], [w * 0.4, d * 0.4]]) {
    const block = new THREE.Mesh(blockGeom, woodMat);
    block.position.set(bx, h / 2, bz);
    block.castShadow = true;
    group.add(block);
  }
}

function buildTurnedWood(group: THREE.Group, w: number, d: number, h: number, woodMat: THREE.Material) {
  const rTop = Math.min(w, d) / 2;
  const rBot = rTop * 0.4;
  const geom = new THREE.CylinderGeometry(rTop, rBot, h, 16);
  const mesh = new THREE.Mesh(geom, woodMat);
  mesh.position.set(0, h / 2, 0);
  mesh.castShadow = true;
  group.add(mesh);
}

function buildMate(group: THREE.Group, _w: number, _d: number, h: number) {
  const calabashMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.6 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, metalness: 0.9, roughness: 0.2 });

  const mateGeom = new THREE.SphereGeometry(h * 0.35, 16, 16);
  const mateMesh = new THREE.Mesh(mateGeom, calabashMat);
  mateMesh.position.y = h * 0.45;
  mateMesh.scale.set(0.9, 1.1, 0.9);
  mateMesh.castShadow = true;
  group.add(mateMesh);

  const rimGeom = new THREE.CylinderGeometry(h * 0.28, h * 0.28, 0.02, 16);
  const rim = new THREE.Mesh(rimGeom, silverMat);
  rim.position.y = h * 0.75;
  group.add(rim);

  const strawGeom = new THREE.CylinderGeometry(0.008, 0.008, h * 0.8, 8);
  const straw = new THREE.Mesh(strawGeom, silverMat);
  straw.position.set(0.03, h * 0.75, 0.02);
  straw.rotation.z = -0.35;
  straw.castShadow = true;
  group.add(straw);

  const standGeom = new THREE.CylinderGeometry(h * 0.3, h * 0.35, h * 0.35, 3, 1, true);
  const stand = new THREE.Mesh(standGeom, silverMat);
  stand.position.y = h * 0.18;
  group.add(stand);
}
