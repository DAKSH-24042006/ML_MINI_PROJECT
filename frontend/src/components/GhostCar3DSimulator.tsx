import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Play, Square, RotateCcw, Compass, Flag, Activity, Move3d, Eye, Zap } from 'lucide-react';
import realMonzaData from '../data/monza_real_3d.json';

export type SimulationTrackSegment =
  | 't1_chicane'    // Variante del Rettifilo (T1-T2)
  | 'curva_grande'  // Curva Biassono / Curva Grande (T3)
  | 't4_roggia'     // Variante della Roggia (T4-T5)
  | 'lesmo'         // Curva di Lesmo 1 & 2 (T6-T7)
  | 'serraglio'     // Curva del Serraglio Straight (S4)
  | 'ascari'        // Variante Ascari Chicane (T8-T10)
  | 'parabolica'    // Curva Parabolica / Alboreto (T11)
  | 'main_straight' // Main Rettifilo Straight (S1)
  | 'full_circuit'; // Entire 5.793km Monza Circuit

interface TelemetryPoint {
  Distance: number;
  X: number;
  Y: number;
  Z: number;
  Speed: number;
  Throttle: number;
  Brake: boolean;
}

export interface GhostCar3DSimulatorProps {
  segment: SimulationTrackSegment;
  onSelectSegment: (seg: SimulationTrackSegment) => void;
  userApexSpeed: number;
  userTopSpeed: number;
  poleApexSpeed: number;
  poleTopSpeed: number;
  drivingStyle: string;
  isRunning: boolean;
  onToggleRun: () => void;
  onResetRun: () => void;
}

export type CameraViewMode = 'orbit' | 'chase' | 'onboard' | 'tv' | 'heli';

export const SECTOR_RANGES: Record<
  SimulationTrackSegment,
  { start: number; end: number; name: string; type: 'chicane' | 'corner' | 'straight' | 'circuit' }
> = {
  t1_chicane: { start: 700, end: 1100, name: 'Variante del Rettifilo (T1-T2)', type: 'chicane' },
  curva_grande: { start: 1050, end: 1950, name: 'Curva Biassono / Grande (T3)', type: 'corner' },
  t4_roggia: { start: 1950, end: 2350, name: 'Variante della Roggia (T4-T5)', type: 'chicane' },
  lesmo: { start: 2350, end: 2800, name: 'Curva di Lesmo 1 & 2 (T6-T7)', type: 'corner' },
  serraglio: { start: 2800, end: 3750, name: 'Curva del Serraglio (S4)', type: 'straight' },
  ascari: { start: 3750, end: 4250, name: 'Variante Ascari (T8-T10)', type: 'chicane' },
  parabolica: { start: 4900, end: 5550, name: 'Curva Parabolica (T11)', type: 'corner' },
  main_straight: { start: 5400, end: 5767, name: 'Rettifilo Main Straight (S1)', type: 'straight' },
  full_circuit: { start: 0, end: 5767, name: 'Full Monza Circuit (5.793 km)', type: 'circuit' },
};

/**
 * Builds an authentic procedural Formula 1 car model.
 * GEOMETRY CONVENTION:
 * - Local +Z is the FORWARD direction (nosecone, front wing, front wheels, forward movement).
 * - Local -Z is the REAR direction (engine cover, diffuser, rear wing, rain LED).
 * - Local +Y is UP.
 * - Local +X is RIGHT.
 * - Local -X is LEFT.
 * When Three.js dummy.lookAt(pos + tangent) is called, local +Z aligns with tangent,
 * guaranteeing the car faces and drives FORWARD 100% of the time!
 */
