// --- CONFIGURATION ---
// Set to '' if the frontend is served by the same Express server.
// Set to 'http://localhost:3000' if running frontend (e.g., Live Server) and backend separately.
const BASE_URL = '';
const API_URL = `${BASE_URL}/tasks`;

// --- API FUNCTIONS ---

async function loadTasks() {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();

    const container = document.getElementById('taskList');
    container.innerHTML = '';

    if (tasks.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:#666; padding:20px;">No tasks yet. Add one above!</p>`;
      updateStats([]);
      return;
    }

    tasks.forEach((task) => {
      const isCompleted = task.completed === true;
      const deadlineDate = new Date(task.deadline);
      const isOverdue = !isCompleted && deadlineDate < new Date();

      container.innerHTML += `
        <div class="task-card ${isCompleted ? 'completed' : ''}">
          <h3>${task.title}</h3>
          <p><strong>Subject:</strong> ${task.subject}</p>
          <p><strong>Deadline:</strong> ${task.deadline}</p>
          <p><strong>Status:</strong> 
            ${
              isCompleted
                ? '✅ Completed'
                : isOverdue
                ? '⚠️ Overdue'
                : '❌ Pending'
            }
          </p>
          <div class="buttons">
            ${
              !isCompleted
                ? `<button onclick="markComplete(${task.id})" class="complete-btn">Mark Complete</button>`
                : ''
            }
            <button onclick="deleteTask(${
              task.id
            })" class="delete-btn">Delete</button>
          </div>
        </div>
      `;
    });

    updateStats(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    alert('Failed to load tasks. Check if server is running.');
  }
}

function updateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed === true).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('statsText').innerHTML = `
    Total Tasks: <strong>${total}</strong> | 
    Completed: <strong>${completed}</strong>
  `;
  document.getElementById('progressFill').style.width = `${progress}%`;
}

async function markComplete(id) {
  try {
    // Constructing URL using the base logic
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    loadTasks();
  } catch (error) {
    alert('Failed to update task');
  }
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (error) {
    alert('Failed to delete task');
  }
}

// Form handler
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const subject = document.getElementById('subject').value.trim();
  const title = document.getElementById('title').value.trim();
  const deadline = document.getElementById('deadline').value;

  if (!subject || !title || !deadline) {
    alert('Please fill all fields');
    return;
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, title, deadline }),
    });

    e.target.reset();
    loadTasks();
  } catch (error) {
    alert('Failed to add task');
  }
});

// Initialize
window.onload = loadTasks;
window.loadTasks = loadTasks;
window.markComplete = markComplete;
window.deleteTask = deleteTask;
