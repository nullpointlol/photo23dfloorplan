import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import type {
  CameraViewMode,
  FurnitureItem,
  HouseFloorplan,
  WallDisplayMode,
} from '../types/floorplan';
import { buildRoomFloor } from './FloorBuilder';
import { createFurnitureMesh } from './FurnitureFactory';
import { buildRoomWalls } from './WallBuilder';

export interface SceneCallbacks {
  onSelectFurniture?: (item: FurnitureItem | null) => void;
  onSelectRoom?: (roomId: string | null) => void;
}

export class HouseSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  public persCamera: THREE.PerspectiveCamera;
  public orthoCamera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  private currentFloorplan: HouseFloorplan | null = null;
  private wallMode: WallDisplayMode = 'dollhouse';
  private viewMode: CameraViewMode = 'isometric';
  private activeLevel = 0;

  private houseGroup: THREE.Group;
  private wallsGroup: THREE.Group;
  private furnitureGroup: THREE.Group;
  private floorsGroup: THREE.Group;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private container: HTMLElement;
  private callbacks: SceneCallbacks;

  private animFrameId: number | null = null;

  constructor(container: HTMLElement, callbacks: SceneCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const aspect = width / height;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f2f5); // architectural studio background

    // 2. Cameras
    this.persCamera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.persCamera.position.set(12, 14, 16);

    const orthoFrustum = 8;
    this.orthoCamera = new THREE.OrthographicCamera(
      -orthoFrustum * aspect,
      orthoFrustum * aspect,
      orthoFrustum,
      -orthoFrustum,
      0.1,
      100
    );
    this.orthoCamera.position.set(12, 14, 16);

    this.camera = this.persCamera;

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02; // prevent going below ground
    this.controls.target.set(0, 0, 0);

    // 5. Lighting (Sims / Dollhouse warm aesthetic)
    this.setupLighting();

    // 6. Ground Studio Plane
    this.setupGround();

    // 7. House Groups
    this.houseGroup = new THREE.Group();
    this.floorsGroup = new THREE.Group();
    this.wallsGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();

    this.houseGroup.add(this.floorsGroup);
    this.houseGroup.add(this.wallsGroup);
    this.houseGroup.add(this.furnitureGroup);
    this.scene.add(this.houseGroup);

    // 8. Event Listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    this.animate();
  }

  private setupLighting() {
    // Ambient light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe0e7ff, 0.65);
    this.scene.add(hemiLight);

    // Warm Sun Directional Light
    const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.3);
    dirLight.position.set(15, 22, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const d = 16;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Soft fill light
    const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.4);
    fillLight.position.set(-10, 15, -10);
    this.scene.add(fillLight);
  }

  private setupGround() {
    // Elegant neutral grid/pedestal
    const groundGeom = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.01;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Subtle grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0xd0d5dd, 0xe4e7ec);
    gridHelper.position.y = -0.005;
    this.scene.add(gridHelper);
  }

  public setFloorplan(floorplan: HouseFloorplan) {
    this.currentFloorplan = floorplan;
    this.rebuildScene();
    this.centerCamera();
  }

  public setWallMode(mode: WallDisplayMode) {
    this.wallMode = mode;
    this.rebuildWalls();
  }

  public setViewMode(mode: CameraViewMode) {
    this.viewMode = mode;
    const target = this.controls.target.clone();

    if (mode === 'topdown') {
      this.camera = this.persCamera;
      this.controls.object = this.camera;
      this.camera.position.set(target.x, target.y + 22, target.z + 0.001);
      this.controls.maxPolarAngle = 0.01;
      this.controls.minPolarAngle = 0.01;
    } else if (mode === 'isometric') {
      this.camera = this.persCamera;
      this.controls.object = this.camera;
      this.controls.maxPolarAngle = Math.PI / 2;
      this.controls.minPolarAngle = 0.1;
      this.camera.position.set(target.x + 12, target.y + 14, target.z + 14);
    } else {
      // Perspective free orbit
      this.camera = this.persCamera;
      this.controls.object = this.camera;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.minPolarAngle = 0.05;
      this.camera.position.set(target.x + 10, target.y + 10, target.z + 10);
    }

    this.controls.update();
  }

  public setActiveLevel(index: number) {
    this.activeLevel = index;
    this.rebuildScene();
  }

  private rebuildScene() {
    if (!this.currentFloorplan) return;

    // Clear existing meshes
    this.clearGroup(this.floorsGroup);
    this.clearGroup(this.wallsGroup);
    this.clearGroup(this.furnitureGroup);

    const level = this.currentFloorplan.levels[this.activeLevel] || this.currentFloorplan.levels[0];
    if (!level) return;

    const elevation = level.elevation || 0;

    for (const room of level.rooms) {
      // 1. Floor
      const floorMesh = buildRoomFloor(room, elevation);
      this.floorsGroup.add(floorMesh);

      // 2. Walls
      const wallsMesh = buildRoomWalls(room, this.wallMode, elevation);
      this.wallsGroup.add(wallsMesh);

      // 3. Furniture
      for (const item of room.furniture) {
        const itemCopy = {
          ...item,
          position: [item.position[0], item.position[1] + elevation, item.position[2]] as [number, number, number],
        };
        const mesh = createFurnitureMesh(itemCopy);
        this.furnitureGroup.add(mesh);
      }
    }
  }

  private rebuildWalls() {
    if (!this.currentFloorplan) return;
    this.clearGroup(this.wallsGroup);

    const level = this.currentFloorplan.levels[this.activeLevel] || this.currentFloorplan.levels[0];
    if (!level) return;

    const elevation = level.elevation || 0;
    for (const room of level.rooms) {
      const wallsMesh = buildRoomWalls(room, this.wallMode, elevation);
      this.wallsGroup.add(wallsMesh);
    }
  }

  public centerCamera() {
    if (!this.currentFloorplan) return;

    const box = new THREE.Box3().setFromObject(this.houseGroup);
    if (box.isEmpty()) return;

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    this.controls.target.copy(center);

    const maxDim = Math.max(size.x, size.z, 5);
    const dist = maxDim * 1.8;

    if (this.viewMode === 'topdown') {
      this.camera.position.set(center.x, center.y + dist * 1.5, center.z + 0.001);
    } else {
      this.camera.position.set(center.x + dist * 0.8, center.y + dist * 0.9, center.z + dist * 0.8);
    }

    this.controls.update();
  }

  private onPointerDown = (event: MouseEvent) => {
    // Only raycast on primary left click
    if (event.button !== 0) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.houseGroup.children, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;

      // Find top-level furniture or floor parent
      while (hitObj && hitObj !== this.houseGroup) {
        if (hitObj.userData?.type === 'furniture') {
          this.callbacks.onSelectFurniture?.(hitObj.userData.itemData);
          return;
        }
        if (hitObj.userData?.type === 'floor') {
          this.callbacks.onSelectRoom?.(hitObj.userData.roomId);
          return;
        }
        hitObj = hitObj.parent;
      }
    }

    this.callbacks.onSelectFurniture?.(null);
    this.callbacks.onSelectRoom?.(null);
  };

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
      }
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    const aspect = width / height;

    this.persCamera.aspect = aspect;
    this.persCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public getExportObject(): THREE.Object3D {
    return this.houseGroup;
  }

  public dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.dispose();
    this.controls.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
