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
        {/* Pantalla de Inicio */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* NUEVO: Tu pantalla de menú de dos botones */}
        <Stack.Screen name="mode-selection" options={{ headerShown: false }} />
        
        {/* Pantalla de Teoría de Regresión Lineal */}
        <Stack.Screen 
          name="linear-theory" 
          options={{ 
            headerShown: false 
          }} 
        />

        {/* CORREGIDO: Ahora dice logistic-theory */}
        <Stack.Screen 
          name="logistic-theory" 
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