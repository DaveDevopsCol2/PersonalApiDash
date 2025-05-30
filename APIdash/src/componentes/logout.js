// src/components/logout.js
import { supabase } from '../supabaseClient.js';

export async function cerrarSesion() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Aquí podrías agregar código para actualizar la UI o redirigir al usuario
  } catch (error) {
    console.error('Error cerrando sesión:', error.message);
  }
}
