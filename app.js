/*
  =========================================================
  CONFIGURACIÓN CASA SHOWER H&S
  =========================================================

  Mientras revelarFecha sea false:
  - fecha y hora aparecen como incógnita
  - contador permanece bloqueado

  Cuando tengan fecha:
  1. cambia revelarFecha a true
  2. completa fecha y hora
  3. guarda el archivo en GitHub

  Ejemplo:
  revelarFecha: true,
  fecha: "2026-10-10",
  hora: "19:00"
*/

const EVENTO = {
  revelarFecha: false,

  fecha: "",
  hora: "",

  revelarUbicacion: false,
  lugar: "",
  direccion: "",
  mapsUrl: "",

  apiUrl: "https://script.google.com/macros/s/AKfycbz9QIQ7EOY_Upf61Nzq80uobw1KuVj4Ten2TgLaxl3umxD2vWMlkFUGLPl6ubDW1qpI/exec"
};


function scrollToInvite() {
  document.getElementById("invitacion").scrollIntoView({
    behavior: "smooth"
  });
}


function formatearFecha(fechaISO) {
  const [year, month, day] = fechaISO.split("-").map(Number);

  const fecha = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(fecha);
}


function revelarDatos() {
  const fechaEl = document.getElementById("fechaEvento");
  const horaEl = document.getElementById("horaEvento");
  const estadoFecha = document.getElementById("estadoFecha");
  const estadoHora = document.getElementById("estadoHora");
  const mystery = document.getElementById("mysteryBox");

  if (EVENTO.revelarFecha && EVENTO.fecha && EVENTO.hora) {
    fechaEl.textContent = formatearFecha(EVENTO.fecha);
    horaEl.textContent = `${EVENTO.hora} hs`;

    estadoFecha.textContent = "Fecha confirmada";
    estadoHora.textContent = "Hora confirmada";

    mystery.innerHTML = `
      <div class="spark">✦</div>
      <p>Ahora sí... llegó el momento de prepararnos.</p>
    `;

    activarCuentaRegresiva();
  }
}


function activarCuentaRegresiva() {
  const countdown = document.getElementById("countdown");
  const title = document.getElementById("countdownTitle");
  const note = document.getElementById("countdownNote");

  countdown.classList.remove("locked-countdown");
  title.textContent = "Falta muy poco";
  note.textContent = "Nos encantará compartir este momento contigo.";

  const destino = new Date(`${EVENTO.fecha}T${EVENTO.hora}:00`);

  function actualizar() {
    const ahora = new Date();
    const diferencia = destino - ahora;

    if (diferencia <= 0) {
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";

      title.textContent = "¡Hoy es el día!";
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    document.getElementById("days").textContent = String(dias).padStart(2, "0");
    document.getElementById("hours").textContent = String(horas).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutos).padStart(2, "0");
    document.getElementById("seconds").textContent = String(segundos).padStart(2, "0");
  }

  actualizar();
  setInterval(actualizar, 1000);
}


function configurarUbicacion() {
  if (!EVENTO.revelarUbicacion) return;

  const title = document.getElementById("locationTitle");
  const text = document.getElementById("locationText");

  title.textContent = EVENTO.lugar || "Ubicación confirmada";
  text.textContent = EVENTO.direccion || "";
}


// Animaciones al hacer scroll
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.16
  }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

revelarDatos();
configurarUbicacion();


// =========================================================
// CONFIRMACIÓN DE ASISTENCIA + LISTA DE REGALOS
// =========================================================

let REGALOS = [];

let giftState = {};

