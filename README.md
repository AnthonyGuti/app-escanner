# AppRA: Realidad Aumentada aplicada a la Estadística

**AppRA** es una aplicación móvil desarrollada para la **Universidad Indoamérica**, diseñada para facilitar el aprendizaje de la **Regresión Lineal Simple**. Utiliza tecnología 3D y Realidad Aumentada para visualizar datos estadísticos de forma interactiva, permitiendo una comprensión profunda de los modelos predictivos.

---

## Características Principales

* **Módulo de Teoría**: Explicación clara y sencilla de los fundamentos matemáticos y la ecuación de la recta (y = mx + b).
* **Escáner QR**: Carga de conjuntos de datos mediante códigos QR dinámicos que vinculan a estructuras JSON.
* **Visualización 3D**: Gráficos animados en tiempo real utilizando Three.js y Expo-GL para representar la dispersión de datos.
* **Cálculo Automático**: Generación instantánea de la línea de mejor ajuste mediante el método de mínimos cuadrados.

---

## Tecnologías Utilizadas

* **React Native & Expo**: Framework principal para el desarrollo de la aplicación.
* **Three.js / Expo-Three**: Motor de renderizado para los gráficos estadísticos en 3D.
* **Expo Camera**: Implementación de la interfaz de cámara para el escaneo de ejercicios.
* **TypeScript**: Lenguaje de programación para garantizar la robustez de la lógica y los cálculos.

---

## Instrucciones de Instalación y Ejecución

Siga estos pasos para configurar el entorno de desarrollo y ejecutar la aplicación correctamente:

### Pre-requisitos

* Tener instalado [Node.js](https://nodejs.org/) (Versión LTS recomendada).
* Tener instalada la aplicación **Expo Go** en su dispositivo móvil.

### Instalación de Dependencias

Es fundamental seguir este orden para evitar conflictos entre las librerías de realidad aumentada y el motor 3D:

1.  **Clonar el repositorio**:
    ```bash
    git clone [https://github.com/TU_USUARIO/nombre-de-tu-repo.git](https://github.com/TU_USUARIO/nombre-de-tu-repo.git)
    ```
2.  **Entrar a la carpeta del proyecto**:
    ```bash
    cd AppRA
    ```
3.  **Instalar paquetes con flag de compatibilidad**:
    Este paso asegura que las dependencias de Three.js y Expo se instalen correctamente a pesar de las restricciones de versiones entre pares:
    ```bash
    npm install --legacy-peer-deps
    ```
4.  **Instalar dependencias nativas faltantes (opcional)**:
    Si el entorno reporta falta de librerías de sistema, ejecute:
    ```bash
    npx expo install expo-asset expo-file-system expo-camera expo-gl
    ```

### Ejecución

1.  **Iniciar el servidor de desarrollo**:
    ```bash
    npx expo start
    ```
2.  **Vincular con dispositivo móvil**:
    Escanee el código QR que aparecerá en su terminal utilizando la cámara de su celular o la aplicación **Expo Go**.

---

## Contexto Académico

Este proyecto forma parte del desarrollo práctico para la materia de Estadística en la Universidad Indoamérica. Se enfoca en la innovación educativa mediante el uso de herramientas tecnológicas modernas para la visualización de datos complejos.

**Autor**: Anthony Gutierrez  
**Institución**: Universidad Indoamérica