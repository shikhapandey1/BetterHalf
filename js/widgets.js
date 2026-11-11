/**
 * Widgets & Duolingo-Style Streak Module for BetterHalf
 * Starts completely fresh at 0 so users can build their own streak from scratch!
 */

class WidgetManager {
    constructor() {
        this.data = this.loadData();
        this.checkStreak();
    }

    loadData() {
        const saved = localStorage.getItem('betterhalf_widgets_data');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }

        // Clean fresh starting state - Streak 0, XP 0, Water 0!
        return {
            streak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            streakFreezes: 1,
            stardustXP: 0,
            waterGlasses: 0,
            waterGoal: 8,
            openedCookieToday: false,
            cookieMessage: '',
            unlockedStickers: ['🐰']
        };
    }

    saveData() {
        localStorage.setItem('betterhalf_widgets_data', JSON.stringify(this.data));
    }

    checkStreak() {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const lastDate = this.data.lastActiveDate;

        if (!lastDate) {
            // New user, streak stays 0 until first task completed
            return;
        }

        if (lastDate === todayKey) {
            return;
        }

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];

        if (lastDate !== yesterdayKey) {
            // Missed a day
            if (this.data.streakFreezes > 0 && this.data.streak > 0) {
                this.data.streakFreezes -= 1;
                this.saveData();
            } else {
                this.data.streak = 0;
                this.saveData();
            }
        }
    }

    recordTaskCompletion() {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const lastDate = this.data.lastActiveDate;

        if (lastDate !== todayKey) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split('T')[0];

            if (lastDate === yesterdayKey || this.data.streak === 0) {
                this.data.streak += 1;
            } else {
                this.data.streak = 1;
            }

            if (this.data.streak > this.data.longestStreak) {
                this.data.longestStreak = this.data.streak;
            }
            this.data.lastActiveDate = todayKey;
            this.saveData();

            if (window.soundEngine) window.soundEngine.playStreakFanfare();
            if (window.createSparkleBurst) window.createSparkleBurst();
            if (window.lunaAgent) {
                window.lunaAgent.voice.speak(`Awesome! Your streak is now ${this.data.streak}! Keep up the great work!`);
            }
        }
    }

    addStardust(amount, reason = '') {
        this.data.stardustXP += amount;
        this.saveData();
        this.triggerXPPopup(amount, reason);
    }

    triggerXPPopup(amount, reason) {
        const container = document.getElementById('xp-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'xp-toast';
        toast.innerHTML = `<span>+${amount} ✨</span> <span class="text-xs opacity-85">${reason}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, 2200);
    }

    addWater() {
        if (this.data.waterGlasses < this.data.waterGoal) {
            this.data.waterGlasses += 1;
            this.saveData();
            if (window.soundEngine) window.soundEngine.playWaterDrop();
            this.addStardust(5, '💧 Water sip');

            if (this.data.waterGlasses === this.data.waterGoal) {
                if (window.soundEngine) window.soundEngine.playSparkle();
                if (window.createSparkleBurst) window.createSparkleBurst();
                this.addStardust(25, '🌸 8/8 Cups finished!');
                if (window.lunaAgent) {
                    window.lunaAgent.voice.speak("Yay! You reached your water goal for today! Great job!");
                }
            }
            return this.data.waterGlasses;
        }
        return this.data.waterGlasses;
    }

    resetWater() {
        this.data.waterGlasses = 0;
        this.saveData();
    }

    crackFortuneCookie() {
        const fortunes = [
            "A cup of warm kindness will solve what heavy worry couldn't. ☕✨",
            "The magic you are looking for is in your gentle consistency. 🌸",
            "An unexpected lovely moment will make you smile today! 💌",
            "You do not need to bloom every second. Winter is where roots grow deep. 🌱",
            "Your cozy vibe is someone else's favorite safe harbor. 💖",
            "A tiny step taken today will make tomorrow much easier! ✨",
            "Stars don't compare their brightness; they just twinkle together. 🌟"
        ];

        const randomMessage = fortunes[Math.floor(Math.random() * fortunes.length)];
        this.data.openedCookieToday = true;
        this.data.cookieMessage = randomMessage;
        this.saveData();

        if (window.soundEngine) window.soundEngine.playCookieCrunch();
        this.addStardust(20, '🥠 Opened Daily Fortune');
        return randomMessage;
    }
}

window.widgetManager = new WidgetManager();
