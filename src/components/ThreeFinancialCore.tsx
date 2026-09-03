'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThreeFinancialCoreProps {
  mode?: 'login' | 'dashboard' | 'twin';
  height?: number | string;
  interactive?: boolean;
  reactiveTrigger?: number;
}

export function ThreeFinancialCore({
  mode = 'dashboard',
  height = 360,
  interactive = true,
  reactiveTrigger = 0,
}: ThreeFinancialCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const { resolvedTheme } = useTheme();
  const triggerRef = useRef(reactiveTrigger);

  useEffect(() => {
    triggerRef.current = reactiveTrigger;
  }, [reactiveTrigger]);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch {
        return false;
      }
    };

    const hasWebGL = checkWebGL();
    setWebglSupported(hasWebGL);

    if (!hasWebGL || !canvasRef.current || !containerRef.current) return;

    let isMounted = true;
    let animationFrameId: number;

    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;

    const initThree = async () => {
      const THREE = await import('three');
      if (!isMounted || !canvasRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth || 380;
      const heightVal = typeof height === 'number' ? height : (container.clientHeight || 360);

      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / heightVal, 0.1, 1000);
      camera.position.z = mode === 'login' ? 5.0 : mode === 'twin' ? 5.2 : 5.6;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, heightVal);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const isDark = resolvedTheme === 'dark';
      const emeraldColor = isDark ? 0x10b981 : 0x059669;
      const brightEmerald = 0x34d399;
      const goldColor = 0xf59e0b;

      // Group holding the entire rotating system
      const systemGroup = new THREE.Group();
      scene.add(systemGroup);

      // -------------------------------------------------------------
      // 1. PROCEDURAL TEXTURES
      // -------------------------------------------------------------
      const createCoinTexture = () => {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d')!;
        const rad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
        rad.addColorStop(0, '#fef08a');
        rad.addColorStop(0.7, '#f59e0b');
        rad.addColorStop(1, '#b45309');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(128, 128, 124, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.arc(128, 128, 105, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 120px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 128, 134);

        return new THREE.CanvasTexture(c);
      };

      const createBanknoteTexture = () => {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, 0, 256, 128);

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 244, 116);
        ctx.strokeRect(12, 12, 232, 104);

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.ellipse(128, 64, 45, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ecfdf5';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', 128, 66);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(110, 0, 36, 128);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.fillText('FINEXFLY', 128, 64);

        return new THREE.CanvasTexture(c);
      };

      const createCardTexture = () => {
        const c = document.createElement('canvas');
        c.width = 300;
        c.height = 180;
        const ctx = c.getContext('2d')!;
        
        const grad = ctx.createLinearGradient(0, 0, 300, 180);
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.5, '#047857');
        grad.addColorStop(1, '#022c22');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 300, 180);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(24, 50, 42, 32);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 50, 42, 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Courier, monospace';
        ctx.fillText('4242  ••••  ••••  2026', 24, 125);

        ctx.font = '11px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('SIYA PAHWA', 24, 155);
        ctx.fillText('08/29', 220, 155);

        return new THREE.CanvasTexture(c);
      };

      const createCalculatorTexture = () => {
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = 220;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 160, 220);

        ctx.fillStyle = '#022c22';
        ctx.fillRect(16, 16, 128, 40);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, 16, 128, 40);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 18px Courier, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('3,500,000', 136, 42);

        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = (row === 3 && col === 2) ? '#059669' : '#1e293b';
            ctx.fillRect(16 + col * 44, 70 + row * 34, 38, 28);
          }
        }

        return new THREE.CanvasTexture(c);
      };

      // -------------------------------------------------------------
      // 2. CENTRAL HOLOGRAPHIC DIGITAL GLOBE
      // -------------------------------------------------------------
      const globeGroup = new THREE.Group();
      systemGroup.add(globeGroup);

      const globeGeo = new THREE.SphereGeometry(1.15, 32, 32);
      const globeWireMat = new THREE.MeshBasicMaterial({
        color: emeraldColor,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.35 : 0.25,
      });
      const globeWire = new THREE.Mesh(globeGeo, globeWireMat);
      globeGroup.add(globeWire);

      const innerGlobeGeo = new THREE.SphereGeometry(0.98, 28, 28);
      const innerGlobeMat = new THREE.MeshBasicMaterial({
        color: 0x064e3b,
        transparent: true,
        opacity: isDark ? 0.7 : 0.5,
      });
      const innerGlobe = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
      globeGroup.add(innerGlobe);

      // Landmass Node Points
      const pointsGeo = new THREE.BufferGeometry();
      const pointPositions: number[] = [];
      const numPoints = 180;
      for (let i = 0; i < numPoints; i++) {
        const phi = Math.acos(-1 + (2 * i) / numPoints);
        const theta = Math.sqrt(numPoints * Math.PI) * phi;
        const r = 1.18;
        if ((phi > 0.4 && phi < 1.4) || (phi > 1.7 && phi < 2.5)) {
          pointPositions.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
          );
        }
      }
      pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
      const pointsMat = new THREE.PointsMaterial({
        color: brightEmerald,
        size: 0.042,
        transparent: true,
        opacity: 0.85,
      });
      const landPoints = new THREE.Points(pointsGeo, pointsMat);
      globeGroup.add(landPoints);

      // Orbital Rings
      const orbitalRings: any[] = [];
      [1.7, 2.4].forEach((rad, idx) => {
        const curve = new THREE.EllipseCurve(0, 0, rad, rad * 0.46, 0, Math.PI * 2, false, 0);
        const pts = curve.getPoints(64);
        const rGeo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
        const rMat = new THREE.LineBasicMaterial({
          color: idx === 1 ? goldColor : brightEmerald,
          transparent: true,
          opacity: 0.24 - idx * 0.06,
        });
        const rMesh = new THREE.Line(rGeo, rMat);
        rMesh.rotation.x = Math.PI / 3 + idx * 0.3;
        rMesh.rotation.y = idx * 0.4;
        systemGroup.add(rMesh);
        orbitalRings.push(rMesh);
      });

      // -------------------------------------------------------------
      // 3. SEVEN DISTINCT FINANCIAL OBJECTS
      // -------------------------------------------------------------
      const floatingObjects: any[] = [];
      const coinTexture = createCoinTexture();
      const banknoteTexture = createBanknoteTexture();
      const cardTexture = createCardTexture();
      const calcTexture = createCalculatorTexture();

      const createCoinMesh = (x: number, y: number, z: number, scale = 1, rotZ = 0) => {
        const group = new THREE.Group();
        const cylGeo = new THREE.CylinderGeometry(0.22 * scale, 0.22 * scale, 0.045 * scale, 32);
        const sideMat = new THREE.MeshStandardMaterial({ color: goldColor, metalness: 0.85, roughness: 0.2 });
        const capMat = new THREE.MeshStandardMaterial({ map: coinTexture, metalness: 0.65, roughness: 0.25 });
        const coin = new THREE.Mesh(cylGeo, [sideMat, capMat, capMat]);
        coin.rotation.x = Math.PI / 2.8;
        coin.rotation.z = rotZ;
        group.add(coin);
        group.position.set(x, y, z);
        systemGroup.add(group);
        floatingObjects.push({ mesh: group, baseX: x, baseY: y, baseZ: z, speed: 0.008, phase: x });
        return group;
      };

      const createBanknoteStack = (x: number, y: number, z: number, scale = 1) => {
        const group = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(0.44 * scale, 0.14 * scale, 0.24 * scale);
        const topMat = new THREE.MeshStandardMaterial({ map: banknoteTexture, roughness: 0.5 });
        const sideMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 });
        const stack = new THREE.Mesh(boxGeo, [sideMat, sideMat, topMat, topMat, sideMat, sideMat]);
        stack.rotation.y = Math.PI / 5;
        stack.rotation.x = Math.PI / 8;
        group.add(stack);
        group.position.set(x, y, z);
        systemGroup.add(group);
        floatingObjects.push({ mesh: group, baseX: x, baseY: y, baseZ: z, speed: 0.006, phase: y });
        return group;
      };

      const createBarChart = (x: number, y: number, z: number, scale = 1) => {
        const group = new THREE.Group();
        [0.16, 0.28, 0.38, 0.5].forEach((h, idx) => {
          const bGeo = new THREE.BoxGeometry(0.07 * scale, h * scale, 0.07 * scale);
          const bMat = new THREE.MeshStandardMaterial({
            color: idx === 3 ? 0x34d399 : 0x059669,
            metalness: 0.3,
            roughness: 0.2,
          });
          const bar = new THREE.Mesh(bGeo, bMat);
          bar.position.set((idx - 1.5) * 0.09 * scale, (h * scale) / 2, 0);
          group.add(bar);
        });
        group.rotation.y = -Math.PI / 6;
        group.rotation.x = Math.PI / 8;
        group.position.set(x, y, z);
        systemGroup.add(group);
        floatingObjects.push({ mesh: group, baseX: x, baseY: y, baseZ: z, speed: 0.007, phase: x + 1 });
        return group;
      };

      const createCreditCard = (x: number, y: number, z: number, scale = 1) => {
        const group = new THREE.Group();
        const cardGeo = new THREE.BoxGeometry(0.48 * scale, 0.28 * scale, 0.012 * scale);
        const topMat = new THREE.MeshStandardMaterial({ map: cardTexture, metalness: 0.4, roughness: 0.3 });
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0x022c22, roughness: 0.4 });
        const card = new THREE.Mesh(cardGeo, [edgeMat, edgeMat, edgeMat, edgeMat, topMat, edgeMat]);
        card.rotation.z = -Math.PI / 8;
        card.rotation.y = -Math.PI / 5;
        card.rotation.x = Math.PI / 6;
        group.add(card);
        group.position.set(x, y, z);
        systemGroup.add(group);
        floatingObjects.push({ mesh: group, baseX: x, baseY: y, baseZ: z, speed: 0.007, phase: x + y });
        return group;
      };

      const createCalculator = (x: number, y: number, z: number, scale = 1) => {
        const group = new THREE.Group();
        const calcGeo = new THREE.BoxGeometry(0.28 * scale, 0.38 * scale, 0.035 * scale);
        const topMat = new THREE.MeshStandardMaterial({ map: calcTexture, roughness: 0.4 });
        const sideMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const calc = new THREE.Mesh(calcGeo, [sideMat, sideMat, sideMat, sideMat, topMat, sideMat]);
        calc.rotation.x = Math.PI / 5;
        calc.rotation.y = Math.PI / 8;
        calc.rotation.z = -Math.PI / 10;
        group.add(calc);
        group.position.set(x, y, z);
        systemGroup.add(group);
        floatingObjects.push({ mesh: group, baseX: x, baseY: y, baseZ: z, speed: 0.009, phase: z });
        return group;
      };

      // Exact Placements - Scaled up and spread out
      createBanknoteStack(-2.2, 1.5, 0.3, 1.45);
      createCoinMesh(-0.8, 2.0, 0.2, 1.6, 0.2);
      createBarChart(1.8, 1.6, 0.3, 1.5);
      createCreditCard(2.0, 0.1, 0.5, 1.6);
      createCalculator(1.5, -1.3, 0.4, 1.5);
      createCoinMesh(-2.0, -1.1, 0.3, 1.35, 0.4);
      createBanknoteStack(-2.1, 0.2, 0.4, 1.4);

      // Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambLight);

      const dirLight1 = new THREE.DirectionalLight(0x34d399, 1.6);
      dirLight1.position.set(5, 8, 5);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.2);
      dirLight2.position.set(-5, -4, 4);
      scene.add(dirLight2);

      // Mouse Parallax
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (!interactive || !container) return;
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };

      if (interactive) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      }

      // Resize
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 380;
        const h = typeof height === 'number' ? height : (container.clientHeight || 360);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Loop
      let time = 0;
      let reactionBurst = 0;
      let lastTrigger = triggerRef.current;

      const animate = () => {
        if (!isMounted) return;
        time += 0.012;

        if (triggerRef.current !== lastTrigger) {
          reactionBurst = 1.0;
          lastTrigger = triggerRef.current;
        }

        if (reactionBurst > 0.01) {
          reactionBurst *= 0.94;
        } else {
          reactionBurst = 0;
        }

        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        systemGroup.rotation.y = time * 0.12 + targetX * 0.4 + reactionBurst * 2.5;
        systemGroup.rotation.x = Math.sin(time * 0.08) * 0.08 + targetY * 0.25;

        globeGroup.rotation.y += 0.004 + reactionBurst * 0.03;

        floatingObjects.forEach(({ mesh, baseX, baseY, speed, phase }) => {
          mesh.position.y = baseY + Math.sin(time * speed * 80 + phase) * (0.05 + reactionBurst * 0.1);
          mesh.position.x = baseX + Math.cos(time * speed * 60 + phase) * 0.03;
          mesh.rotation.y += 0.005 + reactionBurst * 0.02;
        });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        isMounted = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (interactive) window.removeEventListener('mousemove', handleMouseMove);
        resizeObserver.disconnect();
        if (renderer) renderer.dispose();
      };
    };

    const cleanupPromise = initThree();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [mode, height, interactive, resolvedTheme]);

  if (webglSupported === false) {
    return <CSSFallbackFinancialCore height={height} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          outline: 'none',
        }}
      />
    </div>
  );
}

function CSSFallbackFinancialCore({ height }: { height: number | string }) {
  return (
    <div
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '1px dashed rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(6, 78, 59, 0.8) 100%)',
            border: '2px solid #10b981',
          }}
        />
      </div>
    </div>
  );
}