async function apiPost(payload) {
  const response = await fetch(EVENTO.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}

async function apiGet(action) {
  const response = await fetch(
    `${EVENTO.apiUrl}?action=${encodeURIComponent(action)}&_=${Date.now()}`
  );

  return await response.json();
}

const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("rsvpNombre").value.trim();
    const estado = document.getElementById("rsvpEstado").value;
    const cantidad = document.getElementById("rsvpCantidad").value;
    const mensaje = document.getElementById("rsvpMensaje").value.trim();

    const btn = document.getElementById("btnRsvp");
    const status = document.getElementById("rsvpStatus");

    if (!nombre || !estado) {
      status.textContent = "Completa tu nombre y confirma si asistirás.";
      return;
    }

    btn.disabled = true;
    status.textContent = "Guardando confirmación...";

    try {
      const result = await apiPost({
        action: "rsvp",
        nombre,
        estado,
        cantidad,
        mensaje
      });

      if (!result.ok) {
        throw new Error(result.error || "ERROR");
      }

      status.textContent = "✓ Tu respuesta quedó registrada. ¡Gracias!";
      rsvpForm.reset();

    } catch (error) {
      status.textContent =
        "No pudimos guardar tu confirmación. Intenta nuevamente.";
    } finally {
      btn.disabled = false;
    }
  });
}

function renderGifts() {

  const container = document.getElementById("giftList");

  if (!container) return;

  container.innerHTML = "";

  REGALOS.forEach((regalo) => {

    const card = document.createElement("article");

    card.className =
      `gift-card${regalo.reservado ? " reserved" : ""}`;

    card.innerHTML = `
      <div>
        <div class="gift-name">
          ${regalo.nombre}
        </div>

        <div class="gift-category">
          ${regalo.categoria}
        </div>
      </div>

      <button
        class="gift-btn"
        ${regalo.reservado ? "disabled" : ""}
        onclick="openGiftModal('${regalo.id}')"
      >
        ${regalo.reservado ? "Reservado" : "Reservar"}
      </button>
    `;

    container.appendChild(card);
  });
}

async function loadGiftState() {

  const status = document.getElementById("giftStatus");

  try {

    const result = await apiGet("regalos");

    if (result.ok) {

      REGALOS = result.regalos || [];

      if (status) {
        status.textContent = "";
      }

    } else {

      if (status) {
        status.textContent =
          "No se pudo consultar la lista de regalos.";
      }

    }

  } catch (error) {

    console.error(error);

    if (status) {
      status.textContent =
        "No se pudo conectar con la lista de regalos.";
    }

  }

  renderGifts();
}

function openGiftModal(id) {
  const regalo = REGALOS.find((item) => item.id === id);

  if (!regalo || regalo.reservado) return;

  document.getElementById("modalGiftId").value = id;
  document.getElementById("modalGiftName").textContent = regalo.nombre;
  document.getElementById("giftGuestName").value = "";
  document.getElementById("giftModalStatus").textContent = "";

  document.getElementById("giftModal").classList.add("open");
}

function closeGiftModal() {
  document.getElementById("giftModal").classList.remove("open");
}

async function confirmGiftReservation() {

  const id = document.getElementById("modalGiftId").value;
  const nombre = document.getElementById("giftGuestName").value.trim();
  const status = document.getElementById("giftModalStatus");

  if (!nombre) {
    status.textContent = "Escribe tu nombre.";
    return;
  }

  status.textContent = "Reservando...";

  try {

    const result = await apiPost({
      action: "reservar_regalo",
      regaloId: id,
      nombre: nombre
    });

    if (!result.ok) {
      throw new Error(result.error || "ERROR");
    }

    // Vuelve a consultar Google Sheets
    // para actualizar toda la lista de regalos
    await loadGiftState();

    status.textContent = "✓ Regalo reservado correctamente.";

    setTimeout(() => {
      closeGiftModal();
    }, 900);

  } catch (error) {

    status.textContent =
      error.message === "YA_RESERVADO"
        ? "Ese regalo ya fue reservado por otra persona."
        : "No pudimos reservar el regalo. Intenta nuevamente.";

    // Actualiza la lista por si otra persona
    // reservó el regalo al mismo tiempo
    await loadGiftState();
  }
}

renderGifts();
loadGiftState();

