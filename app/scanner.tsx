import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';
import { guardarResultadoEstadistico } from '../services/_databaseService';

// ── Importación de Firebase para Expo Go ─────────────────────────────────
import { doc, getDoc } from "firebase/firestore";
import { db } from '../services/firebaseConfig';

interface EjercicioData {
  titulo?: string;
  id_enunciado?: string;
  enunciado_completo: string;
  datos_variable_x: number[];
  datos_variable_y: number[];
  tipo?: string; // 'linear' o 'logistic'
}

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showHint, setShowHint] = useState(true);
  const [ejercicio, setEjercicio] = useState<EjercicioData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  // ── Descarga el ejercicio desde Firebase ─────────────────────────────────
  useEffect(() => {
    async function obtenerEjercicioFirebase() {
      if (!scannedData) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'ejercicios', scannedData);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const datosDoc = docSnap.data();
          if (datosDoc) {
            setEjercicio(datosDoc as EjercicioData);
            setStep(3);
          } else {
            alert("El documento existe pero no contiene datos válidos.");
            setScannedData(null);
            setStep(1);
          }
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
  const tipoModelo = ejercicio?.tipo || 'linear';

  const enunciado = ejercicio?.enunciado_completo?.toLowerCase() || "";
  const esIQ      = enunciado.includes("iq") || enunciado.includes("coeficiente");
  const esAnsiedad = enunciado.includes("ansiedad") || enunciado.includes("estres");

  // ── CÁLCULO DE MODELOS REALES (Lineal vs Regresión Logística) ────────────
  const calcularModelo = (x: number[], y: number[], tipo: string) => {
    const n = x.length;
    if (n < 2) return { m: 0, b: 0 };

    if (tipo === 'logistic') {
      // Regresión Logística real mediante Gradiente Descendente (Logit)
      const minY = Math.min(...y);
      const maxY = Math.max(...y);
      const rangeY = maxY - minY === 0 ? 1 : maxY - minY;
      
      let b = 0; // Intercepto
      let m = 0; // Pendiente
      const lr = 0.05;
      const epochs = 2000;
      
      for (let epoch = 0; epoch < epochs; epoch++) {
        let db = 0;
        let dm = 0;
        for (let i = 0; i < n; i++) {
          const yiNorm = (y[i] - minY) / rangeY;
          const z = m * x[i] + b;
          const zClamped = Math.max(Math.min(z, 35), -35);
          const p = 1 / (1 + Math.exp(-zClamped));
          const error = p - yiNorm;
          db += error;
          dm += error * x[i];
        }
        b -= (lr * db) / n;
        m -= (lr * dm) / n;
      }
      return { m, b };
    } else {
      // Regresión Lineal Ordinaria (Mínimos Cuadrados)
      const sumX  = x.reduce((a, b) => a + b, 0);
      const sumY  = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, v, i) => a + v * y[i], 0);
      const sumX2 = x.reduce((a, v) => a + v * v, 0);
      const denom = n * sumX2 - sumX * sumX;
      if (denom === 0) return { m: 0, b: 0 };
      const m = (n * sumXY - sumX * sumY) / denom;
      const b = (sumY - m * sumX) / n;
      return { m, b };
    }
  };

  const resultadoModelo = calcularModelo(xData, yData, tipoModelo);

  // ── Análisis interpretativo ──────────────────────────────────────────────
  const generarAnalisis = useCallback(
    (m: number): { icono: string; texto: string; color: string } => {
      const abs = Math.abs(m);

      if (esIQ) {
        if (m > 0) {
          if (abs >= 0.5) return { icono: '🧠', color: '#00e5ff', texto: 'Los estudiantes con mayor coeficiente intelectual tienden a obtener calificaciones notablemente más altas.' };
          return { icono: '🧠', color: '#B39DDB', texto: 'El coeficiente intelectual influye en la calificación, aunque otros factores también juegan un papel importante.' };
        }
        return { icono: '⚠️', color: '#FF7043', texto: 'La recta sugiere que a mayor IQ las notas bajan, lo que puede indicar datos atípicos o un grupo muy específico.' };
      }

      if (esAnsiedad) {
        if (m < 0) {
          if (abs >= 0.5) return { icono: '😰', color: '#FF7043', texto: 'A mayor nivel de ansiedad, las notas caen de forma considerable. Gestionar el estrés es clave para el rendimiento.' };
          return { icono: '😰', color: '#B39DDB', texto: 'La ansiedad afecta ligeramente las notas, aunque el efecto es moderado en este grupo.' };
        }
        return { icono: '🔍', color: '#00e5ff', texto: 'En este grupo, mayor ansiedad no implica peor nota. Podría tratarse de un perfil que trabaja mejor bajo presión.' };
      }

      if (tipoModelo === 'logistic') {
         return { icono: '⚡', color: '#00e5ff', texto: 'Modelo Logístico calculado por máxima verosimilitud. La curva en S predice la probabilidad del evento.' };
      }

      if (m > 0) return { icono: '📈', color: '#00e5ff', texto: 'La recta de ajuste es creciente: cuando X aumenta, Y también tiende a subir.' };
      if (m < 0) return { icono: '📉', color: '#FF7043', texto: 'La recta de ajuste es decreciente: cuando X sube, Y tiende a bajar.' };
      return { icono: '➡️', color: '#B39DDB', texto: 'La recta es casi horizontal: X no parece influir en Y en este conjunto de datos.' };
    },
    [esIQ, esAnsiedad, tipoModelo]
  );

  // ── Guardado automático del historial ────────────────────────────────────
  useEffect(() => {
    if (!resultadoModelo || !scannedData || !ejercicio) return;
    const infoAnalisis = generarAnalisis(resultadoModelo.m);
    
    guardarResultadoEstadistico(scannedData, {
      enunciado: ejercicio.enunciado_completo,
      x:         xData,
      y:         yData,
      m:         resultadoModelo.m,
      b:         resultadoModelo.b,
      analisis:  infoAnalisis.texto,
      qr:        scannedData,
      tipo:      tipoModelo
    });
  }, [resultadoModelo, scannedData, generarAnalisis, ejercicio, tipoModelo]);

  const IconoExpandir = () => (
    <View style={iconStyles.wrapper}>
      <View style={[iconStyles.corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[iconStyles.corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
      <View style={[iconStyles.corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[iconStyles.corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
    </View>
  );

  const IconoMinimizar = () => (
    <View style={iconStyles.wrapper}>
      <View style={[iconStyles.corner, { top: 0, left: 0, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#00e5ff' }]} />
      <View style={[iconStyles.corner, { top: 0, right: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#00e5ff' }]} />
      <View style={[iconStyles.corner, { bottom: 0, left: 0, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#00e5ff' }]} />
      <View style={[iconStyles.corner, { bottom: 0, right: 0, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#00e5ff' }]} />
    </View>
  );

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
      
      {!loading && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={({ data }) => { 
            if (data && step === 1) setScannedData(data); 
          }}
        />
      )}

      {loading && (
        <View style={styles.fullOverlay}>
          <View style={styles.glassCard}>
            <ActivityIndicator size="large" color="#00e5ff" />
            <Text style={[styles.subNote, { marginTop: 15 }]}>Conectando con Firebase...</Text>
            <Text style={styles.whiteText}>Calculando modelo estadístico...</Text>
          </View>
        </View>
      )}

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

      {step === 3 && ejercicio && (
        <View
          style={styles.arHudContainer}
          onStartShouldSetResponder={() => {
            setShowHint(false);
            return false; 
          }}
        >
          <View style={styles.zoomWrapper}>

            {/* 1. GRÁFICA 3D */}
            <View style={[styles.floatingGraphWrapper, styles.perspectiveGraph]}>
              {!pantallaCompleta && (
                 <Graph3D xData={xData} yData={yData} type={tipoModelo as "linear"|"logistic"} transparente={true} />
              )}
              {showHint && (
                <View pointerEvents="none" style={styles.hintCloud}>
                  <Text style={styles.hintText}>👆 Usa gestos para rotar o zoom</Text>
                </View>
              )}
              <TouchableOpacity style={styles.btnExpand} onPress={() => setPantallaCompleta(true)}>
                <IconoExpandir />
              </TouchableOpacity>
            </View>

            {/* 2. ANÁLISIS */}
            {resultadoModelo && (() => {
              const analisis = generarAnalisis(resultadoModelo.m);
              return (
                <View style={[styles.glassPanel, styles.perspectiveRight, styles.analysisBox, { borderColor: analisis.color + '55', marginTop: 15 }]}>
                  <Text style={[styles.analysisTitle, { color: analisis.color }]}>
                    {analisis.icono}  Interpretación
                  </Text>
                  <Text style={styles.analysisText}>{analisis.texto}</Text>
                </View>
              );
            })()}

            {/* 3. FÓRMULA REAL CALCULADA */}
            {resultadoModelo && (
              <View style={[styles.glassPanel, styles.perspectiveLeft, { marginTop: 15, marginBottom: 5 }]}>
                {tipoModelo === 'logistic' ? (() => {
                  const mStr = `${resultadoModelo.m >= 0 ? '' : '-'}${Math.abs(resultadoModelo.m).toFixed(2)}X`;
                  const bStr = `${resultadoModelo.b >= 0 ? '+ ' + resultadoModelo.b.toFixed(2) : '- ' + Math.abs(resultadoModelo.b).toFixed(2)}`;
                  const exponente = `${mStr} ${bStr}`;
                  return (
                    <View style={styles.fractionContainer}>
                      <Text style={styles.fractionP}>P(X) = </Text>
                      <View style={styles.fractionInner}>
                        <Text style={styles.fractionNumerator}>e^({exponente})</Text>
                        <View style={styles.fractionLine} />
                        <Text style={styles.fractionDenominator}>1 + e^({exponente})</Text>
                      </View>
                    </View>
                  );
                })() : (
                  <Text style={styles.equationValue}>
                    Y = {resultadoModelo.m.toFixed(2)}X + {resultadoModelo.b.toFixed(2)}
                  </Text>
                )}
              </View>
            )}

            {/* BOTÓN DE REINICIO */}
            <TouchableOpacity
              style={styles.btnResetGlass}
              onPress={() => { setScannedData(null); setEjercicio(null); setStep(1); }}
            >
              <Text style={styles.btnText}>NUEVO ANÁLISIS</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

      {/* --- MODAL DE GRÁFICO TRANSPARENTE EN PANTALLA COMPLETA --- */}
      <Modal visible={pantallaCompleta} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalTransparentContainer}>
          <View style={styles.modalGraphWrapper}>
            {pantallaCompleta && (
              <Graph3D key={`modal-ar-${xData.length}`} xData={xData} yData={yData} type={tipoModelo as "linear"|"logistic"} transparente={true} setLockScroll={() => {}} />
            )}
          </View>
          <TouchableOpacity style={styles.btnMinimize} onPress={() => setPantallaCompleta(false)}>
            <IconoMinimizar />
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backBtnGlass} onPress={() => router.back()}>
        <Text style={styles.btnText}>SALIR</Text>
      </TouchableOpacity>

    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: { width: 20, height: 20, position: 'relative' },
  corner: { position: 'absolute', width: 8, height: 8, borderColor: '#ffffff' },
});

const styles = StyleSheet.create({
  container:             { flex: 1, backgroundColor: 'transparent' }, 
  center:                { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  whiteText:             { color: 'white', marginBottom: 20 },
  glassCard:             { backgroundColor: 'rgba(10, 10, 30, 0.8)', padding: 25, borderRadius: 30, alignItems: 'center', width: '85%', borderWidth: 1.5, borderColor: 'rgba(0, 229, 255, 0.4)' },
  glassPanel:            { backgroundColor: 'rgba(15, 20, 45, 0.85)', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  arHudContainer:        { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 }, 
  zoomWrapper:           { width: '100%', paddingHorizontal: 15, transform: [{ scale: 0.88 }, { perspective: 1000 }] },
  perspectiveCard:       { transform: [{ perspective: 1000 }, { rotateX: '5deg' }] },
  perspectiveLeft:       { transform: [{ perspective: 1000 }, { rotateY: '8deg' }] },
  perspectiveRight:      { transform: [{ perspective: 1000 }, { rotateY: '-8deg' }] },
  perspectiveGraph:      { transform: [{ perspective: 1000 }, { rotateX: '10deg' }] },
  fullOverlay:           { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)' }, 
  qrGuide:               { width: 180, height: 180, borderWidth: 2, borderColor: '#00e5ff', borderStyle: 'dashed', borderRadius: 20, marginVertical: 15 },
  stepTag:               { color: '#00e5ff', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  glassTitle:            { color: 'white', fontSize: 20, fontWeight: 'bold' },
  subNote:               { color: 'white', fontSize: 12, opacity: 0.7, textAlign: 'center', marginTop: 5 },
  floatingGraphWrapper:  { height: 480, width: '100%', backgroundColor: 'rgba(10, 10, 30, 0.3)', borderRadius: 30, borderWidth: 2, borderColor: 'rgba(0, 229, 255, 0.7)', overflow: 'hidden' }, 
  hintCloud:             { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'rgba(0, 229, 255, 0.3)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#00e5ff' },
  hintText:              { color: '#00e5ff', fontSize: 12, fontWeight: 'bold' },
  equationValue:         { color: '#00e5ff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#00e5ff', textShadowRadius: 10 },
  
  fractionContainer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  fractionP:             { color: '#00e5ff', fontSize: 16, fontWeight: 'bold', marginRight: 8, textShadowColor: '#00e5ff', textShadowRadius: 10 },
  fractionInner:         { alignItems: 'center', flex: 1 },
  fractionNumerator:     { color: '#00e5ff', fontSize: 13, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#00e5ff', textShadowRadius: 8 },
  fractionLine:          { width: '100%', height: 1.5, backgroundColor: '#00e5ff', marginVertical: 4 },
  fractionDenominator:   { color: '#00e5ff', fontSize: 13, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#00e5ff', textShadowRadius: 8 },

  analysisBox:           { marginTop: 8, backgroundColor: 'rgba(10, 10, 30, 0.9)', borderWidth: 1 },
  analysisTitle:         { fontSize: 13, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  analysisText:          { color: '#E0E0E0', fontSize: 13, lineHeight: 19 },
  btnResetGlass:         { backgroundColor: 'rgba(255, 112, 67, 0.8)', padding: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  backBtnGlass:          { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 12, zIndex: 200 },
  btnOrange:             { backgroundColor: '#FF7043', padding: 15, borderRadius: 10 },
  btnText:               { color: 'white', fontWeight: 'bold' },
  
  btnExpand: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(0, 229, 255, 0.3)', 
    width: 44, 
    height: 44, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#00e5ff'
  },
  modalTransparentContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalGraphWrapper: { 
    width: '90%', 
    height: '75%', 
    backgroundColor: 'rgba(10, 10, 30, 0.3)', 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#00e5ff', 
    overflow: 'hidden' 
  },
  btnMinimize: { 
    position: 'absolute', 
    top: 60, 
    right: 30, 
    backgroundColor: 'rgba(0, 229, 255, 0.2)', 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 99,
    borderWidth: 1,
    borderColor: '#00e5ff'
  },
});