function buildNativeForwardF1Car(liveryColor: number, isGhost: boolean): THREE.Group {
  const car = new THREE.Group();
  const wheels: THREE.Mesh[] = [];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: liveryColor,
    metalness: 0.85,
    roughness: 0.22,
    transparent: isGhost,
    opacity: isGhost ? 0.52 : 1.0,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    metalness: 0.6,
    roughness: 0.35,
    transparent: isGhost,
    opacity: isGhost ? 0.45 : 1.0,
  });

  const tyreRubberMat = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.9,
    metalness: 0.1,
    transparent: isGhost,
    opacity: isGhost ? 0.55 : 1.0,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x24272e,
    metalness: 0.8,
    roughness: 0.25,
  });

  const stripeColor = isGhost ? 0xe10600 : 0x00f0ff;
  const stripeMat = new THREE.MeshBasicMaterial({ color: stripeColor });

  // 1. Cockpit & Monocoque Body (centered along Z)
  const chassisGeo = new THREE.BoxGeometry(1.2, 0.52, 3.6);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.position.set(0, 0.42, 0.0);
  chassis.castShadow = true;
  car.add(chassis);

  // 2. Tapered Nosecone (pointed strictly in +Z forward direction)
  const noseGeo = new THREE.ConeGeometry(0.48, 2.2, 8);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.rotation.x = Math.PI / 2; // Tip faces +Z forward!
  nose.position.set(0, 0.35, 2.6);
  nose.castShadow = true;
  car.add(nose);

  // 3. Multi-Element Front Wing (at +Z = +3.3)
  const fWingGeo = new THREE.BoxGeometry(3.4, 0.08, 0.7);
  const fWing = new THREE.Mesh(fWingGeo, carbonMat);
  fWing.position.set(0, 0.16, 3.3);
  fWing.castShadow = true;
  car.add(fWing);

  // Front Wing Endplates
  [-1.7, 1.7].forEach((xSide) => {
    const epGeo = new THREE.BoxGeometry(0.05, 0.38, 0.85);
    const ep = new THREE.Mesh(epGeo, carbonMat);
    ep.position.set(xSide, 0.28, 3.3);
    car.add(ep);
  });

  // 4. Ground-Effect Sidepods (along sides)
  [-0.9, 0.9].forEach((xSide) => {
    const podGeo = new THREE.BoxGeometry(0.6, 0.48, 2.1);
    const pod = new THREE.Mesh(podGeo, bodyMat);
    pod.position.set(xSide, 0.38, 0.0);
    pod.castShadow = true;
    car.add(pod);

    // Radiator inlet scoop
    const scoopGeo = new THREE.BoxGeometry(0.55, 0.38, 0.1);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(xSide, 0.4, 1.05);
    car.add(scoop);
  });

  // 5. Floor & Venturi Underside
  const floorGeo = new THREE.BoxGeometry(2.7, 0.04, 3.8);
  const floor = new THREE.Mesh(floorGeo, carbonMat);
  floor.position.set(0, 0.12, 0.1);
  car.add(floor);

  // Rear Diffuser (at -Z = -1.9)
  const diffGeo = new THREE.BoxGeometry(1.5, 0.24, 0.5);
  const diffuser = new THREE.Mesh(diffGeo, carbonMat);
  diffuser.position.set(0, 0.2, -1.9);
  diffuser.rotation.x = -0.28;
  car.add(diffuser);

  // 6. Airbox & Engine Cover (facing +Z intake, fin extending to -Z)
  const airboxGeo = new THREE.BoxGeometry(0.42, 0.5, 1.5);
  const airbox = new THREE.Mesh(airboxGeo, bodyMat);
  airbox.position.set(0, 0.9, -0.3);
  car.add(airbox);

  const finGeo = new THREE.BoxGeometry(0.04, 0.55, 1.3);
  const sharkFin = new THREE.Mesh(finGeo, carbonMat);
  sharkFin.position.set(0, 0.98, -1.0);
  car.add(sharkFin);

  // 7. Halo Safety Titanium Structure
  const haloCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.62, 1.15),
    new THREE.Vector3(0, 0.88, 0.8),
    new THREE.Vector3(0, 0.92, 0.4),
    new THREE.Vector3(0, 0.86, 0.1)
  );
  const haloGeo = new THREE.TubeGeometry(haloCurve, 16, 0.045, 8, false);
  const halo = new THREE.Mesh(haloGeo, carbonMat);
  car.add(halo);

  // 8. Driver Helmet & Visor
  const helmetGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const helmetMat = new THREE.MeshStandardMaterial({
    color: isGhost ? 0xffdd00 : 0x00f0ff,
    metalness: 0.7,
    roughness: 0.2,
  });
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.set(0, 0.72, 0.35);
  car.add(helmet);

  // 9. Rear Wing & DRS Flap (at -Z = -2.2)
  const rWingMainGeo = new THREE.BoxGeometry(2.3, 0.06, 0.5);
  const rWingMain = new THREE.Mesh(rWingMainGeo, carbonMat);
  rWingMain.position.set(0, 1.15, -2.15);
  rWingMain.castShadow = true;
  car.add(rWingMain);

  const rWingTopGeo = new THREE.BoxGeometry(2.3, 0.05, 0.3);
  const rWingTop = new THREE.Mesh(rWingTopGeo, bodyMat);
  rWingTop.position.set(0, 1.32, -2.25);
  rWingTop.rotation.x = 0.2;
  rWingTop.castShadow = true;
  car.add(rWingTop);

  // Rear Wing Endplates
  [-1.15, 1.15].forEach((xSide) => {
    const rEpGeo = new THREE.BoxGeometry(0.04, 0.65, 0.8);
    const rEp = new THREE.Mesh(rEpGeo, carbonMat);
    rEp.position.set(xSide, 1.1, -2.15);
    car.add(rEp);
  });

  // FIA Rain Safety Flashing Light
  const rainLedGeo = new THREE.BoxGeometry(0.14, 0.14, 0.06);
  const rainLedMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
  const rainLed = new THREE.Mesh(rainLedGeo, rainLedMat);
  rainLed.position.set(0, 0.28, -2.25);
  car.add(rainLed);

  // 10. Wheels & Pirelli Tires (2 Front at +Z=1.65, 2 Rear at -Z=-1.45)
  const wheelPositions = [
    { x: -1.25, z: 1.65, radius: 0.35, width: 0.42 }, // Front Left
    { x: 1.25, z: 1.65, radius: 0.35, width: 0.42 },  // Front Right
    { x: -1.25, z: -1.45, radius: 0.36, width: 0.52 }, // Rear Left
    { x: 1.25, z: -1.45, radius: 0.36, width: 0.52 }, // Rear Right
  ];

  wheelPositions.forEach((wp) => {
    const wheelGroup = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(wp.radius, wp.radius, wp.width, 24);
    const tire = new THREE.Mesh(tireGeo, tyreRubberMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(wp.radius * 0.62, wp.radius * 0.62, wp.width + 0.01, 16);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    wheelGroup.position.set(wp.x, wp.radius, wp.z);
    car.add(wheelGroup);
    wheels.push(tire);
  });

  car.userData.wheels = wheels;
  return car;
}

