import { supabase } from '../supabaseClient.js';

export async function cargarPreguntas(categoriaId) {
  const preguntasLista = document.getElementById('preguntas-lista');
  preguntasLista.innerHTML = '<p>Cargando preguntas...</p>';

  // Obtener usuario logueado una vez
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    preguntasLista.innerHTML = '<p>Debes iniciar sesión para responder preguntas.</p>';
    return;
  }

  fetch(`https://opentdb.com/api.php?amount=5&category=${categoriaId}`)
    .then(res => res.json())
    .then(data => {
      const preguntas = data.results;
      mostrarPreguntas(preguntas);
    })
    .catch(() => {
      preguntasLista.innerHTML = '<p>Error cargando preguntas.</p>';
    });

  function mostrarPreguntas(preguntas) {
    preguntasLista.innerHTML = '';

    preguntas.forEach((pregunta, i) => {
      const divPregunta = document.createElement('div');
      divPregunta.classList.add('pregunta');

      const preguntaTexto = document.createElement('h4');
      preguntaTexto.innerHTML = decodeHTML(pregunta.question);
      divPregunta.appendChild(preguntaTexto);

      const opciones = [...pregunta.incorrect_answers];
      opciones.push(pregunta.correct_answer);
      shuffleArray(opciones);

      opciones.forEach(opcion => {
        const btnOpcion = document.createElement('button');
        btnOpcion.classList.add('option');
        btnOpcion.innerHTML = decodeHTML(opcion);

        btnOpcion.addEventListener('click', async () => {
          const buttons = divPregunta.querySelectorAll('button.option');
          buttons.forEach(b => b.disabled = true);

          const esCorrecta = opcion === pregunta.correct_answer;

          if (esCorrecta) {
            btnOpcion.classList.add('correcta');
          } else {
            btnOpcion.classList.add('incorrecta');
            buttons.forEach(b => {
              if (b.textContent === decodeHTML(pregunta.correct_answer)) {
                b.classList.add('correcta');
              }
            });
          }

          // Guardar la respuesta en Supabase
          const { error: insertError } = await supabase.from('respuestas').insert([{
            user_id: user.id,
            categoria_id: categoriaId.toString(),
            pregunta: decodeHTML(pregunta.question),
            respuesta_correcta: decodeHTML(pregunta.correct_answer),
            respuesta_usuario: decodeHTML(opcion),
            es_correcta: esCorrecta
          }]);

          if (insertError) {
            console.error('Error al guardar respuesta:', insertError.message);
          } else {
            console.log('Respuesta guardada correctamente');
          }
        });

        divPregunta.appendChild(btnOpcion);
      });

      preguntasLista.appendChild(divPregunta);
    });
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
}
