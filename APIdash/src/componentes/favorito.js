import { supabase } from '../supabaseClient.js'; // Ajusta la ruta si es necesario

export async function mostrarFavoritos(container, user) {
  container.innerHTML = `
    <div id="favoritos">
      <form id="form-favoritos">
        <input type="text" id="pregunta-texto" placeholder="Texto de la pregunta" required />
        <input type="text" id="respuesta-correcta" placeholder="Respuesta correcta" required />
        <input type="text" id="categoria" placeholder="Categoría" required />
        <button type="submit">Agregar Favorito</button>
        <button type="button" id="cancelar-edicion" style="display:none;">Cancelar</button>
      </form>
      <input type="text" id="buscador-favoritos" placeholder="Buscar favoritos..." />
      <div id="favoritos-lista"></div>
    </div>
  `;

  const form = document.getElementById('form-favoritos');
  const buscador = document.getElementById('buscador-favoritos');
  const lista = document.getElementById('favoritos-lista');
  const cancelarBtn = document.getElementById('cancelar-edicion');

  let modoEdicion = false;
  let idEditando = null;

  let favoritos = await cargarFavoritos();

  async function cargarFavoritos() {
    if (!user) return [];
    const { data, error } = await supabase
      .from('favoritos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando favoritos:', error);
      return [];
    }
    return data;
  }

  async function guardarFavorito(fav) {
    if (!user) {
      alert('Debes iniciar sesión para guardar favoritos');
      return null;
    }
    const { data, error } = await supabase
      .from('favoritos')
      .insert([{ ...fav, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error guardando favorito:', error);
      return null;
    }
    return data[0];
  }

  async function actualizarFavorito(id, fav) {
    const { data, error } = await supabase
      .from('favoritos')
      .update(fav)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error actualizando favorito:', error);
      return null;
    }
    return data[0];
  }

  async function eliminarFavorito(id) {
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando favorito:', error);
      return false;
    }
    return true;
  }

  function mostrarFavoritosLista(items) {
    lista.innerHTML = '';
    if (items.length === 0) {
      lista.innerHTML = '<p>No hay favoritos.</p>';
      return;
    }
    items.forEach((fav, idx) => {
      const div = document.createElement('div');
      div.className = 'favorito-item';
      div.innerHTML = `
        <h4>${fav.pregunta}</h4>
        <p><strong>Respuesta:</strong> ${fav.respuesta}</p>
        <p><strong>Categoría:</strong> ${fav.categoria}</p>
        <button data-idx="${idx}" class="editar">Editar</button>
        <button data-idx="${idx}" class="eliminar">Eliminar</button>
      `;
      lista.appendChild(div);
    });

    // Botones eliminar
    lista.querySelectorAll('button.eliminar').forEach(btn => {
      btn.addEventListener('click', async e => {
        const idx = e.target.dataset.idx;
        const fav = favoritos[idx];
        if (confirm('¿Quieres eliminar este favorito?')) {
          const ok = await eliminarFavorito(fav.id);
          if (ok) {
            favoritos.splice(idx, 1);
            mostrarFavoritosLista(favoritos);
          }
        }
      });
    });

    // Botones editar
    lista.querySelectorAll('button.editar').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = e.target.dataset.idx;
        const fav = favoritos[idx];
        document.getElementById('pregunta-texto').value = fav.pregunta;
        document.getElementById('respuesta-correcta').value = fav.respuesta;
        document.getElementById('categoria').value = fav.categoria;

        modoEdicion = true;
        idEditando = fav.id;

        form.querySelector('button[type="submit"]').textContent = 'Actualizar Favorito';
        cancelarBtn.style.display = 'inline';
      });
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nuevoFav = {
      pregunta: document.getElementById('pregunta-texto').value,
      respuesta: document.getElementById('respuesta-correcta').value,
      categoria: document.getElementById('categoria').value
    };

    if (modoEdicion && idEditando) {
      const res = await actualizarFavorito(idEditando, nuevoFav);
      if (res) {
        const idx = favoritos.findIndex(f => f.id === idEditando);
        favoritos[idx] = res;
        mostrarFavoritosLista(favoritos);
        reiniciarFormulario();
      }
    } else {
      const res = await guardarFavorito(nuevoFav);
      if (res) {
        favoritos.unshift(res);
        mostrarFavoritosLista(favoritos);
        form.reset();
      }
    }
  });

  cancelarBtn.addEventListener('click', () => {
    reiniciarFormulario();
  });

  function reiniciarFormulario() {
    modoEdicion = false;
    idEditando = null;
    form.reset();
    form.querySelector('button[type="submit"]').textContent = 'Agregar Favorito';
    cancelarBtn.style.display = 'none';
  }

  buscador.addEventListener('input', () => {
    const filtro = buscador.value.toLowerCase();
    const filtrados = favoritos.filter(fav =>
      fav.pregunta.toLowerCase().includes(filtro) ||
      fav.respuesta.toLowerCase().includes(filtro) ||
      fav.categoria.toLowerCase().includes(filtro)
    );
    mostrarFavoritosLista(filtrados);
  });

  mostrarFavoritosLista(favoritos);
}
