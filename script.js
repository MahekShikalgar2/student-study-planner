// Student Study Planner - JavaScript Logic

// Task storage array
let tasks = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const subjectInput = document.getElementById('subject');
const descriptionInput = document.getElementById('description');
const dueDateInput = document.getElementById('due-date');
const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const completedCountEl = document.getElementById('completed-count');
const totalCountEl = document.getElementById('total-count');
const progressFill = document.getElementById('progress-fill');

// Initialize: Load tasks from LocalStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    updateProgress();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.setAttribute('min', today);
});

// Load tasks from LocalStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('studyTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Save tasks to LocalStorage
function saveTasksToStorage() {
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
}

// Handle form submission - Add new task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const subject = subjectInput.value.trim();
    const description = descriptionInput.value.trim();
    const dueDate = dueDateInput.value;
    
    // Validation
    if (!subject || !description || !dueDate) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Create new task object
    const newTask = {
        id: Date.now(), // Unique ID using timestamp
        subject: subject,
        description: description,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add task to array
    tasks.push(newTask);
    
    // Save to LocalStorage
    saveTasksToStorage();
    
    // Update UI
    renderTasks();
    updateProgress();
    
    // Reset form
    taskForm.reset();
    
    // Show success feedback
    showNotification('Task added successfully! ✅');
});

// Render all tasks
function renderTasks() {
    // Clear container
    tasksContainer.innerHTML = '';
    
    // Show empty state if no tasks
    if (tasks.length === 0) {
        tasksContainer.appendChild(emptyState);
        return;
    }
    
    // Sort tasks: incomplete first, then by due date
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    // Create task cards
    sortedTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
}

// Create a task card element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.dataset.taskId = task.id;
    
    // Check if task is overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    const isOverdue = !task.completed && dueDate < today;
    
    // Format due date
    const formattedDate = formatDate(task.dueDate);
    
    card.innerHTML = `
        <div class="task-subject">${escapeHtml(task.subject)}</div>
        <div class="task-description">${escapeHtml(task.description)}</div>
        <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
            📅 Due: ${formattedDate}
            ${isOverdue ? ' ⚠️ Overdue!' : ''}
        </div>
        <div class="task-actions">
            <button class="btn btn-complete ${task.completed ? 'completed' : ''}" 
                    onclick="toggleComplete(${task.id})">
                ${task.completed ? '✓ Completed' : '✓ Mark Complete'}
            </button>
            <button class="btn btn-delete" onclick="deleteTask(${task.id})">
                🗑️ Delete
            </button>
        </div>
    `;
    
    return card;
}

// Toggle task completion status
function toggleComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateProgress();
        
        const message = task.completed ? 'Task marked as completed! ✅' : 'Task marked as incomplete';
        showNotification(message);
    }
}

// Delete a task
function deleteTask(taskId) {
    // Confirm deletion
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTasks();
        updateProgress();
        showNotification('Task deleted successfully! 🗑️');
    }
}

// Update progress indicator
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    completedCountEl.textContent = completed;
    totalCountEl.textContent = total;
    progressFill.style.width = `${percentage}%`;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification (simple alert alternative)
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation style if not exists
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
