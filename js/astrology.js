/**
 * Astrology & Star Vibe Compartment
 * Simple, easy-to-understand daily horoscopes, star matches, and lucky picks
 */

const ZODIAC_SIGNS = [
    { id: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
    { id: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
    { id: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
    { id: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
    { id: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
    { id: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
    { id: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
    { id: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
    { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
    { id: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
    { id: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
    { id: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' }
];

const ORACLE_CARDS = [
    {
        id: 'star-sprout',
        name: 'The Baby Sprout 🌱✨',
        subtitle: 'Fresh Start',
        meaning: 'Small things grow big! A tiny good habit you do today will make you very happy later.',
        magicTask: 'Spend 2 quiet minutes thinking about your favorite dream.'
    },
    {
        id: 'velvet-moon',
        name: 'The Cozy Moon 🌙🫖',
        subtitle: 'Time to Rest',
        meaning: 'You do not have to hurry today. Drink something warm and wrap up in a soft blanket.',
        magicTask: 'Drink a warm cup of water or tea and take 3 deep belly breaths.'
    },
    {
        id: 'wandering-comet',
        name: 'The Bright Star ☄️💫',
        subtitle: 'Fun Idea',
        meaning: 'A fun, creative idea is coming to your mind today! Write it down in a notebook.',
        magicTask: 'Doodle or write down 1 silly, fun idea.'
    },
    {
        id: 'cozy-snail',
        name: 'The Happy Snail 🐌🌸',
        subtitle: 'Slow & Steady',
        meaning: 'Going slow is wonderful! You can enjoy every moment without rushing.',
        magicTask: 'Do your next chore slowly while listening to pleasant music.'
    },
    {
        id: 'honey-bee',
        name: 'The Sweet Bee 🐝🍯',
        subtitle: 'Kind Friend',
        meaning: 'Being kind makes everyone happy! Today is a great day to share a smile.',
        magicTask: 'Send a cute text or nice compliment to a friend.'
    },
    {
        id: 'crystal-mirror',
        name: 'The Magic Mirror 🪞🔮',
        subtitle: 'Listen to Your Heart',
        meaning: 'Trust yourself! You already know the right answer in your heart.',
        magicTask: 'Ask yourself: "What will make me smile today?" and do it!'
    }
];

class AstrologyEngine {
    constructor() {
        this.selectedSignId = localStorage.getItem('betterhalf_user_sign') || 'cancer';
        this.todayCardId = localStorage.getItem('betterhalf_today_card') || null;
        this.todayCardDate = localStorage.getItem('betterhalf_card_date') || null;
    }

    getSign(id = this.selectedSignId) {
        return ZODIAC_SIGNS.find(s => s.id === id) || ZODIAC_SIGNS[3];
    }

    setSign(id) {
        this.selectedSignId = id;
        localStorage.setItem('betterhalf_user_sign', id);
    }

    getDailyReading(signId = this.selectedSignId) {
        const sign = this.getSign(signId);
        const todayStr = new Date().toDateString();
        const hash = this._hashString(todayStr + signId);

        const transits = [
            `The Moon is soft and peaceful today. It brings you a calm mind and sweet creative ideas.`,
            `The stars are shining bright for you! Your thoughts are clear and your words are charming.`,
            `The sky is giving you cozy, warm vibes. Great day for self-care, yummy food, and cute chats.`,
            `A lucky little surprise is waiting for you today! Keep your eyes open for happy moments.`
        ];

        const luckyElements = [
            { charm: 'Purple Amethyst 🔮', color: 'Pastel Lilac', hour: '11:00 AM', vibe: 'Calm Mind' },
            { charm: 'Pink Blossom 🌸', color: 'Strawberry Milk', hour: '3:30 PM', vibe: 'Warm Heart' },
            { charm: 'Green Jade 🍃', color: 'Matcha Cream', hour: '10:00 AM', vibe: 'Fresh Energy' },
            { charm: 'Sunny Droplet ☀️', color: 'Honey Butter', hour: '4:00 PM', vibe: 'Cheerful Smiles' }
        ];

        const compatibilities = [
            {
                partnerSign: sign.element === 'Water' ? 'Taurus ♉' : sign.element === 'Fire' ? 'Gemini ♊' : sign.element === 'Earth' ? 'Cancer ♋' : 'Leo ♌',
                score: 96,
                vibe: 'Best Tea Buddy',
                advice: 'You two understand each other without words today! Great for a sweet chat.'
            },
            {
                partnerSign: sign.element === 'Water' ? 'Pisces ♓' : sign.element === 'Fire' ? 'Aries ♈' : sign.element === 'Earth' ? 'Virgo ♍' : 'Libra ♎',
                score: 90,
                vibe: 'Creative Partner',
                advice: 'Great to work together or share funny jokes and pictures.'
            }
        ];

        const energyScores = {
            focus: 65 + (hash % 30),
            intuition: 70 + ((hash * 3) % 25),
            social: 50 + ((hash * 7) % 40),
            restNeeded: 60 + ((hash * 5) % 35)
        };

        const horoscopeMessages = [
            `Sweet ${sign.name}, please don't worry about yesterday. You are doing great! Pick 2 simple goals today, treat yourself to a nice snack, and relax.`,
            `The stars are hugging you today, ${sign.name}! Trust your gentle feelings. When you don't stress, everything falls into place smoothly!`,
            `The sky has a warm, sweet feeling for you today, ${sign.name}. Take care of yourself first. A tiny good habit today will make you very proud tomorrow.`
        ];

        return {
            sign,
            transit: transits[hash % transits.length],
            lucky: luckyElements[hash % luckyElements.length],
            compatibility: compatibilities[hash % compatibilities.length],
            energy: energyScores,
            horoscope: horoscopeMessages[hash % horoscopeMessages.length]
        };
    }

    getTodayCard(forceNew = false) {
        const todayStr = new Date().toDateString();
        if (!forceNew && this.todayCardDate === todayStr && this.todayCardId) {
            const card = ORACLE_CARDS.find(c => c.id === this.todayCardId);
            if (card) return { card, isFlipped: true };
        }

        if (forceNew) {
            const currentIdx = ORACLE_CARDS.findIndex(c => c.id === this.todayCardId);
            const nextIdx = (currentIdx + 1) % ORACLE_CARDS.length;
            const newCard = ORACLE_CARDS[nextIdx];
            this.todayCardId = newCard.id;
            this.todayCardDate = todayStr;
            localStorage.setItem('betterhalf_today_card', this.todayCardId);
            localStorage.setItem('betterhalf_card_date', this.todayCardDate);
            return { card: newCard, isFlipped: true };
        }

        const hash = this._hashString(todayStr);
        const card = ORACLE_CARDS[hash % ORACLE_CARDS.length];
        return { card, isFlipped: false };
    }

    revealTodayCard() {
        const todayStr = new Date().toDateString();
        const hash = this._hashString(todayStr);
        const card = ORACLE_CARDS[hash % ORACLE_CARDS.length];
        this.todayCardId = card.id;
        this.todayCardDate = todayStr;
        localStorage.setItem('betterhalf_today_card', this.todayCardId);
        localStorage.setItem('betterhalf_card_date', this.todayCardDate);
        return card;
    }

    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
}

window.astrologyEngine = new AstrologyEngine();
