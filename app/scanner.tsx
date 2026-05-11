import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';

const data = require('./devices.json');
const { height: screenHeight } = Dimensions.get('window');

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [step, setStep] = useState(1); 

  const ejercicio = scannedData ? data[scannedData] : null;
  const xData: number[] = ejercicio?.iq || ejercicio?.ansiedad || [];
  const yData: number[] = ejercicio?.calificaciones || ejercicio?.notas || [];

  const calcularRegresion = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, v, i) => a + v * y[i], 0);
    const sumX2 = x.reduce((a, v) => a + v * v, 0);
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    return { m, b };
  };

  const regresion = xData.length > 0 ? calcularRegresion(xData, yData) : null;

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Solicitando cámara...</Text>
        <TouchableOpacity style={styles.btnOrange} onPress={requestPermission}>
          <Text style={styles.btnText}>PERMITIR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* FONDO: LA CÁMARA SIEMPRE ACTIVA PARA EFECTO AR */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={step === 1 ? ({ data }) => { setScannedData(data); setStep(2); } : undefined}
      />

      {/* PASO 1: CUADRO DE ESCANEO TRANSLÚCIDO */}
      {step === 1 && (
        <View style={styles.fullOverlay}>
          <View style={styles.glassCard}>
            <Text style={styles.stepTag}>PASO 1</Text>
            <Text style={styles.glassTitle}>Escanear Código del Tutor</Text>
            <View style={styles.qrGuide} />
          </View>
        </View>
      )}

      {/* PASO 2: TUTORIAL FLOTANTE TRANSLÚCIDO */}
      {step === 2 && (
        <TouchableOpacity style={styles.floatingGlassTutorial} onPress={() => setStep(3)}>
          <Text style={styles.stepTag}>PASO 2</Text>
          <Text style={styles.glassTitle}>Interactúa con los datos</Text>
          <Text style={styles.subText}>Mueve el gráfico 3D para analizar la correlación. (Toca para continuar)</Text>
        </TouchableOpacity>
      )}

      {/* PASO 3: RESULTADOS TIPO "HUD" DE REALIDAD AUMENTADA */}
      {step === 3 && ejercicio && (
        <View style={styles.arHudContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* PANEL SUPERIOR: PREGUNTA */}
            <View style={styles.glassPanel}>
              <Text style={styles.exerciseHeader}>{ejercicio.titulo}</Text>
              <Text style={styles.exerciseText}>{ejercicio.descripcion}</Text>
            </View>

            {/* PANEL MEDIO: TABLA TRANSPARENTE */}
            <View style={styles.glassPanel}>
              <Text style={styles.sectionHeader}>Tabla de Datos</Text>
              <View style={styles.arTable}>
                <View style={styles.arTableHeader}>
                  <Text style={styles.headerLabel}>IQ / Ansiedad</Text>
                  <Text style={styles.headerLabel}>Nota Final</Text>
                </View>
                {xData.map((val, i) => (
                  <View key={i} style={styles.arTableRow}>
                    <Text style={styles.arCell}>{val}</Text>
                    <Text style={[styles.arCell, {color: '#FFCCBC'}]}>{yData[i]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* GRÁFICO 3D FLOTANTE (Abajo de la tabla para efecto pepa) */}
            <View style={styles.floatingGraphWrapper}>
                <Graph3D xData={xData} yData={yData} />
            </View>

            {/* PANEL ECUACIÓN */}
            {regresion && (
              <View style={styles.glassPanel}>
                <Text style={styles.equationTitle}>Ecuación Calculada</Text>
                <Text style={styles.equationValue}>Y = {regresion.m.toFixed(2)}X + {regresion.b.toFixed(2)}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.btnResetGlass} onPress={() => { setScannedData(null); setStep(1); }}>
              <Text style={styles.btnText}>NUEVO ANÁLISIS</Text>
            </TouchableOpacity>
            <View style={{height: 50}} />
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.backBtnGlass} onPress={() => router.back()}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>SALIR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Efecto Glassmorphism (Panel Transparente)
  glassCard: {
    backgroundColor: 'rgba(10, 10, 35, 0.7)',
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    width: '85%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassPanel: {
    backgroundColor: 'rgba(20, 20, 50, 0.75)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // HUD de Realidad Aumentada
  arHudContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 100 },
  fullOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  qrGuide: { width: 220, height: 220, borderWidth: 2, borderColor: '#00e5ff', borderStyle: 'dashed', borderRadius: 20, marginTop: 20 },
  
  floatingGlassTutorial: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'rgba(255, 112, 67, 0.8)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Textos Estilo AR
  stepTag: { color: '#00e5ff', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  glassTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  subText: { color: 'white', fontSize: 13, marginTop: 5, opacity: 0.9 },
  exerciseHeader: { color: '#00e5ff', fontSize: 20, fontWeight: 'bold' },
  exerciseText: { color: 'white', fontSize: 14, marginTop: 8, lineHeight: 20 },
  sectionHeader: { color: '#B39DDB', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },

  // Tabla Transparente
  arTable: { borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  arTableHeader: { flexDirection: 'row', backgroundColor: 'rgba(56, 0, 107, 0.5)', padding: 10 },
  headerLabel: { flex: 1, color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 12 },
  arTableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255, 255, 255, 0.1)', padding: 8 },
  arCell: { flex: 1, color: '#B39DDB', textAlign: 'center', fontSize: 14 },

  // Gráfico Flotante Pepa
  floatingGraphWrapper: {
    height: 350,
    width: '100%',
    backgroundColor: 'rgba(10, 10, 30, 0.6)',
    borderRadius: 25,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    overflow: 'hidden',
  },

  // Ecuación
  equationTitle: { color: 'white', fontSize: 12, textAlign: 'center', opacity: 0.7 },
  equationValue: { color: '#00e5ff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 5 },

  // Botones
  btnResetGlass: { backgroundColor: 'rgba(255, 112, 67, 0.7)', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: 'white' },
  backBtnGlass: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnText: { color: 'white', fontWeight: 'bold' },
  btnOrange: { backgroundColor: '#FF7043', padding: 15, borderRadius: 10 },
});