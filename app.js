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

// Cerrar modales con la tecla Escape
document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    const modales = document.querySelectorAll('.modal-overlay');
    modales.forEach(m => m.classList.remove('active'));
  }
});

// =============================================================
// SEGURIDAD POR TOKEN DE SESIÓN DINÁMICO (ANTI-BOTS EN GITHUB)
// =============================================================

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOW92KR9J3BdP6LVJPcrhIbS-6bWia5A5XqzMF5x5rWRTpAYfujtGVEueTICchmAXegQ/exec";

// Comprobamos si ya pusiste la clave en esta sesión de navegación
let tokenAcceso = sessionStorage.getItem("SESION_TOKEN");

if (!tokenAcceso) {
  tokenAcceso = prompt("SISTEMA FINANCIERO BLOQUEADO\nIntroduzca la llave maestra para iniciar sesión:");
  if (tokenAcceso) {
    sessionStorage.setItem("SESION_TOKEN", tokenAcceso);
  }
}

let saldoActual = 20.00; 

async function procesarMovimiento(event, tipo, idModal) {
  event.preventDefault();
  
  const formulario = event.target;
  const conceptoInput = formulario.querySelector('input[type="text"]').value;
  let montoInput = parseFloat(formulario.querySelector('input[type="number"]').value);
  const botonSubmit = formulario.querySelector('button[type="submit"]');

  if (tipo === 'gasto') { montoInput = -montoInput; }

  // Empaquetamos los datos agregando la clave dinámica que ingresaste
  const datosMovimiento = {
    concepto: conceptoInput,
    monto: montoInput,
    clave: sessionStorage.getItem("SESION_TOKEN") // Se extrae seguro de la memoria de la pestaña
  };

  botonSubmit.disabled = true;
  botonSubmit.textContent = "TRANSMITIENDO...";

  try {
    // Usamos 'no-cors' para saltar las restricciones nativas de Google Apps Script
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosMovimiento)
    });

    // Actualización visual local
    saldoActual += montoInput;
    document.getElementById('pantallaSaldo').textContent = `$${saldoActual.toFixed(2)}`;
    
    formulario.reset();
    cerrarModal(idModal);

  } catch (error) {
    alert("CRITICAL ERROR: Fallo en la transmisión hacia la base de datos.");
    console.error(error);
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.textContent = "EJECUTAR";
  }
}