/**
 * BetterHalf Interactive Voice Communication Engine
 * Features:
 * 1. Speech Recognition (Speech-to-Text): Tap mic and speak with your voice!
 * 2. Speech Synthesis (Text-to-Speech): High-pitch kawaii anime voice + Animalese chatter
 * 3. Two-way conversational chat history log
 */

class VoiceRecognizer {
    constructor(onResult, onStateChange) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.supported = !!SpeechRec;
        this.recognition = SpeechRec ? new SpeechRec() : null;
        this.isListening = false;
        this.onResult = onResult;
        this.onStateChange = onStateChange;

        if (this.recognition) {
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.onStateChange) this.onStateChange(true, "Listening... speak now! 🌸");
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (this.onResult) this.onResult(transcript);
            };

            this.recognition.onerror = (event) => {
                console.warn('SpeechRecognition error:', event.error);
                this.isListening = false;
                let msg = "Could not hear clearly. Try again or tap a voice chip!";
                if (event.error === 'not-allowed') {
                    msg = "Microphone permission blocked. Please allow mic in browser!";
                }
                if (this.onStateChange) this.onStateChange(false, msg);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onStateChange) this.onStateChange(false, "Tap mic to speak again");
            };
        }
    }

    start() {
        if (!this.supported) {
            if (this.onStateChange) this.onStateChange(false, "Microphone not supported on this browser. Try typing or voice chips!");
            return false;
        }

        try {
            if (this.isListening) {
                this.recognition.stop();
                return false;
            }
            this.recognition.start();
            return true;
        } catch (e) {
            console.warn('SpeechRecognition start error:', e);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
}

class CuteVoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.isVoiceEnabled = localStorage.getItem('betterhalf_voice_enabled') !== 'false';
        this.voiceMode = localStorage.getItem('betterhalf_voice_mode') || 'english'; // 'english' or 'chatter'
        this.selectedVoice = null;
        this.isSpeaking = false;
        this.initVoice();
    }

    initVoice() {
        if (!this.synth) return;
        const loadVoices = () => {
            try {
                const voices = this.synth.getVoices();
                if (voices && voices.length > 0) {
                    this.selectedVoice = voices.find(v => 
                        (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha') || 
                         v.name.includes('Zira') || v.name.includes('Victoria') || v.name.includes('Karen') || 
                         v.name.includes('Jenny') || v.name.includes('Natural')) 
                        && v.lang.startsWith('en')
                    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
                }
            } catch(e) {}
        };

        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    toggleVoice() {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        localStorage.setItem('betterhalf_voice_enabled', this.isVoiceEnabled);
        if (!this.isVoiceEnabled) {
            this.stop();
        }
        return this.isVoiceEnabled;
    }

    setVoiceMode(mode) {
        this.voiceMode = mode;
        localStorage.setItem('betterhalf_voice_mode', mode);
        return this.voiceMode;
    }

    setAvatarTalking(talking) {
        this.isSpeaking = talking;
        const avatar = document.getElementById('companion-avatar');
        if (avatar) {
            avatar.classList.toggle('talking-anim', talking);
        }
    }

    speak(text) {
        if (!this.isVoiceEnabled) return;

        let cleanText = text
            .replace(/[*#_~`]/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanText) return;

        if (this.voiceMode === 'chatter') {
            this.playBunnyChatter(cleanText);
            return;
        }

        if (!this.synth) {
            this.playBunnyChatter(cleanText);
            return;
        }

        try {
            this.synth.resume();
            this.synth.cancel();

            setTimeout(() => {
                try {
                    this.synth.resume();
                    const utterance = new SpeechSynthesisUtterance(cleanText);
                    utterance.pitch = 1.45;
                    utterance.rate = 1.05;
                    utterance.volume = 1.0;

                    if (!this.selectedVoice) {
                        this.initVoice();
                    }
                    if (this.selectedVoice) {
                        utterance.voice = this.selectedVoice;
                    }

                    let started = false;
                    utterance.onstart = () => {
                        started = true;
                        this.setAvatarTalking(true);
                    };

                    utterance.onend = () => {
                        this.setAvatarTalking(false);
                    };

                    utterance.onerror = (e) => {
                        console.warn('SpeechSynthesis error, falling back to bunny chatter:', e);
                        this.setAvatarTalking(false);
                        this.playBunnyChatter(cleanText);
                    };

                    this.synth.speak(utterance);

                    // Watchdog fallback if browser blocked TTS or stalled
                    setTimeout(() => {
                        if (!started) {
                            try { this.synth.cancel(); } catch(e){}
                            this.playBunnyChatter(cleanText);
                        }
                    }, 220);

                } catch (innerErr) {
                    this.playBunnyChatter(cleanText);
                }
            }, 60);

        } catch (err) {
            this.playBunnyChatter(cleanText);
        }
    }

    playBunnyChatter(text) {
        if (window.soundEngine) {
            this.setAvatarTalking(true);
            window.soundEngine.playAnimalese(text, () => {
                this.setAvatarTalking(false);
            });
        }
    }

    stop() {
        if (this.synth) {
            try { this.synth.cancel(); } catch(e) {}
        }
        this.setAvatarTalking(false);
    }
}

class LunaAgent {
    constructor() {
        this.voice = new CuteVoiceEngine();
        this.recognizer = null;
        this.petCount = parseInt(localStorage.getItem('betterhalf_pet_count') || '0', 10);
        this.chatHistory = this.loadChat();
    }

    initSpeechRecognition(onStateChange, onTranscriptReceived) {
        this.recognizer = new VoiceRecognizer(
            (transcript) => {
                if (onTranscriptReceived) onTranscriptReceived(transcript);
                this.addUserMessage(transcript);
                this.respondToUser(transcript);
            },
            onStateChange
        );
    }

    toggleListen() {
        if (!this.recognizer) return false;
        return this.recognizer.start();
    }

    loadChat() {
        const saved = localStorage.getItem('betterhalf_chat_history');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }
        return [
            {
                sender: 'luna',
                text: "Hello my favorite friend! ✨ Tap the 🎙️ mic button or prompt chips below to talk with me!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ];
    }

    saveChat() {
        localStorage.setItem('betterhalf_chat_history', JSON.stringify(this.chatHistory.slice(-20)));
    }

    pet() {
        this.petCount += 1;
        localStorage.setItem('betterhalf_pet_count', this.petCount);

        if (window.soundEngine) window.soundEngine.playSparkle();
        if (window.widgetManager) window.widgetManager.addStardust(3, '🐰 Gentle head pats');

        const petResponses = [
            "Hehe, thank you for the pats! You are so sweet! 💕",
            "Aww that tickles! I love spending time with you! ✨",
            "Yay! My ears are wiggling with joy! 🌸",
            "You are the best friend ever! Sending you lots of love! 💖"
        ];
        const speech = petResponses[Math.floor(Math.random() * petResponses.length)];
        this.voice.speak(speech);
        return speech;
    }

    getDailyGoalBriefing() {
        const stats = window.dayPlanner ? window.dayPlanner.getStats() : { total: 0, completed: 0 };
        const highlight = window.dayPlanner ? window.dayPlanner.getHighlight() : '';
        const tasks = window.dayPlanner ? window.dayPlanner.getTasksForDate() : [];
        const activeTasks = tasks.filter(t => !t.completed);

        const currentHour = new Date().getHours();
        let greeting = "Good morning";
        if (currentHour >= 12 && currentHour < 17) greeting = "Good afternoon";
        else if (currentHour >= 17) greeting = "Good evening";

        let message = `${greeting}, sweet friend! 🌸\n\n`;

        if (tasks.length === 0) {
            message += `Your day schedule is totally free right now! Tap 'Add Task' to plant your first easy goal! ✨`;
        } else if (activeTasks.length === 0) {
            message += `🎉 Wow, you finished ALL your tasks today! You did so well! Now it's time to drink some hot cocoa and relax.`;
        } else {
            message += `You have **${activeTasks.length} easy goal${activeTasks.length > 1 ? 's' : ''}** to do today.\n\n`;
            if (highlight) {
                message += `⭐ **Your Main Goal**: "${highlight}"\nIf you only finish this one thing today, your day is already a big win!\n\n`;
            }
            message += `💡 **My Cozy Tip**: Do the easiest task first to feel happy and proud! You can do it! 🐰`;
        }

        return message;
    }

    getAstrologyBriefing() {
        if (!window.astrologyEngine) return "The stars are glowing gently today ✨";
        const reading = window.astrologyEngine.getDailyReading();

        let message = `🌌 **Today's Star Vibe for ${reading.sign.name} ${reading.sign.symbol}**:\n\n`;
        message += `🪐 **Sky Mood**: ${reading.transit}\n\n`;
        message += `💫 **Your Best Friend Sign Today**: **${reading.compatibility.partnerSign}** (${reading.compatibility.score}% match!) — *${reading.compatibility.advice}*\n\n`;
        message += `✨ **Lucky Item**: ${reading.lucky.charm} • Best Focus Time: ${reading.lucky.hour}\n\n`;
        message += `🔮 **Today's Sweet Message**: "${reading.horoscope}"`;

        return message;
    }

    respondToUser(userText) {
        const text = userText.trim();
        const lower = text.toLowerCase();
        let reply = "";

        // 1. Natural Language Task Creation: "add task ...", "new task ...", "remind me to ..."
        const addTaskMatch = lower.match(/^(?:add\s+(?:a\s+)?task(?:\s+to)?|new\s+task(?:\s+to)?|remind\s+me\s+to|schedule|plan\s+task)\s+(.+)/i);
        if (addTaskMatch && addTaskMatch[1]) {
            const taskTitleRaw = addTaskMatch[1].trim();
            const cleanTitle = taskTitleRaw.charAt(0).toUpperCase() + taskTitleRaw.slice(1);
            
            // Determine time block
            let timeBlock = 'morning';
            if (lower.includes('afternoon') || lower.includes('noon')) timeBlock = 'afternoon';
            else if (lower.includes('evening') || lower.includes('tonight')) timeBlock = 'evening';
            else if (lower.includes('night') || lower.includes('bedtime')) timeBlock = 'night';
            else {
                const hour = new Date().getHours();
                if (hour >= 12 && hour < 17) timeBlock = 'afternoon';
                else if (hour >= 17 && hour < 21) timeBlock = 'evening';
                else if (hour >= 21) timeBlock = 'night';
            }

            if (window.dayPlanner) {
                window.dayPlanner.addTask(cleanTitle, 'Cozy', timeBlock, 2, 15, false);
                if (window.BetterHalfApp) {
                    window.BetterHalfApp.renderPlannerView();
                    window.BetterHalfApp.renderHeaderStats();
                }
            }
            if (window.soundEngine) window.soundEngine.playSparkle();
            if (window.createSparkleBurst) window.createSparkleBurst();

            reply = `✨ Done! I added **"${cleanTitle}"** to your ${timeBlock} schedule! You're going to do great! 🌸`;
        }
        // 2. Hydration: "i drank water", "drink water", "add water", "water"
        else if (/\b(drank|drink|glass|cup)\s+water\b/i.test(lower) || lower === 'water' || lower === 'add water' || lower === 'drink') {
            if (window.widgetManager) {
                window.widgetManager.addWater();
                if (window.BetterHalfApp) {
                    window.BetterHalfApp.renderHydrationWidget();
                    window.BetterHalfApp.renderHeaderStats();
                }
                const count = window.widgetManager.data.waterGlasses;
                const goal = window.widgetManager.data.waterGoal;
                reply = `💧 Yay! Recorded a fresh cup of water! You are at **${count} / ${goal} Cups** today! Stay fresh and glowing! 🌸`;
            } else {
                reply = "💧 Good job drinking water! Stay refreshed and take care of your body! ✨";
            }
        }
        // 3. Fortune Cookie: "fortune", "cookie", "lucky"
        else if (/\b(fortune|cookie|lucky cookie)\b/i.test(lower)) {
            const fortunes = [
                "A gentle breeze brings sweet news and peaceful thoughts today. 🌸",
                "You are capable of far more than your worries tell you. ✨",
                "A tiny seed you plant today will bloom into a beautiful garden. 🌱",
                "Your kindness is a superpower that warms everyone around you. 💖",
                "Resting today is giving yourself permission to shine tomorrow. 🫖"
            ];
            const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
            if (window.soundEngine) window.soundEngine.playSparkle();
            reply = `🥠 **Crunch! Here is your lucky fortune**:\n\n*"${fortune}"* ✨`;
        }
        // 4. Streak / XP Check: "streak", "xp", "stardust"
        else if (/\b(streak|flame|stardust|xp|points|score)\b/i.test(lower)) {
            const streak = window.widgetManager ? window.widgetManager.data.streak : 0;
            const xp = window.widgetManager ? window.widgetManager.data.stardustXP : 0;
            if (streak === 0) {
                reply = `🔥 Your streak is currently at **0 Days**! Finish any easy task or log your water to light your first magic flame! You also have **${xp} ✨ Stardust XP**!`;
            } else {
                reply = `🔥 You have an active **${streak}-Day Magic Streak** and **${xp} ✨ Stardust XP**! Keep checking in with me daily to keep your flame glowing! ⭐`;
            }
        }
        // 5. Rain Ambience: "rain", "rain sound", "relaxing music"
        else if (/\b(rain|ambient|white noise|sound of rain)\b/i.test(lower)) {
            if (window.soundEngine) {
                const active = window.soundEngine.toggleAmbient('rain');
                const ambientBtn = document.getElementById('btn-ambient-toggle');
                if (ambientBtn) {
                    ambientBtn.classList.toggle('active', active);
                    ambientBtn.innerHTML = active ? '🌧️ Rain: Playing' : '🌧️ Rain Ambience';
                }
                reply = active 
                    ? "🌧️ Cozy rain is now playing in the background! Enjoy the gentle raindrops as you relax... 🍵" 
                    : "🌧️ Rain ambience has been turned off! ☀️";
            } else {
                reply = "🌧️ Cozy rain sounds are lovely for focus and rest! 🌸";
            }
        }
        // 6. Greetings: "hi", "hello", "hey", "good morning", "good evening", etc.
        else if (/^(hi|hello|hey|heyy|heya|howdy|sup|good morning|good afternoon|good evening)\b/i.test(lower)) {
            const greetings = [
                "Hi my sweet friend! 🐰✨ It brings me so much joy to chat with you! How is your cozy day going?",
                "Hello hello! 🌸 Luna here, with happy ears wiggling! What would you like to accomplish today?",
                "Hey there, wonderful human! 💖 I'm so happy you're here. Let me know if you want to plan your day or check the stars!"
            ];
            reply = greetings[Math.floor(Math.random() * greetings.length)];
        }
        // 7. Identity & Introduction: "who are you", "what is your name", "what are you"
        else if (/who (are|r) you|what is your name|what('s| is) betterhalf|introduce yourself/i.test(lower)) {
            reply = `I am **Luna**, your AI companion and BetterHalf! 🐰💕 I'm here to help you organize your daily goals, track your weekly habits and cycle, check daily astrology, and cheer you on with cute voice chats. You're never alone! ✨`;
        }
        // 8. Capabilities & Help: "what can you do", "help", "how do you work"
        else if (/what can you do|how (do|can) you help|commands|features/i.test(lower) || lower === 'help') {
            reply = `Here is what we can do together! 🐰✨\n\n` +
                    `⭐ **Plan Tasks**: Say *"Add task buy tea"* or *"What are my goals today?"*\n` +
                    `🌌 **Astrology**: Say *"Check my stars"* or ask about your zodiac sign like *"Aries"* or *"Taurus"*\n` +
                    `💧 **Water**: Say *"I drank water"* to fill your cup\n` +
                    `🥠 **Fortunes**: Say *"Open fortune cookie"*\n` +
                    `🔥 **Streaks**: Ask *"What is my streak?"*\n` +
                    `🌙 **Cycle Care**: Ask *"How is my cycle today?"*\n` +
                    `🌧️ **Ambience**: Say *"Play rain"* for cozy sounds\n` +
                    `💬 **Chat**: Ask for a joke, 5-minute break, or tell me how you feel! 🌸`;
        }
        // 9. Status & "How are you?":
        else if (/how are you|how('s| is) it going|how do you feel/i.test(lower)) {
            reply = `I'm feeling super cozy and happy because I get to chat with you! 🐰💖 My ears are perked up and I'm ready to help you have the sweetest day. How are you feeling today?`;
        }
        // 10. Presence & Readiness: "are you there", "can you hear me", "reply", "test"
        else if (/are you (there|here)|can you hear me|listen to me|reply|test\b/i.test(lower)) {
            reply = `I am right here with you! 🐰 Ears up and listening! I can hear you and reply to all your messages. What would you like to do together? ✨`;
        }
        // 11. Emotional Support: Overwhelmed, Stressed, Tired, Sad, Anxious
        else if (/\b(overwhelm|stress|tired|sad|exhausted|anxious|depressed|cry|crying|scared|worried)\b/i.test(lower)) {
            reply = `Oh sweet friend, take a soft, deep breath with me... Inhale slowly... and exhale gently. 🥺 You don't have to carry the whole world today. Put on fuzzy socks, take a warm sip of tea, and do just one tiny 2-minute step. I am right here by your side! 🌸🧸`;
        }
        // 12. Procrastination / Lazy / Hard task
        else if (/\b(lazy|procrastinat|can't focus|hard task|struggling|unmotivated)\b/i.test(lower)) {
            reply = `It is totally normal to feel this way! 🥧 Let's do the **2-Minute Magic Rule**:\n\n1. Don't worry about finishing the whole thing.\n2. Just open it and look at it for 60 seconds.\n3. If you want to stop, you can stop!\nUsually taking the tiny first step breaks the spell! You've got this! 🐰✨`;
        }
        // 13. Joy / Good Mood / Accomplishment
        else if (/\b(happy|excited|great day|proud|finished|i did it|done with|awesome)\b/i.test(lower)) {
            if (window.soundEngine) window.soundEngine.playChime();
            reply = `🎉 Yay!! That makes me so incredibly happy to hear! Look at you glowing and doing amazing things! Give yourself a warm pat on the back, you earned this smile! ✨🌸`;
        }
        // 14. Day Planner / Goals
        else if (/\b(goal|goals|today|schedule|plan|what should i do|what to do)\b/i.test(lower)) {
            reply = this.getDailyGoalBriefing();
        }
        // 15. Specific Zodiac Sign queries
        else if (/\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i.test(lower)) {
            const signMatch = lower.match(/\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i)[0];
            const signName = signMatch.charAt(0).toUpperCase() + signMatch.slice(1).toLowerCase();
            if (window.astrologyEngine) {
                window.astrologyEngine.userSign = signName;
                localStorage.setItem('betterhalf_user_sign', signName);
            }
            reply = this.getAstrologyBriefing();
        }
        // 16. General Astrology / Horoscope / Stars
        else if (/\b(astrology|horoscope|star|stars|zodiac|vibe|compatibility|partner|sky)\b/i.test(lower)) {
            reply = this.getAstrologyBriefing();
        }
        // 17. Period / Menstrual Cycle
        else if (/\b(period|cramp|cramps|cycle|moon cycle|menstrua|pms|follicular|luteal|ovulat)\b/i.test(lower)) {
            if (window.periodTracker) {
                const status = window.periodTracker.getCycleStatus();
                reply = `🌙 Today is **Day ${status.currentCycleDay}** of your body's rhythm (${status.phase.name}). ${status.phase.focus}. Keep your tummy cozy with a warm water bottle, sip chamomile tea, and take extra restful naps today! 🌸`;
            } else {
                reply = "🌙 Keep your tummy warm, drink warm water or tea, and be extra gentle with your body today! 🌸";
            }
        }
        // 18. Breaks & Self-Care
        else if (/\b(break|recharge|rest|pause|relax)\b/i.test(lower)) {
            const breaks = [
                "Look out your window and find 3 things that are green or fluffy ☁️",
                "Drink 5 slow sips of warm tea without checking your screen 🫖",
                "Roll your shoulders backwards 5 times and wiggle your toes 💆‍♀️",
                "Put on your favorite cute song and sway gently in your room! 🎵"
            ];
            reply = `Here is a cozy 5-minute break just for you:\n\n✨ ${breaks[Math.floor(Math.random() * breaks.length)]}`;
        }
        // 19. Jokes
        else if (/\b(joke|funny|laugh|humor)\b/i.test(lower)) {
            const jokes = [
                "Why did the bunny sit on the clock? To be on time! 🐰⏰",
                "What do you call a sleeping dinosaur? A dino-snore! 🦖💤",
                "Why did the strawberry cry? Because its mom was in a jam! 🍓🤣",
                "What is a cute bunny's favorite type of music? Hip-hop! 🎶🐰"
            ];
            reply = jokes[Math.floor(Math.random() * jokes.length)];
        }
        // 20. Kindness & Love
        else if (/\b(thank you|thanks|love you|you('re| are) cute|sweet|best friend)\b/i.test(lower)) {
            reply = `Awww, you make my heart so happy! 💖 Thank YOU for being so kind and sweet. Having you here makes my whole world brighter! 🐰🌸`;
        }
        // 21. Dynamic Reflection Fallback (Acknowledges whatever user said!)
        else {
            const snippet = text.length > 40 ? text.substring(0, 40) + '...' : text;
            reply = `I hear you saying "${snippet}"! 🐰 I'm right here with you. Remember to take things one gentle step at a time today. You can ask me to add a task, check today's stars, or give you a quick break idea! 🌸`;
        }

        // Voice reply out loud!
        this.voice.speak(reply);

        const botMsg = {
            sender: 'luna',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.chatHistory.push(botMsg);
        this.saveChat();
        if (window.soundEngine) window.soundEngine.playPop();

        // Update UI chat view if helper exists
        if (window.BetterHalfApp && window.BetterHalfApp.renderChatHistory) {
            window.BetterHalfApp.renderChatHistory();
        }

        return botMsg;
    }

    addUserMessage(text) {
        const userMsg = {
            sender: 'user',
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.chatHistory.push(userMsg);
        this.saveChat();

        if (window.BetterHalfApp && window.BetterHalfApp.renderChatHistory) {
            window.BetterHalfApp.renderChatHistory();
        }
        return userMsg;
    }
}

window.lunaAgent = new LunaAgent();
