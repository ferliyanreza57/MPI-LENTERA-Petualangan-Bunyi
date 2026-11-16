import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface CupPhone3DProps {
  isTaut: boolean;
  distance: number;
  pulseActive: boolean;
}

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

function createCorrugatedTinTextures(renderer: THREE.WebGLRenderer): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const w = 256;
  const h = 256;

  // Color map: brushed tin steel with subtle vertical sheen
  const cCanvas = document.createElement('canvas');
  cCanvas.width = w;
  cCanvas.height = h;
  const cCtx = cCanvas.getContext('2d')!;
  const grad = cCtx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#c6cbd1');
  grad.addColorStop(0.25, '#e8ecf0');
  grad.addColorStop(0.5, '#b6bcc4');
  grad.addColorStop(0.75, '#eef2f6');
  grad.addColorStop(1, '#c6cbd1');
  cCtx.fillStyle = grad;
  cCtx.fillRect(0, 0, w, h);

  // Fine horizontal brushed metal grain & rib shading
  for (let y = 0; y < h; y += 2) {
    const v = Math.sin((y / h) * Math.PI * 22);
    cCtx.fillStyle = v > 0 ? 'rgba(255,255,255,0.14)' : 'rgba(60,70,82,0.14)';
    cCtx.fillRect(0, y, w, 2);
  }

  // Bump + Roughness map for realistic tin can ribs
  const bCanvas = document.createElement('canvas');
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = w;
  rCanvas.height = h;
  const rCtx = rCanvas.getContext('2d')!;

  for (let y = 0; y < h; y++) {
    // Corrugated ribs across middle 72% of can height
    const ny = y / h;
    let rib = 0.5;
    if (ny > 0.14 && ny < 0.86) {
      rib = 0.5 + 0.45 * Math.sin(((ny - 0.14) / 0.72) * Math.PI * 20);
    }
    const bVal = Math.round(rib * 255);
    bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.fillRect(0, y, w, 1);

    const rough = Math.round((0.22 + (1 - rib) * 0.18) * 255);
    rCtx.fillStyle = `rgb(${rough},${rough},${rough})`;
    rCtx.fillRect(0, y, w, 1);
  }

  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const colorMap = new THREE.CanvasTexture(cCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAniso;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.anisotropy = maxAniso;

  return { colorMap, bumpMap, roughnessMap };
}