export const GhostCar3DSimulator: React.FC<GhostCar3DSimulatorProps> = ({
  segment,
  onSelectSegment,
  userApexSpeed,
  userTopSpeed,
  poleApexSpeed,
  poleTopSpeed,
  drivingStyle,
  isRunning,
  onToggleRun,
  onResetRun,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [cameraView, setCameraView] = useState<CameraViewMode>('orbit');
  const [sectorFinished, setSectorFinished] = useState<boolean>(false);

  // Position progress (0.00 to 0.99 along the selected sector spline)
  const progressPoleRef = useRef<number>(0.005);
  const progressUserRef = useRef<number>(0.005);

  // Live telemetry HUD states
  const [poleHud, setPoleHud] = useState({ speed: 0, throttle: 100, brake: 0, gear: 8, gLat: 0 });
  const [userHud, setUserHud] = useState({ speed: 0, throttle: 100, brake: 0, gear: 8, gLat: 0, delta: 0, gapMeters: 0 });

  // References to keep requestAnimationFrame loop fully synchronized with props
  const stateRef = useRef({
    isRunning,
    userApexSpeed,
    userTopSpeed,
    poleApexSpeed,
    poleTopSpeed,
    drivingStyle,
    cameraView,
  });

  useEffect(() => {
    stateRef.current = {
      isRunning,
      userApexSpeed,
      userTopSpeed,
      poleApexSpeed,
      poleTopSpeed,
      drivingStyle,
      cameraView,
    };
  }, [isRunning, userApexSpeed, userTopSpeed, poleApexSpeed, poleTopSpeed, drivingStyle, cameraView]);

  const rawData = useMemo(() => realMonzaData as TelemetryPoint[], []);

  // Filter and deduplicate raw coordinates for the active sector to prevent spline micro-twitches
  const sectorData = useMemo(() => {
    const range = SECTOR_RANGES[segment] || SECTOR_RANGES.t1_chicane;
    const base =
      segment === 'full_circuit'
        ? rawData
        : rawData.filter((pt) => pt.Distance >= range.start && pt.Distance <= range.end);

    const safeList = base.length >= 5 ? base : rawData.slice(0, 30);

    const cleaned: TelemetryPoint[] = [];
    for (let i = 0; i < safeList.length; i++) {
      if (i === 0) {
        cleaned.push(safeList[i]);
      } else {
        const last = cleaned[cleaned.length - 1];
        const dist = Math.hypot(safeList[i].X - last.X, safeList[i].Y - last.Y);
        if (dist >= 12 || i === safeList.length - 1) {
          cleaned.push(safeList[i]);
        }
      }
    }
    return cleaned.length >= 4 ? cleaned : safeList;
  }, [segment, rawData]);

  // Stage cars back at start of sector whenever segment changes or user resets
  const stageCarsAtStart = () => {
    progressPoleRef.current = 0.005;
    progressUserRef.current = 0.005;
    setSectorFinished(false);
  };

  useEffect(() => {
    stageCarsAtStart();
  }, [segment]);

  const handleReset = () => {
    stageCarsAtStart();
    onResetRun();
  };

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container || sectorData.length < 3) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060912);
    scene.fog = new THREE.FogExp2(0x060912, segment === 'full_circuit' ? 0.0012 : 0.0022);

    const width = container.clientWidth || 800;
    const height = 430;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 3.0;
    controls.maxDistance = 550.0;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL context lost.');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Studio & Track Lighting
    scene.add(new THREE.AmbientLight(0xdde5f0, 1.3));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(120, 200, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);
    scene.add(new THREE.DirectionalLight(0x4070a0, 0.9));

    // Construct 3D Track from Official FastF1 coordinates
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    sectorData.forEach((pt) => {
      if (pt.X < minX) minX = pt.X;
      if (pt.X > maxX) maxX = pt.X;
      if (pt.Y < minY) minY = pt.Y;
      if (pt.Y > maxY) maxY = pt.Y;
      if (pt.Z < minZ) minZ = pt.Z;
      if (pt.Z > maxZ) maxZ = pt.Z;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const spanX = Math.max(20, maxX - minX);
    const spanY = Math.max(20, maxY - minY);
    const maxSpan = Math.max(spanX, spanY);

    const targetSpan = segment === 'full_circuit' ? 320 : 160;
    const scaleFactor = targetSpan / maxSpan;
    const elevScale = 0.08;

    const curvePoints3D: THREE.Vector3[] = sectorData.map((pt) => {
      const worldX = (pt.X - centerX) * scaleFactor;
      const worldZ = -(pt.Y - centerY) * scaleFactor;
      const worldY = (pt.Z - minZ) * elevScale;
      return new THREE.Vector3(worldX, worldY, worldZ);
    });

    // CatmullRom spline with centripetal parameterization
    const trackCurve = new THREE.CatmullRomCurve3(curvePoints3D, segment === 'full_circuit', 'catmullrom', 0.5);

    // Infield Ground Plane & Grid
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshStandardMaterial({ color: 0x070b12, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.25;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(700, 50, 0x141f2e, 0x0c131e);
    grid.position.y = -0.2;
    scene.add(grid);

    // Procedural Road Surface & Curbs
    const numSubdivisions = segment === 'full_circuit' ? 500 : 250;
    const spacedPoints = trackCurve.getSpacedPoints(numSubdivisions);
    const trackWidth = segment === 'full_circuit' ? 9.0 : 13.0;

    const roadGeo = new THREE.BufferGeometry();
    const roadPositions: number[] = [];
    const roadIndices: number[] = [];
    const curbLeftGeo = new THREE.BufferGeometry();
    const curbRightGeo = new THREE.BufferGeometry();
    const curbLeftPos: number[] = [];
    const curbRightPos: number[] = [];
    const curbIndices: number[] = [];

    for (let i = 0; i < spacedPoints.length; i++) {
      const pt = spacedPoints[i];
      const u = i / (spacedPoints.length - 1);
      const tangent = trackCurve.getTangentAt(u).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = pt.clone().add(normal.clone().multiplyScalar(trackWidth / 2));
      const right = pt.clone().add(normal.clone().multiplyScalar(-trackWidth / 2));

      roadPositions.push(left.x, left.y + 0.02, left.z);
      roadPositions.push(right.x, right.y + 0.02, right.z);

      const lOuter = pt.clone().add(normal.clone().multiplyScalar(trackWidth / 2 + 1.4));
      curbLeftPos.push(left.x, left.y + 0.05, left.z);
      curbLeftPos.push(lOuter.x, lOuter.y + 0.16, lOuter.z);

      const rOuter = pt.clone().add(normal.clone().multiplyScalar(-trackWidth / 2 - 1.4));
      curbRightPos.push(right.x, right.y + 0.05, right.z);
      curbRightPos.push(rOuter.x, rOuter.y + 0.16, rOuter.z);
    }

    for (let i = 0; i < spacedPoints.length - 1; i++) {
      const v1 = i * 2;
      const v2 = i * 2 + 1;
      const v3 = (i + 1) * 2;
      const v4 = (i + 1) * 2 + 1;
      roadIndices.push(v1, v2, v3, v2, v4, v3);
      curbIndices.push(v1, v2, v3, v2, v4, v3);
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeo.setIndex(roadIndices);
    roadGeo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(
      roadGeo,
      new THREE.MeshStandardMaterial({ color: 0x141a24, roughness: 0.88, metalness: 0.2, side: THREE.DoubleSide })
    );
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    curbLeftGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbLeftPos, 3));
    curbLeftGeo.setIndex(curbIndices);
    curbLeftGeo.computeVertexNormals();
    scene.add(new THREE.Mesh(curbLeftGeo, new THREE.MeshStandardMaterial({ color: 0xd91624, roughness: 0.5, side: THREE.DoubleSide })));

    curbRightGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbRightPos, 3));
    curbRightGeo.setIndex(curbIndices);
    curbRightGeo.computeVertexNormals();
    scene.add(new THREE.Mesh(curbRightGeo, new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, side: THREE.DoubleSide })));

    // Starting Gantry & Checkered Start Line at t = 0.001 (framing cars from behind)
    const gantryPt = trackCurve.getPointAt(0.001);
    const gantryTan = trackCurve.getTangentAt(0.001).normalize();
    const gantryNorm = new THREE.Vector3(-gantryTan.z, 0, gantryTan.x).normalize();

    const archP1 = gantryPt.clone().add(gantryNorm.clone().multiplyScalar(trackWidth / 2 + 1.8));
    const archP2 = gantryPt.clone().add(gantryNorm.clone().multiplyScalar(-trackWidth / 2 - 1.8));

    const postMat = new THREE.MeshStandardMaterial({ color: 0x333b48, metalness: 0.8, roughness: 0.3 });
    const postGeo = new THREE.CylinderGeometry(0.25, 0.25, 7.0);

    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(archP1.x, archP1.y + 3.5, archP1.z);
    scene.add(post1);

    const post2 = new THREE.Mesh(postGeo, postMat);
    post2.position.set(archP2.x, archP2.y + 3.5, archP2.z);
    scene.add(post2);

    const gantry = new THREE.Mesh(
      new THREE.BoxGeometry(trackWidth + 3.8, 0.7, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1e2633, metalness: 0.9 })
    );
    gantry.position.set(gantryPt.x, gantryPt.y + 6.8, gantryPt.z);
    gantry.lookAt(gantry.position.clone().add(gantryTan));
    scene.add(gantry);

    // --- CAR MODELS SETUP ---
    // Both cars have their NOSE facing strictly in LOCAL +Z direction
    const poleCar = buildNativeForwardF1Car(0xe8002d, true); // Ferrari Pole Ghost (Red)
    scene.add(poleCar);

    const userCar = buildNativeForwardF1Car(0x00d2be, false); // User Setup (Mercedes Cyan)
    scene.add(userCar);

    // Load authentic 3D GLB model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/f1_car.glb',
      (gltf) => {
        const loadedMesh = gltf.scene;

        const bbox = new THREE.Box3().setFromObject(loadedMesh);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5.0 / maxDim; // ~5.0 meters length
        loadedMesh.scale.set(scale, scale, scale);

        const center = bbox.getCenter(new THREE.Vector3());
        loadedMesh.position.set(-center.x * scale, -bbox.min.y * scale, -center.z * scale);

        // ROTATION FIX: Rotate by -90 deg around Y so the nosecone points strictly along local +Z forward!
        loadedMesh.rotation.y = -Math.PI / 2;

        const modelRoot = new THREE.Group();
        modelRoot.add(loadedMesh);

        // 1. Pole Ghost Instance: Glowing Ferrari Scarlet Red
        const poleClone = modelRoot.clone(true);
        const ghostMat = new THREE.MeshStandardMaterial({
          color: 0xee1515,
          emissive: 0x550505,
          roughness: 0.25,
          metalness: 0.8,
          transparent: true,
          opacity: 0.65,
        });
        poleClone.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.material = ghostMat;
          }
        });
        poleCar.clear();
        poleCar.add(poleClone);

        // 2. User Custom Instance: Gloss Mercedes Petronas Emerald Cyan
        const userClone = modelRoot.clone(true);
        const userMat = new THREE.MeshStandardMaterial({
          color: 0x00d2be,
          emissive: 0x00332c,
          roughness: 0.2,
          metalness: 0.85,
        });
        userClone.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.material = userMat;
          }
        });
        userCar.clear();
        userCar.add(userClone);
      },
      undefined,
      (err) => console.info('Using native aerodynamic CAD model fallback:', err)
    );

    // Speed and telemetry lookup from FastF1 telemetry points
    const getFastF1TelemetryAt = (t: number) => {
      const totalPoints = sectorData.length;
      const rawIdx = Math.max(0, Math.min(totalPoints - 1, t * (totalPoints - 1)));
      const idx0 = Math.floor(rawIdx);
      const idx1 = Math.min(totalPoints - 1, idx0 + 1);
      const frac = rawIdx - idx0;

      const p0 = sectorData[idx0];
      const p1 = sectorData[idx1];

      return {
        speed: p0.Speed + (p1.Speed - p0.Speed) * frac,
        throttle: Math.round(p0.Throttle + (p1.Throttle - p0.Throttle) * frac),
        brake: p0.Brake || p1.Brake ? 100 : 0,
      };
    };

    const sectorLengthM =
      segment === 'full_circuit'
        ? 5767
        : Math.max(150, (SECTOR_RANGES[segment]?.end ?? 1000) - (SECTOR_RANGES[segment]?.start ?? 700));

    // Smooth lateral racing lines: Pole takes left lane (-2.2m); User takes right lane (+2.2m)
    const getRacingLaneOffset = (carType: 'pole' | 'user') => {
      return carType === 'pole' ? -2.2 : 2.2;
    };

    // Staging: Position cars at sector starting line facing forward
    const initialT = 0.005;
    const initPt = trackCurve.getPointAt(initialT);
    const initTan = trackCurve.getTangentAt(initialT).normalize();
    const initNorm = new THREE.Vector3(-initTan.z, 0, initTan.x).normalize();

    poleCar.position.copy(initPt).add(initNorm.clone().multiplyScalar(getRacingLaneOffset('pole')));
    userCar.position.copy(initPt).add(initNorm.clone().multiplyScalar(getRacingLaneOffset('user')));

    const dummyLook = new THREE.Object3D();

    dummyLook.position.copy(poleCar.position);
    dummyLook.lookAt(poleCar.position.clone().add(initTan));
    poleCar.quaternion.copy(dummyLook.quaternion);

    dummyLook.position.copy(userCar.position);
    dummyLook.lookAt(userCar.position.clone().add(initTan));
    userCar.quaternion.copy(dummyLook.quaternion);

    // Elevated, dynamic TV broadcast angle framing both cars side-by-side with full track perspective
    camera.position.set(
      initPt.x - initTan.x * 28 + initNorm.x * 12,
      initPt.y + 14,
      initPt.z - initTan.z * 28 + initNorm.z * 12
    );
    controls.target.copy(initPt.clone().add(initTan.clone().multiplyScalar(12)));

    let lastTime = performance.now();
    let animId: number;

    const animate = (time: number) => {
      const dt = Math.min(0.033, (time - lastTime) / 1000);
      lastTime = time;

      const {
        isRunning: activePlay,
        userApexSpeed: curUserApex,
        userTopSpeed: curUserTop,
        poleApexSpeed: curPoleApex,
        poleTopSpeed: curPoleTop,
        cameraView: activeCam,
      } = stateRef.current;

      const pPole = progressPoleRef.current;
      const pUser = progressUserRef.current;

      const poleDyn = getFastF1TelemetryAt(pPole);

      // User car physics based on edited parameters
      const range = SECTOR_RANGES[segment] || SECTOR_RANGES.t1_chicane;
      const isCornering = range.type === 'chicane' || range.type === 'corner';
      let calculatedUserSpeed = poleDyn.speed;

      if (isCornering) {
        const apexFactor = curPoleApex > 0 ? curUserApex / curPoleApex : 1.0;
        const topFactor = curPoleTop > 0 ? curUserTop / curPoleTop : 1.0;
        const isBraking = poleDyn.brake > 0 || poleDyn.speed < curPoleApex + 35;
        if (isBraking) {
          calculatedUserSpeed = poleDyn.speed * (0.8 + 0.2 * apexFactor);
        } else {
          calculatedUserSpeed = poleDyn.speed * (0.85 + 0.15 * topFactor);
        }
      } else {
        const topFactor = curPoleTop > 0 ? curUserTop / curPoleTop : 1.0;
        calculatedUserSpeed = poleDyn.speed * (0.85 + 0.15 * topFactor);
      }

      const userDyn = {
        speed: Math.max(50, Math.min(375, calculatedUserSpeed)),
        throttle: poleDyn.throttle,
        brake: poleDyn.brake,
      };

      // PROGRESS ADVANCEMENT: ONLY when RUN SIMULATION is active!
      if (activePlay) {
        const poleStep = ((poleDyn.speed / 3.6) * dt) / sectorLengthM;
        const userStep = ((userDyn.speed / 3.6) * dt) / sectorLengthM;

        const nextPole = progressPoleRef.current + poleStep;
        const nextUser = progressUserRef.current + userStep;

        if (nextPole >= 0.985 || nextUser >= 0.985) {
          setSectorFinished(true);
          progressPoleRef.current = Math.min(0.985, nextPole);
          progressUserRef.current = Math.min(0.985, nextUser);
        } else {
          progressPoleRef.current = nextPole;
          progressUserRef.current = nextUser;
        }
      }

      // Smooth Position & Orientation along track spline
      const curPPole = progressPoleRef.current;
      const curPUser = progressUserRef.current;

      const polePt = trackCurve.getPointAt(curPPole);
      const poleTan = trackCurve.getTangentAt(curPPole).normalize();
      const poleNorm = new THREE.Vector3(-poleTan.z, 0, poleTan.x).normalize();
      const poleTargetPos = polePt.clone().add(poleNorm.clone().multiplyScalar(getRacingLaneOffset('pole')));
      poleCar.position.copy(poleTargetPos);

      // Dummy lookAt with pos + tangent points local +Z directly forward
      dummyLook.position.copy(poleCar.position);
      dummyLook.lookAt(poleCar.position.clone().add(poleTan));
      poleCar.quaternion.slerp(dummyLook.quaternion, 0.35);

      const userPt = trackCurve.getPointAt(curPUser);
      const userTan = trackCurve.getTangentAt(curPUser).normalize();
      const userNorm = new THREE.Vector3(-userTan.z, 0, userTan.x).normalize();
      const userTargetPos = userPt.clone().add(userNorm.clone().multiplyScalar(getRacingLaneOffset('user')));
      userCar.position.copy(userTargetPos);

      dummyLook.position.copy(userCar.position);
      dummyLook.lookAt(userCar.position.clone().add(userTan));
      userCar.quaternion.slerp(dummyLook.quaternion, 0.35);

      // Centripetal G-Load
      const gLatPole = parseFloat((Math.min(5.6, (poleDyn.speed / 3.6) ** 2 / 125 / 9.81)).toFixed(1));
      const gLatUser = parseFloat((Math.min(5.6, (userDyn.speed / 3.6) ** 2 / 125 / 9.81)).toFixed(1));

      // Realistic F1 Gear estimation from speed
      const getGear = (spd: number) => {
        if (spd < 90) return 2;
        if (spd < 135) return 3;
        if (spd < 185) return 4;
        if (spd < 235) return 5;
        if (spd < 280) return 6;
        if (spd < 320) return 7;
        return 8;
      };

      // Gap Delta calculations
      const deltaProgress = curPUser - curPPole;
      const gapMeters = parseFloat((deltaProgress * sectorLengthM).toFixed(1));
      const avgSpeedMs = Math.max(20, poleDyn.speed / 3.6);
      const deltaSeconds = parseFloat((gapMeters / avgSpeedMs).toFixed(3));

      // Camera Tracking Modes
      if (activeCam === 'orbit') {
        controls.enabled = true;
        const midPt = userCar.position.clone().add(poleCar.position).multiplyScalar(0.5);
        controls.target.lerp(midPt, 0.08);
      } else if (activeCam === 'chase') {
        controls.enabled = false;
        const chasePos = userCar.position.clone().sub(userTan.clone().multiplyScalar(15)).add(new THREE.Vector3(0, 4.8, 0));
        camera.position.lerp(chasePos, 0.18);
        camera.lookAt(userCar.position.clone().add(userTan.clone().multiplyScalar(18)));
      } else if (activeCam === 'onboard') {
        controls.enabled = false;
        const tCamPos = userCar.position.clone().add(new THREE.Vector3(0, 1.35, 0)).add(userTan.clone().multiplyScalar(0.2));
        camera.position.copy(tCamPos);
        camera.lookAt(userCar.position.clone().add(userTan.clone().multiplyScalar(30)));
      } else if (activeCam === 'tv') {
        controls.enabled = false;
        const tvTower = initPt.clone().add(initNorm.clone().multiplyScalar(22)).add(new THREE.Vector3(0, 8.0, 0));
        camera.position.lerp(tvTower, 0.05);
        camera.lookAt(userCar.position);
      } else if (activeCam === 'heli') {
        controls.enabled = false;
        const heliPos = userCar.position.clone().add(new THREE.Vector3(0, 42, 0)).sub(userTan.clone().multiplyScalar(8));
        camera.position.lerp(heliPos, 0.1);
        camera.lookAt(userCar.position);
      }

      // Update React HUD states
      setPoleHud({
        speed: Math.round(poleDyn.speed),
        throttle: poleDyn.throttle,
        brake: poleDyn.brake,
        gear: getGear(poleDyn.speed),
        gLat: gLatPole,
      });

      setUserHud({
        speed: Math.round(userDyn.speed),
        throttle: userDyn.throttle,
        brake: userDyn.brake,
        gear: getGear(userDyn.speed),
        gLat: gLatUser,
        delta: deltaSeconds,
        gapMeters: gapMeters,
      });

      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      renderer.dispose();
      roadGeo.dispose();
      curbLeftGeo.dispose();
      curbRightGeo.dispose();
      ground.geometry.dispose();
    };
  }, [segment, sectorData]);

  return (
    <div className="f1-panel p-4 bg-[#0a0d14] border border-[#1b2333] select-none font-mono">
      {/* 3D Simulation Deck Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#18202d] gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-red-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3D GHOST DUEL // {SECTOR_RANGES[segment]?.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  isRunning
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 animate-pulse'
                    : sectorFinished
                    ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                    : 'bg-blue-950/80 border-blue-700 text-blue-300'
                }`}
              >
                {isRunning ? '● DUEL IN PROGRESS' : sectorFinished ? '🏁 SECTOR COMPLETED' : '⏹ STAGED AT START LINE'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans">
              Carlos Sainz Pole Lap (FastF1 Telemetry) vs Your Custom Parameter Setup.
            </p>
          </div>
        </div>

        {/* Action Controls: RUN & STOP */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRun}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all shadow-lg ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
            }`}
          >
            {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'PAUSE DUEL' : '▶ RUN SIMULATION'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141a26] hover:bg-[#1c2436] border border-[#232f42] text-gray-300 text-xs font-bold transition-all hover:text-white"
            title="Stop and reset both cars to sector start line"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>STOP & RESET</span>
          </button>

          {/* Camera Selector */}
          <div className="hidden md:flex items-center bg-[#101622] rounded-lg border border-[#1d2738] p-0.5 text-xs ml-2">
            <button
              onClick={() => setCameraView('orbit')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                cameraView === 'orbit' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ORBIT
            </button>
            <button
              onClick={() => setCameraView('chase')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                cameraView === 'chase' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              CHASE
            </button>
            <button
              onClick={() => setCameraView('onboard')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                cameraView === 'onboard' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              COCKPIT
            </button>
            <button
              onClick={() => setCameraView('tv')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                cameraView === 'tv' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              TV CAM
            </button>
            <button
              onClick={() => setCameraView('heli')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                cameraView === 'heli' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              HELI
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="relative my-3 rounded-lg overflow-hidden border border-[#1b2536] bg-[#060910]">
        <div ref={mountRef} className="w-full h-[430px] cursor-grab active:cursor-grabbing" />

        {/* 3D Controls Hint */}
        <div className="absolute top-3 right-3 bg-[#0a0f18]/85 backdrop-blur-sm px-2.5 py-1 rounded border border-[#1d273a] text-[10px] text-gray-400 flex items-center gap-1.5 pointer-events-none">
          <Move3d className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left-Drag: Orbit 360° • Scroll: Zoom • Right-Drag: Pan</span>
        </div>

        {/* Live Telemetry Heads-Up Display (HUD) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2.5 pointer-events-none">
          {/* Pole Ghost HUD */}
          <div className="bg-[#0b0e14]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#e80020]/50 text-xs min-w-[165px] shadow-lg">
            <div className="flex items-center justify-between text-[10px] uppercase mb-1">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                SAINZ #55 (FERRARI POLE)
              </span>
              <span className="text-[9px] text-gray-400">1:20.294</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{poleHud.speed}</span>
                <span className="text-xs text-gray-400">km/h</span>
              </div>
              <span className="text-xs font-bold text-amber-400">GEAR {poleHud.gear}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
              <span>THR: {poleHud.throttle}%</span>
              <span>BRK: {poleHud.brake}%</span>
            </div>
          </div>

          {/* User Tuned Setup HUD */}
          <div className="bg-[#0b0e14]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#00d2be]/50 text-xs min-w-[165px] shadow-lg">
            <div className="flex items-center justify-between text-[10px] uppercase mb-1">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                YOUR TUNED SETUP
              </span>
              <span className="text-[9px] text-cyan-400 truncate max-w-[80px]">{drivingStyle}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{userHud.speed}</span>
                <span className="text-xs text-gray-400">km/h</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">GEAR {userHud.gear}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
              <span>THR: {userHud.throttle}%</span>
              <span>BRK: {userHud.brake}%</span>
            </div>
          </div>

          {/* Dynamic Gap Delta HUD */}
          <div className="bg-[#0b0e14]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#232f42] text-xs min-w-[140px] shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block font-semibold">SECTOR GAP DELTA</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-extrabold ${userHud.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userHud.delta >= 0 ? `+${userHud.delta}` : userHud.delta}s
              </span>
              <span className="text-[10px] text-gray-400">
                ({userHud.gapMeters >= 0 ? `+${userHud.gapMeters}` : userHud.gapMeters}m)
              </span>
            </div>
            <span className="text-[9px] text-gray-400 block mt-0.5">
              {userHud.delta >= 0 ? '▲ Ahead of Pole' : '▼ Trailing Pole'}
            </span>
          </div>

          {/* Lateral G-Force Sensor */}
          <div className="bg-[#0b0e14]/90 backdrop-blur-md p-2.5 rounded-lg border border-[#232f42] text-xs hidden lg:block shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase block font-semibold">LATERAL G-LOAD</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-bold text-amber-300">{userHud.gLat} G</span>
            </div>
            <span className="text-[9px] text-gray-400 block">Cornering Grip Load</span>
          </div>
        </div>

        {/* Sector Completion Overlay */}
        {sectorFinished && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto">
            <div className="bg-[#0d131f] border border-[#2c3d59] p-5 rounded-xl shadow-2xl text-center max-w-sm">
              <span className="text-3xl block mb-2">🏁</span>
              <h4 className="text-base font-black text-white uppercase tracking-wider mb-1">
                SECTOR RUN COMPLETED!
              </h4>
              <p className="text-xs text-gray-300 mb-3">
                {userHud.delta >= 0
                  ? `Your setup beat the pole benchmark by +${userHud.delta}s!`
                  : `Your setup trailed the pole benchmark by ${userHud.delta}s.`}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  RESET & TWEAK SETUP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sector Tag Badge */}
        <div className="absolute bottom-3 right-3 bg-[#0c121d]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#233146] text-xs text-gray-300 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white uppercase text-[11px]">
            {SECTOR_RANGES[segment]?.name || 'Monza Sector'}
          </span>
        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">CORNERING PROFILE:</span>
          <span className="text-cyan-300 font-bold uppercase">{drivingStyle}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>🔴 Red Ghost: Carlos Sainz Pole Lap (FastF1 Monza)</span>
          <span>🟢 Cyan Car: Your Custom Parameter Setup</span>
        </div>
      </div>
    </div>
  );
};
