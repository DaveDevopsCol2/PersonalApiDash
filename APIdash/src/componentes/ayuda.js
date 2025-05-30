import { supabase } from '../supabaseClient.js'; // Asegúrate de que esta ruta sea correcta

export function mostrarAyuda(container) {
  container.innerHTML = `
    <div id="ayuda">
      <form id="formulario-ayuda">
        <label for="nombre">Nombre:</label><br />
        <input type="text" id="nombre" name="nombre" required /><br /><br />
        
        <label for="email">Email:</label><br />
        <input type="email" id="email" name="email" required /><br /><br />
        
        <label for="mensaje">Mensaje:</label><br />
        <textarea id="mensaje" name="mensaje" required></textarea><br /><br />
        
        <button type="submit">Enviar</button>
      </form>
      <div id="mensaje-ayuda" style="margin-top: 10px; font-weight: bold;"></div>
    </div>
  `;

  const form = document.getElementById('formulario-ayuda');
  const mensajeDiv = document.getElementById('mensaje-ayuda');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();

    // Validación mínima
    if (!nombre || !email || !mensaje) {
      mensajeDiv.textContent = 'Por favor, completa todos los campos.';
      mensajeDiv.style.color = 'red';
      return;
    }

    // Guardar en Supabase
    const { error } = await supabase.from('ayuda').insert([
      { nombre, email, mensaje }
    ]);

    if (error) {
      console.error('Error al enviar el mensaje:', error);
      mensajeDiv.textContent = 'Hubo un error al enviar el mensaje. Intenta nuevamente.';
      mensajeDiv.style.color = 'red';
    } else {
      mensajeDiv.textContent = `Gracias, ${nombre}. Tu mensaje ha sido enviado con éxito.`;
      mensajeDiv.style.color = 'green';
      form.reset();
    }
  });
}
