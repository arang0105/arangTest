// 테마 토글 (전체 사이트 공통)
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

applyTheme(localStorage.getItem('theme') === 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'));
  });
}
