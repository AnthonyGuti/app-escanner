import { Stack, router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Graph3D from '../components/Graph3D';

export default function LogisticTheory() {
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
    const esNumeroValido = (texto: string) => /^-?\d*([.,]\d+)?$/.test(texto.trim());
    if (!esNumeroValido(xInput) || !esNumeroValido(yInput) || xInput.trim() === "" || yInput.trim() === "") {
      Alert.alert("Atención", "Por favor, ingresa solo números válidos.");
      return;
    }
    const valX = parseFloat(xInput.replace(',', '.'));
    const valY = parseFloat(yInput.replace(',', '.'));
    
    if (valY !== 0 && valY !== 1) {
      Alert.alert("Nota Educativa", "En la regresión logística, los valores de Y suelen ser 0 (No) o 1 (Sí).");
    }

    setDatosX(prev => [...prev, valX]);
    setDatosY(prev => [...prev, valY]);
    setXInput(""); setYInput("");
  }, [xInput, yInput]);

  const reiniciarGrafica = () => { setDatosX([]); setDatosY([]); setXInput(""); setYInput(""); };

  const regresionLogistica = useMemo(() => {
    const n = datosX.length;
    if (n < 2) return null;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += datosX[i]; sumY += datosY[i]; sumXY += datosX[i] * datosY[i]; sumX2 += datosX[i] * datosX[i];
    }
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    return { m, b };
  }, [datosX, datosY]);

  const toggleSigno = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    if (val.startsWith('-')) setter(val.slice(1));
    else setter('-' + val);
  };

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
      <View style={[iconStyles.corner, { top: 0, left: 0, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#4A148C' }]} />
      <View style={[iconStyles.corner, { top: 0, right: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#4A148C' }]} />
      <View style={[iconStyles.corner, { bottom: 0, left: 0, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#4A148C' }]} />
      <View style={[iconStyles.corner, { bottom: 0, right: 0, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#4A148C' }]} />
    </View>
  );

  return (
    <ScrollView style={styles.container} scrollEnabled={!scrollOcupado}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => router.replace('/')}><Text style={styles.backArrowText}>←</Text></TouchableOpacity>
        <View style={styles.headerTextContainer}><Text style={styles.title}>Regresión Logística</Text><Text style={styles.subtitle}>Universidad Indoamérica</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>¿Qué es la Regresión Logística?</Text>
        <Text style={styles.content}>
          Es un modelo que clasifica datos usando una <Text style={styles.highlight}>curva en forma de "S"</Text> (Curva Sigmoide). En lugar de predecir valores continuos, calcula la probabilidad de que un evento ocurra (valores entre 0 y 1).
        </Text>
      </View>

      {/* TARJETA 2: ECUACIÓN CON ESPACIADO PERFECTO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>La Ecuación Matemática</Text>
        
        <View style={styles.formulaBox}>
          <View style={styles.formulaContainer}>
            <Text style={styles.formulaY}>y =</Text>
            <View style={styles.fractionContainer}>
              <View style={styles.numeratorBox}>
                <Text style={styles.numerator}>1</Text>
              </View>
              <View style={styles.fractionLine} />
              <View style={styles.denominatorBase}>
                <Text style={styles.denominatorText}>1 + e</Text>
                <Text style={styles.superscriptText}>-f(x)</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.termText}><Text style={styles.termLabel}>• y (Probabilidad):</Text> El resultado final (mapeado de 0 a 1).</Text>
        <Text style={styles.termText}><Text style={styles.termLabel}>• e (Euler):</Text> Constante matemática fundamental (~2.718).</Text>
        <Text style={styles.termText}><Text style={styles.termLabel}>• f(x):</Text> La función lineal de ajuste matemático (mx + b).</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gráfica 3D (Simulador)</Text>
        <View style={styles.graphWrapper}>
          <View style={styles.graphContainer}>
            {isFocused && !pantallaCompleta ? (
              <Graph3D key={`normal-${datosX.length}`} xData={datosX} yData={datosY} type="logistic" setLockScroll={setScrollOcupado} transparente={true} />
            ) : <View style={styles.loaderContainer}><Text style={{ color: '#B39DDB' }}>Simulador activo</Text></View>}
          </View>
          <TouchableOpacity style={styles.btnExpand} onPress={() => setPantallaCompleta(true)}><IconoExpandir /></TouchableOpacity>
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Valor X" placeholderTextColor="#B0BEC5" value={xInput} onChangeText={setXInput} />
            <TouchableOpacity style={styles.btnSigno} onPress={() => toggleSigno(setXInput, xInput)}><Text style={styles.btnSignoText}>+/-</Text></TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="Valor Y (0 o 1)" placeholderTextColor="#B0BEC5" value={yInput} onChangeText={setYInput} />
          </View>
          <TouchableOpacity onPress={agregarDato} style={styles.btnAdd}><Text style={styles.btnAddText}>+</Text></TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={reiniciarGrafica} style={styles.btnReset}><Text style={styles.btnResetText}>LIMPIAR PUNTOS</Text></TouchableOpacity>
        
        {/* RESULTADO DINÁMICO ARREGLADO */}
        {regresionLogistica && (
          <View style={styles.resultBox}>
            <Text style={styles.resultFormulaTitle}>Modelo obtenido en tiempo real:</Text>
            <View style={styles.formulaContainer}>
              <Text style={[styles.formulaY, { fontSize: 24 }]}>y =</Text>
              <View style={styles.fractionContainer}>
                <View style={styles.numeratorBox}>
                  <Text style={[styles.numerator, { fontSize: 20 }]}>1</Text>
                </View>
                <View style={styles.fractionLine} />
                <View style={styles.denominatorBase}>
                  <Text style={[styles.denominatorText, { fontSize: 20 }]}>1 + e</Text>
                  <Text style={[styles.superscriptText, { fontSize: 13 }]}>
                    -({regresionLogistica.m.toFixed(2)}x {regresionLogistica.b >= 0 ? '+' : '-'} {Math.abs(regresionLogistica.b).toFixed(2)})
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <Modal visible={pantallaCompleta} animationType="fade" transparent={false} statusBarTranslucent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalGraphWrapper}>
            {isFocused && pantallaCompleta && <Graph3D key={`modal-${datosX.length}`} xData={datosX} yData={datosY} type="logistic" setLockScroll={() => {}} transparente={false} />}
          </View>
          <TouchableOpacity style={styles.btnMinimize} onPress={() => setPantallaCompleta(false)}><IconoMinimizar /></TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity style={styles.buttonMain} onPress={() => router.push('./scanner')}>
        <Text style={styles.buttonText}>➔ ¡VAMOS A LOS EJERCICIOS!</Text>
      </TouchableOpacity>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: { width: 24, height: 24, position: 'relative' },
  corner: { position: 'absolute', width: 10, height: 10, borderColor: '#ffffff' },
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
  
  /* --- ESTILOS MEJORADOS PARA LA FÓRMULA --- */
  formulaBox: { 
    backgroundColor: '#2a004f', 
    paddingVertical: 25, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginVertical: 15, 
    width: '100%' 
  },
  formulaContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  formulaY: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#00e5ff', 
    marginRight: 12 
  },
  fractionContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    minWidth: 80 
  },
  numeratorBox: {
    paddingBottom: 8, // Empuja el número 1 hacia arriba para dar espacio a la línea
  },
  numerator: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#00e5ff',
  },
  fractionLine: { 
    height: 3, // Línea un poco más gruesa
    backgroundColor: '#00e5ff', 
    width: '100%', 
    borderRadius: 2
  },
  denominatorBase: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', // Esto es clave: alinea el exponente arriba y el texto abajo
    paddingTop: 8, // Espacio debajo de la línea de fracción
  },
  denominatorText: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#00e5ff',
    marginTop: 6, // Baja el "1 + e" para que el exponente quede más arriba
  },
  superscriptText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#00e5ff', 
    marginLeft: 2,
  },
  
  termText: { color: 'white', fontSize: 15, marginBottom: 5 },
  termLabel: { color: '#FF7043', fontWeight: 'bold' },
  graphWrapper: { position: 'relative', marginBottom: 15 },
  graphContainer: { height: 300, backgroundColor: '#2a004f', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#7b1fa2' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a004f' },
  btnExpand: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF7043', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalGraphWrapper: { flex: 1, width: '100%' },
  btnMinimize: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(255,112,67,0.2)', width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 99 },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  inputGroup: { flex: 1, flexDirection: 'row', backgroundColor: '#2a004f', borderRadius: 10, marginRight: 8, alignItems: 'center' },
  input: { flex: 1, color: 'white', padding: 12 },
  btnSigno: { paddingHorizontal: 10 },
  btnSignoText: { color: '#FF7043', fontWeight: 'bold' },
  btnAdd: { backgroundColor: '#00e5ff', width: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnAddText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  btnReset: { backgroundColor: 'rgba(255, 112, 67, 0.2)', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnResetText: { color: '#FF7043', fontWeight: 'bold' },
  resultBox: { paddingVertical: 20, paddingHorizontal: 15, backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 10, width: '100%', alignItems: 'center' },
  resultFormulaTitle: { color: 'white', fontSize: 15, fontWeight: '500', marginBottom: 15 },
  buttonMain: { backgroundColor: '#34C759', marginHorizontal: 20, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 4 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});