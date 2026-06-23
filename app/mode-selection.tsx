import { router, Stack, useLocalSearchParams } from 'expo-router'; // NUEVO: Importamos Stack
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ModeSelection() {
  const { type } = useLocalSearchParams(); 

  const irATeoria = () => {
    if (type === 'linear') {
      router.push('./linear-theory');
    } else {
      router.push('./logistic-theory');
    }
  };

  const irARealidadAumentada = () => {
    router.push('./scanner'); 
  };

  return (
    <View style={styles.container}>
      {/* NUEVO: Le decimos a la pantalla que esconda la barra fea de arriba */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <Text style={styles.titleText}>¿Qué deseas hacer?</Text>
        
        <Text style={styles.subtitleText}>
          Elegiste Regresión {type === 'linear' ? 'Lineal' : 'Logística'}
        </Text>

        <TouchableOpacity style={styles.buttonTheory} onPress={irATeoria}>
          <Text style={styles.buttonText}>TEORÍA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonAR} onPress={irARealidadAumentada}>
          <Text style={styles.buttonText}>REALIDAD AUMENTADA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonBack} onPress={() => router.back()}>
          <Text style={styles.buttonBackText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4A148C' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  titleText: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitleText: { color: '#B39DDB', fontSize: 18, marginTop: 10, marginBottom: 40, textAlign: 'center' },
  buttonTheory: { backgroundColor: '#38006B', paddingVertical: 18, width: width * 0.8, borderRadius: 12, alignItems: 'center', marginVertical: 10, elevation: 4 },
  buttonAR: { backgroundColor: '#e85a06', paddingVertical: 18, width: width * 0.8, borderRadius: 12, alignItems: 'center', marginVertical: 10, elevation: 4 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  buttonBack: { marginTop: 30, padding: 10 },
  buttonBackText: { color: '#B39DDB', fontSize: 14, textDecorationLine: 'underline' }
});