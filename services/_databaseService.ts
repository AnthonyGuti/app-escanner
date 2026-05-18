import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Guarda el resultado del análisis estadístico en la nube.
 * @param idEnunciado El identificador obtenido del código QR.
 * @param datos Objeto con la información del ejercicio y el cálculo.
 */
export const guardarResultadoEstadistico = async (idEnunciado: string, datos: any) => {
  try {
    // Referencia al documento en la colección 'ejercicios' usando el ID del QR
    const referenciaDoc = doc(db, "ejercicios", idEnunciado);

    await setDoc(referenciaDoc, {
      id_enunciado: idEnunciado,
      enunciado_completo: datos.enunciado,
      datos_variable_x: datos.x,
      datos_variable_y: datos.y,
      recta_ajuste: {
        m: datos.m,
        b: datos.b,
        ecuacion: "Y = " + datos.m.toFixed(2) + "X + " + datos.b.toFixed(2)
      },
      analisis_grafico: datos.analisis,
      qr_origen: datos.qr,
      fecha_registro: new Date().toISOString()
    });

    console.log("¡Datos guardados en la nube con éxito!");
    return true;
  } catch (error) {
    console.error("Error al intentar guardar en Firebase:", error);
    return false;
  }
};