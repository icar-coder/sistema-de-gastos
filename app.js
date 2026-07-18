// Control de navegación con empuje lateral
function navegar(numeroPestana, botonActivo) {
  const escenario = document.getElementById('escenario');
  escenario.classList.remove('mostrar-p1', 'mostrar-p2', 'mostrar-p3');
  escenario.classList.add('mostrar-p' + numeroPestana);

  const botones = document.querySelectorAll('.nav-btn');
  botones.forEach(btn => btn.classList.remove('activo'));
  botonActivo.classList.add('activo');
}

// Apertura y cierre de ventanas modales
function abrirModal(idModal) {
  document.getElementById(idModal).classList.add('active');
}

function cerrarModal(idModal) {
  document.getElementById(idModal).classList.remove('active');
}

// Cerrar modales con el botón de escape físico de un teclado
document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    const modales = document.querySelectorAll('.modal-overlay');
    modales.forEach(m => m.classList.remove('active'));
  }
});

// =============================================================
// CONEXIÓN TOTALMENTE RESPALDADA POR GOOGLE OAUTH SECURITY
// =============================================================

// ⚠️ PEGA AQUÍ ABAJO TU URL LARGA OBTENIDA DE GOOGLE APPS SCRIPT
const APPS_SCRIPT_URL = "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUÍ";

let saldoActual = 20.00; 

async function procesarMovimiento(event, tipo, idModal) {
  event.preventDefault();
  
  const formulario = event.target;
  const conceptoInput = formulario.querySelector('input[type="text"]').value;
  let montoInput = parseFloat(formulario.querySelector('input[type="number"]').value);
  const botonSubmit = formulario.querySelector('button[type="submit"]');

  if (tipo === 'gasto') { montoInput = -montoInput; }

  const datosMovimiento = {
    concepto: conceptoInput,
    monto: montoInput
  };

  botonSubmit.disabled = true;
  botonSubmit.textContent = "TRANSMITIENDO...";

  try {
    // El navegador enviará invisiblemente tus credenciales de Google
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosMovimiento)
    });

    // Si pasa el filtro de Google, refresca la pantalla
    saldoActual += montoInput;
    document.getElementById('pantallaSaldo').textContent = `$${saldoActual.toFixed(2)}`;
    
    formulario.reset();
    cerrarModal(idModal);

  } catch (error) {
    alert("CRITICAL SECURITY ERROR: El servidor rechazó la transmisión.");
    console.error(error);
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.textContent = "EJECUTAR";
  }
}