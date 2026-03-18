// ── 상태 ──────────────────────────────────────────
let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';

// ── 저장 ──────────────────────────────────────────
function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// ── 화면 렌더링 ────────────────────────────────────
function render() {
  const list       = document.getElementById('todoList');
  const emptyMsg   = document.getElementById('emptyMsg');
  const stats      = document.getElementById('stats');
  const progressBar = document.getElementById('progressBar');

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return  t.done;
    return true;
  });

  list.innerHTML = '';
  filtered.forEach(todo => {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    li.innerHTML = `
      <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggle(${todo.id})" />
      <span>${escapeHtml(todo.text)}</span>
      <button class="delete-btn" onclick="remove(${todo.id})" title="삭제">×</button>
    `;
    list.appendChild(li);
  });

  emptyMsg.style.display = filtered.length === 0 ? 'block' : 'none';

  const total = todos.length;
  const done  = todos.filter(t => t.done).length;
  stats.textContent = `${total}개 중 ${done}개 완료`;
  progressBar.style.width = total === 0 ? '0%' : `${Math.round((done / total) * 100)}%`;
}

// ── Todo 추가 ──────────────────────────────────────
function addTodo() {
  const input = document.getElementById('todoInput');
  const text  = input.value.trim();
  if (!text) return;

  todos.push({ id: Date.now(), text, done: false });
  input.value = '';
  save();
  render();
}

// ── 완료 토글 ──────────────────────────────────────
function toggle(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.done = !todo.done;
  save();
  render();
}

// ── 개별 삭제 ──────────────────────────────────────
function remove(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

// ── 필터 변경 ──────────────────────────────────────
function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ── 완료 항목 일괄 삭제 ────────────────────────────
function clearDone() {
  todos = todos.filter(t => !t.done);
  save();
  render();
}

// ── XSS 방지 ──────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Enter 키 입력 ──────────────────────────────────
document.getElementById('todoInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// ── 초기 렌더링 ────────────────────────────────────
render();
