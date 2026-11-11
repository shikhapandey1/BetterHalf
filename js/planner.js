/**
 * Day Planner Module for BetterHalf
 * Starts completely fresh with an empty task list so users can plan from scratch!
 */

class DayPlanner {
    constructor() {
        this.currentDate = new Date();
        this.tasks = this.loadTasks();
        this.filter = 'all';
    }

    getDateKey(d = this.currentDate) {
        return d.toISOString().split('T')[0];
    }

    loadTasks() {
        const saved = localStorage.getItem('betterhalf_day_tasks');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }

        // Clean fresh state - no pre-filled tasks!
        return {
            highlights: {}
        };
    }

    saveTasks() {
        localStorage.setItem('betterhalf_day_tasks', JSON.stringify(this.tasks));
    }

    getTasksForDate(d = this.currentDate) {
        const key = this.getDateKey(d);
        return this.tasks[key] || [];
    }

    getHighlight(d = this.currentDate) {
        const key = this.getDateKey(d);
        return (this.tasks.highlights && this.tasks.highlights[key]) || '';
    }

    setHighlight(text, d = this.currentDate) {
        const key = this.getDateKey(d);
        if (!this.tasks.highlights) this.tasks.highlights = {};
        this.tasks.highlights[key] = text.trim();
        this.saveTasks();
    }

    addTask(title, category = 'Work/Study', timeBlock = 'morning', priority = 2, duration = 15, isHighlight = false) {
        const key = this.getDateKey();
        if (!this.tasks[key]) this.tasks[key] = [];

        const newTask = {
            id: 'task-' + Date.now() + Math.random().toString(36).substring(2, 6),
            title: title.trim(),
            category,
            timeBlock,
            priority: parseInt(priority, 10) || 2,
            duration: parseInt(duration, 10) || 15,
            completed: false,
            isHighlight: !!isHighlight
        };

        if (isHighlight) {
            this.setHighlight(title);
        }

        this.tasks[key].push(newTask);
        this.saveTasks();
        return newTask;
    }

    toggleTask(id) {
        const key = this.getDateKey();
        const list = this.tasks[key] || [];
        const task = list.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();

            if (task.completed) {
                if (window.soundEngine) window.soundEngine.playChime();
                if (window.createSparkleBurst) window.createSparkleBurst();
                if (window.widgetManager) {
                    window.widgetManager.addStardust(15, `✨ Finished "${task.title.substring(0, 18)}..."`);
                    window.widgetManager.recordTaskCompletion();
                }
            } else {
                if (window.soundEngine) window.soundEngine.playPop();
            }
        }
        return task;
    }

    deleteTask(id) {
        const key = this.getDateKey();
        if (this.tasks[key]) {
            this.tasks[key] = this.tasks[key].filter(t => t.id !== id);
            this.saveTasks();
        }
    }

    getStats(d = this.currentDate) {
        const list = this.getTasksForDate(d);
        const total = list.length;
        const completed = list.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percent };
    }
}

window.dayPlanner = new DayPlanner();
