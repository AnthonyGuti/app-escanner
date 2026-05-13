import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';

export default function TheoryScreen() {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(true);
  const [xInput, setXInput] = useState("");
  const [yInput, setYInput] = useState("");
  const [datosX, setDatosX] = useState<number[]>([]);
  const [datosY, setDatosY] = useState<number[]>([]);

  // 1. Control de navegación para liberar memoria al salir (evita que se trabe)
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  // 2. Agregado atómico para que cargue el punto inmediatamente
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

  // 3. Limpieza instantánea
  const reiniciarGrafica = () => {
    setDatosX([]);
    setDatosY([]);
    setXInput("");
    setYInput("");
  };

  // --- TU LÓGICA DE TEORÍA (CONSERVADA SIN CAMBIOS) ---
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fundamentos de Regresión</Text>
        <Text style={styles.subtitle}>Universidad Indoamérica</Text>
      </View>

      {/* --- TEORÍA INTACTA --- */}
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

      {/* --- SIMULADOR OPTIMIZADO --- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gráfica 3D (Simulador)</Text>
        
        <View style={styles.graphContainer}>
          {/* SOLUCIÓN: Usamos datosX.length como key para que solo 
            se refresque cuando cambia la cantidad de puntos, no con cada tecla.
          */}
          {isFocused ? (
            <Graph3D key={datosX.length} xData={datosX} yData={datosY} />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#B39DDB' }}>Cargando simulador...</Text>
            </View>
          )}
        </View>

        <View style={styles.inputRow}>
          <TextInput 
            style={styles.input}
            keyboardType="numeric" 
            placeholder="X" 
            placeholderTextColor="#B39DDB"
            value={xInput}
            onChangeText={setXInput} 
          />
          <TextInput 
            style={styles.input}
            keyboardType="numeric" 
            placeholder="Y" 
            placeholderTextColor="#B39DDB"
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

      <TouchableOpacity 
        style={styles.buttonMain} 
        onPress={() => router.push('/scanner')}
      >
        <Text style={styles.buttonText}>¡ENTENDIDO! IR A ESCANEAR ➔</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4A148C' },
  header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: '#B39DDB' },
  card: { backgroundColor: '#38006B', marginHorizontal: 20, borderRadius: 15, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF7043', marginBottom: 10 },
  content: { fontSize: 15, color: 'white', lineHeight: 22 },
  highlight: { fontWeight: 'bold', color: '#00e5ff' },
  label: { color: '#FF7043', fontWeight: 'bold' },
  formulaBox: { backgroundColor: '#2a004f', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  formula: { fontSize: 28, fontWeight: 'bold', color: '#00e5ff' },
  graphContainer: { height: 300, backgroundColor: '#1a0030', borderRadius: 10, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#00e5ff' },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#2a004f', borderRadius: 10, color: 'white', padding: 12, marginRight: 8 },
  btnAdd: { backgroundColor: '#00e5ff', width: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnAddText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  btnReset: { backgroundColor: 'rgba(255, 112, 67, 0.2)', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#FF7043' },
  btnResetText: { color: '#FF7043', fontWeight: 'bold' },
  resultBox: { padding: 10, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 10 },
  resultFormula: { color: '#00e5ff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  buttonMain: { backgroundColor: '#FF7043', marginHorizontal: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});