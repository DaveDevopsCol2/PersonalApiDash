// src/components/login.js
import { supabase } from '../supabaseClient.js';

export function mostrarLogin(container) {
  container.innerHTML = `
    <form id="form-login">
      <input type="email" id="email" placeholder="Correo electrónico" required />
      <input type="password" id="password" placeholder="Contraseña" required />
      <button type="submit">Iniciar sesión</button>
    </form>
    <p id="error-msg" style="color: red;"></p>
  `;

  const form = container.querySelector('#form-login');
  const errorMsg = container.querySelector('#error-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        errorMsg.textContent = 'Usuario o contraseña incorrectos.';
      } else if (error.message.toLowerCase().includes('invalid email')) {
        errorMsg.textContent = 'Correo inválido.';
      } else {
        errorMsg.textContent = 'Error: ' + error.message;
      }
    } else {
      errorMsg.textContent = '';
      form.reset();
      alert('¡Inicio de sesión exitoso!');

      // ✅ Insertar usuario en tabla personalizada 'usuario' si no existe
      const { user } = data;
      const { error: upsertError } = await supabase.from('usuario').upsert([{
        id: user.id,
        correo: user.email,
        nombre: user.user_metadata?.full_name || 'Usuario',
        roll: 'jugador'
      }]);

      if (upsertError) {
        console.error('Error al insertar/actualizar usuario en tabla personalizada:', upsertError.message);
      } else {
        console.log('Usuario registrado en tabla personalizada');
      }

      // 👉 Aquí puedes redirigir o cargar otra vista si es necesario
    }
  });
}
