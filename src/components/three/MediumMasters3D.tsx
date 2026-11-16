import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LenteraState } from '../../types/lentera';

interface MediumMasters3DProps {
  medium: LenteraState['slide12Medium'];
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

interface ParticleSeed {
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  speedX: number;
  speedY: number;
  speedZ: number;
}

const MAX_PARTICLES = 180; // 10 x 4 x 4 + reserve

export const MediumMasters3D: React.FC<MediumMasters3DProps> = ({ medium }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mediumRef = useRef<LenteraState['slide12Medium']>(medium);

  useEffect(() => {
    mediumRef.current = medium;
  }, [medium]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 190;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b132b');
    scene.fog = new THREE.Fog('#0b132b', 9, 20);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 1.55, 5.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
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
    controls.minDistance = 3.8;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.enableDamping = !isSoftwareGl;
    controls.target.set(0, 0.1, 0);
    controls.update();

    // Warm/cool 3-point rig
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 2.0);
    keyLight.position.set(3.5, 5.5, 4.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-4.0, 2.5, -3.5);
    scene.add(rimLight);

    // Lab Bench Base Platform
    const baseGeo = new THREE.BoxGeometry(5.6, 0.28, 2.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.48,
      metalness: 0.45,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.78;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Left Composite 3D Sound Emitter (Speaker Horn + Magnet Stand + Diaphragm Cone)
    const emitterGroup = new THREE.Group();
    const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.35, roughness: 0.38 });
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      metalness: 0.25,
      roughness: 0.45,
    });

    const eFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.14, 24), standMat);
    eFoot.position.y = -0.57;
    eFoot.castShadow = true;
    emitterGroup.add(eFoot);

    const eNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 16), standMat);
    eNeck.position.y = -0.3;
    emitterGroup.add(eNeck);

    const eBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.42, 24), housingMat);
    eBody.rotation.z = Math.PI / 2;
    eBody.position.set(-0.08, 0.12, 0);
    eBody.castShadow = true;
    emitterGroup.add(eBody);

    const eHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.25, 0.34, 32, 1, true), housingMat);
    eHorn.rotation.z = -Math.PI / 2;
    eHorn.position.set(0.24, 0.12, 0);
    eHorn.material.side = THREE.DoubleSide;
    emitterGroup.add(eHorn);

    const eDiaphragm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), coneMat);
    eDiaphragm.scale.set(0.55, 1, 1);
    eDiaphragm.position.set(0.22, 0.12, 0);
    emitterGroup.add(eDiaphragm);

    emitterGroup.position.set(-2.22, 0, 0);
    scene.add(emitterGroup);

    // Right Composite 3D Acoustic Receiver Sensor (Dish + Glow Core + Pedestal)
    const receiverGroup = new THREE.Group();
    const rFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.14, 24), standMat);
    rFoot.position.y = -0.57;
    rFoot.castShadow = true;
    receiverGroup.add(rFoot);

    const rNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 16), standMat);
    rNeck.position.y = -0.3;
    receiverGroup.add(rNeck);

    const rDishMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.45, roughness: 0.32 });
    const rDish = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.22, 0.3, 32), rDishMat);
    rDish.rotation.z = Math.PI / 2;
    rDish.position.set(0, 0.12, 0);
    rDish.castShadow = true;
    receiverGroup.add(rDish);

    const rCoreMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.3,
    });
    const rCore = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), rCoreMat);
    rCore.position.set(-0.18, 0.12, 0);
    receiverGroup.add(rCore);

    receiverGroup.position.set(2.22, 0, 0);
    scene.add(receiverGroup);

    // Translucent Medium Volume Chamber Box (represents crystal block / water tank / vacuum jar)
    const chamberGeo = new THREE.BoxGeometry(3.3, 1.25, 1.3);
    const chamberMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      roughness: 0.12,
      metalness: 0.05,
      depthWrite: false,
    });
    const chamberMesh = new THREE.Mesh(chamberGeo, chamberMat);
    chamberMesh.position.set(0, 0.12, 0);
    chamberMesh.renderOrder = 4;
    scene.add(chamberMesh);

    const chamberEdgeGeo = new THREE.EdgesGeometry(chamberGeo);
    const chamberEdgeMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.45 });
    const chamberEdges = new THREE.LineSegments(chamberEdgeGeo, chamberEdgeMat);
    chamberEdges.position.copy(chamberMesh.position);
    scene.add(chamberEdges);

    // InstancedMesh of 3D Medium Molecules / Particles
    const particleGeo = new THREE.SphereGeometry(0.088, 16, 16);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.35,
      envMapIntensity: 1.2,
    });
    const instancedParticles = new THREE.InstancedMesh(particleGeo, particleMat, MAX_PARTICLES);
    instancedParticles.frustumCulled = false;
    instancedParticles.castShadow = !isSoftwareGl;
    scene.add(instancedParticles);

    // Expanding 3D Acoustic Wavefront Rings moving across the medium
    const waveRings: THREE.Mesh[] = [];
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.75,
    });
    for (let i = 0; i < 3; i++) {
      const rMesh = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 10, 32), ringMat.clone());
      rMesh.rotation.y = Math.PI / 2;
      rMesh.position.set(-1.5, 0.12, 0);
      scene.add(rMesh);
      waveRings.push(rMesh);
    }

    // Build deterministic 3D lattice seeds
    const seeds: ParticleSeed[] = [];
    const cols = 10;
    const rows = 4;
    const depths = 4;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        for (let d = 0; d < depths; d++) {
          const bx = -1.45 + c * (2.9 / (cols - 1));
          const by = -0.34 + r * (0.92 / (rows - 1));
          const bz = -0.45 + d * (0.9 / (depths - 1));
          seeds.push({
            baseX: bx,
            baseY: by,
            baseZ: bz,
            phase: c * 0.7 + r * 1.3 + d * 2.1,
            speedX: 0.8 + ((c * 3 + r) % 5) * 0.25,
            speedY: 0.7 + ((r * 5 + d) % 5) * 0.25,
            speedZ: 0.9 + ((d * 7 + c) % 5) * 0.25,
          });
        }
      }
    }

    const _dummyMat = new THREE.Matrix4();
    const _pos = new THREE.Vector3();
    const _quat = new THREE.Quaternion();
    const _scale = new THREE.Vector3(1, 1, 1);
    const _color = new THREE.Color();
    const _baseColor = new THREE.Color();
    const _hitColor = new THREE.Color(0xfef08a);

    let frameId = 0;
    let disposed = false;
    let waveFront = -1.65;
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
      const tSec = now * 0.001;
      const mode = mediumRef.current;

      // Emitter diaphragm always vibrates to show sound source is active
      eDiaphragm.position.x = 0.22 + Math.sin(tSec * 22) * 0.032;

      if (mode === 'Hampa') {
        // Zero medium particles; speaker emits waves that stall at -1.55 and turn red
        instancedParticles.count = 0;
        chamberMat.color.setHex(0xf43f5e);
        chamberMat.opacity = 0.08;
        chamberEdgeMat.color.setHex(0xfb7185);
        rCoreMat.emissive.setHex(0x334155);
        rCoreMat.emissiveIntensity = 0.05;

        waveRings.forEach((ring, idx) => {
          const p = (tSec * 1.1 + idx * 0.33) % 1;
          ring.position.x = -1.78 + p * 0.25;
          ring.scale.setScalar(0.8 + p * 0.3);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.color.setHex(0xf43f5e);
          mat.opacity = Math.max(0, 0.7 - p * 0.75);
        });
      } else {
        const waveSpeed = mode === 'Padat' ? 3.8 : mode === 'Cair' ? 2.15 : 1.15;
        waveFront += dt * waveSpeed;
        if (waveFront > 2.0) waveFront = -1.75;

        const isPadat = mode === 'Padat';
        const isCair = mode === 'Cair';
        const activeCount = isPadat ? 160 : isCair ? 112 : 52;
        instancedParticles.count = activeCount;

        chamberMat.color.setHex(isPadat ? 0xf59e0b : isCair ? 0x0ea5e9 : 0x6ee7b7);
        chamberMat.opacity = isPadat ? 0.14 : isCair ? 0.2 : 0.08;
        chamberEdgeMat.color.setHex(isPadat ? 0xfbbf24 : isCair ? 0x38bdf8 : 0x34d399);

        _baseColor.setHex(isPadat ? 0xf59e0b : isCair ? 0x38bdf8 : 0x6ee7b7);

        // Receiver lights up when wavefront arrives near +1.45
        const receiverHit = Math.max(0, 1 - Math.abs(waveFront - 1.55) / 0.6);
        rCoreMat.emissive.setHex(0x10b981);
        rCoreMat.emissiveIntensity = 0.25 + receiverHit * 1.4;
        rCore.scale.setScalar(1 + receiverHit * 0.16);

        // Update traveling 3D acoustic wavefront rings
        waveRings.forEach((ring, idx) => {
          const offset = ((waveFront + 1.75 + idx * 1.25) % 3.75) - 1.75;
          ring.position.x = offset;
          const norm = (offset + 1.75) / 3.75;
          ring.scale.setScalar(0.85 + Math.sin(norm * Math.PI) * 0.45);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.color.setHex(isPadat ? 0xfef08a : isCair ? 0x7dd3fc : 0xa7f3d0);
          mat.opacity = 0.65 * Math.sin(norm * Math.PI);
        });

        for (let i = 0; i < activeCount; i++) {
          // Spread sparse indices evenly across volume when count < seeds.length
          const seedIdx = isPadat ? i : Math.floor((i * seeds.length) / activeCount);
          const s = seeds[seedIdx];

          let mx = s.baseX;
          let my = s.baseY;
          let mz = s.baseZ;

          if (isCair) {
            mx += Math.sin(tSec * s.speedX + s.phase) * 0.08;
            my += Math.cos(tSec * s.speedY + s.phase) * 0.07;
            mz += Math.sin(tSec * s.speedZ + s.phase * 1.4) * 0.08;
          } else if (!isPadat) {
            // Gas: wide energetic thermal motion
            mx += Math.sin(tSec * s.speedX * 1.5 + s.phase) * 0.22;
            my += Math.cos(tSec * s.speedY * 1.5 + s.phase) * 0.18;
            mz += Math.sin(tSec * s.speedZ * 1.5 + s.phase * 1.7) * 0.2;
          }

          // Longitudinal compression displacement from sound wavefront
          const dist = Math.abs(mx - waveFront);
          const hit = dist < 0.5 ? Math.cos((dist / 0.5) * Math.PI * 0.5) : 0;
          const dispX = hit * Math.sin((mx - waveFront) * 6.0) * (isPadat ? 0.095 : isCair ? 0.13 : 0.16);
          _pos.set(mx + dispX, my, mz);

          const pScale = (isPadat ? 1.0 : isCair ? 0.92 : 0.82) + hit * 0.28;
          _scale.setScalar(pScale);
          _dummyMat.compose(_pos, _quat, _scale);
          instancedParticles.setMatrixAt(i, _dummyMat);

          _color.copy(_baseColor).lerp(_hitColor, hit * 0.85);
          instancedParticles.setColorAt(i, _color);
        }

        instancedParticles.instanceMatrix.needsUpdate = true;
        if (instancedParticles.instanceColor) instancedParticles.instanceColor.needsUpdate = true;
      }

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
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 190;
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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.InstancedMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
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
      className="w-full h-40 sm:h-44 rounded-2xl border-2 border-amber-600 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
      aria-label={`Simulasi 3D Medium Perambatan Bunyi: ${medium}`}
    />
  );
};
