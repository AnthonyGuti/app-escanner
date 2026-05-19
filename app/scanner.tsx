import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';
import { guardarResultadoEstadistico } from '../services/_databaseService';
import { db } from '../services/firebaseConfig';

interface EjercicioData {
  titulo?: string;
  id_enunciado?: string;
  enunciado_completo: string;
  datos_variable_x: number[];
  datos_variable_y: number[];
}

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showHint, setShowHint] = useState(true);
  const [ejercicio, setEjercicio] = useState<EjercicioData | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Descarga el ejercicio desde Firebase al escanear el QR ───────────────
  useEffect(() => {
    async function obtenerEjercicioFirebase() {
      if (!scannedData) return;
      setLoading(true);
      try {
        const docRef = doc(db, "ejercicios", scannedData);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEjercicio(docSnap.data() as EjercicioData);
          setStep(3);
        } else {
          alert("El código QR escaneado no existe en el sistema.");
          setScannedData(null);
          setStep(1);
        }
      } catch (error) {
        console.error("Error al conectar con Firebase:", error);
        alert("Error de conexión al descargar el ejercicio.");
        setScannedData(null);
        setStep(1);
      } finally {
        setLoading(false);
      }
    }
    obtenerEjercicioFirebase();
  }, [scannedData]);

  const xData: number[] = ejercicio?.datos_variable_x || [];
  const yData: number[] = ejercicio?.datos_variable_y || [];

  // Detectamos contexto desde el enunciado para el análisis interpretativo
  const enunciado = ejercicio?.enunciado_completo?.toLowerCase() || "";
  const esIQ       = enunciado.includes("iq") || enunciado.includes("coeficiente");
  const esAnsiedad = enunciado.includes("ansiedad") || enunciado.includes("estres");

  // ── Cálculo de regresión ─────────────────────────────────────────────────
  const calcularRegresion = (x: number[], y: number[]) => {
    const n = x.length;
    if (n < 2) return null;
    const sumX  = x.reduce((a, b) => a + b, 0);
    const sumY  = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, v, i) => a + v * y[i], 0);
    const sumX2 = x.reduce((a, v) => a + v * v, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    const m = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY - m * sumX) / n;
    return { m, b };
  };

  const regresion = calcularRegresion(xData, yData);

  // ── Análisis interpretativo ──────────────────────────────────────────────
  const generarAnalisis = useCallback(
    (m: number): { icono: string; texto: string; color: string } => {
      const abs = Math.abs(m);

      if (esIQ) {
        if (m > 0) {
          if (abs >= 0.5)
            return { icono: '🧠', color: '#00e5ff', texto: 'Los estudiantes con mayor coeficiente intelectual tienden a obtener calificaciones notablemente más altas.' };
          return { icono: '🧠', color: '#B39DDB', texto: 'El coeficiente intelectual influye en la calificación, aunque otros factores también juegan un papel importante.' };
        }
        return { icono: '⚠️', color: '#FF7043', texto: 'La recta sugiere que a mayor IQ las notas bajan, lo que puede indicar datos atípicos o un grupo muy específico.' };
      }

      if (esAnsiedad) {
        if (m < 0) {
          if (abs >= 0.5)
            return { icono: '😰', color: '#FF7043', texto: 'A mayor nivel de ansiedad, las notas caen de forma considerable. Gestionar el estrés es clave para el rendimiento.' };
          return { icono: '😰', color: '#B39DDB', texto: 'La ansiedad afecta ligeramente las notas, aunque el efecto es moderado en este grupo.' };
        }
        return { icono: '🔍', color: '#00e5ff', texto: 'En este grupo, mayor ansiedad no implica peor nota. Podría tratarse de un perfil que trabaja mejor bajo presión.' };
      }

      if (m > 0) return { icono: '📈', color: '#00e5ff', texto: 'La recta de ajuste es creciente: cuando X aumenta, Y también tiende a subir.' };
      if (m < 0) return { icono: '📉', color: '#FF7043', texto: 'La recta de ajuste es decreciente: cuando X sube, Y tiende a bajar.' };
      return { icono: '➡️', color: '#B39DDB', texto: 'La recta es casi horizontal: X no parece influir en Y en este conjunto de datos.' };
    },
    [esIQ, esAnsiedad]
  );

  // ── Guardado automático del historial analizado en Firebase ──────────────
  useEffect(() => {
    if (!regresion || !scannedData || !ejercicio) return;
    const infoAnalisis = generarAnalisis(regresion.m);
    guardarResultadoEstadistico(scannedData, {
      enunciado: ejercicio.enunciado_completo,
      x:         xData,
      y:         yData,
      m:         regresion.m,
      b:         regresion.b,
      analisis:  infoAnalisis.texto,
      qr:        scannedData,
    });
  }, [regresion, scannedData, generarAnalisis, ejercicio]);

  // ── Permisos de cámara ───────────────────────────────────────────────────
  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.whiteText}>Solicitando acceso a la cámara...</Text>
        <TouchableOpacity style={styles.btnOrange} onPress={requestPermission}>
          <Text style={styles.btnText}>DAR PERMISO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Cámara activa solo en paso 1 y sin carga */}
      {step === 1 && !loading && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={({ data }) => { if (data) setScannedData(data); }}
        />
      )}

      {/* PANTALLA DE CARGA */}
      {loading && (
        <View style={styles.fullOverlay}>
          <View style={styles.glassCard}>
            <ActivityIndicator size="large" color="#00e5ff" />
            <Text style={[styles.subNote, { marginTop: 15 }]}>Conectando con Firebase...</Text>
            <Text style={styles.whiteText}>Procesando ejercicio...</Text>
          </View>
        </View>
      )}

      {/* PASO 1: ESCANEO */}
      {step === 1 && !loading && (
        <View style={styles.fullOverlay}>
          <View style={[styles.glassCard, styles.perspectiveCard]}>
            <Text style={styles.stepTag}>SISTEMA AppRA V1.0</Text>
            <Text style={styles.glassTitle}>Escanear Código QR</Text>
            <View style={styles.qrGuide} />
            <Text style={styles.subNote}>Apunta al QR generado en el Panel Web</Text>
          </View>
        </View>
      )}

      {/* PASO 3: HUD DE RESULTADOS */}
      {step === 3 && ejercicio && (
        <View
          style={styles.arHudContainer}
          onStartShouldSetResponder={() => { setShowHint(false); return false; }}
        >
          <View style={styles.zoomWrapper}>

            {/* Enunciado */}
            <View style={[styles.glassPanel, styles.perspectiveLeft, { padding: 10, marginBottom: 8 }]}>
              <Text style={styles.exerciseHeader}>ID: {ejercicio.id_enunciado || scannedData}</Text>
              <Text style={styles.exerciseText} numberOfLines={3}>{ejercicio.enunciado_completo}</Text>
            </View>

            {/* Tabla de registros */}
            <View style={[styles.glassPanel, styles.perspectiveRight, { height: 130, padding: 5, marginBottom: 8 }]}>
              <Text style={styles.sectionHeader}>Registros del Sistema</Text>
              <ScrollView nestedScrollEnabled style={styles.arTable}>
                {xData.map((val, i) => (
                  <View key={i} style={styles.arTableRow}>
                    <Text style={styles.arCell}>#{i + 1}</Text>
                    <Text style={styles.arCell}>X: {val}</Text>
                    <Text style={[styles.arCell, { color: '#00e5ff' }]}>Y: {yData[i]}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Gráfica 3D */}
            <View style={[styles.floatingGraphWrapper, styles.perspectiveGraph]}>
              <Graph3D xData={xData} yData={yData} />
              {showHint && (
                <View pointerEvents="none" style={styles.hintCloud}>
                  <Text style={styles.hintText}>👆 Usa gestos para rotar o zoom</Text>
                </View>
              )}
            </View>

            {/* Ecuación */}
            {regresion && (
              <View style={[styles.glassPanel, styles.perspectiveLeft, { marginTop: 5 }]}>
                <Text style={styles.equationValue}>
                  Y = {regresion.m.toFixed(2)}X + {regresion.b.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Análisis interpretativo */}
            {regresion && (() => {
              const analisis = generarAnalisis(regresion.m);
              return (
                <View style={[styles.glassPanel, styles.perspectiveRight, styles.analysisBox, { borderColor: analisis.color + '55' }]}>
                  <Text style={[styles.analysisTitle, { color: analisis.color }]}>
                    {analisis.icono}  Interpretación
                  </Text>
                  <Text style={styles.analysisText}>{analisis.texto}</Text>
                </View>
              );
            })()}

            <TouchableOpacity
              style={styles.btnResetGlass}
              onPress={() => { setScannedData(null); setEjercicio(null); setStep(1); }}
            >
              <Text style={styles.btnText}>NUEVO ANÁLISIS</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

      <TouchableOpacity style={styles.backBtnGlass} onPress={() => router.back()}>
        <Text style={styles.btnText}>SALIR</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#000' },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center' },
  whiteText:            { color: 'white', marginBottom: 20 },
  glassCard:            { backgroundColor: 'rgba(10, 10, 30, 0.8)', padding: 25, borderRadius: 30, alignItems: 'center', width: '85%', borderWidth: 1.5, borderColor: 'rgba(0, 229, 255, 0.4)' },
  glassPanel:           { backgroundColor: 'rgba(15, 20, 45, 0.85)', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  arHudContainer:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  zoomWrapper:          { width: '100%', paddingHorizontal: 15, transform: [{ scale: 0.88 }, { perspective: 1000 }] },
  perspectiveCard:      { transform: [{ perspective: 1000 }, { rotateX: '5deg' }] },
  perspectiveLeft:      { transform: [{ perspective: 1000 }, { rotateY: '8deg' }] },
  perspectiveRight:     { transform: [{ perspective: 1000 }, { rotateY: '-8deg' }] },
  perspectiveGraph:     { transform: [{ perspective: 1000 }, { rotateX: '10deg' }] },
  fullOverlay:          { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  qrGuide:              { width: 180, height: 180, borderWidth: 2, borderColor: '#00e5ff', borderStyle: 'dashed', borderRadius: 20, marginVertical: 15 },
  stepTag:              { color: '#00e5ff', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  glassTitle:           { color: 'white', fontSize: 20, fontWeight: 'bold' },
  subNote:              { color: 'white', fontSize: 12, opacity: 0.7, textAlign: 'center', marginTop: 5 },
  exerciseHeader:       { color: '#00e5ff', fontSize: 16, fontWeight: 'bold' },
  exerciseText:         { color: 'white', fontSize: 11, lineHeight: 14 },
  sectionHeader:        { color: '#B39DDB', fontSize: 12, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  arTable:              { borderRadius: 10, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  arTableRow:           { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)', padding: 6 },
  arCell:               { flex: 1, color: '#E0E0E0', textAlign: 'center', fontSize: 11 },
  floatingGraphWrapper: { height: 380, width: '100%', backgroundColor: 'rgba(10, 10, 30, 0.4)', borderRadius: 30, borderWidth: 2, borderColor: 'rgba(0, 229, 255, 0.7)', overflow: 'hidden' },
  hintCloud:            { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'rgba(0, 229, 255, 0.3)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#00e5ff' },
  hintText:             { color: '#00e5ff', fontSize: 12, fontWeight: 'bold' },
  equationValue:        { color: '#00e5ff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#00e5ff', textShadowRadius: 10 },
  analysisBox:          { marginTop: 8, backgroundColor: 'rgba(10, 10, 30, 0.9)', borderWidth: 1 },
  analysisTitle:        { fontSize: 13, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  analysisText:         { color: '#E0E0E0', fontSize: 13, lineHeight: 19 },
  btnResetGlass:        { backgroundColor: 'rgba(255, 112, 67, 0.8)', padding: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  backBtnGlass:         { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 12, zIndex: 200 },
  btnOrange:            { backgroundColor: '#FF7043', padding: 15, borderRadius: 10 },
  btnText:              { color: 'white', fontWeight: 'bold' },
});