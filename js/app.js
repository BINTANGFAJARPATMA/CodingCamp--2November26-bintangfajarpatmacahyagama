/* ============================================================
   app.js  –  Personal Dashboard
   Single JS file (TC-1 / folder rules)
   Challenges implemented:
     ✅ Light / Dark mode
     ✅ Custom name in greeting
     ✅ Prevent duplicate tasks
     ✅ Sort tasks
     ✅ Change Pomodoro time
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   STORAGE HELPERS
─────────────────────────────────────────── */
const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },
};

/* ──────────────────────────────────────────
   GREETING  (date / time / name)
─────────────────────────────────────────── */
const datetimeEl = document.getElementById('datetime');
const greetingEl = document.getElementById('greeting');

function getGreetingPhrase(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function updateClock() {
  const now = new Date();

  // Format: Friday, November 6, 2026  •  15:40:07
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  datetimeEl.textContent = `${dateStr}  •  ${timeStr}`;

  const name   = storage.get('userName', '');
  const phrase = getGreetingPhrase(now.getHours());
  greetingEl.textContent = name ? `${phrase}, ${name}! 👋` : `${phrase}! 👋`;
}

updateClock();
setInterval(updateClock, 1000);

/* ──────────────────────────────────────────
   LIGHT / DARK MODE  (Challenge)
─────────────────────────────────────────── */
const btnTheme = document.getElementById('btn-theme');
const html     = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  btnTheme.textContent = theme === 'dark' ? '☀️' : '🌙';
  btnTheme.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  storage.set('theme', theme);
}

// Load saved theme on boot
applyTheme(storage.get('theme', 'light'));

btnTheme.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

/* ──────────────────────────────────────────
   CUSTOM NAME  (Challenge)
─────────────────────────────────────────── */
const btnName        = document.getElementById('btn-name');
const modalName      = document.getElementById('modal-name');
const nameInput      = document.getElementById('name-input');
const btnSaveName    = document.getElementById('btn-save-name');
const btnCancelName  = document.getElementById('btn-cancel-name');
const modalOverlay   = document.getElementById('modal-overlay');

function openModal(modalEl) {
  modalEl.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
}
function closeModal(modalEl) {
  modalEl.classList.add('hidden');
  modalOverlay.classList.add('hidden');
}

btnName.addEventListener('click', () => {
  nameInput.value = storage.get('userName', '');
  openModal(modalName);
  nameInput.focus();
});

btnSaveName.addEventListener('click', () => {
  const name = nameInput.value.trim();
  storage.set('userName', name);
  closeModal(modalName);
  updateClock(); // refresh greeting immediately
});

btnCancelName.addEventListener('click', () => closeModal(modalName));

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSaveName.click();
  if (e.key === 'Escape') btnCancelName.click();
});

/* ──────────────────────────────────────────
   FOCUS TIMER  (+ Change Pomodoro time challenge)
─────────────────────────────────────────── */
const timerDisplay  = document.getElementById('timer-display');
const btnStart      = document.getElementById('btn-start');
const btnStop       = document.getElementById('btn-stop');
const btnReset      = document.getElementById('btn-reset');
const timerMinInput = document.getElementById('timer-minutes');
const btnSetTime    = document.getElementById('btn-set-time');

let timerDuration = (storage.get('pomodoroMinutes', 25)) * 60; // seconds
let timerRemaining = timerDuration;
let timerInterval  = null;
let timerRunning   = false;

// Sync input with saved value
timerMinInput.value = storage.get('pomodoroMinutes', 25);

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerRemaining);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  btnStart.disabled = true;

  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      btnStart.disabled = false;
      timerDisplay.textContent = '00:00';
      // Notify user
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏱ Focus session complete!', { body: 'Time to take a break.' });
      } else {
        alert('⏱ Focus session complete! Time to take a break.');
      }
      return;
    }
    timerRemaining--;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  btnStart.disabled = false;
}

function resetTimer() {
  stopTimer();
  timerRemaining = timerDuration;
  renderTimer();
}

// Set custom Pomodoro duration
btnSetTime.addEventListener('click', () => {
  const mins = parseInt(timerMinInput.value, 10);
  if (!mins || mins < 1 || mins > 99) {
    timerMinInput.value = Math.floor(timerDuration / 60);
    return;
  }
  timerDuration    = mins * 60;
  timerRemaining   = timerDuration;
  storage.set('pomodoroMinutes', mins);
  stopTimer();
  renderTimer();
});

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnReset.addEventListener('click', resetTimer);

// Request notification permission on first interaction
document.addEventListener('click', () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, { once: true });

renderTimer();

/* ──────────────────────────────────────────
   TO-DO LIST
─────────────────────────────────────────── */
const todoInput      = document.getElementById('todo-input');
const btnAddTask     = document.getElementById('btn-add-task');
const todoListEl     = document.getElementById('todo-list');
const dupMsg         = document.getElementById('todo-duplicate-msg');
const todoSortSelect = document.getElementById('todo-sort');

// Edit modal
const modalEditTask       = document.getElementById('modal-edit-task');
const editTaskInput       = document.getElementById('edit-task-input');
const btnSaveEditTask     = document.getElementById('btn-save-edit-task');
const btnCancelEditTask   = document.getElementById('btn-cancel-edit-task');
let   editingTaskId       = null;

let tasks = storage.get('tasks', []);

function saveTasks() {
  storage.set('tasks', tasks);
}

