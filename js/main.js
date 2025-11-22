// Site main JS: navigation and countdown
function toggleNav() {
  const nav = document.getElementById('mySidenav');
  const overlay = document.getElementById('overlay');
  const open = nav.classList.toggle('open');
  overlay.classList.toggle('open', open);
}

function closeNav() {
  const nav = document.getElementById('mySidenav');
  const overlay = document.getElementById('overlay');
  nav.classList.remove('open');
  overlay.classList.remove('open');
}

// Countdown logic
function startCountdown(container) {
  const targetAttr = container.dataset.target || container.getAttribute('data-target') || '2026-06-06T00:00:00';
  const target = new Date(targetAttr).getTime();

  function update() {
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const elDays = container.querySelector('#days');
    const elHours = container.querySelector('#hours');
    const elMinutes = container.querySelector('#minutes');
    const elSeconds = container.querySelector('#seconds');

    if (elDays) elDays.innerText = days;
    if (elHours) elHours.innerText = hours;
    if (elMinutes) elMinutes.innerText = minutes;
    if (elSeconds) elSeconds.innerText = seconds;
  }

  update();
  return setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', function () {
  // close nav when clicking overlay handled by markup
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', closeNav);

  // initialize countdown containers
  document.querySelectorAll('.countdown-container').forEach((c) => startCountdown(c));
});
