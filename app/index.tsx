import { router } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Universidad Indoamérica</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        <Text style={styles.instructionText}>Aprende Regresión Lineal con Realidad Aumentada</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/theory')} 
        >
          <Text style={styles.buttonText}>INICIAR LECCIÓN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4A148C' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#38006B' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  welcomeText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  instructionText: { color: '#B39DDB', fontSize: 14, marginBottom: 30, textAlign: 'center', paddingHorizontal: 40 },
  button: { backgroundColor: '#FF7043', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8, elevation: 3 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});