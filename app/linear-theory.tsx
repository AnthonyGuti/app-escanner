// app/linear-theory.tsx

import { Stack, router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';

export default function LinearTheory() {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(true);
  const [xInput, setXInput] = useState("");
  const [yInput, setYInput] = useState("");
  const [datosX, setDatosX] = useState<number[]>([]);
  const [datosY, setDatosY] = useState<number[]>([]);
  const [scrollOcupado, setScrollOcupado] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
    return () => { unsubscribeFocus(); unsubscribeBlur(); };
  }, [navigation]);

  const agregarDato = useCallback(() => {
    const valX = parseFloat(xInput);
    const valY = parseFloat(yInput);
    if (isNaN(valX) || isNaN(valY)) {
      Alert.alert("Atención", "Ingresa números válidos");
      return;
    }
    setDatosX(prev => [...prev, valX]);
    setDatosY(prev => [...prev, valY]);
    setXInput("");
    setYInput("");
  }, [xInput, yInput]);

  const reiniciarGrafica = () => {
    setDatosX([]);
    setDatosY([]);
    setXInput("");
    setYInput("");
  };

  const regresion = useMemo(() => {
    const n = datosX.length;
    if (n < 2) return null;
    const sumX = datosX.reduce((a, b) => a + b, 0);
    const sumY = datosY.reduce((a, b) => a + b, 0);
    const sumXY = datosX.reduce((a, v, i) => a + v * datosY[i], 0);
    const sumX2 = datosX.reduce((a, v) => a + v * v, 0);
    const denominador = (n * sumX2 - sumX * sumX);
    if (denominador === 0) return null;
    const m = (n * sumXY - sumX * sumY) / denominador;
    const b = (sumY - m * sumX) / n;
    return { m, b };
  }, [datosX, datosY]);

  const IconoExpandir = () => (
    <View style={iconStyles.wrapper}>
      <View style={[iconStyles.corner, { top: 0, left: 0 }]}>
        <View style={[iconStyles.lineH, { left: 0 }]} />
        <View style={[iconStyles.lineV, { top: 0 }]} />
      </View>
      <View style={[iconStyles.corner, { top: 0, right: 0 }]}>
        <View style={[iconStyles.lineH, { right: 0 }]} />
        <View style={[iconStyles.lineV, { top: 0 }]} />
      </View>
      <View style={[iconStyles.corner, { bottom: 0, left: 0 }]}>
        <View style={[iconStyles.lineH, { left: 0 }]} />
        <View style={[iconStyles.lineV, { bottom: 0 }]} />
      </View>
      <View style={[iconStyles.corner, { bottom: 0, right: 0 }]}>
        <View style={[iconStyles.lineH, { left: 0 }]} />
        <View style={[iconStyles.lineV, { bottom: 0 }]} />
      </View>
    </View>
  );

  const IconoMinimizar = () => (
    <View style={iconStyles.wrapper}>
      <View style={[iconStyles.corner, { top: 0, left: 0 }]}>
        <View style={[iconStyles.lineH, { right: 0 }]} />
        <View style={[iconStyles.lineV, { bottom: 0 }]} />
      </View>
      <View style={[iconStyles.corner, { top: 0, right: 0 }]}>
        <View style={[iconStyles.lineH, { left: 0 }]} />
        <View style={[iconStyles.lineV, { bottom: 0 }]} />
      </View>
      <View style={[iconStyles.corner, { bottom: 0, left: 0 }]}>
        <View style={[iconStyles.lineH, { right: 0 }]} />
        <View style={[iconStyles.lineV, { top: 0 }]} />
      </View>
      <View style={[iconStyles.corner, { bottom: 0, right: 0 }]}>
        <View style={[iconStyles.lineH, { left: 0 }]} />
        <View style={[iconStyles.lineV, { top: 0 }]} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} scrollEnabled={!scrollOcupado}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => router.replace('/')}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Regresión Lineal</Text>
          <Text style={styles.subtitle}>Universidad Indoamérica</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>¿Qué es la Regresión Lineal?</Text>
        <Text style={styles.content}>
          Es como trazar la <Text style={styles.highlight}>línea más justa</Text> que pase por en medio de un grupo de puntos.
          Su objetivo es decirnos cómo cambia una cosa cuando otra se mueve.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>La Ecuación Matemática</Text>
        <View style={styles.formulaBox}>
          <Text style={styles.formula}>y = mx + b</Text>
        </View>
        <Text style={styles.content}>
          • <Text style={styles.label}>m (Pendiente):</Text> Inclinación de la recta.{"\n"}
          • <Text style={styles.label}>b (Intercepto):</Text> Punto de corte en Y.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gráfica 3D (Simulador)</Text>

        <View style={styles.graphWrapper}>
          <View style={styles.graphContainer}>
            {isFocused && !pantallaCompleta ? (
              <Graph3D
                key={`normal-${datosX.length}`}
                xData={datosX}
                yData={datosY}
                setLockScroll={setScrollOcupado}
                transparente={true} 
              />
            ) : (
              <View style={styles.loaderContainer}>
                <Text style={{ color: '#B39DDB' }}>Modo pantalla completa activo</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.btnExpand} onPress={() => setPantallaCompleta(true)}>
            <IconoExpandir />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Punto X"
            placeholderTextColor="#B0BEC5"
            value={xInput}
            onChangeText={setXInput}
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Punto Y"
            placeholderTextColor="#B0BEC5"
            value={yInput}
            onChangeText={setYInput}
          />
          <TouchableOpacity onPress={agregarDato} style={styles.btnAdd}>
            <Text style={styles.btnAddText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={reiniciarGrafica} style={styles.btnReset}>
          <Text style={styles.btnResetText}>LIMPIAR PUNTOS</Text>
        </TouchableOpacity>

        {regresion && (
          <View style={styles.resultBox}>
            <Text style={styles.resultFormula}>
              y = {regresion.m.toFixed(2)}x {regresion.b >= 0 ? '+' : '-'} {Math.abs(regresion.b).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={pantallaCompleta}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPantallaCompleta(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer} pointerEvents="box-none">
          <View style={styles.modalGraphWrapper} pointerEvents="box-none">
            {isFocused && pantallaCompleta ? (
              <Graph3D
                key={`modal-${datosX.length}`}
                xData={datosX}
                yData={datosY}
                setLockScroll={() => {}}
                transparente={false} 
              />
            ) : null}
          </View>

          <View style={styles.floatingControls} pointerEvents="box-none">
            <TouchableOpacity style={styles.btnMinimize} onPress={() => setPantallaCompleta(false)}>
              <IconoMinimizar />
            </TouchableOpacity>
            <View style={styles.floatingIndicator} pointerEvents="none">
              <Text style={styles.floatingIndicatorText}>Simulador 3D • Arrastra para rotar</Text>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.buttonMain} 
        onPress={() => router.push('./scanner')}
      >
        <Text style={styles.buttonText}>➔ ¡VAMOS A LOS EJERCICIOS!</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: { width: 22, height: 22, position: 'relative' },
  corner: { position: 'absolute', width: 9, height: 9 },
  lineH: { position: 'absolute', width: 9, height: 2.5, backgroundColor: '#ffffff', borderRadius: 1 },
  lineV: { position: 'absolute', width: 2.5, height: 9, backgroundColor: '#ffffff', borderRadius: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4A148C' },
  header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  backArrow: { paddingRight: 15, paddingVertical: 5 },
  backArrowText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  headerTextContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: '#B39DDB' },
  card: { backgroundColor: '#38006B', marginHorizontal: 20, borderRadius: 15, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF7043', marginBottom: 10 },
  content: { fontSize: 15, color: 'white', lineHeight: 22 },
  highlight: { fontWeight: 'bold', color: '#00e5ff' },
  label: { color: '#FF7043', fontWeight: 'bold' },
  formulaBox: { backgroundColor: '#2a004f', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  formula: { fontSize: 28, fontWeight: 'bold', color: '#00e5ff' },
  graphWrapper: { position: 'relative', marginBottom: 15 },
  
  // ✅ Cambiado de blanco sólido a color oscuro integrado con la tarjeta
  graphContainer: { height: 300, backgroundColor: '#2a004f', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#7b1fa2' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a004f' },
  
  btnExpand: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#FF7043',
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 6,
  },
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalGraphWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  floatingControls: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  btnMinimize: {
    position: 'absolute', top: 50, right: 20,
    backgroundColor: '#FF7043',
    width: 50, height: 50, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 99,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 4, elevation: 6,
  },
  floatingIndicator: {
    position: 'absolute', top: 50, left: 20,
    backgroundColor: 'rgba(56, 0, 107, 0.85)',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
  },
  floatingIndicatorText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#2a004f', borderRadius: 10, color: 'white', padding: 12, marginRight: 8, borderWidth: 1, borderColor: '#4A148C' },
  btnAdd: { backgroundColor: '#00e5ff', width: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnAddText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  btnReset: { backgroundColor: 'rgba(255, 112, 67, 0.2)', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#FF7043' },
  btnResetText: { color: '#FF7043', fontWeight: 'bold' },
  resultBox: { padding: 10, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 10 },
  resultFormula: { color: '#00e5ff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  
  buttonMain: { backgroundColor: '#34C759', marginHorizontal: 20, padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});