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
        
        {/* Pantalla de Teoría */}
        <Stack.Screen 
          name="theory" 
          options={{ 
            title: 'Lección Académica',
            headerStyle: { backgroundColor: '#38006B' },
            headerTintColor: '#fff',
            headerShown: true 
          }} 
        />

        {/* Pantalla de Escáner */}
        <Stack.Screen name="scanner" options={{ headerShown: false }} />
        
        {/* Modal opcional */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}