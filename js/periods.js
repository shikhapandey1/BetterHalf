/**
 * Period & Body Rhythm Tracker
 * Gentle and loving cycle tracking with simple, comforting advice.
 */

class PeriodTracker {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const saved = localStorage.getItem('betterhalf_period_data');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }

        const today = new Date();
        const lastPeriodStart = new Date(today);
        lastPeriodStart.setDate(today.getDate() - 13); // currently Day 14 (Glowing Phase)

        return {
            lastStartDate: lastPeriodStart.toISOString().split('T')[0],
            cycleLength: 28,
            periodDuration: 5,
            logs: {}
        };
    }

    saveData() {
        localStorage.setItem('betterhalf_period_data', JSON.stringify(this.data));
    }

    getCycleStatus(targetDate = new Date()) {
        const lastStart = new Date(this.data.lastStartDate);
        const diffTime = targetDate.getTime() - lastStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const cycleLength = this.data.cycleLength || 28;
        const currentCycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
        const daysUntilNext = cycleLength - currentCycleDay;

        let phase = {
            id: 'menstrual',
            name: 'Cozy Rest Phase 🌙🩸',
            shortName: 'Rest & Warmth',
            energy: 'Low & Gentle 🕯️',
            focus: 'Lots of rest, cozy blankets, warm hugs & hot tea',
            nutrition: 'Warm vegetable soup, iron-rich greens & dark chocolate',
            movement: 'Soft stretching, lying in bed, slow deep breaths'
        };

        if (currentCycleDay > this.data.periodDuration && currentCycleDay <= 12) {
            phase = {
                id: 'follicular',
                name: 'Fresh Energy Phase 🌱✨',
                shortName: 'Rising Energy',
                energy: 'Rising & Cheerful 🚀',
                focus: 'Trying new hobbies, fun learning & playful ideas',
                nutrition: 'Fresh juicy fruits, crunchy salads & berry smoothies',
                movement: 'Fun music dance break, quick walk in the park'
            };
        } else if (currentCycleDay >= 13 && currentCycleDay <= 16) {
            phase = {
                id: 'ovulatory',
                name: 'Super Glowing Phase 🌸☀️',
                shortName: 'High Radiance',
                energy: 'Peak Energy & Smiles 👑',
                focus: 'Hanging out with friends, talking & feeling confident',
                nutrition: 'Light colorful meals, lots of water & avocado',
                movement: 'Any fun workout, dancing, jumping or jogging'
            };
        } else if (currentCycleDay > 16) {
            phase = {
                id: 'luteal',
                name: 'Cozy Nesting Phase 🦔☕',
                shortName: 'Slow & Steady',
                energy: 'Calm & Grounded 🍂',
                focus: 'Tidying your room, finishing small tasks & early bedtime',
                nutrition: 'Warm cooked food, nuts, bananas & chamomile tea',
                movement: 'Calm walks, peaceful bedtime stretching'
            };
        }

        const nextPeriodDate = new Date(lastStart);
        nextPeriodDate.setDate(lastStart.getDate() + (Math.floor(diffDays / cycleLength) + 1) * cycleLength);

        return {
            currentCycleDay,
            cycleLength,
            daysUntilNext: daysUntilNext === 0 ? cycleLength : daysUntilNext,
            phase,
            nextPeriodDate: nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    }

    logToday(entry) {
        const todayKey = new Date().toISOString().split('T')[0];
        this.data.logs[todayKey] = {
            ...this.data.logs[todayKey],
            ...entry,
            updatedAt: new Date().toISOString()
        };
        this.saveData();
    }

    getTodayLog() {
        const todayKey = new Date().toISOString().split('T')[0];
        return this.data.logs[todayKey] || {
            flow: 'none',
            symptoms: [],
            mood: 'peaceful'
        };
    }
}

window.periodTracker = new PeriodTracker();
