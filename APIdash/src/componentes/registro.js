// src/components/registro.js
import { supabase } from '../supabaseClient.js';

export function mostrarRegistro(container) {
  container.innerHTML = `
    <div id="registro">
      <form id="formRegistro">
        <input type="text" id="nombre" placeholder="Nombre" required />
        <input type="email" id="email" placeholder="Correo" required />
        <input type="password" id="password" placeholder="Contraseña" required />
        <button type="submit">Registrarse</button>
      </form>
      <p id="mensajeRegistro" style="color: red;"></p>
    </div>
  `;

  const form = container.querySelector('#formRegistro');
  const mensaje = container.querySelector('#mensajeRegistro');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      // Crear usuario en Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre }
        }
      });

      if (error) throw error;

      // Guardar datos adicionales en tabla "usuarios" si quieres aparte del perfil
      const { user } = data;

      await supabase.from('usuarios').insert([{
        id: user.id,
        nombre: nombre,
        email: email,
        fecha_registro: new Date()
      }]);

      mensaje.style.color = 'green';
      mensaje.textContent = "Registro exitoso. Revisa tu correo para confirmar la cuenta.";
      form.reset();

    } catch (error) {
      mensaje.style.color = 'red';
      let textoError = '';
      switch (error.message) {
        case 'User already registered':
          textoError = 'El correo ya está en uso.';
          break;
        case 'Invalid email or password':
          textoError = 'Correo o contraseña inválidos.';
          break;
        default:
          textoError = error.message;
      }
      mensaje.textContent = `Error: ${textoError}`;
    }
  });

  // Limpiar mensaje cuando el usuario escribe
  form.nombre.addEventListener('input', () => mensaje.textContent = '');
  form.email.addEventListener('input', () => mensaje.textContent = '');
  form.password.addEventListener('input', () => mensaje.textContent = '');
}
