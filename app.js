/* ============================================
   MODERN TO-DO LIST APPLICATION - JAVASCRIPT
   Enhanced Task Completion System
   ============================================ */

// ============================================
// TASK MANAGER CLASS
// ============================================

class TaskManager {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.setupTheme();
        this.render();
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Add Task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.filter-btn').classList.add('active');
                this.currentFilter = e.target.closest('.filter-btn').dataset.filter;
                this.render();
            });
        });

        // Clear Completed
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCompleted());

        // Modal
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveEdit());
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeModal();
        });
    }

    // ============================================
    // TASK OPERATIONS
    // ============================================

    addTask() {
        const input = document.getElementById('taskInput');
        const taskText = input.value.trim();
        const errorMessage = document.getElementById('errorMessage');

        // Validation
        if (!taskText) {
            this.showError('❌ Please enter a task!');
            return;
        }

        if (taskText.length > 100) {
            this.showError('❌ Task is too long (max 100 characters)!');
            return;
        }

        // Create Task
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toLocaleString(),
            completedAt: null
        };

        this.tasks.unshift(task);
        input.value = '';
        this.showToast('✅ Task added successfully!', 'success');
        this.saveTasks();
        this.render();
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.showToast('🗑️ Task deleted!', 'info');
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toLocaleString() : null;
            
            if (task.completed) {
                this.showToast('✅ Task completed! Great job!', 'success');
            } else {
                this.showToast('↩️ Task marked as pending', 'info');
            }
            
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            document.getElementById('editInput').value = task.text;
            document.getElementById('editModal').classList.add('show');
            document.getElementById('editInput').focus();
        }
    }

    saveEdit() {
        const newText = document.getElementById('editInput').value.trim();
        
        if (!newText) {
            this.showError('❌ Task cannot be empty!');
            return;
        }

        if (newText.length > 100) {
            this.showError('❌ Task is too long (max 100 characters)!');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            this.showToast('✏️ Task updated!', 'success');
            this.saveTasks();
            this.closeModal();
            this.render();
        }
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('show');
        this.editingTaskId = null;
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showToast('No completed tasks to clear', 'info');
            return;
        }

        if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.showToast('🧹 All completed tasks cleared!', 'success');
            this.saveTasks();
            this.render();
        }
    }

    // ============================================
    // FILTERING & SEARCHING
    // ============================================

    getFilteredTasks() {
        let filtered = this.tasks;

        // Apply Filter
        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }

        // Apply Search
        if (this.searchQuery) {
            filtered = filtered.filter(task =>
                task.text.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    }

    // ============================================
    // STATISTICS
    // ============================================

    updateStats() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
    }

    // ============================================
    // RENDERING
    // ============================================

    render() {
        this.updateStats();
        this.renderTasks();
    }

    renderTasks() {
        const pendingList = document.getElementById('pendingTasksList');
        const completedList = document.getElementById('completedTasksList');
        const pendingGroup = document.getElementById('pendingGroup');
        const completedGroup = document.getElementById('completedGroup');

        const filteredTasks = this.getFilteredTasks();
        const pendingTasks = filteredTasks.filter(t => !t.completed);
        const completedTasks = filteredTasks.filter(t => t.completed);

        // Render Pending Tasks
        if (pendingTasks.length === 0) {
            pendingList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No pending tasks. Great job!</p>
                </div>
            `;
        } else {
            pendingList.innerHTML = pendingTasks.map(task => this.createPendingTaskHTML(task)).join('');
        }

        // Render Completed Tasks
        if (completedTasks.length === 0) {
            completedList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-smile"></i>
                    <p>No completed tasks yet. Start completing tasks!</p>
                </div>
            `;
        } else {
            completedList.innerHTML = completedTasks.map(task => this.createCompletedTaskHTML(task)).join('');
        }

        // Show/Hide Groups based on Filter
        if (this.currentFilter === 'completed') {
            pendingGroup.classList.add('hidden');
            completedGroup.classList.remove('hidden');
        } else if (this.currentFilter === 'pending') {
            pendingGroup.classList.remove('hidden');
            completedGroup.classList.add('hidden');
        } else {
            pendingGroup.classList.remove('hidden');
            completedGroup.classList.remove('hidden');
        }

        // Attach Event Listeners
        this.attachTaskListeners();
    }

    createPendingTaskHTML(task) {
        return `
            <div class="task-item" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    data-id="${task.id}"
                    title="Mark as complete"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHTML(task.text)}</div>
                    <div class="task-meta">
                        <span>
                            <i class="fas fa-calendar-alt"></i>
                            Created: ${task.createdAt}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn complete" data-id="${task.id}" title="Mark as complete">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="task-btn edit" data-id="${task.id}" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete" data-id="${task.id}" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createCompletedTaskHTML(task) {
        return `
            <div class="task-item completed" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    data-id="${task.id}"
                    checked
                    title="Mark as pending"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHTML(task.text)}</div>
                    <div class="task-meta">
                        <span>
                            <i class="fas fa-calendar-alt"></i>
                            Created: ${task.createdAt}
                        </span>
                        <span>
                            <i class="fas fa-check-circle"></i>
                            Completed: ${task.completedAt}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn undo" data-id="${task.id}" title="Mark as pending">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="task-btn edit" data-id="${task.id}" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete" data-id="${task.id}" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    attachTaskListeners() {
        // Checkbox
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(parseInt(e.target.dataset.id));
            });
        });

        // Complete Button
        document.querySelectorAll('.task-btn.complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleTask(parseInt(e.currentTarget.dataset.id));
            });
        });

        // Undo Button
        document.querySelectorAll('.task-btn.undo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleTask(parseInt(e.currentTarget.dataset.id));
            });
        });

        // Edit Button
        document.querySelectorAll('.task-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTask(parseInt(e.currentTarget.dataset.id));
            });
        });

        // Delete Button
        document.querySelectorAll('.task-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTask(parseInt(e.currentTarget.dataset.id));
            });
        });
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        this.tasks = saved ? JSON.parse(saved) : [];
    }

    // ============================================
    // THEME
    // ============================================

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.updateThemeIcon();
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon();
        this.showToast(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
    }

    updateThemeIcon() {
        const icon = document.querySelector('#themeToggle i');
        const isDark = document.body.classList.contains('dark-mode');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 3000);
    }

    // ============================================
    // UTILITIES
    // ============================================

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
