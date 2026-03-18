const HOLE_COUNT = 9;
const GAME_DURATION = 60; // 초
const MOLE_IMAGES = ['refe/r1.png', 'refe/r2.png'];

const grid = document.getElementById('grid');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('finalScore');
const hitMessage = document.getElementById('hitMessage');
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');

let score = 0;
let timeLeft = GAME_DURATION;
let timerInterval = null;
let moleTimeout = null;
let isRunning = false;
let holes = [];

// ── 구멍 생성 ──────────────────────────────────────────
function buildGrid() {
  grid.innerHTML = '';
  holes = [];

  for (let i = 0; i < HOLE_COUNT; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';

    const mole = document.createElement('div');
    mole.className = 'mole';
    const img = document.createElement('img');
    img.src = MOLE_IMAGES[Math.floor(Math.random() * MOLE_IMAGES.length)];
    img.alt = '두더지';
    mole.appendChild(img);

    const ground = document.createElement('div');
    ground.className = 'hole-ground';

    hole.appendChild(mole);
    hole.appendChild(ground);
    hole.addEventListener('click', (e) => whack(hole, e));

    grid.appendChild(hole);
    holes.push(hole);
  }
}

// ── 두더지 올리기 ──────────────────────────────────────
function peekMole() {
  if (!isRunning) return;

  // 랜덤 구멍 선택 (현재 올라온 곳 제외)
  const downHoles = holes.filter(h => !h.classList.contains('up'));
  if (downHoles.length === 0) {
    schedulePeek();
    return;
  }

  const hole = downHoles[Math.floor(Math.random() * downHoles.length)];
  hole.classList.add('up');

  // 체류 시간: 800ms ~ 1800ms (시간 줄수록 빨라짐)
  const minStay = Math.max(500, 1000 - (GAME_DURATION - timeLeft) * 8);
  const maxStay = Math.max(900, 1800 - (GAME_DURATION - timeLeft) * 10);
  const stayTime = rand(minStay, maxStay);

  setTimeout(() => {
    hole.classList.remove('up', 'whacked');
  }, stayTime);

  schedulePeek();
}

function schedulePeek() {
  if (!isRunning) return;
  const delay = rand(400, 900);
  moleTimeout = setTimeout(peekMole, delay);
}

// ── 클릭 ───────────────────────────────────────────────
function whack(hole, event) {
  if (!isRunning || !hole.classList.contains('up')) return;

  hole.classList.remove('up');
  hole.classList.add('whacked');

  setTimeout(() => hole.classList.remove('whacked'), 300);

  score++;
  scoreEl.textContent = score;
  showHitEffect(hole);
  showBloodEffect(event.clientX, event.clientY);
}

// ── 피 이펙트 ──────────────────────────────────────────
function showBloodEffect(x, y) {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'blood-drop';

    const angle = (360 / count) * i + rand(-15, 15);
    const distance = rand(30, 80);
    const rad = (angle * Math.PI) / 180;

    drop.style.left = x + 'px';
    drop.style.top = y + 'px';
    drop.style.setProperty('--tx', `${Math.cos(rad) * distance}px`);
    drop.style.setProperty('--ty', `${Math.sin(rad) * distance}px`);
    drop.style.animationDuration = rand(400, 700) + 'ms';

    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 800);
  }
}

function showHitEffect(hole) {
  const rect = hole.getBoundingClientRect();
  hitMessage.className = 'hit-message';
  hitMessage.style.left = rect.left + rect.width / 2 - 30 + 'px';
  hitMessage.style.top = rect.top + 20 + 'px';

  // 애니메이션 재시작
  void hitMessage.offsetWidth;
  hitMessage.classList.add('show');
}

// ── 타이머 ─────────────────────────────────────────────
function startTimer() {
  timerEl.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 10) {
      timerEl.classList.add('danger');
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ── 게임 흐름 ───────────────────────────────────────────
function startGame() {
  score = 0;
  timeLeft = GAME_DURATION;
  isRunning = true;

  scoreEl.textContent = 0;
  timerEl.textContent = GAME_DURATION;
  timerEl.classList.remove('danger');

  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');

  buildGrid();
  startTimer();
  schedulePeek();
  // 처음에 동시에 여러 마리 등장
  setTimeout(peekMole, 200);
  setTimeout(peekMole, 500);
}

function endGame() {
  isRunning = false;
  clearInterval(timerInterval);
  clearTimeout(moleTimeout);

  // 모든 두더지 내리기
  holes.forEach(h => h.classList.remove('up', 'whacked'));

  finalScoreEl.textContent = score;
  endScreen.classList.remove('hidden');
}

// ── 유틸 ───────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── 게임 내 테마 토글 버튼 (shared.js와 동기화) ──────────
const themeToggleGame = document.getElementById('themeToggleGame');
const themeIconGame = document.getElementById('themeIconGame');
const themeLabelText = document.querySelector('.theme-label-text');

function syncGameThemeBtn() {
  const isDark = document.body.classList.contains('dark');
  if (themeIconGame) themeIconGame.textContent = isDark ? '☀️' : '🌙';
  if (themeLabelText) themeLabelText.textContent = isDark ? '라이트 모드' : '다크 모드';
}

syncGameThemeBtn();

if (themeToggleGame) {
  themeToggleGame.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // navbar 버튼도 동기화
    const navIcon = document.getElementById('themeIcon');
    if (navIcon) navIcon.textContent = isDark ? '☀️' : '🌙';
    syncGameThemeBtn();
  });
}

// ── 이벤트 ─────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
