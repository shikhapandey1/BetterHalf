/**
 * Goals I Wish I Liked (Guilt-Free Sanctuary)
 * Starts clean with zero pre-loaded items so users can add their own dreams!
 */

class GoalsSanctuary {
    constructor() {
        this.goals = this.loadGoals();
    }

    loadGoals() {
        const saved = localStorage.getItem('betterhalf_sanctuary_goals');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        // Starts completely clean with 0 starting elements!
        return [];
    }

    saveGoals() {
        localStorage.setItem('betterhalf_sanctuary_goals', JSON.stringify(this.goals));
    }

    addGoal(title, reason, microStep, category = 'Dream') {
        const newGoal = {
            id: 'goal-' + Date.now(),
            title: title.trim(),
            category,
            reason: reason.trim() || 'A wish that can wait safely without rush',
            microStep: microStep.trim() || `Take 1 tiny 30-second easy step`,
            status: 'slumbering',
            createdAt: new Date().toISOString()
        };
        this.goals.unshift(newGoal);
        this.saveGoals();
        return newGoal;
    }

    sproutGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.status = 'sprouted';
            this.saveGoals();

            if (window.dayPlanner) {
                window.dayPlanner.addTask(
                    `🌱 Tiny Step: ${goal.microStep}`,
                    'Self-Care',
                    'morning',
                    2,
                    10
                );
            }
        }
        return goal;
    }

    releaseGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.status = 'released';
            goal.releasedAt = new Date().toISOString();
            this.saveGoals();

            if (window.widgetManager) {
                window.widgetManager.addStardust(50, '🕊️ Let go of pressure with love');
            }
        }
        return goal;
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.saveGoals();
    }
}

window.goalsSanctuary = new GoalsSanctuary();
