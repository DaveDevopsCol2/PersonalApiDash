// src/components/perfil.js
import { supabase } from '../supabaseClient.js';

export async function mostrarPerfil(container) {
  container.innerHTML = `
    <div id="perfil">
      <h2>Mi Perfil</h2>
      <form id="formPerfil">
        <input type="text" id="nombre" placeholder="Nombre" required />
        <input type="email" id="email" placeholder="Correo" disabled />
        <button type="submit">Guardar Cambios</button>
      </form>
      <div id="mensajePerfil"></div>
    </div>
  `;

  const form = container.querySelector('#formPerfil');
  const mensaje = container.querySelector('#mensajePerfil');

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    container.innerHTML = '<p>No estás autenticado.</p>';
    return;
  }

  form.email.value = user.email || '';

  // Cargar datos actuales desde tabla "usuarios"
  const { data, error } = await supabase
    .from('usuarios')
    .select('nombre')
    .eq('id', user.id)
    .single();

  if (error) {
    mensaje.textContent = 'No se encontraron datos del usuario.';
  } else {
    form.nombre.value = data?.nombre || '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreNuevo = form.nombre.value.trim();

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ nombre: nombreNuevo })
      .eq('id', user.id);

    if (updateError) {
      mensaje.textContent = `Error al actualizar: ${updateError.message}`;
    } else {
      mensaje.textContent = 'Perfil actualizado correctamente.';
    }
  });
}
