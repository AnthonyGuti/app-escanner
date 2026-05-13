import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { useEffect, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import * as THREE from 'three';

export default function Graph3D({ xData, yData, setLockScroll }: any) {
  const rotation = useRef({ x: 0, y: 0 });
  const startRotation = useRef({ x: 0, y: 0 });
  const zoom = useRef(28);
  const lastDistance = useRef<number | null>(null);
  const animProgress = useRef(0);

  // ── FIX 1: cancelar el loop al salir del módulo ────────────────────────
  const rafHandle = useRef<number>(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelAnimationFrame(rafHandle.current);
    };
  }, []);
  // ───────────────────────────────────────────────────────────────────────

  useEffect(() => {
    animProgress.current = 0;
  }, [xData, yData]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setLockScroll?.(true);
      startRotation.current = { ...rotation.current };
    },
    onPanResponderMove: (evt, gesture) => {
      const t = evt.nativeEvent.touches;
      if (t.length === 1) {
        rotation.current.y = startRotation.current.y + gesture.dx * 0.004;
        rotation.current.x = startRotation.current.x + gesture.dy * 0.004;
      }
      if (t.length === 2) {
        const dx = t[0].pageX - t[1].pageX;
        const dy = t[0].pageY - t[1].pageY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastDistance.current !== null) {
          const diff = dist - lastDistance.current;
          zoom.current -= diff * 0.04;
          zoom.current = Math.max(10, Math.min(80, zoom.current));
        }
        lastDistance.current = dist;
      }
    },
    onPanResponderRelease: () => {
      setLockScroll?.(false);
      lastDistance.current = null;
    },
  });

  const createBlockLabel = (type: 'X' | 'Y' | 'Z') => {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
    if (type === 'X') {
      const geo = new THREE.BoxGeometry(0.2, 1.3, 0.2);
      const b1 = new THREE.Mesh(geo, mat); b1.rotation.z = Math.PI / 4;
      const b2 = new THREE.Mesh(geo, mat); b2.rotation.z = -Math.PI / 4;
      group.add(b1, b2);
    } else if (type === 'Y') {
      const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
      const lA = new THREE.Mesh(armGeo, mat); lA.position.set(-0.3, 0.4, 0); lA.rotation.z = Math.PI / 4;
      const rA = new THREE.Mesh(armGeo, mat); rA.position.set(0.3, 0.4, 0); rA.rotation.z = -Math.PI / 4;
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), mat); st.position.y = -0.2;
      group.add(lA, rA, st);
    } else if (type === 'Z') {
      const bar = new THREE.BoxGeometry(1.1, 0.2, 0.2);
      const t = new THREE.Mesh(bar, mat); t.position.y = 0.5;
      const b = new THREE.Mesh(bar, mat); b.position.y = -0.5;
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), mat); d.rotation.z = Math.PI / 3.5;
      group.add(t, b, d);
    }
    return group;
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={(gl) => {
          const renderer = new Renderer({ gl, alpha: true }) as any;
          renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
          renderer.setClearColor(0x000000, 0);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(
            75,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
          );
          camera.position.set(0, 0, 40);
          scene.add(new THREE.AmbientLight(0xffffff, 1.5));
          scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));

          const axis = (pts: THREE.Vector3[], col: number) => {
            scene.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: col })
              )
            );
          };
          axis([new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)], 0xff3b30);
          axis([new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 10, 0)], 0x34c759);
          axis([new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 10)], 0x007aff);

          const lx = createBlockLabel('X'); lx.position.set(11, 0.5, 0); scene.add(lx);
          const ly = createBlockLabel('Y'); ly.position.set(0.5, 11, 0); scene.add(ly);
          const lz = createBlockLabel('Z'); lz.position.set(0, 0.5, 11); scene.add(lz);

          // ── FIX 2: rangos seguros para 0, 1 o muchos puntos ─────────────
          const n = xData.length;

          // Con 0 puntos usamos rango dummy; con 1 punto forzamos rango de 2
          const minX = n > 0 ? Math.min(...xData) : -1;
          const maxX = n > 0 ? Math.max(...xData) : 1;
          const minY = n > 0 ? Math.min(...yData) : -1;
          const maxY = n > 0 ? Math.max(...yData) : 1;

          // rX/rY nunca son 0 → evita divisiones por cero y puntos superpuestos
          const rX = (maxX - minX) || 2;
          const rY = (maxY - minY) || 2;

          const sx = (v: number) => ((v - minX) / rX) * 12 - 6;
          const sy = (v: number) => ((v - minY) / rY) * 12 - 6;
          // ────────────────────────────────────────────────────────────────

          // ── FIX 3: regresión solo con ≥2 puntos y denominador válido ────
          let m = 0, bCoef = 0, canDrawLine = false;
          if (n >= 2) {
            const sumX  = xData.reduce((a: number, v: number) => a + v, 0);
            const sumY  = yData.reduce((a: number, v: number) => a + v, 0);
            const sumXY = xData.reduce((a: number, v: number, i: number) => a + v * yData[i], 0);
            const sumX2 = xData.reduce((a: number, v: number) => a + v * v, 0);
            const denom = n * sumX2 - sumX * sumX;
            if (denom !== 0) {
              m      = (n * sumXY - sumX * sumY) / denom;
              bCoef  = (sumY - m * sumX) / n;
              canDrawLine = isFinite(m) && isFinite(bCoef);
            }
          }
          // ────────────────────────────────────────────────────────────────

          // Puntos — se muestran todos desde el primero
          xData.forEach((x: number, i: number) => {
            const p = new THREE.Mesh(
              new THREE.SphereGeometry(0.3, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xff2d75 })
            );
            p.position.set(sx(x), sy(yData[i]), 0);
            scene.add(p);
          });

          // Recta animada (solo si hay regresión válida)
          const lineGeometry = new THREE.BufferGeometry();
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 3 });
          const animatedLine = new THREE.Line(lineGeometry, lineMaterial);
          if (canDrawLine) scene.add(animatedLine);

          // ── FIX 4: loop con guarda de desmontaje ───────────────────────
          const render = () => {
            if (!mounted.current) return; // componente desmontado → para el loop
            rafHandle.current = requestAnimationFrame(render);

            if (canDrawLine && animProgress.current < 1) {
              animProgress.current += 0.01;
              const currentPoints: THREE.Vector3[] = [];
              const steps = 20;
              const limit = Math.floor(steps * animProgress.current);
              for (let i = 0; i <= limit; i++) {
                const xv = minX + (rX * i) / steps;
                currentPoints.push(new THREE.Vector3(sx(xv), sy(m * xv + bCoef), 0));
              }
              if (currentPoints.length > 1) lineGeometry.setFromPoints(currentPoints);
            }

            camera.position.z += (zoom.current - camera.position.z) * 0.1;
            camera.lookAt(0, 0, 0);
            scene.rotation.x = rotation.current.x;
            scene.rotation.y = rotation.current.y;

            [lx, ly, lz].forEach(label => {
              label.rotation.set(-rotation.current.x, -rotation.current.y, 0);
            });

            renderer.render(scene, camera);
            gl.endFrameEXP();
          };
          render();
          // ────────────────────────────────────────────────────────────────
        }}
      />
    </View>
  );
}