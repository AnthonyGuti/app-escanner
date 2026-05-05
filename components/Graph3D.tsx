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
  
  // Ref para controlar el progreso de la animación (0 a 1)
  const animProgress = useRef(0);

  // Reiniciar animación si cambian los datos
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
      const b1 = new THREE.Mesh(geo, mat); b1.rotation.z = Math.PI/4;
      const b2 = new THREE.Mesh(geo, mat); b2.rotation.z = -Math.PI/4;
      group.add(b1, b2);
    } else if (type === 'Y') {
      const arcGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 16, Math.PI);
      const cup = new THREE.Mesh(arcGeo, mat); cup.rotation.z = Math.PI; cup.position.y = 0.3;
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), mat); stem.position.y = -0.3;
      group.add(cup, stem);
    } else if (type === 'Z') {
      const bar = new THREE.BoxGeometry(1.1, 0.2, 0.2);
      const t = new THREE.Mesh(bar, mat); t.position.y = 0.55;
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), mat); d.rotation.z = Math.PI/4;
      const b = new THREE.Mesh(bar, mat); b.position.y = -0.55;
      group.add(t, d, b);
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
          const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
          camera.position.set(0, 0, 40);
          scene.add(new THREE.AmbientLight(0xffffff, 1.5));

          scene.add(new THREE.GridHelper(20, 20, 0x444444, 0x222222));
          
          const axis = (pts: any, col: number) => {
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col })));
          };
          axis([new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)], 0xff3b30);
          axis([new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 10, 0)], 0x34c759);
          axis([new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 10)], 0x007aff);

          const lx = createBlockLabel('X'); lx.position.set(11, 0.5, 0); scene.add(lx);
          const ly = createBlockLabel('Y'); ly.position.set(0.5, 11, 0); scene.add(ly);
          const lz = createBlockLabel('Z'); lz.position.set(0, 0.5, 11); scene.add(lz);

          // Lógica de datos
          const n = xData.length;
          const sumX = xData.reduce((a: any, b: any) => a + b, 0);
          const sumY = yData.reduce((a: any, b: any) => a + b, 0);
          const sumXY = xData.reduce((a: any, v: any, i: any) => a + v * yData[i], 0);
          const sumX2 = xData.reduce((a: any, v: any) => a + v * v, 0);
          const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
          const b = (sumY - m * sumX) / n;
          const minX = Math.min(...xData), rX = Math.max(...xData) - minX || 1;
          const minY = Math.min(...yData), rY = Math.max(...yData) - minY || 1;
          const sx = (v: number) => ((v - minX) / rX) * 12 - 6;
          const sy = (v: number) => ((v - minY) / rY) * 12 - 6;

          // Puntos estáticos
          xData.forEach((x: any, i: number) => {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2d75 }));
            p.position.set(sx(x), sy(yData[i]), 0);
            scene.add(p);
          });

          // 📈 RECTA ANIMADA
          const lineGeometry = new THREE.BufferGeometry();
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 3 });
          const animatedLine = new THREE.Line(lineGeometry, lineMaterial);
          scene.add(animatedLine);

          const render = () => {
            requestAnimationFrame(render);
            
            // 1. Animación de la recta
            if (animProgress.current < 1) {
              animProgress.current += 0.01; // Velocidad de la animación
              const currentPoints = [];
              const steps = 20;
              const limit = Math.floor(steps * animProgress.current);
              
              for (let i = 0; i <= limit; i++) {
                const xv = minX + (rX * i) / steps;
                currentPoints.push(new THREE.Vector3(sx(xv), sy(m * xv + b), 0));
              }
              if (currentPoints.length > 1) {
                lineGeometry.setFromPoints(currentPoints);
              }
            }

            // 2. Movimiento de cámara y rotación
            camera.position.z += (zoom.current - camera.position.z) * 0.1;
            camera.lookAt(0, 0, 0);
            scene.rotation.x = rotation.current.x;
            scene.rotation.y = rotation.current.y;
            
            // Billboard etiquetas
            lx.rotation.y = -rotation.current.y;
            ly.rotation.y = -rotation.current.y;
            lz.rotation.y = -rotation.current.y;
            
            renderer.render(scene, camera);
            gl.endFrameEXP();
          };
          render();
        }}
      />
    </View>
  );
}