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

// =============================================================
// 🚀 NUEVA LÓGICA: LECTURA EN TIEMPO REAL DESDE GOOGLE SHEETS
// =============================================================

// Esta función limpia el "$20.00" estático y trae el valor real de la celda E2
async function obtenerSaldoReal() {
  const pantallaSaldo = document.getElementById('pantallaSaldo');
  pantallaSaldo.textContent = "CARGANDO..."; 
  
  try {
    const respuesta = await fetch(APPS_SCRIPT_URL, { method: "GET" });
    
    // En lugar de respuesta.json(), leemos como texto y luego lo parseamos manualmente
    const textoRespuesta = await respuesta.text();
    const datos = JSON.parse(textoRespuesta);
    
    pantallaSaldo.textContent = `$${parseFloat(datos.saldo).toFixed(2)}`;
  } catch (error) {
    pantallaSaldo.textContent = "$0.00";
    console.error("Error al leer el saldo base de Google Sheets:", error);
  }
}

// DISPARADOR: Se ejecuta automáticamente en cuanto la web se abre en el navegador
window.addEventListener('DOMContentLoaded', obtenerSaldoReal);

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
    clave: sessionStorage.getItem("SESION_TOKEN") 
  };

  botonSubmit.disabled = true;
  botonSubmit.textContent = "TRANSMITIENDO...";

  try {
    // Mandamos los datos a Google Script de forma segura
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosMovimiento)
    });

    // 🔄 REFRESCAR DESDE LA BASE DE DATOS
    // Esperamos 1.5 segundos para darle tiempo a la celda E2 de recalcular la suma, 
    // y luego mandamos a llamar a obtenerSaldoReal() para pintar el número exacto.
    setTimeout(obtenerSaldoReal, 1500); 
    
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