/** Builds a multi-part 3D hollow corrugated tin can centered around origin along local Y axis (open end at +Y, closed bottom at -Y) */
function createTinCanGroup(
  tinOuterMat: THREE.MeshStandardMaterial,
  tinInnerMat: THREE.MeshStandardMaterial,
  rimMat: THREE.MeshStandardMaterial,
  baseMat: THREE.MeshStandardMaterial,
  knotMat: THREE.MeshStandardMaterial,
  glowMat: THREE.MeshBasicMaterial
): { group: THREE.Group; glowRing: THREE.Mesh } {
  const group = new THREE.Group();

  const radius = 0.58;
  const height = 1.28;
  const halfH = height / 2;

  // 1. Corrugated outer profile via LatheGeometry (open top & bottom cylinder with slight rib wave)
  const pts: THREE.Vector2[] = [];
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -halfH + t * height;
    const rib = t > 0.12 && t < 0.88 ? Math.sin(((t - 0.12) / 0.76) * Math.PI * 16) * 0.018 : 0;
    pts.push(new THREE.Vector2(radius + rib, y));
  }
  const outerGeo = new THREE.LatheGeometry(pts, 48);
  const outerMesh = new THREE.Mesh(outerGeo, tinOuterMat);
  outerMesh.castShadow = true;
  outerMesh.receiveShadow = true;
  group.add(outerMesh);

  // 2. Inner corrugated hollow wall (BackSide / slightly smaller radius)
  const innerPts = pts.map((p) => new THREE.Vector2(p.x - 0.022, p.y));
  const innerGeo = new THREE.LatheGeometry(innerPts, 48);
  const innerMesh = new THREE.Mesh(innerGeo, tinInnerMat);
  group.add(innerMesh);

  // 3. Rolled lip rim at open end (+halfH)
  const openRimGeo = new THREE.TorusGeometry(radius, 0.032, 16, 48);
  const openRim = new THREE.Mesh(openRimGeo, rimMat);
  openRim.rotation.x = Math.PI / 2;
  openRim.position.y = halfH;
  openRim.castShadow = true;
  group.add(openRim);

  // 4. Rolled seam rim at closed base (-halfH)
  const baseRimGeo = new THREE.TorusGeometry(radius, 0.03, 14, 48);
  const baseRim = new THREE.Mesh(baseRimGeo, rimMat);
  baseRim.rotation.x = Math.PI / 2;
  baseRim.position.y = -halfH;
  baseRim.castShadow = true;
  group.add(baseRim);

  // 5. Recessed closed metallic base plate with concentric stamp rings
  const basePlateGeo = new THREE.CylinderGeometry(radius - 0.015, radius - 0.015, 0.035, 48);
  const basePlate = new THREE.Mesh(basePlateGeo, baseMat);
  basePlate.position.y = -halfH + 0.025;
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  group.add(basePlate);

  // Raised concentric stamp ring on base exterior
  const stampRingGeo = new THREE.TorusGeometry(radius * 0.56, 0.012, 10, 40);
  const stampRing = new THREE.Mesh(stampRingGeo, rimMat);
  stampRing.rotation.x = Math.PI / 2;
  stampRing.position.y = -halfH + 0.005;
  group.add(stampRing);

  // 6. Dark center eyelet hole + red string knot anchor on base
  const holeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.045, 24);
  const holeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
  const hole = new THREE.Mesh(holeGeo, holeMat);
  hole.position.y = -halfH + 0.022;
  group.add(hole);

  const knotGeo = new THREE.SphereGeometry(0.052, 16, 16);
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.position.y = -halfH + 0.048;
  group.add(knot);

  // 7. Luminous acoustic diaphragm ring around base (pulses when sound travels)
  const glowGeo = new THREE.TorusGeometry(radius * 0.76, 0.02, 12, 48);
  const glowRing = new THREE.Mesh(glowGeo, glowMat);
  glowRing.rotation.x = Math.PI / 2;
  glowRing.position.y = -halfH + 0.004;
  glowRing.visible = false;
  group.add(glowRing);

  return { group, glowRing };
}

