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
  mapsUrl: ""
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
