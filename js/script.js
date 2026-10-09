document.addEventListener('DOMContentLoaded', () => {

  // ⚠️ PON AQUÍ TU URL PUBLICADA DE GOOGLE APPS SCRIPT
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrJTP8po5TIhSFCht7QOKr8G0ROt8vOxc04oI_VaypZKpXp2gqCObs2YxKr-Nv9q1ssA/exec';

  // --- 1. CONTROL DEL MENÚ RESPONSIVE MÓVIL ---
  const menuBtn = document.getElementById('menuToggleBtn');
  const navMenu = document.getElementById('navbarNav');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

    const links = navMenu.querySelectorAll('.nav-link, .btn');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
      });
    });
  }

  // --- 2. LECTURA DINÁMICA DE GOOGLE SHEETS ---
  function cargarProgramasDesdeSheets() {
    const container = document.getElementById('programasContainer');
    const selectProgram = document.getElementById('program');

    if (!SCRIPT_URL || SCRIPT_URL.includes('PEGA_AQUI')) {
      if (container) container.innerHTML = '<p class="text-center text-muted">Configura SCRIPT_URL en js/script.js</p>';
      if (selectProgram) selectProgram.innerHTML = '<option value="" disabled selected>No se configuró la URL del script</option>';
      return;
    }

    fetch(SCRIPT_URL)
      .then(response => response.json())
      .then(data => {
        if (data.result === 'success' && data.programas && data.programas.length > 0) {

          // Llenar el desplegable de carreras
          if (selectProgram) {
            selectProgram.innerHTML = '<option value="" selected disabled>Selecciona un programa...</option>';
            data.programas.forEach(prog => {
              const option = document.createElement('option');
              option.value = prog.carrera;
              option.textContent = prog.carrera;
              selectProgram.appendChild(option);
            });
          }

          // Dibujar las cartas de carreras en la web
          if (container) {
            container.innerHTML = '';
            data.programas.forEach(prog => {
              const col = document.createElement('div');
              col.className = 'col-md-4';

              // Usar la foto del Excel o un marcador limpio si la celda está vacía
              const imgUrl = (prog.foto && prog.foto.trim() !== '') ? prog.foto : '';
              const imgHtml = imgUrl 
                ? `<img src="${imgUrl}" class="card-img-top" alt="${prog.carrera}" style="height: 200px; object-fit: cover;">`
                : `<div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;"><i class="fa-solid fa-graduation-cap fa-3x text-secondary"></i></div>`;

              col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                  ${imgHtml}
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold text-capitalize">${prog.carrera}</h5>
                    <p class="card-text text-muted small flex-grow-1">${prog.informacion || 'Sin descripción disponible.'}</p>
                    <a href="#registro" class="btn btn-primary w-100 fw-semibold mt-3">Más información</a>
                  </div>
                </div>
              `;
              container.appendChild(col);
            });
          }

        } else {
          if (container) container.innerHTML = '<p class="text-center text-muted">No hay programas registrados en el Excel.</p>';
          if (selectProgram) selectProgram.innerHTML = '<option value="" disabled selected>No hay programas disponibles</option>';
        }
      })
      .catch(err => {
        console.error('Error al cargar carreras:', err);
        if (container) container.innerHTML = '<p class="text-center text-danger">Error al cargar carreras desde la hoja de cálculo.</p>';
        if (selectProgram) selectProgram.innerHTML = '<option value="" disabled selected>Error de carga</option>';
      });
  }

  cargarProgramasDesdeSheets();

  // --- 3. PROCESAMIENTO DEL FORMULARIO DE REGISTRO ---
  const form = document.getElementById('registrationForm');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showToast('Por favor completa todos los campos requeridos.', 'danger');
        return;
      }

      const formData = {
        nombre: document.getElementById('fullName').value.trim(),
        correo: document.getElementById('email').value.trim(),
        telefono: document.getElementById('phone').value.trim(),
        carrera: document.getElementById('program').value,
        acepta: document.getElementById('terms').checked ? 'SÍ' : 'NO'
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(() => {
        showToast(`¡Registro guardado con éxito para ${formData.nombre}!`, 'success');
        form.reset();
        form.classList.remove('was-validated');
      })
      .catch((err) => {
        console.error(err);
        showToast('Error al enviar los datos a la hoja.', 'danger');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });
    });
  }

  // --- 4. NOTIFICACIONES TOAST ---
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show shadow-lg`;
    toast.role = 'alert';
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
});