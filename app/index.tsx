import { router } from 'expo-router';
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header ajustado: El borde oscuro no baja, solo contiene al logo */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/image_72ab7f.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        
        {/* Mascota Pumas - Ahora sí se va a ver grande */}
        <Image 
          source={require('../assets/images/image_7305bb.png')} 
          style={styles.mascot} 
          resizeMode="contain"
        />

        <Text style={styles.instructionText}>
          Aprende Regresión Lineal con Realidad Aumentada
        </Text>

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
  container: { 
    flex: 1, 
    backgroundColor: '#4A148C' 
  },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 15, 
    paddingBottom: 10, // Sincronización: el borde termina justo tras el logo
    backgroundColor: '#38006B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: { 
    width: width * 0.85, // Ocupa el 85% del ancho de la pantalla
    height: 80,          // Altura suficiente para que sea grande
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20
  },
  mascot: { 
    width: width * 0.75, // Imagen de la mascota mucho más grande
    height: width * 0.75, 
    marginVertical: 10   // Pegado a los textos para no desperdiciar espacio
  },
  welcomeText: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: 'bold', 
    textAlign: 'center'
  },
  instructionText: { 
    color: '#B39DDB', 
    fontSize: 16, 
    marginTop: 10,
    marginBottom: 30, 
    textAlign: 'center', 
    paddingHorizontal: 30 
  },
  button: { 
    backgroundColor: '#FF7043', 
    paddingVertical: 15, 
    paddingHorizontal: 50, 
    borderRadius: 12, 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});