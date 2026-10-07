document.addEventListener('DOMContentLoaded', function () {

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykpFGskpF6w_Z3WDXHG2z-9c5JzKL6aJjBovy9aAmIWR6ZfEUs_uLdYe018kMLH6VgJg/exec";
    const selectCarrera = document.getElementById('carrera');
    const contenedorProgramas = document.getElementById('contenedor-programas');
    const formRegistro = document.getElementById('formRegistro');

    // 1. CARGA DE DATOS DESDE GOOGLE SHEETS
    if (SCRIPT_URL && SCRIPT_URL !== "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT") {
        fetch(SCRIPT_URL)
            .then(response => response.json())
            .then(datos => {
                if (selectCarrera) {
                    selectCarrera.innerHTML = '<option value="" disabled selected>Selecciona una carrera</option>';
                }

                if (Array.isArray(datos) && datos.length > 0) {
                    let tarjetasDinamicas = [];

                    datos.forEach((item, index) => {
                        const nombreCarrera = (typeof item === 'string') ? item : (item.nombre || "");
                        let fotoCarrera = (typeof item === 'object' && item.foto) ? String(item.foto).trim() : "";
                        const infoCarrera = (typeof item === 'object' && item.informacion) ? item.informacion : "";

                        // A) Llenar el selector de carreras
                        if (selectCarrera && nombreCarrera) {
                            const option = document.createElement('option');
                            option.value = nombreCarrera;
                            option.textContent = nombreCarrera;
                            selectCarrera.appendChild(option);
                        }

                        // Ajustar la ruta local de la imagen
                        if (fotoCarrera && !fotoCarrera.startsWith("http") && !fotoCarrera.startsWith("imagenes/") && !fotoCarrera.startsWith("data:")) {
                            fotoCarrera = `imagenes/${fotoCarrera}`;
                        } else if (!fotoCarrera) {
                            fotoCarrera = `imagenes/default.jpg`;
                        }

                        // B) Guardar elementos válidos
                        if (infoCarrera.trim() !== "") {
                            tarjetasDinamicas.push({
                                nombre: nombreCarrera,
                                foto: fotoCarrera,
                                informacion: infoCarrera
                            });
                        }
                    });

                    // C) Renderizar tarjetas dinámicas con fotos locales
                    if (tarjetasDinamicas.length > 0 && contenedorProgramas) {
                        contenedorProgramas.innerHTML = ''; 
                        tarjetasDinamicas.forEach(prog => {
                            const col = document.createElement('div');
                            col.className = 'col-md-4';
                            col.innerHTML = `
                                <div class="card border rounded-3 h-100 shadow-sm program-card">
                                    <img src="${prog.foto}" class="card-img-top" alt="${prog.nombre}" style="height: 200px; object-fit: cover;" onerror="this.onerror=null; this.src='img/default.jpg';">
                                    <div class="card-body p-3 d-flex flex-column">
                                        <h6 class="card-title fw-bold">${prog.nombre}</h6>
                                        <p class="card-text text-muted text-xs flex-grow-1">${prog.informacion}</p>
                                        <a href="#registro" class="btn btn-blue btn-sm w-100 mt-2">Más información</a>
                                    </div>
                                </div>
                            `;
                            contenedorProgramas.appendChild(col);
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error al cargar datos desde Google Sheets:', error);
                if (selectCarrera) selectCarrera.innerHTML = '<option value="" disabled selected>Error al cargar carreras</option>';
            });
    }

    // 2. ENVÍO DEL FORMULARIO CON REGISTRO DE FOTO
    if (formRegistro) {
        formRegistro.addEventListener('submit', function (e) {
            e.preventDefault();

            const btnEnviar = document.getElementById('btnEnviar');
            const inputFoto = document.getElementById('foto');
            const archivo = inputFoto.files[0];

            if (!archivo) {
                alert('⚠️ Selecciona una foto de perfil antes de enviar.');
                return;
            }

            if (archivo.size > 3 * 1024 * 1024) {
                alert('⚠️ La imagen es muy pesada. Selecciona una foto menor a 3 MB.');
                return;
            }

            const textoOriginal = btnEnviar.innerText;
            btnEnviar.disabled = true;
            btnEnviar.innerText = 'Guardando datos y foto...';

            const reader = new FileReader();
            reader.readAsDataURL(archivo);

            reader.onload = function () {
                const datosEstudiante = {
                    nombre: document.getElementById('nombre').value.trim(),
                    correo: document.getElementById('correo').value.trim(),
                    clave: document.getElementById('clave').value.trim(),
                    fecha: document.getElementById('fecha').value,
                    genero: document.getElementById('genero').value,
                    carrera: selectCarrera.value,
                    comentario: document.getElementById('comentario').value.trim(),
                    acepto: document.getElementById('acepto').checked ? "Sí" : "No",
                    fotoBase64: reader.result,
                    fotoNombre: archivo.name,
                    fotoType: archivo.type
                };

                fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(datosEstudiante)
                })
                .then(response => response.json())
                .then(resultado => {
                    if (resultado.status === 'success') {
                        alert('🎉 ¡Registro guardado exitosamente!');
                        formRegistro.reset();
                    } else {
                        const msj = resultado.message || resultado.error || JSON.stringify(resultado);
                        alert('⚠️ Ocurrió un error: ' + msj);
                    }
                })
                .catch(error => {
                    console.error('Error al enviar:', error);
                    alert('⚠️ Error de conexión con el servidor.');
                })
                .finally(() => {
                    btnEnviar.disabled = false;
                    btnEnviar.innerText = textoOriginal;
                });
            };
        });
    }

    // 3. DESPLAZAMIENTO SUAVE
    document.querySelectorAll('a[href^="#"]').forEach(enlace => {
        enlace.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                const destino = document.querySelector(targetId);
                const posicion = destino.getBoundingClientRect().top + window.pageYOffset - 75;
                window.scrollTo({ top: posicion, behavior: 'smooth' });
            }
        });
    });
});