// components/Graph3D.tsx

import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useEffect, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import * as THREE from 'three';

interface Graph3DProps {
  xData: number[];
  yData: number[];
  setLockScroll?: (lock: boolean) => void;
  transparente?: boolean; 
  type?: string; 
}

export default function Graph3D({ xData, yData, setLockScroll, transparente = true, type }: Graph3DProps) {
  const rotation = useRef({ x: 0.3, y: 0.4 });
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  
  // Control de Zoom suave
  const zoom = useRef(35);
  const minZoom = 12;
  const maxZoom = 100;
  
  // Guardar la distancia anterior entre dos dedos para calcular el cambio (Pinch)
  const lastPinchDist = useRef<number | null>(null);

  const animProgress = useRef(0);
  const rafHandle = useRef<number>(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelAnimationFrame(rafHandle.current);
    };
  }, []);

  useEffect(() => {
    animProgress.current = 0;
  }, [xData, yData]);

  // Función matemática para calcular la distancia exacta entre dos dedos
  const calcDistance = (t1: any, t2: any) => {
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // PANRESPONDER REESCRITO: Zoom matemático fluido y rápido
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: (evt) => {
      setLockScroll?.(true);
      const t = evt.nativeEvent.touches;
      if (t.length === 1) {
        lastTouch.current = { x: t[0].pageX, y: t[0].pageY };
        lastPinchDist.current = null;
      } else if (t.length === 2) {
        lastPinchDist.current = calcDistance(t[0], t[1]);
      }
    },

    onPanResponderMove: (evt) => {
      const t = evt.nativeEvent.touches;
      
      if (t.length === 2) {
        const currentDist = calcDistance(t[0], t[1]);
        if (lastPinchDist.current !== null) {
          const delta = currentDist - lastPinchDist.current;
          const sensibilidad = 0.12; 
          
          zoom.current -= delta * sensibilidad;
          
          if (zoom.current < minZoom) zoom.current = minZoom;
          if (zoom.current > maxZoom) zoom.current = maxZoom;
        }
        lastPinchDist.current = currentDist;
      } 
      else if (t.length === 1) {
        lastPinchDist.current = null;
        if (lastTouch.current) {
          const deltaX = t[0].pageX - lastTouch.current.x;
          const deltaY = t[0].pageY - lastTouch.current.y;
          rotation.current.y += deltaX * 0.007;
          rotation.current.x += deltaY * 0.007;
        }
        lastTouch.current = { x: t[0].pageX, y: t[0].pageY };
      }
    },

    onPanResponderRelease: () => {
      setLockScroll?.(false);
      lastTouch.current = null;
      lastPinchDist.current = null;
    },

    onPanResponderTerminate: () => {
      setLockScroll?.(false);
      lastTouch.current = null;
      lastPinchDist.current = null;
    },
  });

  const createBlockLabel = (typeLabel: 'X' | 'Y' | 'Z') => {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: transparente ? 0xffffff : 0x000000 });
    if (typeLabel === 'X') {
      const geo = new THREE.BoxGeometry(0.2, 1.3, 0.2);
      const b1 = new THREE.Mesh(geo, mat); b1.rotation.z = Math.PI / 4;
      const b2 = new THREE.Mesh(geo, mat); b2.rotation.z = -Math.PI / 4;
      group.add(b1, b2);
    } else if (typeLabel === 'Y') {
      const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
      const lA = new THREE.Mesh(armGeo, mat); lA.position.set(-0.3, 0.4, 0); lA.rotation.z = Math.PI / 4;
      const rA = new THREE.Mesh(armGeo, mat); rA.position.set(0.3, 0.4, 0); rA.rotation.z = -Math.PI / 4;
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), mat); st.position.y = -0.2;
      group.add(lA, rA, st);
    } else if (typeLabel === 'Z') {
      const bar = new THREE.BoxGeometry(1.1, 0.2, 0.2);
      const t = new THREE.Mesh(bar, mat); t.position.y = 0.5;
      const b = new THREE.Mesh(bar, mat); b.position.y = -0.5;
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), mat); d.rotation.z = Math.PI / 3.5;
      group.add(t, b, d);
    }
    return group;
  };

  const createNumberLabel = (textStr: string) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: transparente ? 0xeeeeee : 0x111111 });
    let currentXOffset = 0;
    for (let i = 0; i < textStr.length; i++) {
      const char = textStr[i];
      const charGroup = new THREE.Group();
      if (char === '-') {
        const minus = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.12), mat);
        charGroup.add(minus);
        currentXOffset += 0.4;
      } else if (char === '1') {
        const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.12), mat);
        const hook = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.12), mat);
        hook.position.set(-0.06, 0.36, 0); hook.rotation.z = Math.PI / 4;
        charGroup.add(vertical, hook);
        currentXOffset += 0.4;
      } else if (char === '2') {
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); top.position.set(0, 0.35, 0);
        const middle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); middle.position.set(0, 0, 0);
        const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); bottom.position.set(0, -0.35, 0);
        const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.12), mat); r1.position.set(0.155, 0.175, 0);
        const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.12), mat); l1.position.set(-0.155, -0.175, 0);
        charGroup.add(top, middle, bottom, r1, l1);
        currentXOffset += 0.55;
      } else if (char === '3') {
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); top.position.set(0, 0.35, 0);
        const middle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, 0.12), mat); middle.position.set(-0.05, 0, 0);
        const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); bottom.position.set(0, -0.35, 0);
        const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.12), mat); r1.position.set(0.18, 0, 0);
        charGroup.add(top, middle, bottom, r1);
        currentXOffset += 0.55;
      } else if (char === '5') {
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); top.position.set(0, 0.35, 0);
        const lineLeft = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.12), mat); lineLeft.position.set(-0.155, 0.175, 0);
        const middle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); middle.position.set(0, 0, 0);
        const lineRight = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.35, 0.12), mat); lineRight.position.set(0.155, -0.175, 0);
        const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.12), mat); bottom.position.set(0, -0.35, 0);
        charGroup.add(top, lineLeft, middle, lineRight, bottom);
        currentXOffset += 0.55;
      } else if (char === '0') {
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.12), mat); t.position.y = 0.35;
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.12), mat); b.position.y = -0.35;
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.12), mat); l.position.x = -0.18;
        const r = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.12), mat); r.position.x = 0.18;
        charGroup.add(t, b, l, r);
        currentXOffset += 0.55;
      }
      charGroup.position.x = currentXOffset - (char === '-' ? 0.2 : 0);
      group.add(charGroup);
    }
    group.scale.set(0.65, 0.65, 0.65);
    return group;
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }} {...panResponder.panHandlers}>
      <GLView
        style={{ flex: 1, backgroundColor: 'transparent' }}
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
          
          camera.position.set(0, 0, zoom.current); 
          scene.add(new THREE.AmbientLight(0xffffff, 1.8));

          const gridColor = transparente ? 0x9575cd : 0x999999;
          const gridCenter = transparente ? 0xb39ddb : 0xe0e0e0;
          scene.add(new THREE.GridHelper(32, 32, gridColor, gridCenter));

          const axis = (pts: THREE.Vector3[], col: number) => {
            scene.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: col, linewidth: 2 })
              )
            );
          };
          axis([new THREE.Vector3(-16, 0, 0), new THREE.Vector3(16, 0, 0)], 0xff3b30);
          axis([new THREE.Vector3(0, -16, 0), new THREE.Vector3(0, 16, 0)], 0x34c759);
          axis([new THREE.Vector3(0, 0, -16), new THREE.Vector3(0, 0, 16)], 0x007aff);

          const lx = createBlockLabel('X'); lx.position.set(17, 0.5, 0); scene.add(lx);
          const ly = createBlockLabel('Y'); ly.position.set(0.5, 17, 0); scene.add(ly);
          const lz = createBlockLabel('Z'); lz.position.set(0, 0.5, 17); scene.add(lz);
          const todasLasEtiquetas: THREE.Group[] = [lx, ly, lz];

          const valoresMarcas = [-15, -10, -5, 5, 10, 15];
          valoresMarcas.forEach((num) => {
            const p = (num / 15) * 15;
            const labelX = createNumberLabel(num.toString()); labelX.position.set(p - 0.2, -0.9, 0); scene.add(labelX); todasLasEtiquetas.push(labelX);
            const labelY = createNumberLabel(num.toString()); labelY.position.set(0.9, p, 0); scene.add(labelY); todasLasEtiquetas.push(labelY);
            const labelZ = createNumberLabel(num.toString()); labelZ.position.set(0, -0.9, p); scene.add(labelZ); todasLasEtiquetas.push(labelZ);
          });

          const n = xData.length;
          const minX = n > 0 ? Math.min(...xData) : -15;
          const maxX = n > 0 ? Math.max(...xData) : 15;
          const minY = n > 0 ? Math.min(...yData) : -15;
          const maxY = n > 0 ? Math.max(...yData) : 15;
          const rX = (maxX - minX) || 30;
          const rY = (maxY - minY) || 30;
          const sx = (v: number) => ((v - minX) / rX) * 24 - 12;
          const sy = (v: number) => ((v - minY) / rY) * 24 - 12;

          let m = 0, bCoef = 0, canDrawLine = false;
          if (n >= 2) {
            const sumX  = xData.reduce((a: number, v: number) => a + v, 0);
            const sumY  = yData.reduce((a: number, v: number) => a + v, 0);
            const sumXY = xData.reduce((a: number, v: number, i: number) => a + v * yData[i], 0);
            const sumX2 = xData.reduce((a: number, v: number) => a + v * v, 0);
            const denom = n * sumX2 - sumX * sumX;
            if (denom !== 0) {
              m = (n * sumXY - sumX * sumY) / denom;
              bCoef = (sumY - m * sumX) / n;
              canDrawLine = isFinite(m) && isFinite(bCoef);
            }
          }

          xData.forEach((x: number, i: number) => {
            const p = new THREE.Mesh(
              new THREE.SphereGeometry(0.45, 16, 16),
              new THREE.MeshBasicMaterial({ color: 0xff2d75 })
            );
            p.position.set(sx(x), sy(yData[i]), 0);
            scene.add(p);
          });

          const lineGeometry = new THREE.BufferGeometry();
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 5 });
          const animatedLine = new THREE.Line(lineGeometry, lineMaterial);
          if (canDrawLine) scene.add(animatedLine);

          const render = () => {
            if (!mounted.current) return;
            rafHandle.current = requestAnimationFrame(render);
            
            if (canDrawLine && animProgress.current < 1) {
              animProgress.current += 0.01;
              const pts: THREE.Vector3[] = [];
              
              // Verificamos qué tipo de modelo estamos dibujando
              const isLogistic = type === 'logistic';
              const steps = isLogistic ? 80 : 20;
              const limit = Math.floor(steps * animProgress.current);
              
              for (let i = 0; i <= limit; i++) {
                const xv = minX + (rX * i) / steps;
                
                // 1. Por defecto, calcula el punto como una línea recta
                let yv = m * xv + bCoef; 
                
                // 2. Si detecta que es el modelo logístico, cambia el cálculo a la fórmula de la curva en "S"
                if (isLogistic) {
                  yv = 1 / (1 + Math.exp(-(m * xv + bCoef)));
                }
                
                pts.push(new THREE.Vector3(sx(xv), sy(yv), 0));
              }
              if (pts.length > 1) lineGeometry.setFromPoints(pts);
            }

            camera.position.z += (zoom.current - camera.position.z) * 0.2;
            camera.lookAt(0, 0, 0);
            
            scene.rotation.x = rotation.current.x;
            scene.rotation.y = rotation.current.y;

            todasLasEtiquetas.forEach(l => {
              l.quaternion.copy(camera.quaternion);
            });

            renderer.render(scene, camera);
            gl.endFrameEXP();
          };
          render();
        }}
      />
    </View>
  );
}