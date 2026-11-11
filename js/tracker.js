/**
 * Week Tracker Module for BetterHalf
 * Starts completely fresh with empty habit blooms so users can track on their own!
 */

class WeekTracker {
    constructor() {
        this.currentWeekOffset = 0;
        this.habits = this.loadHabits();
        this.moods = this.loadMoods();
    }

    loadHabits() {
        const saved = localStorage.getItem('betterhalf_weekly_habits');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }

        // Clean fresh habits with empty history
        return [
            { id: 'h-1', name: 'Drink 8 Cups of Water 💧', icon: '💧', history: {} },
            { id: 'h-2', name: '10-Min Nature Walk or Fresh Air 🌿', icon: '🌿', history: {} },
            { id: 'h-3', name: 'Read a Favorite Book or Story 📖', icon: '📖', history: {} },
            { id: 'h-4', name: 'Gentle Stretch or Yoga 🧘‍♀️', icon: '🧘‍♀️', history: {} },
            { id: 'h-5', name: 'Sleep Early with Soft Music 🌙', icon: '🌙', history: {} }
        ];
    }

    saveHabits() {
        localStorage.setItem('betterhalf_weekly_habits', JSON.stringify(this.habits));
    }

    loadMoods() {
        const saved = localStorage.getItem('betterhalf_weekly_moods');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }
        return {};
    }

    saveMoods() {
        localStorage.setItem('betterhalf_weekly_moods', JSON.stringify(this.moods));
    }

    getWeekDays(offset = this.currentWeekOffset) {
        const today = new Date();
        const currentDayIndex = today.getDay();
        const monOffset = (currentDayIndex === 0 ? -6 : 1) - currentDayIndex;

        const monday = new Date(today);
        monday.setDate(today.getDate() + monOffset + (offset * 7));

        const days = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = d.toISOString().split('T')[0];
            const isToday = key === today.toISOString().split('T')[0];

            days.push({
                name: dayNames[i],
                dateNum: d.getDate(),
                month: d.toLocaleDateString('en-US', { month: 'short' }),
                key,
                isToday,
                dateObj: d
            });
        }

        return days;
    }

    toggleHabit(habitId, dateKey) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        if (!habit.history) habit.history = {};
        habit.history[dateKey] = !habit.history[dateKey];
        this.saveHabits();

        if (habit.history[dateKey]) {
            if (window.soundEngine) window.soundEngine.playPop();
            if (window.widgetManager) {
                window.widgetManager.addStardust(10, `🌸 Bloomed habit: ${habit.name.substring(0, 15)}`);
            }
        }
        return habit.history[dateKey];
    }

    setMood(dateKey, moodId) {
        this.moods[dateKey] = { moodId, updatedAt: new Date().toISOString() };
        this.saveMoods();
        if (window.soundEngine) window.soundEngine.playSparkle();
    }

    getWeeklyStats() {
        const days = this.getWeekDays();
        let totalPossible = this.habits.length * 7;
        let completed = 0;

        days.forEach(d => {
            this.habits.forEach(h => {
                if (h.history && h.history[d.key]) completed++;
            });
        });

        const percent = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
        return { totalPossible, completed, percent };
    }
}

window.weekTracker = new WeekTracker();
