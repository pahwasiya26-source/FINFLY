'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThreeFinancialCoreProps {
  mode?: 'login' | 'dashboard';
  height?: number | string;
  interactive?: boolean;
}

export function ThreeFinancialCore({
  mode = 'dashboard',
  height = 360,
  interactive = true,
}: ThreeFinancialCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Check WebGL support
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

    // Dynamically import Three to keep initial bundle light
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;

    const initThree = async () => {
      const THREE = await import('three');
      if (!isMounted || !canvasRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth || 360;
      const heightVal = typeof height === 'number' ? height : (container.clientHeight || 360);

      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / heightVal, 0.1, 1000);
      camera.position.z = mode === 'login' ? 6.5 : 5.8;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, heightVal);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Theme-based colors
      const isDark = resolvedTheme === 'dark';
      const emeraldColor = isDark ? 0x10b981 : 0x059669;
      const goldColor = isDark ? 0xf59e0b : 0xd97706;
      const coreColor = isDark ? 0x34d399 : 0x047857;
      const ringColor = isDark ? 0xffffff : 0x0e121b;

      // Group holding the entire rotating system
      const systemGroup = new THREE.Group();
      scene.add(systemGroup);

      // Central core geometry: glowing icosahedron wireframe + inner pulse sphere
      const coreGeo = new THREE.IcosahedronGeometry(1.0, 2);
      const coreMat = new THREE.MeshBasicMaterial({
        color: coreColor,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.45 : 0.35,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      systemGroup.add(coreMesh);

      // Inner pulsating solid sphere
      const innerGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const innerMat = new THREE.MeshBasicMaterial({
        color: emeraldColor,
        transparent: true,
        opacity: isDark ? 0.35 : 0.25,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      systemGroup.add(innerMesh);

      // Orbital Concentric Rings
      const ringRadii = mode === 'login' ? [1.8, 2.6, 3.3] : [1.7, 2.4, 3.1];
      const ringMeshes: any[] = [];

      ringRadii.forEach((radius, idx) => {
        const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.45, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(64);
        const ringGeo = new THREE.BufferGeometry().setFromPoints(points.map((p: any) => new THREE.Vector3(p.x, p.y, 0)));
        const ringLineMat = new THREE.LineBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: isDark ? (0.12 - idx * 0.02) : (0.09 - idx * 0.02),
        });
        const ringLine = new THREE.Line(ringGeo, ringLineMat);
        ringLine.rotation.x = Math.PI / 3 + idx * 0.2;
        ringLine.rotation.y = idx * 0.35;
        systemGroup.add(ringLine);
        ringMeshes.push(ringLine);
      });

      // Satellite Nodes definition
      const nodeLabels = mode === 'login'
        ? [
            { name: 'Cash', color: emeraldColor, dist: 1.8, speed: 0.012, offset: 0 },
            { name: 'Investments', color: goldColor, dist: 2.6, speed: 0.009, offset: Math.PI * 0.4 },
            { name: 'Goals', color: emeraldColor, dist: 2.6, speed: 0.008, offset: Math.PI * 1.1 },
            { name: 'Liabilities', color: isDark ? 0xf87171 : 0xef4444, dist: 3.3, speed: 0.006, offset: Math.PI * 0.7 },
            { name: 'Growth', color: 0x6366f1, dist: 3.3, speed: 0.007, offset: Math.PI * 1.6 },
          ]
        : [
            { name: 'Liquidity', color: emeraldColor, dist: 1.7, speed: 0.012, offset: 0 },
            { name: 'Growth', color: 0x6366f1, dist: 2.4, speed: 0.009, offset: Math.PI * 0.5 },
            { name: 'Risk', color: goldColor, dist: 2.4, speed: 0.008, offset: Math.PI * 1.2 },
            { name: 'Investments', color: emeraldColor, dist: 3.1, speed: 0.006, offset: Math.PI * 1.7 },
          ];

      const satelliteMeshes: any[] = [];
      nodeLabels.forEach((item) => {
        const satGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const satMat = new THREE.MeshBasicMaterial({
          color: item.color,
          transparent: true,
          opacity: 0.9,
        });
        const satMesh = new THREE.Mesh(satGeo, satMat);

        // Subtle glow halo around satellite
        const haloGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const haloMat = new THREE.MeshBasicMaterial({
          color: item.color,
          transparent: true,
          opacity: isDark ? 0.25 : 0.18,
          wireframe: true,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        satMesh.add(haloMesh);

        systemGroup.add(satMesh);
        satelliteMeshes.push({ mesh: satMesh, config: item });
      });

      // Mouse Parallax
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (!interactive) return;
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };

      if (interactive) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      }

      // Resize Handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 360;
        const h = typeof height === 'number' ? height : (container.clientHeight || 360);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Render Loop
      let time = 0;
      const animate = () => {
        if (!isMounted) return;
        time += 0.015;

        // Parallax damping
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        systemGroup.rotation.y = time * 0.25 + targetX * 0.6;
        systemGroup.rotation.x = Math.sin(time * 0.15) * 0.15 + targetY * 0.4;

        // Core pulsation
        const pulse = 1 + Math.sin(time * 2) * 0.06;
        coreMesh.scale.set(pulse, pulse, pulse);
        coreMesh.rotation.y += 0.005;
        coreMesh.rotation.z += 0.003;

        // Update satellite positions along elliptical paths
        satelliteMeshes.forEach(({ mesh, config }) => {
          const angle = time * config.speed * 60 + config.offset;
          mesh.position.x = Math.cos(angle) * config.dist;
          mesh.position.y = Math.sin(angle) * (config.dist * 0.45);
          mesh.position.z = Math.sin(angle * 1.5) * 0.6;
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

        // Memory cleanup
        coreGeo.dispose();
        coreMat.dispose();
        innerGeo.dispose();
        innerMat.dispose();
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
    return <CSSFallbackFinancialCore mode={mode} height={height} />;
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

/**
 * High-fidelity CSS/SVG Fallback when WebGL is disabled or unsupported
 */
function CSSFallbackFinancialCore({ mode, height }: { mode: string; height: number | string }) {
  const isLogin = mode === 'login';
  const nodes = isLogin
    ? [
        { name: 'Cash', color: 'var(--accent-primary)', delay: '0s' },
        { name: 'Investments', color: 'var(--gold-accent)', delay: '2s' },
        { name: 'Goals', color: 'var(--accent-primary)', delay: '4s' },
        { name: 'Liabilities', color: 'var(--danger)', delay: '6s' },
        { name: 'Growth', color: 'var(--indigo-accent)', delay: '8s' },
      ]
    : [
        { name: 'Liquidity', color: 'var(--accent-primary)', delay: '0s' },
        { name: 'Growth', color: 'var(--indigo-accent)', delay: '2.5s' },
        { name: 'Risk', color: 'var(--gold-accent)', delay: '5s' },
        { name: 'Investments', color: 'var(--accent-primary)', delay: '7.5s' },
      ];

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer Orbit */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px dashed var(--border-strong)',
            animation: 'spinOrbit 30s linear infinite',
          }}
        />

        {/* Inner Orbit */}
        <div
          style={{
            position: 'absolute',
            inset: '30px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            animation: 'spinOrbit 20s linear infinite reverse',
          }}
        />

        {/* Central Core */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 80%)',
            border: '2px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px var(--accent-glow)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              opacity: 0.85,
            }}
          />
        </div>

        {/* Orbital Nodes */}
        {nodes.map((node, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '12px',
              height: '12px',
              marginTop: '-6px',
              marginLeft: '-6px',
              borderRadius: '50%',
              background: node.color,
              boxShadow: `0 0 10px ${node.color}`,
              transform: `rotate(${i * (360 / nodes.length)}deg) translate(95px) rotate(-${i * (360 / nodes.length)}deg)`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spinOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
