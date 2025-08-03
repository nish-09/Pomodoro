class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.timer = null;
        this.currentMode = 'work';
        this.sessionCount = 1;
        this.completedSessions = 0;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.updateDisplay();
        this.updateProgressRing();
    }

    initializeElements() {
        this.timeDisplay = document.getElementById('time');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.sessionNumber = document.getElementById('session-number');
        this.currentModeText = document.getElementById('current-mode-text');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        // Settings inputs
        this.workTimeInput = document.getElementById('work-time');
        this.shortBreakInput = document.getElementById('short-break');
        this.longBreakInput = document.getElementById('long-break');
    }

    initializeEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        // Mode buttons
        this.modeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchMode(e.target));
        });

        // Settings inputs
        this.workTimeInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakInput.addEventListener('change', () => this.updateSettings());
        this.longBreakInput.addEventListener('change', () => this.updateSettings());
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                this.updateProgressRing();
                
                if (this.timeLeft <= 0) {
                    this.timerComplete();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            clearInterval(this.timer);
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgressRing();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    switchMode(button) {
        // Update active button
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Get mode and time from button data
        const mode = button.dataset.mode;
        const time = parseInt(button.dataset.time);
        
        this.currentMode = mode;
        this.totalTime = time * 60;
        this.timeLeft = this.totalTime;
        
        // Update mode text
        const modeTexts = {
            'work': 'Work Time',
            'short-break': 'Short Break',
            'long-break': 'Long Break'
        };
        this.currentModeText.textContent = modeTexts[mode];
        
        // Update settings if timer is not running
        if (!this.isRunning) {
            this.updateSettings();
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgressRing() {
        const circumference = 2 * Math.PI * 120; // r = 120
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const offset = circumference - (progress * circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
    }

    timerComplete() {
        this.pauseTimer();
        
        // Add completion animation
        this.timeDisplay.classList.add('timer-complete');
        setTimeout(() => {
            this.timeDisplay.classList.remove('timer-complete');
        }, 500);

        // Play notification sound (if supported)
        this.playNotification();

        // Show notification
        this.showNotification();

        // Auto-switch to next mode
        this.autoSwitchMode();
    }

    playNotification() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const modeTexts = {
                'work': 'Work session completed!',
                'short-break': 'Short break completed!',
                'long-break': 'Long break completed!'
            };
            
            new Notification('Pomodoro Timer', {
                body: modeTexts[this.currentMode],
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234299e1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
            });
        }
    }

    autoSwitchMode() {
        if (this.currentMode === 'work') {
            this.completedSessions++;
            
            // Switch to short break after work session
            if (this.completedSessions % 4 === 0) {
                // Long break every 4 sessions
                this.switchToMode('long-break');
            } else {
                // Short break
                this.switchToMode('short-break');
            }
        } else {
            // Switch back to work after break
            this.switchToMode('work');
            this.sessionCount++;
            this.sessionNumber.textContent = this.sessionCount;
        }
    }

    switchToMode(mode) {
        const button = Array.from(this.modeButtons).find(btn => btn.dataset.mode === mode);
        if (button) {
            this.switchMode(button);
        }
    }

    updateSettings() {
        if (!this.isRunning) {
            const workTime = parseInt(this.workTimeInput.value);
            const shortBreak = parseInt(this.shortBreakInput.value);
            const longBreak = parseInt(this.longBreakInput.value);

            // Update button data attributes
            this.modeButtons[0].dataset.time = workTime;
            this.modeButtons[1].dataset.time = shortBreak;
            this.modeButtons[2].dataset.time = longBreak;

            // Update current timer if it matches the current mode
            if (this.currentMode === 'work') {
                this.totalTime = workTime * 60;
                this.timeLeft = this.totalTime;
            } else if (this.currentMode === 'short-break') {
                this.totalTime = shortBreak * 60;
                this.timeLeft = this.totalTime;
            } else if (this.currentMode === 'long-break') {
                this.totalTime = longBreak * 60;
                this.timeLeft = this.totalTime;
            }

            this.updateDisplay();
            this.updateProgressRing();
        }
    }
}

// Request notification permission on page load
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Initialize the Pomodoro timer
    new PomodoroTimer();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else if (!pauseBtn.disabled) {
            pauseBtn.click();
        }
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        document.getElementById('reset-btn').click();
    }
}); 