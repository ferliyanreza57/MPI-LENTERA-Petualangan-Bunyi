import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface WaterXylophone3DProps {
  mode: 'Ketuk Botol' | 'Tiup Botol';
  activeBottleIdx: number | null;
  strikeNonce: number;
  onSelectBottle: (idx: number) => void;
}

const WATER_LEVELS = [0.85, 0.68, 0.52, 0.36, 0.2];
const LIQUID_COLORS = [0xf43f5e, 0xf59e0b, 0x10b981, 0x0ea5e9, 0x6366f1];

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createCoasterTexture(num: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 58px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(num), 64, 67);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface BottleRig {
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  waveRing: THREE.Mesh;
  airGlow: THREE.Mesh;
  meniscus: THREE.Mesh;
  baseWaterY: number;
  impulse: number;
  baseX: number;
}

export const WaterXylophone3D: React.FC<WaterXylophone3DProps> = ({
  mode,
  activeBottleIdx,
  strikeNonce,
  onSelectBottle,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ mode, activeBottleIdx, strikeNonce });
  const callbackRef = useRef(onSelectBottle);

  useEffect(() => {
    stateRef.current = { mode, activeBottleIdx, strikeNonce };
  }, [mode, activeBottleIdx, strikeNonce]);

  useEffect(() => {
    callbackRef.current = onSelectBottle;
  }, [onSelectBottle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.Fog('#0f172a', 10, 22);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.set(0, 2.05, 5.45);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 4.0;
    controls.maxDistance = 8.0;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.enableDamping = !isSoftwareGl;
    controls.target.set(0, 0.58, 0);
    controls.update();

    // Studio 3-point lighting tuned for clear glass & liquid refractions
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x451a03, 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(3.5, 6.5, 4.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
    rimLight.position.set(-4.2, 3.2, -4.0);
    scene.add(rimLight);

    // Warm Wooden Xylophone Bench Platform
    const benchGeo = new THREE.BoxGeometry(5.1, 0.24, 1.45);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x7c3f1d,
      roughness: 0.62,
      metalness: 0.08,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.14, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    // Front brass trim rail along bench
    const trimGeo = new THREE.BoxGeometry(5.12, 0.05, 0.05);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, -0.04, 0.72);
    scene.add(trim);

    // Lathe profile for genuine curved glass bottle
    const outerPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.24, 0.0),
      new THREE.Vector2(0.275, 0.04),
      new THREE.Vector2(0.275, 0.82),
      new THREE.Vector2(0.26, 0.92),
      new THREE.Vector2(0.16, 1.07),
      new THREE.Vector2(0.105, 1.18),
      new THREE.Vector2(0.102, 1.42),
      new THREE.Vector2(0.125, 1.44),
      new THREE.Vector2(0.102, 1.46),
    ];
    const bottleGlassGeo = new THREE.LatheGeometry(outerPoints, 40);

    // Subtle glass rim torus at bottle lip
    const lipGeo = new THREE.TorusGeometry(0.11, 0.022, 12, 32);

    // Shared translucent realistic glass material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.36,
      roughness: 0.07,
      metalness: 0.05,
      ior: 1.5,
      reflectivity: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.65,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const hitGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.52, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const coasterTexList: THREE.CanvasTexture[] = [];
    const bottles: BottleRig[] = [];
    const hitTargets: THREE.Mesh[] = [];

    const bottleBodyMaxH = 0.82; // cylindrical liquid chamber height

    WATER_LEVELS.forEach((level, idx) => {
      const bx = (idx - 2) * 0.96;
      const group = new THREE.Group();
      group.position.set(bx, 0, 0);

      // Coaster number disc in front of bottle
      const cTex = createCoasterTexture(idx + 1);
      coasterTexList.push(cTex);
      const coasterGeo = new THREE.CylinderGeometry(0.2, 0.21, 0.03, 24);
      const coasterMat = new THREE.MeshStandardMaterial({ map: cTex, roughness: 0.5, metalness: 0.1 });
      const coaster = new THREE.Mesh(coasterGeo, coasterMat);
      coaster.position.set(0, -0.015, 0.44);
      coaster.rotation.y = -Math.PI / 2;
      group.add(coaster);

      // Solid colored water column inside bottle
      const waterH = bottleBodyMaxH * level;
      const waterGeo = new THREE.CylinderGeometry(0.242, 0.242, waterH, 32);
      const waterMat = new THREE.MeshStandardMaterial({
        color: LIQUID_COLORS[idx],
        emissive: LIQUID_COLORS[idx],
        emissiveIntensity: 0.18,
        roughness: 0.16,
        metalness: 0.08,
        transparent: true,
        opacity: 0.86,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.position.y = 0.04 + waterH / 2;
      group.add(waterMesh);

      // Bright top surface meniscus disc (ripples when active)
      const meniscusGeo = new THREE.CircleGeometry(0.242, 32);
      const meniscusMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: LIQUID_COLORS[idx],
        emissiveIntensity: 0.55,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
      });
      const meniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
      meniscus.rotation.x = -Math.PI / 2;
      meniscus.position.y = 0.04 + waterH + 0.002;
      group.add(meniscus);

      // Air-column resonance glow cylinder above water (visible in 'Tiup Botol' mode)
      const airSpaceH = Math.max(0.14, 1.38 - (0.04 + waterH));
      const airGlowGeo = new THREE.CylinderGeometry(0.085, 0.18, airSpaceH, 24);
      const airGlowMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const airGlow = new THREE.Mesh(airGlowGeo, airGlowMat);
      airGlow.position.y = 0.04 + waterH + airSpaceH / 2;
      group.add(airGlow);

      // Thick glass bottom base plug for realistic refraction anchor
      const baseGlassGeo = new THREE.CylinderGeometry(0.255, 0.24, 0.045, 32);
      const baseGlass = new THREE.Mesh(baseGlassGeo, glassMat);
      baseGlass.position.y = 0.022;
      group.add(baseGlass);

      // Curved glass outer bottle body
      const bottleMesh = new THREE.Mesh(bottleGlassGeo, glassMat);
      bottleMesh.castShadow = !isSoftwareGl;
      bottleMesh.renderOrder = 3;
      group.add(bottleMesh);

      // Glass mouth rim
      const lip = new THREE.Mesh(lipGeo, glassMat);
      lip.rotation.x = Math.PI / 2;
      lip.position.y = 1.44;
      lip.renderOrder = 4;
      group.add(lip);

      // Expanding sound wave ring around bottle
      const waveGeo = new THREE.TorusGeometry(0.32, 0.02, 12, 36);
      const waveMat = new THREE.MeshBasicMaterial({
        color: LIQUID_COLORS[idx],
        transparent: true,
        opacity: 0.0,
      });
      const waveRing = new THREE.Mesh(waveGeo, waveMat);
      waveRing.rotation.x = Math.PI / 2;
      waveRing.position.y = 0.04 + waterH;
      waveRing.visible = false;
      group.add(waveRing);

      // Invisible raycast hit cylinder
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 0.74;
      hitMesh.userData.bottleIdx = idx;
      group.add(hitMesh);
      hitTargets.push(hitMesh);

      scene.add(group);
      bottles.push({
        group,
        hitMesh,
        waveRing,
        airGlow,
        meniscus,
        baseWaterY: 0.04 + waterH,
        impulse: 0,
        baseX: bx,
      });
    });

    // Animated 3D Wooden Striker Mallet (visible in 'Ketuk Botol' mode)
    const malletGroup = new THREE.Group();
    const stickMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.1 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35, metalness: 0.15 });
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.85, 16), stickMat);
    stick.rotation.z = Math.PI / 2;
    stick.position.set(0.42, 0, 0);
    malletGroup.add(stick);
    const malletHead = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 20), headMat);
    malletHead.position.set(0, 0, 0);
    malletHead.castShadow = !isSoftwareGl;
    malletGroup.add(malletHead);
    malletGroup.position.set(0, 0.55, 0.65);
    malletGroup.visible = false;
    scene.add(malletGroup);

    // Raycaster for clicking bottles directly in 3D
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const getBottleHit = (clientX: number, clientY: number): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.bottleIdx;
        if (typeof idx === 'number') return idx;
      }
      return null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > 8) return; // Ignore orbit drag
      const hitIdx = getBottleHit(e.clientX, e.clientY);
      if (hitIdx !== null) {
        callbackRef.current(hitIdx);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const hitIdx = getBottleHit(e.clientX, e.clientY);
      renderer.domElement.style.cursor = hitIdx !== null ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    let frameId = 0;
    let disposed = false;
    let lastNonce = stateRef.current.strikeNonce;
    let malletTimer = 0;
    let malletTargetIdx = 0;
    let lastTime = performance.now();

    const afterDraw = (cb: () => void) => {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const st = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (st === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const tick = (now = performance.now()) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const { mode: curMode, activeBottleIdx: activeIdx, strikeNonce: nonce } = stateRef.current;

      if (nonce !== lastNonce && activeIdx !== null && bottles[activeIdx]) {
        lastNonce = nonce;
        bottles[activeIdx].impulse = 1.0;
        malletTargetIdx = activeIdx;
        malletTimer = 0.42;
      }

      // Animate striker mallet in 'Ketuk Botol' mode
      if (curMode === 'Ketuk Botol' && malletTimer > 0) {
        malletTimer = Math.max(0, malletTimer - dt);
        malletGroup.visible = true;
        const p = 1 - malletTimer / 0.42;
        // Swing in forward from front-right to tap side of glass
        const swingZ = Math.sin(p * Math.PI) * 0.28;
        malletGroup.position.set(bottles[malletTargetIdx].baseX + 0.18, 0.56, 0.58 - swingZ);
        malletGroup.rotation.y = 0.5 - swingZ * 1.4;
      } else {
        malletGroup.visible = false;
      }

      // Update each bottle's vibration, wave ring & air glow
      bottles.forEach((b, idx) => {
        if (b.impulse > 0.005) {
          b.impulse = Math.max(0, b.impulse - dt * 1.65);
          const osc = Math.sin(now * 0.055 + idx) * 0.025 * b.impulse;
          b.group.rotation.z = osc;
          b.meniscus.position.y = b.baseWaterY + 0.002 + Math.sin(now * 0.06) * 0.012 * b.impulse;

          // Expanding wave ring
          const waveProgress = 1 - b.impulse;
          b.waveRing.visible = true;
          b.waveRing.scale.setScalar(1 + waveProgress * 1.35);
          b.waveRing.position.y =
            curMode === 'Ketuk Botol' ? b.baseWaterY * 0.65 + waveProgress * 0.25 : 1.42 + waveProgress * 0.25;
          (b.waveRing.material as THREE.MeshBasicMaterial).opacity = b.impulse * 0.85;

          // Air column shimmer if in 'Tiup Botol' mode
          const airMat = b.airGlow.material as THREE.MeshBasicMaterial;
          airMat.opacity = curMode === 'Tiup Botol' ? b.impulse * (0.35 + 0.15 * Math.sin(now * 0.04)) : 0;
        } else {
          b.group.rotation.z = 0;
          b.meniscus.position.y = b.baseWaterY + 0.002;
          b.waveRing.visible = false;
          (b.airGlow.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      });

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => tick(performance.now()));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 200;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    tick(performance.now());

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      controls.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      coasterTexList.forEach((t) => t.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-40 sm:h-44 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing relative"
      aria-label="Simulasi 3D Xylophone 5 Botol Kaca Nyata"
    />
  );
};
