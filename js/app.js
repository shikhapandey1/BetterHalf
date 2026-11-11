/**
 * Main Application Controller for BetterHalf
 * Two-Way Voice Communication: Speech Recognition (Mic) + Speech Synthesis (Voice)
 */

window.createSparkleBurst = function(x, y) {
    const canvas = document.getElementById('sparkle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const startX = x || window.innerWidth / 2;
    const startY = y || window.innerHeight / 2;
    const particles = [];
    const colors = ['#ff8da9', '#fed166', '#98e6b8', '#9bc5ff', '#efe6fd', '#ffffff'];

    for (let i = 0; i < 32; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            size: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: Math.random() * 0.025 + 0.015,
            shape: Math.random() > 0.5 ? 'star' : 'circle'
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        particles.forEach(p => {
            if (p.alpha > 0) {
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12;
                p.alpha -= p.decay;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;

                if (p.shape === 'star') {
                    drawStar(ctx, p.x, p.y, 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });

        if (alive) {
            requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    requestAnimationFrame(render);
};

const BetterHalfApp = {
    currentTab: 'day-planner',
    lastSpeechText: "Hello my favorite friend! Tap the 🎙️ mic or prompt buttons below to talk with me!",

    init() {
        this.bindEvents();
        this.initVoiceRecognition();
        this.renderHeaderStats();
        this.renderCompanionAvatar();
        this.renderActiveTab();
        this.renderHydrationWidget();
        this.renderFortuneWidget();
        this.renderChatHistory();

        const briefing = window.lunaAgent.getDailyGoalBriefing();
        this.updateCompanionSpeech(briefing);
    },

    initVoiceRecognition() {
        const micBtn = document.getElementById('btn-mic-talk');
        const micLabel = document.getElementById('mic-status-label');

        if (window.lunaAgent) {
            window.lunaAgent.initSpeechRecognition(
                (isListening, statusMsg) => {
                    if (micBtn) {
                        micBtn.classList.toggle('recording-active', isListening);
                    }
                    if (micLabel) {
                        micLabel.innerText = statusMsg;
                    }
                },
                (transcript) => {
                    if (micLabel) micLabel.innerText = `You said: "${transcript}"`;
                    this.renderChatHistory();
                }
            );
        }

        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                if ('speechSynthesis' in window) window.speechSynthesis.resume();

                const started = window.lunaAgent.toggleListen();
                if (!started && micLabel) {
                    // If SpeechRecognition isn't available or blocked
                    if (!window.lunaAgent.recognizer || !window.lunaAgent.recognizer.supported) {
                        alert("Microphone speech recognition is not supported in this window. You can tap any voice chip or type in the box below to talk!");
                    }
                }
            });
        }
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.switchTab(targetTab);
                if (window.soundEngine) window.soundEngine.playPop();
            });
        });

        // Master Voice Toggle
        const voiceBtn = document.getElementById('btn-voice-toggle');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const isEnabled = window.lunaAgent.voice.toggleVoice();
                voiceBtn.innerHTML = isEnabled ? '🔊 Cute Voice: On' : '🔇 Cute Voice: Off';
                if (isEnabled) {
                    window.lunaAgent.voice.speak("Yay! My cute voice is turned back on!");
                }
            });
            voiceBtn.innerHTML = window.lunaAgent.voice.isVoiceEnabled ? '🔊 Cute Voice: On' : '🔇 Cute Voice: Off';
        }

        // Voice Mode Switcher: English Voice <-> Bunny Chatter
        const voiceModeBtn = document.getElementById('btn-voice-mode');
        if (voiceModeBtn) {
            const updateModeLabel = () => {
                const mode = window.lunaAgent.voice.voiceMode;
                voiceModeBtn.innerHTML = mode === 'english' ? '🗣️ Mode: Spoken English' : '🐾 Mode: Bunny Chatter';
            };
            updateModeLabel();

            voiceModeBtn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const current = window.lunaAgent.voice.voiceMode;
                const next = current === 'english' ? 'chatter' : 'english';
                window.lunaAgent.voice.setVoiceMode(next);
                updateModeLabel();
                window.lunaAgent.voice.speak(next === 'english' ? "Switched to spoken English voice!" : "Switched to cute bunny chatter!");
            });
        }

        // Big "Listen to Voice" Button in companion card
        const speakBubbleBtn = document.getElementById('btn-listen-speech');
        if (speakBubbleBtn) {
            speakBubbleBtn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                if ('speechSynthesis' in window) window.speechSynthesis.resume();

                if (this.lastSpeechText) {
                    window.lunaAgent.voice.speak(this.lastSpeechText);
                } else {
                    window.lunaAgent.voice.speak("Hello! I am your BetterHalf companion! Tap the mic button to speak with me!");
                }
            });
        }

        // Sound Mute Toggle
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isMuted = window.soundEngine.toggleMute();
                soundBtn.innerHTML = isMuted ? '🔕' : '🔔';
                soundBtn.title = isMuted ? 'Sound Muted' : 'Sound On';
            });
            soundBtn.innerHTML = window.soundEngine.isMuted ? '🔕' : '🔔';
        }

        // Ambient Rain Sound Toggle
        const ambientBtn = document.getElementById('btn-ambient-toggle');
        if (ambientBtn) {
            ambientBtn.addEventListener('click', () => {
                const active = window.soundEngine.toggleAmbient('rain');
                ambientBtn.classList.toggle('active', active);
                ambientBtn.innerHTML = active ? '🌧️ Rain: Playing' : '🌧️ Rain Ambience';
            });
        }

        // Pet the companion
        const avatar = document.getElementById('companion-avatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const speech = window.lunaAgent.pet();
                this.updateCompanionSpeech(speech);
                this.renderHeaderStats();
                this.renderChatHistory();

                const rect = avatar.getBoundingClientRect();
                window.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
            });
        }

        // Quick prompts
        document.querySelectorAll('.btn-chip-prompt').forEach(chip => {
            chip.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const prompt = chip.getAttribute('data-prompt');
                this.handleCompanionPrompt(prompt);
            });
        });

        // Chat input form
        const chatForm = document.getElementById('companion-chat-form');
        const chatInput = document.getElementById('companion-user-input');
        const chatSend = document.getElementById('companion-btn-send');

        const doSend = () => {
            if (window.soundEngine) window.soundEngine.init();
            if ('speechSynthesis' in window) window.speechSynthesis.resume();
            if (!chatInput) return;
            const val = chatInput.value.trim();
            if (!val) return;
            chatInput.value = '';
            this.handleCompanionPrompt(val);
        };

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                doSend();
            });
        }
        if (chatSend) {
            chatSend.addEventListener('click', (e) => {
                e.preventDefault();
                doSend();
            });
        }
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    doSend();
                }
            });
        }

        this.bindModals();
    },

    renderChatHistory() {
        const stream = document.getElementById('companion-chat-stream');
        if (!stream || !window.lunaAgent) return;

        const history = window.lunaAgent.chatHistory.slice(-8); // last 8 messages
        stream.innerHTML = history.map(m => `
            <div class="chat-bubble-row ${m.sender === 'user' ? 'user' : 'luna'}">
                <div class="chat-msg-pill">
                    ${m.sender === 'user' ? '<strong>You:</strong> ' : '<strong>🐰 Luna:</strong> '}
                    ${this.formatMarkdownText(m.text)}
                </div>
            </div>
        `).join('');

        stream.scrollTop = stream.scrollHeight;
    },

    switchTab(tabId) {
        this.currentTab = tabId;
        document.querySelectorAll('.nav-tab').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
        });

        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.style.display = panel.id === `view-${tabId}` ? 'block' : 'none';
        });

        this.renderActiveTab();
    },

    renderHeaderStats() {
        const streakEl = document.getElementById('header-streak-count');
        const stardustEl = document.getElementById('header-stardust-count');
        if (streakEl && window.widgetManager) {
            streakEl.innerText = window.widgetManager.data.streak;
        }
        if (stardustEl && window.widgetManager) {
            stardustEl.innerText = window.widgetManager.data.stardustXP;
        }
    },

    renderCompanionAvatar() {
        const container = document.getElementById('companion-avatar');
        if (!container) return;

        container.innerHTML = `
            <svg class="avatar-svg-container" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="30" r="3" fill="#fed166" opacity="0.8"/>
                <circle cx="120" cy="40" r="2.5" fill="#ff8da9" opacity="0.8"/>
                <polygon points="115,20 117,25 122,27 117,29 115,34 113,29 108,27 113,25" fill="#fed166" opacity="0.9"/>
                
                <g class="bunny-ears">
                    <ellipse cx="50" cy="35" rx="13" ry="32" transform="rotate(-12 50 35)" fill="#fff5f8" stroke="#ffbccc" stroke-width="3"/>
                    <ellipse cx="50" cy="35" rx="7" ry="22" transform="rotate(-12 50 35)" fill="#ff9ebb" opacity="0.75"/>
                    
                    <ellipse cx="90" cy="35" rx="13" ry="32" transform="rotate(12 90 35)" fill="#fff5f8" stroke="#ffbccc" stroke-width="3"/>
                    <ellipse cx="90" cy="35" rx="7" ry="22" transform="rotate(12 90 35)" fill="#ff9ebb" opacity="0.75"/>
                </g>

                <ellipse cx="70" cy="85" rx="44" ry="40" fill="#fff5f8" stroke="#ffbccc" stroke-width="3"/>
                
                <ellipse cx="44" cy="92" rx="9" ry="5.5" fill="#ff8da9" opacity="0.6"/>
                <ellipse cx="96" cy="92" rx="9" ry="5.5" fill="#ff8da9" opacity="0.6"/>

                <ellipse cx="52" cy="82" rx="4.5" ry="6.5" fill="#463b52"/>
                <circle cx="50.5" cy="80" r="2" fill="#ffffff"/>
                
                <ellipse cx="88" cy="82" rx="4.5" ry="6.5" fill="#463b52"/>
                <circle cx="86.5" cy="80" r="2" fill="#ffffff"/>

                <polygon points="70,89 67,86 73,86" fill="#ff5e82"/>
                <path d="M67 91C68.5 93 70 93 70 91C70 93 71.5 93 73 91" stroke="#463b52" stroke-width="2" stroke-linecap="round"/>

                <ellipse cx="55" cy="116" rx="8" ry="6" fill="#fff5f8" stroke="#ffbccc" stroke-width="2"/>
                <ellipse cx="85" cy="116" rx="8" ry="6" fill="#fff5f8" stroke="#ffbccc" stroke-width="2"/>
                
                <circle cx="40" cy="60" r="4.5" fill="#fed166"/>
                <circle cx="36" cy="57" r="3" fill="#ff8da9"/>
                <circle cx="44" cy="57" r="3" fill="#ff8da9"/>
                <circle cx="42" cy="64" r="3" fill="#ff8da9"/>
                <circle cx="38" cy="64" r="3" fill="#ff8da9"/>
            </svg>
        `;
    },

    updateCompanionSpeech(text) {
        this.lastSpeechText = text;
        const bubble = document.getElementById('companion-speech-text');
        if (bubble) {
            bubble.innerHTML = this.formatMarkdownText(text);
        }
    },

    handleCompanionPrompt(promptText) {
        if (!promptText || !promptText.trim()) return;
        const cleanPrompt = promptText.trim();
        window.lunaAgent.addUserMessage(cleanPrompt);
        this.renderChatHistory();

        // Show typing indicator in companion speech box
        const bubble = document.getElementById('companion-speech-text');
        if (bubble) {
            bubble.innerHTML = '<span style="color: #9b72cf; font-weight: 700;">🐰 Luna is thinking... ✨</span>';
        }

        setTimeout(() => {
            const reply = window.lunaAgent.respondToUser(cleanPrompt);
            this.updateCompanionSpeech(reply.text);
            this.renderChatHistory();
        }, 180);
    },

    formatMarkdownText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    },

    renderHydrationWidget() {
        const container = document.getElementById('hydration-drops-row');
        if (!container || !window.widgetManager) return;

        const current = window.widgetManager.data.waterGlasses;
        const goal = window.widgetManager.data.waterGoal;
        const countLabel = document.getElementById('hydration-count-label');
        if (countLabel) countLabel.innerText = `${current} / ${goal} Cups`;

        let html = '';
        for (let i = 1; i <= goal; i++) {
            const isFilled = i <= current;
            html += `<div class="water-drop-icon ${isFilled ? 'filled' : ''}" data-index="${i}">💧</div>`;
        }
        container.innerHTML = html;

        container.querySelectorAll('.water-drop-icon').forEach(drop => {
            drop.addEventListener('click', () => {
                window.widgetManager.addWater();
                this.renderHydrationWidget();
                this.renderHeaderStats();
            });
        });
    },

    renderFortuneWidget() {
        const cookieCard = document.getElementById('cookie-card-box');
        if (!cookieCard || !window.widgetManager) return;

        const isOpened = window.widgetManager.data.openedCookieToday;
        const msg = window.widgetManager.data.cookieMessage;

        if (isOpened && msg) {
            cookieCard.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 6px;">🥠✨</div>
                <div style="font-size: 13.5px; font-weight: 600; color: #463b52; font-style: italic; line-height: 1.5;">"${msg}"</div>
                <button class="btn-chip" id="btn-re-crack" style="margin-top: 10px;">Open another cookie! ✨</button>
            `;
            document.getElementById('btn-re-crack')?.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const newMsg = window.widgetManager.crackFortuneCookie();
                window.lunaAgent.voice.speak(newMsg);
                this.renderFortuneWidget();
                this.renderHeaderStats();
            });
        } else {
            cookieCard.innerHTML = `
                <div style="font-size: 38px; margin-bottom: 6px; cursor: pointer;" id="cookie-click-target">🥠</div>
                <div style="font-size: 13px; font-weight: 600; color: #746385;">Tap to open today's lucky fortune!</div>
            `;
            document.getElementById('cookie-click-target')?.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const fortune = window.widgetManager.crackFortuneCookie();
                window.lunaAgent.voice.speak(fortune);
                this.renderFortuneWidget();
                this.renderHeaderStats();
            });
        }
    },

    renderActiveTab() {
        if (this.currentTab === 'day-planner') {
            this.renderDayPlannerView();
        } else if (this.currentTab === 'week-tracker') {
            this.renderWeekTrackerView();
        } else if (this.currentTab === 'periods-tracker') {
            this.renderPeriodTrackerView();
        } else if (this.currentTab === 'sanctuary-goals') {
            this.renderGoalsSanctuaryView();
        } else if (this.currentTab === 'astrology-compartment') {
            this.renderAstrologyView();
        }
    },

    renderDayPlannerView() {
        const dateDisplay = document.getElementById('planner-date-title');
        if (dateDisplay && window.dayPlanner) {
            const d = window.dayPlanner.currentDate;
            dateDisplay.innerText = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        }

        const highlightText = document.getElementById('highlight-display-text');
        if (highlightText && window.dayPlanner) {
            const h = window.dayPlanner.getHighlight();
            highlightText.innerText = h || 'Tap below to add your main goal for today ⭐';
        }

        const blocks = ['morning', 'afternoon', 'evening', 'night'];
        const allTasks = window.dayPlanner ? window.dayPlanner.getTasksForDate() : [];

        blocks.forEach(block => {
            const container = document.getElementById(`tasks-${block}`);
            if (!container) return;

            const tasksInBlock = allTasks.filter(t => (t.timeBlock || 'morning') === block);
            if (tasksInBlock.length === 0) {
                container.innerHTML = `<div style="font-size: 12.5px; color: #9f8ea8; font-style: italic; padding: 6px;">Nothing here yet ~ relaxing time! 🌸</div>`;
            } else {
                container.innerHTML = tasksInBlock.map(t => `
                    <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
                        <div class="task-left">
                            <div class="custom-checkbox btn-toggle-task" data-id="${t.id}">
                                ${t.completed ? '✓' : ''}
                            </div>
                            <div class="task-details">
                                <span class="task-title">${t.title}</span>
                                <div class="task-meta">
                                    <span class="badge-tag ${this.getCategoryClass(t.category)}">${t.category}</span>
                                    <span>⏱️ ${t.duration || 15}m</span>
                                    <span>${'⭐'.repeat(t.priority || 1)}</span>
                                    ${t.isHighlight ? '<span style="color: #d97706; font-weight:700;">★ Main Focus</span>' : ''}
                                </div>
                            </div>
                        </div>
                        <button class="btn-task-del" data-id="${t.id}" title="Remove">🗑️</button>
                    </div>
                `).join('');
            }
        });

        document.querySelectorAll('.btn-toggle-task').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const id = btn.getAttribute('data-id');
                window.dayPlanner.toggleTask(id);
                this.renderDayPlannerView();
                this.renderHeaderStats();
            });
        });

        document.querySelectorAll('.btn-task-del').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.dayPlanner.deleteTask(id);
                this.renderDayPlannerView();
            });
        });
    },

    getCategoryClass(cat) {
        if (!cat) return 'tag-work';
        const c = cat.toLowerCase();
        if (c.includes('self')) return 'tag-selfcare';
        if (c.includes('creative')) return 'tag-creative';
        if (c.includes('chore')) return 'tag-chore';
        if (c.includes('rest')) return 'tag-rest';
        return 'tag-work';
    },

    renderWeekTrackerView() {
        const container = document.getElementById('week-matrix-container');
        if (!container || !window.weekTracker) return;

        const days = window.weekTracker.getWeekDays();
        const habits = window.weekTracker.habits;

        let tableHtml = `
            <table class="week-matrix-table">
                <thead>
                    <tr>
                        <th class="habit-row-header">Good Habits 🌸</th>
                        ${days.map(d => `
                            <th class="${d.isToday ? 'today-col' : ''}">
                                <div>${d.name}</div>
                                <div style="font-size: 11px; font-weight: 500;">${d.dateNum} ${d.month}</div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        habits.forEach(h => {
            tableHtml += `
                <tr>
                    <td class="habit-row-header">
                        <span style="margin-right: 6px;">${h.icon || '🌸'}</span>
                        <span>${h.name}</span>
                    </td>
                    ${days.map(d => {
                        const isBloomed = h.history && h.history[d.key];
                        return `
                            <td class="habit-cell ${d.isToday ? 'today-col' : ''}">
                                <div class="habit-bubble ${isBloomed ? 'bloomed' : ''}" 
                                     data-habit="${h.id}" 
                                     data-date="${d.key}">
                                    ${isBloomed ? '🌸' : ''}
                                </div>
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;

        container.querySelectorAll('.habit-bubble').forEach(b => {
            b.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const habitId = b.getAttribute('data-habit');
                const dateKey = b.getAttribute('data-date');
                window.weekTracker.toggleHabit(habitId, dateKey);
                this.renderWeekTrackerView();
                this.renderHeaderStats();
            });
        });

        const stats = window.weekTracker.getWeeklyStats();
        const statsText = document.getElementById('weekly-stats-text');
        const progressBar = document.getElementById('weekly-progress-fill');
        if (statsText) statsText.innerText = `${stats.completed} of ${stats.totalPossible} habits done this week (${stats.percent}%)`;
        if (progressBar) progressBar.style.width = `${stats.percent}%`;
    },

    renderPeriodTrackerView() {
        if (!window.periodTracker) return;
        const status = window.periodTracker.getCycleStatus();

        const dayNumber = document.getElementById('cycle-day-number');
        const phaseName = document.getElementById('cycle-phase-name');
        const countdown = document.getElementById('cycle-countdown-label');
        const progressRing = document.getElementById('cycle-ring-progress-circle');

        if (dayNumber) dayNumber.innerText = status.currentCycleDay;
        if (phaseName) phaseName.innerText = status.phase.name;
        if (countdown) countdown.innerText = `Next period in ~${status.daysUntilNext} days (${status.nextPeriodDate})`;

        if (progressRing) {
            const circumference = 471;
            const progress = (status.currentCycleDay / status.cycleLength);
            const offset = circumference - (progress * circumference);
            progressRing.style.strokeDashoffset = offset;
        }

        const focusTip = document.getElementById('cycle-tip-focus');
        const nutritionTip = document.getElementById('cycle-tip-nutrition');
        const movementTip = document.getElementById('cycle-tip-movement');

        if (focusTip) focusTip.innerText = status.phase.focus;
        if (nutritionTip) nutritionTip.innerText = status.phase.nutrition;
        if (movementTip) movementTip.innerText = status.phase.movement;

        const todayLog = window.periodTracker.getTodayLog();
        document.querySelectorAll('.btn-flow-select').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-flow') === todayLog.flow);
            b.onclick = () => {
                window.periodTracker.logToday({ flow: b.getAttribute('data-flow') });
                this.renderPeriodTrackerView();
                if (window.soundEngine) window.soundEngine.playPop();
            };
        });
    },

    renderGoalsSanctuaryView() {
        const container = document.getElementById('sanctuary-goals-grid');
        if (!container || !window.goalsSanctuary) return;

        const goals = window.goalsSanctuary.goals;
        if (goals.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 40px; color: #9f8ea8; grid-column: 1 / -1;">No pressure goals right now. You can add one below! ✨</div>`;
            return;
        }

        container.innerHTML = goals.map(g => {
            const isReleased = g.status === 'released';
            const isSprouted = g.status === 'sprouted';
            let statusBadge = isReleased ? '🕊️ Let Go with Love' : isSprouted ? '🌱 Sprouted into Today' : '💤 Sleeping Peacefully';

            return `
                <div class="dream-seed-card ${isReleased ? 'released' : ''}" data-id="${g.id}">
                    <span class="seed-status-badge">${statusBadge}</span>
                    <div>
                        <h4 style="font-family: 'Fredoka', cursive; font-size: 15.5px; margin-bottom: 5px; padding-right: 90px; color: #463b52;">
                            ${g.title}
                        </h4>
                        <div class="dream-why-box">
                            <strong>Why I felt I had to do this:</strong><br/>
                            ${g.reason}
                        </div>
                        ${g.microStep ? `
                            <div class="dream-micro-box">
                                <strong>Tiny 30-Second Baby Step (only if you feel like it):</strong><br/>
                                ${g.microStep}
                            </div>
                        ` : ''}
                    </div>

                    <div class="dream-actions">
                        ${!isReleased && !isSprouted ? `
                            <button class="btn-chip btn-sprout-goal" data-id="${g.id}">
                                🌟 Try Tiny Step Today
                            </button>
                            <button class="btn-chip btn-release-goal" data-id="${g.id}" style="border-color: #ffd1df; color: #d81b60;">
                                🕊️ Release (No Guilt!)
                            </button>
                        ` : ''}
                        ${isSprouted ? `<span style="font-size: 12px; color: #166534; font-weight:700;">Added to Today's Planner! ✨</span>` : ''}
                        ${isReleased ? `<span style="font-size: 12px; color: #746385; font-style:italic;">Released with peace (+50 Stardust) 💖</span>` : ''}
                        <button class="btn-task-del btn-del-goal" data-id="${g.id}" style="margin-left: auto;">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.btn-sprout-goal').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const id = btn.getAttribute('data-id');
                window.goalsSanctuary.sproutGoal(id);
                if (window.soundEngine) window.soundEngine.playSparkle();
                window.createSparkleBurst();
                this.renderGoalsSanctuaryView();
            });
        });

        container.querySelectorAll('.btn-release-goal').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.init();
                const id = btn.getAttribute('data-id');
                window.goalsSanctuary.releaseGoal(id);
                if (window.soundEngine) window.soundEngine.playChime();
                window.createSparkleBurst();
                this.renderGoalsSanctuaryView();
                this.renderHeaderStats();
            });
        });

        container.querySelectorAll('.btn-del-goal').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.goalsSanctuary.deleteGoal(id);
                this.renderGoalsSanctuaryView();
            });
        });
    },

    renderAstrologyView() {
        if (!window.astrologyEngine) return;
        const reading = window.astrologyEngine.getDailyReading();

        const signContainer = document.getElementById('astrology-sign-selector');
        if (signContainer) {
            signContainer.innerHTML = ZODIAC_SIGNS.map(s => `
                <button class="btn-chip ${s.id === window.astrologyEngine.selectedSignId ? 'active' : ''}" 
                        data-sign="${s.id}" 
                        style="${s.id === window.astrologyEngine.selectedSignId ? 'background: #ebd8fc; border-color: #9b72cf; font-weight:700;' : ''}">
                    ${s.symbol} ${s.name}
                </button>
            `).join('');

            signContainer.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const signId = btn.getAttribute('data-sign');
                    window.astrologyEngine.setSign(signId);
                    this.renderAstrologyView();
                    if (window.soundEngine) window.soundEngine.playPop();
                });
            });
        }

        const transitEl = document.getElementById('astro-transit-text');
        const horoscopeEl = document.getElementById('astro-horoscope-text');
        const charmEl = document.getElementById('astro-lucky-charm');
        const compatSign = document.getElementById('astro-compat-sign');
        const compatScore = document.getElementById('astro-compat-score');
        const compatAdvice = document.getElementById('astro-compat-advice');

        if (transitEl) transitEl.innerText = reading.transit;
        if (horoscopeEl) horoscopeEl.innerText = `"${reading.horoscope}"`;
        if (charmEl) charmEl.innerText = `Lucky Item: ${reading.lucky.charm} • Best Hour: ${reading.lucky.hour}`;
        if (compatSign) compatSign.innerText = reading.compatibility.partnerSign;
        if (compatScore) compatScore.innerText = `${reading.compatibility.score}% Match (${reading.compatibility.vibe})`;
        if (compatAdvice) compatAdvice.innerText = reading.compatibility.advice;

        this.setBarWidth('bar-focus', reading.energy.focus);
        this.setBarWidth('bar-intuition', reading.energy.intuition);
        this.setBarWidth('bar-social', reading.energy.social);
        this.setBarWidth('bar-rest', reading.energy.restNeeded);

        this.renderTarotCard();
    },

    setBarWidth(id, pct) {
        const el = document.getElementById(id);
        if (el) el.style.width = `${pct}%`;
    },

    renderTarotCard() {
        const cardBox = document.getElementById('tarot-card-flip');
        if (!cardBox || !window.astrologyEngine) return;

        const { card, isFlipped } = window.astrologyEngine.getTodayCard();

        cardBox.className = `tarot-card-inner ${isFlipped ? 'flipped' : ''}`;
        const frontName = document.getElementById('tarot-card-name');
        const frontSubtitle = document.getElementById('tarot-card-subtitle');
        const frontMeaning = document.getElementById('tarot-card-meaning');
        const frontTask = document.getElementById('tarot-card-magic-task');

        if (frontName) frontName.innerText = card.name;
        if (frontSubtitle) frontSubtitle.innerText = card.subtitle;
        if (frontMeaning) frontMeaning.innerText = card.meaning;
        if (frontTask) frontTask.innerText = card.magicTask;

        cardBox.onclick = () => {
            if (window.soundEngine) window.soundEngine.init();
            window.astrologyEngine.revealTodayCard();
            cardBox.classList.add('flipped');
            if (window.soundEngine) window.soundEngine.playSparkle();
            window.createSparkleBurst();
            window.lunaAgent.voice.speak(`${card.name}. ${card.meaning}`);
        };

        const drawAnotherBtn = document.getElementById('btn-draw-card');
        if (drawAnotherBtn) {
            drawAnotherBtn.onclick = () => {
                if (window.soundEngine) window.soundEngine.init();
                const { card: newC } = window.astrologyEngine.getTodayCard(true);
                this.renderTarotCard();
                window.lunaAgent.voice.speak(`New card: ${newC.name}. ${newC.meaning}`);
            };
        }
    },

    bindModals() {
        const btnOpenTaskModal = document.getElementById('btn-open-task-modal');
        const taskModal = document.getElementById('modal-add-task');
        const btnCloseTaskModal = document.getElementById('btn-close-task-modal');
        const formAddTask = document.getElementById('form-add-task');

        if (btnOpenTaskModal && taskModal) {
            btnOpenTaskModal.addEventListener('click', () => {
                taskModal.classList.add('active');
                if (window.soundEngine) window.soundEngine.playPop();
            });
        }
        if (btnCloseTaskModal && taskModal) {
            btnCloseTaskModal.addEventListener('click', () => taskModal.classList.remove('active'));
        }

        if (formAddTask) {
            formAddTask.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('input-task-title').value;
                const category = document.getElementById('select-task-category').value;
                const timeBlock = document.getElementById('select-task-block').value;
                const priority = document.getElementById('select-task-priority').value;
                const duration = document.getElementById('input-task-duration').value;
                const isHighlight = document.getElementById('check-task-highlight').checked;

                if (!title) return;
                window.dayPlanner.addTask(title, category, timeBlock, priority, duration, isHighlight);

                formAddTask.reset();
                taskModal.classList.remove('active');
                this.renderDayPlannerView();
                if (window.soundEngine) window.soundEngine.playPop();
            });
        }

        const btnOpenGoalModal = document.getElementById('btn-open-goal-modal');
        const goalModal = document.getElementById('modal-add-goal');
        const btnCloseGoalModal = document.getElementById('btn-close-goal-modal');
        const formAddGoal = document.getElementById('form-add-goal');

        if (btnOpenGoalModal && goalModal) {
            btnOpenGoalModal.addEventListener('click', () => {
                goalModal.classList.add('active');
                if (window.soundEngine) window.soundEngine.playPop();
            });
        }
        if (btnCloseGoalModal && goalModal) {
            btnCloseGoalModal.addEventListener('click', () => goalModal.classList.remove('active'));
        }

        if (formAddGoal) {
            formAddGoal.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('input-goal-title').value;
                const reason = document.getElementById('input-goal-reason').value;
                const micro = document.getElementById('input-goal-micro').value;

                if (!title) return;
                window.goalsSanctuary.addGoal(title, reason, micro);

                formAddGoal.reset();
                goalModal.classList.remove('active');
                this.renderGoalsSanctuaryView();
                if (window.soundEngine) window.soundEngine.playSparkle();
            });
        }
    }
};

window.BetterHalfApp = BetterHalfApp;

document.addEventListener('DOMContentLoaded', () => {
    BetterHalfApp.init();
});
