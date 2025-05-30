// src/main.js

import { supabase } from './supabaseClient.js';
import { mostrarAyuda } from './componentes/ayuda.js';
import { mostrarCategoriasSection } from './componentes/categoria.js';
import { mostrarFavoritos } from './componentes/favorito.js';
import { mostrarHistoria } from './componentes/historia.js';
import { mostrarInformacion } from './componentes/informacion.js';
import { mostrarInicio } from './componentes/inicio.js';
import { mostrarLogin } from './componentes/login.js';
import { cerrarSesion } from './componentes/logout.js';
import { mostrarPerfil } from './componentes/perfil.js';
import { cargarPreguntas } from './componentes/preguntas.js';
import { mostrarRegistro } from './componentes/registro.js';

// Utilidad para mostrar un componente dentro del <main id="app">
function renderizar(componenteFn, ...args) {
  const contenedor = document.getElementById('app');
  contenedor.innerHTML = ''; // Limpiar contenido actual
  componenteFn(contenedor, ...args); // Insertar nuevo contenido, pasando args si hay
}

// Controlar visibilidad de botones según sesión
function actualizarBotonesNav(session) {
  const loginBtn = document.getElementById('btn-login');
  const registroBtn = document.getElementById('btn-registro');
  const perfilBtn = document.getElementById('btn-perfil');
  const logoutBtn = document.getElementById('btn-logout');

  const btnCategorias = document.getElementById('btn-categorias');
  const btnPreguntas = document.getElementById('btn-preguntas');
  const btnFavoritos = document.getElementById('btn-favoritos');
  const btnAyuda = document.getElementById('btn-ayuda');

  if (session) {
    loginBtn.style.display = 'none';
    registroBtn.style.display = 'none';
    perfilBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'inline-block';

    btnCategorias.style.display = 'inline-block';
    btnPreguntas.style.display = 'inline-block';
    btnFavoritos.style.display = 'inline-block';
    btnAyuda.style.display = 'inline-block';
  } else {
    loginBtn.style.display = 'inline-block';
    registroBtn.style.display = 'inline-block';
    perfilBtn.style.display = 'none';
    logoutBtn.style.display = 'none';

    btnCategorias.style.display = 'none';
    btnPreguntas.style.display = 'none';
    btnFavoritos.style.display = 'none';
    btnAyuda.style.display = 'none';
  }
}

// Enrutador básico para los botones de navegación
function configurarNavegacion(session) {
  const requiereSesion = (componente) => {
    return () => {
      if (!sessionActual) {
        alert('Debes iniciar sesión para acceder a esta sección.');
        renderizar(mostrarLogin);
      } else {
        // Pasar el usuario actual a mostrarFavoritos si es ese componente
        if (componente === mostrarFavoritos) {
          componente(document.getElementById('app'), sessionActual.user);
        } else if (componente === cargarPreguntas) {
          // Si cargarPreguntas necesita user, también aquí podrías pasarlo
          componente(document.getElementById('app'), sessionActual.user);
        } else {
          componente(document.getElementById('app'));
        }
      }
    };
  };

  document.getElementById('btn-inicio')?.addEventListener('click', () => renderizar(mostrarInicio));
  document.getElementById('btn-informacion')?.addEventListener('click', () => renderizar(mostrarInformacion));
  document.getElementById('btn-historia')?.addEventListener('click', () => renderizar(mostrarHistoria));
  document.getElementById('btn-categorias')?.addEventListener('click', requiereSesion(mostrarCategoriasSection));
  document.getElementById('btn-preguntas')?.addEventListener('click', requiereSesion(cargarPreguntas));
  document.getElementById('btn-favoritos')?.addEventListener('click', requiereSesion(mostrarFavoritos));
  document.getElementById('btn-ayuda')?.addEventListener('click', requiereSesion(mostrarAyuda));
  document.getElementById('btn-login')?.addEventListener('click', () => renderizar(mostrarLogin));
  document.getElementById('btn-registro')?.addEventListener('click', () => renderizar(mostrarRegistro));
  document.getElementById('btn-perfil')?.addEventListener('click', () => renderizar(mostrarPerfil));
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await cerrarSesion();
    sessionActual = null;
    main(); // Reiniciar flujo
  });
}

let sessionActual = null;

// Función principal para iniciar la app
async function main() {
  const { data: { session } } = await supabase.auth.getSession();
  sessionActual = session;

  actualizarBotonesNav(session);
  configurarNavegacion(session);

  if (session) {
    renderizar(mostrarInicio);
  } else {
    renderizar(mostrarLogin);
  }

  // Escuchar cambios en sesión
  supabase.auth.onAuthStateChange((_event, newSession) => {
    sessionActual = newSession;
    actualizarBotonesNav(newSession);
    if (newSession) {
      renderizar(mostrarInicio);
    } else {
      renderizar(mostrarLogin);
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
