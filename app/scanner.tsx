import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Graph3D from '../components/Graph3D';

const data = require('./devices.json');

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [lockScroll, setLockScroll] = useState(false);

  const ejercicio = scannedData ? data[scannedData] : null;

  function calcularRegresion(x: number[], y: number[]) {
    const n = x.length;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, v, i) => a + v * y[i], 0);
    const sumX2 = x.reduce((a, v) => a + v * v, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    return { m, b };
  }

  let xData: number[] | null = null;
  let yData: number[] | null = null;

  if (ejercicio?.iq) {
    xData = ejercicio.iq;
    yData = ejercicio.calificaciones;
  } else if (ejercicio?.ansiedad) {
    xData = ejercicio.ansiedad;
    yData = ejercicio.notas;
  }

  const regresion =
    xData && yData ? calcularRegresion(xData, yData) : null;

  if (!permission) return <Text style={{ color: 'white' }}>Cargando...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>Necesitamos permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: '#00e5ff' }}>Permitir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          scannedData ? undefined : ({ data }) => setScannedData(data)
        }
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Realidad Aumentada</Text>
      </View>

      {/* GRAPH */}
      {xData && yData && (
        <View style={styles.graphContainer}>
          <Graph3D
            xData={xData}
            yData={yData}
            setLockScroll={setLockScroll}
          />
        </View>
      )}

      {/* PANEL */}
      {ejercicio && xData && yData && (
        <View style={styles.panel}>
          <ScrollView scrollEnabled={!lockScroll}>

            <Text style={styles.title}>{ejercicio.titulo}</Text>
            <Text style={styles.desc}>{ejercicio.descripcion}</Text>

            <View style={{ marginTop: 10 }}>
              {xData.map((x, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.cell}>{x}</Text>
                  <Text style={styles.cell}>{yData[i]}</Text>
                </View>
              ))}
            </View>

            {regresion && (
              <Text style={styles.eq}>
                y = {regresion.m.toFixed(3)}x + {regresion.b.toFixed(3)}
              </Text>
            )}

          </ScrollView>
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            scannedData ? setScannedData(null) : router.back()
          }
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {scannedData ? 'ESCANEAR NUEVO' : 'VOLVER'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    zIndex: 10,
  },

  headerText: {
    textAlign: 'center',
    color: '#00e5ff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  graphContainer: {
    position: 'absolute',
    top: 110,
    left: 10,
    right: 10,
    height: 360,
    borderRadius: 20,
    overflow: 'hidden',
  },

  panel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: 300,
    backgroundColor: 'rgba(10,10,20,0.95)',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  title: { color: '#4FC3F7', fontWeight: 'bold' },
  desc: { color: 'white', marginBottom: 10 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 4,
  },

  cell: { color: 'white', width: '50%' },

  eq: { color: '#00e5ff', marginTop: 10 },

  footer: {
    position: 'absolute',
    bottom: 320,
    width: '100%',
    alignItems: 'center',
  },

  btn: {
    backgroundColor: '#ff7043',
    padding: 12,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});