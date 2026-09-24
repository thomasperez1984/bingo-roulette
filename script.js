const TOTAL = 90;
const numbers = Array.from({ length: TOTAL }, (_, i) => i + 1);
let drawn = [];
let drawing = false;

const grid = document.querySelector('#numberGrid');
const ball = document.querySelector('#bingoBall');
const ballNumber = document.querySelector('#ballNumber');
const startButton = document.querySelector('#startButton');
const resetButton = document.querySelector('#resetButton');
const voiceToggle = document.querySelector('#voiceToggle');
const counter = document.querySelector('#counter');
const remainingText = document.querySelector('#remainingText');
const boardCaption = document.querySelector('#boardCaption');
const toast = document.querySelector('#toast');

function pad(value) { return String(value).padStart(2, '0'); }

function buildBoard() {
  grid.innerHTML = numbers.map(number => `<div class="number" id="number-${number}">${pad(number)}</div>`).join('');
}

function updateStatus() {
  const remaining = TOTAL - drawn.length;
  counter.textContent = `${drawn.length} / ${TOTAL}`;
  remainingText.textContent = `${remaining} ${remaining === 1 ? 'número restante' : 'números restantes'}`;
  boardCaption.textContent = drawn.length ? `${drawn.length} ${drawn.length === 1 ? 'número sorteado' : 'números sorteados'} · último: ${pad(drawn[drawn.length - 1])}` : 'Nenhum número sorteado ainda';
  startButton.disabled = remaining === 0 || drawing;
  if (remaining === 0) {
    startButton.innerHTML = '✓ Sorteio concluído';
    showToast('Todos os 90 números foram sorteados!');
  } else {
    startButton.innerHTML = '<span class="play-icon">▶</span> Sortear número';
  }
}

function numberInWords(value) {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  if (value < 10) return units[value];
  if (value < 20) return teens[value - 10];
  return tens[Math.floor(value / 10)] + (value % 10 ? ` e ${units[value % 10]}` : '');
}

function speak(value) {
  if (!voiceToggle.checked || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(`Número sorteado: ${numberInWords(value)}`);
  speech.lang = 'pt-BR'; speech.rate = .9; speech.pitch = 1.05;
  window.speechSynthesis.speak(speech);
}

function showToast(message) {
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2600);
}

function draw() {
  if (drawing || drawn.length === TOTAL) return;
  drawing = true; updateStatus();
  ball.classList.remove('drawing'); void ball.offsetWidth; ball.classList.add('drawing');
  startButton.innerHTML = '⏳ Sorteando...';
  setTimeout(() => {
    const available = numbers.filter(number => !drawn.includes(number));
    const selected = available[Math.floor(Math.random() * available.length)];
    drawn.push(selected);
    ballNumber.textContent = pad(selected);
    document.querySelectorAll('.number.latest').forEach(element => element.classList.remove('latest'));
    const selectedElement = document.querySelector(`#number-${selected}`);
    selectedElement.classList.add('drawn', 'latest');
    drawing = false; updateStatus(); speak(selected);
    selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 650);
}

function reset() {
  drawn = []; drawing = false; ballNumber.textContent = '--';
  document.querySelectorAll('.number').forEach(element => element.className = 'number');
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  updateStatus(); showToast('Sorteio recomeçado!');
}

startButton.addEventListener('click', draw);
resetButton.addEventListener('click', reset);
buildBoard(); updateStatus();