function getSortedTasks() {
  const mode = todoSortSelect.value;
  const copy = [...tasks];
  switch (mode) {
    case 'az':   return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':   return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'done': return copy.sort((a, b) => Number(a.done) - Number(b.done));
    default:     return copy; // insertion order
  }
}

function renderTasks() {
  todoListEl.innerHTML = '';
  const sorted = getSortedTasks();

  if (sorted.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No tasks yet. Add one above!';
    empty.style.cssText = 'color:var(--text-muted);font-size:.85rem;text-align:center;padding:.5rem 0;';
    todoListEl.appendChild(empty);
    return;
  }

  sorted.forEach((task) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.checked = task.done;
    cb.setAttribute('aria-label', `Mark "${task.text}" as done`);
    cb.addEventListener('change', () => toggleTask(task.id));

    // Text
    const span = document.createElement('span');
    span.className   = 'todo-text';
    span.textContent = task.text;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className   = 'btn btn-secondary';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
    editBtn.addEventListener('click', () => openEditTask(task.id));

    const delBtn = document.createElement('button');
    delBtn.className   = 'btn btn-danger';
    delBtn.textContent = '🗑';
    delBtn.setAttribute('aria-label', `Delete "${task.text}"`);
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, delBtn);
    li.append(cb, span, actions);
    todoListEl.appendChild(li);
  });
}

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  // Challenge: Prevent duplicate tasks (case-insensitive)
  const duplicate = tasks.some(
    (t) => t.text.toLowerCase() === text.toLowerCase()
  );
  if (duplicate) {
    dupMsg.classList.remove('hidden');
    todoInput.select();
    setTimeout(() => dupMsg.classList.add('hidden'), 2500);
    return;
  }

  dupMsg.classList.add('hidden');
  tasks.push({ id: Date.now().toString(), text, done: false });
  saveTasks();
  renderTasks();
  todoInput.value = '';
  todoInput.focus();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function openEditTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editTaskInput.value = task.text;
  openModal(modalEditTask);
  editTaskInput.focus();
}

btnSaveEditTask.addEventListener('click', () => {
  const newText = editTaskInput.value.trim();
  if (!newText || editingTaskId === null) {
    closeModal(modalEditTask);
    return;
  }

  // Prevent duplicate on edit (ignore current task itself)
  const duplicate = tasks.some(
    (t) => t.id !== editingTaskId && t.text.toLowerCase() === newText.toLowerCase()
  );
  if (duplicate) {
    editTaskInput.select();
    editTaskInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (editTaskInput.style.borderColor = ''), 1500);
    return;
  }

  const task = tasks.find((t) => t.id === editingTaskId);
  if (task) {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
  editingTaskId = null;
  closeModal(modalEditTask);
});

btnCancelEditTask.addEventListener('click', () => {
  editingTaskId = null;
  closeModal(modalEditTask);
});

editTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  btnSaveEditTask.click();
  if (e.key === 'Escape') btnCancelEditTask.click();
});

btnAddTask.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
todoSortSelect.addEventListener('change', renderTasks);

// Challenge: Sort tasks
renderTasks();

/* ──────────────────────────────────────────
   QUICK LINKS
─────────────────────────────────────────── */
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const btnAddLink    = document.getElementById('btn-add-link');
const linksGrid     = document.getElementById('links-grid');

let links = storage.get('links', []);

function saveLinks() {
  storage.set('links', links);
}

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return null;
  }
}

function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No links yet. Add one above!';
    empty.style.cssText = 'color:var(--text-muted);font-size:.85rem;';
    linksGrid.appendChild(empty);
    return;
  }

  links.forEach((link) => {
    // Wrapper (chip acts as anchor)
    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.className = 'link-chip';
    a.setAttribute('aria-label', `Open ${link.name}`);

    // Favicon
    const favicon = getFavicon(link.url);
    if (favicon) {
      const img = document.createElement('img');
      img.src    = favicon;
      img.width  = 16;
      img.height = 16;
      img.alt    = '';
      img.onerror = () => img.remove(); // hide if favicon fails to load
      a.appendChild(img);
    }

    const nameSpan = document.createElement('span');
    nameSpan.textContent = link.name;
    a.appendChild(nameSpan);

    // Delete button (stops link navigation)
    const delBtn = document.createElement('button');
    delBtn.className   = 'link-delete';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', `Remove ${link.name}`);
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(link.id);
    });
    a.appendChild(delBtn);

    linksGrid.appendChild(a);
  });
}

function normalizeUrl(url) {
  if (!url) return '';
  // Prepend https:// if missing a scheme
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();

  if (!name || !url) return;
  url = normalizeUrl(url);

  // Basic URL validation
  try { new URL(url); } catch {
    linkUrlInput.style.borderColor = 'var(--danger)';
    setTimeout(() => (linkUrlInput.style.borderColor = ''), 1500);
    return;
  }

  links.push({ id: Date.now().toString(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

function deleteLink(id) {
  links = links.filter((l) => l.id !== id);
  saveLinks();
  renderLinks();
}

btnAddLink.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });
linkNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addLink(); });

renderLinks();

/* ──────────────────────────────────────────
   MODAL – close on overlay click
─────────────────────────────────────────── */
modalOverlay.addEventListener('click', () => {
  closeModal(modalName);
  closeModal(modalEditTask);
  editingTaskId = null;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(modalName);
    closeModal(modalEditTask);
    editingTaskId = null;
  }
});
