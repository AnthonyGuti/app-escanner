import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Pantalla de Inicio (Tus dos botones principales) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Nueva Pantalla de Teoría de Regresión Lineal */}
        <Stack.Screen 
          name="linear-theory" 
          options={{ 
            headerShown: false // Oculta la barra blanca de arriba para usar tu diseño morado limpio
          }} 
        />

        {/* Nueva Pantalla de Teoría de Regresión Cuadrática */}
        <Stack.Screen 
          name="quadratic-theory" 
          options={{ 
            headerShown: false 
          }} 
        />

        {/* Pantalla del Escáner de Realidad Aumentada */}
        <Stack.Screen name="scanner" options={{ headerShown: false }} />
        
        {/* Modal opcional */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}