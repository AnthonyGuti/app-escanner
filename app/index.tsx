import { router } from 'expo-router';
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header con el logo de la Universidad Indoamérica */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/image_72ab7f.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        
        {/* Mascota Pumas */}
        <Image 
          source={require('../assets/images/image_7305bb.png')} 
          style={styles.mascot} 
          resizeMode="contain"
        />

        <Text style={styles.instructionText}>
          Selecciona el modelo estadístico que deseas aprender hoy
        </Text>

        {/* --- LOS DOS ÚNICOS BOTONES DE TEORÍA --- */}
        
        {/* Botón 1: Teoría de Regresión Lineal */}
        <TouchableOpacity 
          style={styles.buttonLinear} 
          onPress={() => router.push('./linear-theory')} 
        >
          <Text style={styles.buttonText}>TEORÍA REGRESIÓN LINEAL</Text>
        </TouchableOpacity>

        {/* Botón 2: Teoría de Regresión Cuadrática */}
        <TouchableOpacity 
          style={styles.buttonQuadratic} 
          onPress={() => router.push('./quadratic-theory')} 
        >
          <Text style={styles.buttonText}>TEORÍA REGRESIÓN CUADRÁTICA</Text>
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
    paddingBottom: 10, 
    backgroundColor: '#38006B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: { 
    width: width * 0.85, 
    height: 80,          
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20
  },
  mascot: { 
    width: width * 0.65, 
    height: width * 0.65, 
    marginVertical: 15   
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
    marginTop: 5,
    marginBottom: 25, 
    textAlign: 'center', 
    paddingHorizontal: 20 
  },
  buttonLinear: { 
    backgroundColor: '#7B1FA2', 
    paddingVertical: 16, 
    width: width * 0.8, 
    borderRadius: 12, 
    alignItems: 'center',
    marginVertical: 8, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  buttonQuadratic: { 
    backgroundColor: '#FF7043', 
    paddingVertical: 16, 
    width: width * 0.8, 
    borderRadius: 12, 
    alignItems: 'center',
    marginVertical: 8, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  buttonText: { 
    color: 'white', 
    fontSize: 15, 
    fontWeight: 'bold',
    letterSpacing: 1
  }
});