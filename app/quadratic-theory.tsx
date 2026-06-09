import { Stack, router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';

export default function QuadraticTheory() {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(true);
  const [xInput, setXInput] = useState("");
  const [yInput, setYInput] = useState("");
  const [datosX, setDatosX] = useState<number[]>([]);
  const [datosY, setDatosY] = useState<number[]>([]);

  // Control de navegación para liberar memoria
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  // Agregar punto inmediatamente
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

  // Limpiar gráfica
  const reiniciarGrafica = () => {
    setDatosX([]);
    setDatosY([]);
    setXInput("");
    setYInput("");
  };

  // Mínimos Cuadrados para curvas (Parábolas)
  const regresionCuadratica = useMemo(() => {
    const n = datosX.length;
    if (n < 3) return null; 

    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
    let sumXY = 0, sumX2Y = 0;

    for (let i = 0; i < n; i++) {
      const x = datosX[i];
      const y = datosY[i];
      const x2 = x * x;

      sumX += x;
      sumY += y;
      sumX2 += x2;
      sumX3 += x2 * x;
      sumX4 += x2 * x2;
      sumXY += x * y;
      sumX2Y += x2 * y;
    }

    const d = n * (sumX2 * sumX4 - sumX3 * sumX3) - sumX * (sumX * sumX4 - sumX2 * sumX3) + sumX2 * (sumX * sumX3 - sumX2 * sumX2);
    if (d === 0) return null;

    const da = sumY * (sumX2 * sumX4 - sumX3 * sumX3) - sumX * (sumXY * sumX4 - sumX2Y * sumX3) + sumX2 * (sumXY * sumX3 - sumX2Y * sumX2);
    const db = n * (sumXY * sumX4 - sumX2Y * sumX3) - sumY * (sumX * sumX4 - sumX2 * sumX3) + sumX2 * (sumX * sumX2Y - sumX2 * sumXY);
    const dc = n * (sumX2 * sumX2Y - sumX3 * sumXY) - sumX * (sumX * sumX2Y - sumX2 * sumXY) + sumY * (sumX * sumX3 - sumX2 * sumX2);

    return {
      a: da / d,
      b: db / d,
      c: dc / d
    };
  }, [datosX, datosY]);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Barra superior con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => router.replace('/')}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Regresión Cuadrática</Text>
          <Text style={styles.subtitle}>Universidad Indoamérica</Text>
        </View>
      </View>

      {/* Teoría */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>¿Qué es la Regresión Cuadrática?</Text>
        <Text style={styles.content}>
          Es un modelo estadístico que se usa cuando los datos no siguen una línea recta, sino una <Text style={styles.highlight}>curva o parábola</Text>. Es ideal cuando las variables primero suben hasta un tope y luego comienzan a bajar.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>La Ecuación Matemática</Text>
        <View style={styles.formulaBox}>
          <Text style={styles.formula}>y = ax² + bx + c</Text>
        </View>
        <Text style={styles.content}>
          • <Text style={styles.label}>a (Curvatura):</Text> Si es positivo abre hacia arriba (U), si es negativo abre hacia abajo.{"\n"}
          • <Text style={styles.label}>b (Desplazamiento):</Text> Mueve la curva de lado a lado.{"\n"}
          • <Text style={styles.label}>c (Intercepto):</Text> Punto de choque en el eje Y.
        </Text>
      </View>

      {/* Simulador con Fondo Blanco */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gráfica 3D (Simulador)</Text>
        
        <View style={styles.graphContainer}>
          {isFocused ? (
            <Graph3D key={datosX.length} xData={datosX} yData={datosY} type="quadratic" />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#757575' }}>Cargando simulador...</Text>
            </View>
          )}
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

        {regresionCuadratica ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultFormula}>
              y = {regresionCuadratica.a.toFixed(2)}x² {regresionCuadratica.b >= 0 ? '+' : '-'} {Math.abs(regresionCuadratica.b).toFixed(2)}x {regresionCuadratica.c >= 0 ? '+' : '-'} {Math.abs(regresionCuadratica.c).toFixed(2)}
            </Text>
          </View>
        ) : (
          <View style={{ padding: 5 }}>
            <Text style={{ color: '#B39DDB', textAlign: 'center', fontSize: 13 }}>
              Ingresa al menos 3 puntos para trazar la parábola
            </Text>
          </View>
        )}
      </View>

      {/* Botón Principal para volver */}
      <TouchableOpacity 
        style={styles.buttonMain} 
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>➔ VOLVER AL MENÚ PRINCIPAL</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

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
  
  // CAMBIO A FONDO BLANCO AQUÍ
  graphContainer: { height: 300, backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#B0BEC5' },
  
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#2a004f', borderRadius: 10, color: 'white', padding: 12, marginRight: 8, borderWidth: 1, borderColor: '#4A148C' },
  btnAdd: { backgroundColor: '#00e5ff', width: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnAddText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  btnReset: { backgroundColor: 'rgba(255, 112, 67, 0.2)', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#FF7043' },
  btnResetText: { color: '#FF7043', fontWeight: 'bold' },
  resultBox: { padding: 10, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 10 },
  resultFormula: { color: '#00e5ff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  buttonMain: { backgroundColor: '#FF7043', marginHorizontal: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});