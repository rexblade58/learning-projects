const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const counter = document.getElementById('counter');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
  render();
}

function render() {
  list.innerHTML = '';
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.dataset.index = index;
    li.className = 'todo' + (todo.done ? ' done' : '');
    li.innerHTML = `
      <span class="text">${escapeHtml(todo.text)}</span>
      <div class="actions">
        <button class="toggle" data-index="${index}">${todo.done ? '↩' : '✓'}</button>
        <button class="delete" data-index="${index}">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
  counter.textContent = `${todos.filter(t => !t.done).length} remaining`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function startEdit(index, item) {
  const textEl = item.querySelector('.text');
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = todos[index].text;
  editInput.className = 'edit-input';
  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let finished = false;
  const finish = (saveEdit) => {
    if (finished) return;
    finished = true;
    const value = editInput.value.trim();
    if (saveEdit && value) todos[index].text = value;
    save();
  };

  editInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') finish(true);
    if (ev.key === 'Escape') finish(false);
  });
  editInput.addEventListener('blur', () => finish(true));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  input.value = '';
  save();
});

list.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  if (btn.classList.contains('toggle')) todos[index].done = !todos[index].done;
  if (btn.classList.contains('delete')) todos.splice(index, 1);
  save();
});

list.addEventListener('dblclick', (e) => {
  const item = e.target.closest('.todo');
  if (!item) return;
  startEdit(Number(item.dataset.index), item);
});

render();
