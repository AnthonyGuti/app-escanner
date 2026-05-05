import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TheoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fundamentos de Regresión</Text>
        <Text style={styles.subtitle}>Universidad Indoamérica</Text>
      </View>

      {/* CONCEPTO FÁCIL */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>¿Qué es la Regresión Lineal?</Text>
        <Text style={styles.content}>
          Imagina que tienes un grupo de puntos dispersos en un mapa. La regresión lineal es como trazar la <Text style={{fontWeight: 'bold', color: '#00e5ff'}}>línea más justa</Text> que pase por en medio de todos ellos. 
          {"\n\n"}
          Su objetivo es decirnos cómo cambia una cosa cuando otra se mueve. Por ejemplo: 
          {"\n"}
          • Si estudias <Text style={{color: '#FF7043', fontWeight: 'bold'}}>más horas (X)</Text>, ¿qué tanto subirá tu <Text style={{color: '#FF7043', fontWeight: 'bold'}}>nota (Y)</Text>?
          {"\n\n"}
          Esta línea nos permite <Text style={{fontWeight: 'bold', color: '#00e5ff'}}>predecir resultados</Text>: si sabemos cuánto vale X, la línea nos dirá el valor aproximado de Y.
        </Text>
      </View>

      {/* ECUACIÓN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>La Ecuación Matemática</Text>
        <View style={styles.formulaBox}>
          <Text style={styles.formula}>y = mx + b</Text>
        </View>
        <Text style={styles.content}>
          • <Text style={{fontWeight: 'bold', color: '#FF7043'}}>m (Pendiente):</Text> Indica qué tan inclinada está la recta.{"\n"}
          • <Text style={{fontWeight: 'bold', color: '#FF7043'}}>b (Intercepto):</Text> Es el punto donde la línea toca el eje vertical.
        </Text>
      </View>

      {/* BOTÓN HACIA EL ESCÁNER */}
      <TouchableOpacity 
        style={styles.button} 
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
  header: { paddingTop: 30, paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: '#B39DDB' },
  card: { backgroundColor: '#38006B', marginHorizontal: 20, borderRadius: 15, padding: 20, marginBottom: 20, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF7043', marginBottom: 10 },
  content: { fontSize: 15, color: 'white', lineHeight: 22 },
  formulaBox: { backgroundColor: '#2a004f', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  formula: { fontSize: 28, fontWeight: 'bold', color: '#00e5ff' },
  button: { backgroundColor: '#FF7043', marginHorizontal: 20, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});