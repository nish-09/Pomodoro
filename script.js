class PomodoroTimer {
    constructor() {
        this.timeLeft = 120 * 60;
        this.totalTime = 120 * 60;
        this.isRunning = false;
        this.timer = null;
        this.currentMode = 'work';
        this.sessionCount = 1;
        this.completedSessions = 0;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadSettings();
        this.updateDisplay();
        this.updateProgressRing();
    }

    initializeElements() {
        this.timeDisplay = document.getElementById('time');
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsSection = document.getElementById('settings-section');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.sessionNumber = document.getElementById('session-number');
        this.currentModeText = document.getElementById('current-mode-text');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        this.workTimeInput = document.getElementById('work-time');
        this.shortBreakInput = document.getElementById('short-break');
        this.longBreakInput = document.getElementById('long-break');
    }

    initializeEventListeners() {
        this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());

        this.modeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchMode(e.target));
        });

        this.workTimeInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakInput.addEventListener('change', () => this.updateSettings());
        this.longBreakInput.addEventListener('change', () => this.updateSettings());
        
        const themeSelect = document.querySelector('.theme-select');
        const soundToggle = document.getElementById('sound-toggle');
        const soundSelect = document.querySelector('.sound-select');
        
        if (themeSelect) {
            themeSelect.addEventListener('change', () => this.updateTheme());
        }
        if (soundToggle) {
            soundToggle.addEventListener('change', () => this.updateSoundSettings());
        }
        if (soundSelect) {
            soundSelect.addEventListener('change', () => {
                this.updateSoundSettings();
                this.playNotification();
            });
        }
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => this.switchSettingsSection(item));
        });

        const resetBtn = document.querySelector('.reset-btn');
        const closeBtnFooter = document.querySelector('.close-btn-footer');
        const saveBtn = document.querySelector('.save-btn');
        
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetAllSettings());
        if (closeBtnFooter) closeBtnFooter.addEventListener('click', () => this.closeSettings());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveSettings());

        this.settingsSection.addEventListener('click', (e) => {
            if (e.target === this.settingsSection) {
                this.closeSettings();
            }
        });
    }

    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.startPauseBtn.textContent = 'Pause';
        this.startPauseBtn.classList.add('paused');
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.startPauseBtn.textContent = 'Start';
        this.startPauseBtn.classList.remove('paused');
        clearInterval(this.timer);
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgressRing();
    }

    toggleSettings() {
        this.settingsSection.style.display = 'flex';
        this.settingsBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.attachSettingsEventListeners();
    }

    closeSettings() {
        this.settingsSection.style.display = 'none';
        this.settingsBtn.classList.remove('active');
        document.body.style.overflow = '';
    }

    switchSettingsSection(clickedItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });

        clickedItem.classList.add('active');

        const sectionName = clickedItem.dataset.section;
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    resetAllSettings() {
        this.workTimeInput.value = 120;
        this.shortBreakInput.value = 5;
        this.longBreakInput.value = 15;
        
        document.getElementById('sound-toggle').checked = true;
        
        document.querySelector('.theme-select').value = 'light';
        
        document.querySelector('.sound-select').value = 'beep';
        
        localStorage.removeItem('pomodoro-theme');
        localStorage.removeItem('pomodoro-sound-enabled');
        localStorage.removeItem('pomodoro-sound-type');
        
        this.updateSettings();
        this.updateTheme();
        this.updateSoundSettings();
        
        this.showNotification('Settings reset to defaults');
    }

    saveSettings() {
        this.updateSettings();
        this.closeSettings();
        this.showNotification('Settings saved successfully');
    }

    updateTheme() {
        const themeSelect = document.querySelector('.theme-select');
        if (!themeSelect) return;
        
        const selectedTheme = themeSelect.value;
        
        document.body.classList.remove('theme-light', 'theme-dark');
        
        document.body.classList.add(`theme-${selectedTheme}`);
        
        localStorage.setItem('pomodoro-theme', selectedTheme);
    }

    updateSoundSettings() {
        const soundToggle = document.getElementById('sound-toggle');
        const soundSelect = document.querySelector('.sound-select');
        
        if (!soundToggle || !soundSelect) return;
        
        const soundEnabled = soundToggle.checked;
        const selectedSound = soundSelect.value;
        
        localStorage.setItem('pomodoro-sound-enabled', soundEnabled);
        localStorage.setItem('pomodoro-sound-type', selectedSound);
    }

    attachSettingsEventListeners() {
        const themeSelect = document.querySelector('.theme-select');
        const soundToggle = document.getElementById('sound-toggle');
        const soundSelect = document.querySelector('.sound-select');
        
        if (themeSelect) {
            themeSelect.removeEventListener('change', this.updateTheme);
            themeSelect.addEventListener('change', () => this.updateTheme());
        }
        if (soundToggle) {
            soundToggle.removeEventListener('change', this.updateSoundSettings);
            soundToggle.addEventListener('change', () => this.updateSoundSettings());
        }
        if (soundSelect) {
            soundSelect.removeEventListener('change', this.updateSoundSettings);
            soundSelect.addEventListener('change', () => {
                this.updateSoundSettings();
                this.playNotification();
            });
        }
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('pomodoro-theme') || 'light';
        const themeSelect = document.querySelector('.theme-select');
        if (themeSelect) {
            themeSelect.value = savedTheme;
            this.updateTheme();
        }
        
        const savedSoundEnabled = localStorage.getItem('pomodoro-sound-enabled') !== 'false';
        const savedSoundType = localStorage.getItem('pomodoro-sound-type') || 'beep';
        const soundToggle = document.getElementById('sound-toggle');
        const soundSelect = document.querySelector('.sound-select');
        
        if (soundToggle) soundToggle.checked = savedSoundEnabled;
        if (soundSelect) soundSelect.value = savedSoundType;
    }

    switchMode(button) {
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const mode = button.dataset.mode;
        const time = parseInt(button.dataset.time);
        
        this.currentMode = mode;
        this.totalTime = time * 60;
        this.timeLeft = this.totalTime;
        
        const modeTexts = {
            'work': 'Work Time',
            'short-break': 'Short Break',
            'long-break': 'Long Break'
        };
        this.currentModeText.textContent = modeTexts[mode];
        
        if (!this.isRunning) {
            this.updateSettings();
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }

    updateDisplay() {
        const hours = Math.floor(this.timeLeft / 3600);
        const minutes = Math.floor((this.timeLeft % 3600) / 60);
        const seconds = this.timeLeft % 60;
        
        this.timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgressRing() {
        const circumference = 2 * Math.PI * 120;
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const offset = circumference - (progress * circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
    }

    timerComplete() {
        this.pauseTimer();
        
        this.timeDisplay.classList.add('timer-complete');
        setTimeout(() => {
            this.timeDisplay.classList.remove('timer-complete');
        }, 500);

        this.playNotification();
        this.sendTimerNotification();

        this.autoSwitchMode();
    }

    playNotification() {
        const soundToggle = document.getElementById('sound-toggle');
        const soundEnabled = soundToggle ? soundToggle.checked : true;
        
        if (!soundEnabled) return;
        
        const soundSelect = document.querySelector('.sound-select');
        const soundType = soundSelect ? soundSelect.value : 'beep';
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency1, frequency2, duration;
        switch (soundType) {
            case 'bell':
                frequency1 = 523;
                frequency2 = 659;
                duration = 0.3;
                break;
            case 'chime':
                frequency1 = 440;
                frequency2 = 554;
                duration = 0.4;
                break;
            default:
                frequency1 = 800;
                frequency2 = 600;
                duration = 0.2;
                break;
        }
        
        oscillator.frequency.setValueAtTime(frequency1, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(frequency2, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    autoSwitchMode() {
        if (this.currentMode === 'work') {
            this.completedSessions++;
            
            if (this.completedSessions % 4 === 0) {
                this.switchToMode('long-break');
            } else {
                this.switchToMode('short-break');
            }
        } else {
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

            this.modeButtons[0].dataset.time = workTime;
            this.modeButtons[1].dataset.time = shortBreak;
            this.modeButtons[2].dataset.time = longBreak;

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

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234299e1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
            });
        }
        
        console.log(message);
    }

    sendTimerNotification() {
        const modeTexts = {
            'work': 'Work session completed! Time for a break.',
            'short-break': 'Short break completed! Ready to work?',
            'long-break': 'Long break completed! Great job!'
        };
        
        const message = modeTexts[this.currentMode] || 'Timer completed!';
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234299e1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                requireInteraction: true,
                silent: false
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pomodoroTimer = new PomodoroTimer();
    
    const cursor = document.querySelector('.custom-cursor');
    const cursorRing = document.querySelector('.cursor-ring');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorRing.style.left = e.clientX + 'px';
        cursorRing.style.top = e.clientY + 'px';
    });
    
               const hoverElements = document.querySelectorAll('button, a, input, select, .nav-item, .mode-btn');
           const textElements = document.querySelectorAll('h1, h2, h3, p, span, label, .time, .session-count, .current-mode');
           
           hoverElements.forEach(element => {
               element.addEventListener('mouseenter', () => {
                   cursor.classList.add('hover');
                   cursorRing.classList.add('hover');
               });
               element.addEventListener('mouseleave', () => {
                   cursor.classList.remove('hover');
                   cursorRing.classList.remove('hover');
               });
           });
           
           textElements.forEach(element => {
               element.addEventListener('mouseenter', () => {
                   cursor.classList.add('text-hover');
               });
               element.addEventListener('mouseleave', () => {
                   cursor.classList.remove('text-hover');
               });
           });
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('start-pause-btn').click();
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        document.getElementById('reset-btn').click();
    }
}); 