export const CupPhone3D: React.FC<CupPhone3DProps> = ({ isTaut, distance, pulseActive }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ isTaut, distance, pulseActive });

  useEffect(() => {
    stateRef.current = { isTaut, distance, pulseActive };
  }, [isTaut, distance, pulseActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.Fog('#0f172a', 10, 22);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 1.85, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
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
    controls.minDistance = 4.2;
    controls.maxDistance = 9.0;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.enableDamping = !isSoftwareGl;
    controls.target.set(0, 0.18, 0);
    controls.update();

    // 3-Point Warm/Cool Studio Lighting
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x3f2e21, 0.85);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.1);
    keyLight.position.set(3.8, 6.2, 4.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4.5;
    keyLight.shadow.camera.right = 4.5;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-4.5, 3.0, -3.5);
    scene.add(rimLight);

    // Laboratory Table Ground Platform so tin cans feel grounded
    const benchGeo = new THREE.CylinderGeometry(4.8, 5.1, 0.35, 48);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x5c3822,
      roughness: 0.72,
      metalness: 0.06,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.y = -0.78;
    bench.receiveShadow = true;
    scene.add(bench);

    // Soft contact shadow discs under both cans
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
    sGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    });
    const shadowDiscGeo = new THREE.PlaneGeometry(1.75, 1.25);
    const leftShadow = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
    leftShadow.rotation.x = -Math.PI / 2;
    leftShadow.position.set(-2.3, -0.59, 0.15);
    scene.add(leftShadow);

    const rightShadow = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
    rightShadow.rotation.x = -Math.PI / 2;
    rightShadow.position.set(2.3, -0.59, -0.1);
    scene.add(rightShadow);

    // PBR Tin Textures & Materials
    const { colorMap, bumpMap, roughnessMap } = createCorrugatedTinTextures(renderer);

    const tinOuterMat = new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap,
      bumpScale: 0.025,
      roughnessMap,
      metalness: 0.88,
      roughness: 0.28,
      envMapIntensity: 1.3,
    });

    const tinInnerMat = new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap,
      bumpScale: 0.02,
      color: 0xa1aab5,
      metalness: 0.8,
      roughness: 0.42,
      side: THREE.BackSide,
      envMapIntensity: 0.9,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.18,
      envMapIntensity: 1.35,
    });

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.86,
      roughness: 0.3,
      envMapIntensity: 1.2,
    });

    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.65,
      metalness: 0.05,
    });

    const senderGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const receiverGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
    });

    // Left Sender Can (angled so camera sees its open corrugated mouth + right closed base facing center)
    const senderCan = createTinCanGroup(tinOuterMat, tinInnerMat, rimMat, baseMat, knotMat, senderGlowMat);
    senderCan.group.rotation.order = 'YXZ';
    senderCan.group.rotation.z = Math.PI / 2; // +Y open mouth points -X (left), -Y closed base points +X (right center)
    senderCan.group.rotation.y = 0.28;
    senderCan.group.rotation.x = 0.08;
    senderCan.group.position.set(-2.25, 0.12, 0.2);
    scene.add(senderCan.group);

    // Right Receiver Can (closed base faces -X left center, open mouth points +X right)
    const receiverCan = createTinCanGroup(tinOuterMat, tinInnerMat, rimMat, baseMat, knotMat, receiverGlowMat);
    receiverCan.group.rotation.order = 'YXZ';
    receiverCan.group.rotation.z = -Math.PI / 2; // -Y closed base points -X (left center), +Y open mouth points +X (right)
    receiverCan.group.rotation.y = -0.35;
    receiverCan.group.rotation.x = -0.05;
    receiverCan.group.position.set(2.25, 0.18, -0.15);
    scene.add(receiverCan.group);

    // Dynamic Red Braided String Mesh
    const stringSegments = 36;
    const radialSegments = 10;
    const stringMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.58,
      metalness: 0.08,
    });
    let stringMesh: THREE.Mesh | null = null;

    // Traveling Acoustic Pulse Rings + Energy Bead along the string
    const pulseSphereGeo = new THREE.SphereGeometry(0.11, 20, 20);
    const pulseSphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.92 });
    const pulseSphere = new THREE.Mesh(pulseSphereGeo, pulseSphereMat);
    pulseSphere.visible = false;
    scene.add(pulseSphere);

    const pulseRingGeo = new THREE.TorusGeometry(0.19, 0.025, 12, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.y = Math.PI / 2;
    pulseRing.visible = false;
    scene.add(pulseRing);

    const _pStart = new THREE.Vector3();
    const _pEnd = new THREE.Vector3();
    const _pCtrl = new THREE.Vector3();
    const _pTemp = new THREE.Vector3();
    const curvePoints: THREE.Vector3[] = Array.from({ length: stringSegments + 1 }, () => new THREE.Vector3());
    const stringCurve = new THREE.CatmullRomCurve3(curvePoints);

    const updateStringGeometry = (sag: number, waveAmp: number, wavePhase: number) => {
      // Base connection centers in world space
      const distSpan = THREE.MathUtils.clamp(1.65 + (stateRef.current.distance - 2) * 0.13, 1.65, 2.65);
      senderCan.group.position.x = -distSpan;
      receiverCan.group.position.x = distSpan;
      leftShadow.position.x = -distSpan;
      rightShadow.position.x = distSpan;

      // Exact hole world positions (offset along local -Y = -0.62)
      _pStart.set(0, -0.62, 0).applyMatrix4(senderCan.group.matrixWorld);
      _pEnd.set(0, -0.62, 0).applyMatrix4(receiverCan.group.matrixWorld);

      for (let i = 0; i <= stringSegments; i++) {
        const t = i / stringSegments;
        curvePoints[i].lerpVectors(_pStart, _pEnd, t);
        // Parabolic sag when slack
        const sagOffset = Math.sin(t * Math.PI) * sag;
        curvePoints[i].y -= sagOffset;
        // Standing + traveling transverse vibration wave along the taut string
        if (waveAmp > 0.001) {
          const envelope = Math.sin(t * Math.PI);
          curvePoints[i].y += Math.sin(t * Math.PI * 6 - wavePhase) * waveAmp * envelope;
          curvePoints[i].z += Math.cos(t * Math.PI * 5 - wavePhase) * (waveAmp * 0.55) * envelope;
        }
      }

      const newGeo = new THREE.TubeGeometry(stringCurve, stringSegments, 0.032, radialSegments, false);
      if (stringMesh) {
        stringMesh.geometry.dispose();
        stringMesh.geometry = newGeo;
      } else {
        stringMesh = new THREE.Mesh(newGeo, stringMat);
        stringMesh.castShadow = true;
        scene.add(stringMesh);
      }
    };

    senderCan.group.updateMatrixWorld(true);
    receiverCan.group.updateMatrixWorld(true);
    updateStringGeometry(stateRef.current.isTaut ? 0.02 : 0.65, 0, 0);

    let frameId = 0;
    let disposed = false;
    let currentSag = stateRef.current.isTaut ? 0.02 : 0.65;
    let pulseT = 0;
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

      const { isTaut: taut, pulseActive: pulsing } = stateRef.current;

      // Smooth exponential damping between taut and slack string tension
      const targetSag = taut ? 0.02 : 0.62;
      currentSag = THREE.MathUtils.damp(currentSag, targetSag, 8, dt);

      // Gentle alive micro-vibration & acoustic pulse animation
      let waveAmp = 0;
      if (pulsing) {
        pulseT = (pulseT + dt * (taut ? 1.15 : 0.72)) % 1;
        waveAmp = taut ? 0.048 : Math.max(0, 0.025 * (1 - pulseT * 1.4));

        // Sender vibrates strongly; receiver resonates when taut
        senderCan.group.position.y = 0.12 + Math.sin(now * 0.04) * 0.015;
        receiverCan.group.position.y = 0.18 + (taut ? Math.sin(now * 0.04 - 0.8) * 0.015 : 0);

        senderCan.glowRing.visible = true;
        senderCan.glowRing.scale.setScalar(1 + Math.sin(now * 0.02) * 0.08);

        receiverCan.glowRing.visible = taut && pulseT > 0.55;
        if (receiverCan.glowRing.visible) {
          receiverCan.glowRing.scale.setScalar(1 + Math.sin(now * 0.025) * 0.08);
        }

        // Travel position along string curve
        const travelT = taut ? pulseT : Math.min(0.48, pulseT * 0.55);
        const fade = taut ? 1 : Math.max(0, 1 - pulseT * 1.5);
        stringCurve.getPointAt(travelT, _pTemp);
        pulseSphere.position.copy(_pTemp);
        pulseSphere.visible = fade > 0.05;
        pulseSphereMat.opacity = fade * 0.92;

        pulseRing.position.copy(_pTemp);
        pulseRing.visible = fade > 0.05;
        pulseRing.scale.setScalar(0.85 + Math.sin(now * 0.02) * 0.25);
        pulseRingMat.opacity = fade * 0.85;
      } else {
        pulseT = 0;
        senderCan.group.position.y = 0.12 + Math.sin(now * 0.0018) * 0.012;
        receiverCan.group.position.y = 0.18 + Math.sin(now * 0.0018 + 1.2) * 0.012;
        senderCan.glowRing.visible = false;
        receiverCan.glowRing.visible = false;
        pulseSphere.visible = false;
        pulseRing.visible = false;
      }

      senderCan.group.updateMatrixWorld(true);
      receiverCan.group.updateMatrixWorld(true);
      _pCtrl.set(0, 0, 0);
      updateStringGeometry(currentSag, waveAmp, now * 0.022);

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
      const h = container.clientHeight || 220;
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
      colorMap.dispose();
      bumpMap.dispose();
      roughnessMap.dispose();
      shadowTex.dispose();
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
      aria-label="Simulasi 3D Telepon Kaleng Nyata"
    />
  );
};
