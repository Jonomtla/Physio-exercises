// Knee Rehab Tracker - Main Application

(function() {
    'use strict';

    // Constants
    const DAILY_EXERCISES = ['tke', 'glute-bridge', 'clamshell', 'wall-sit'];
    const ALL_EXERCISES = [...DAILY_EXERCISES, 'leg-swing'];
    const STORAGE_KEYS = {
        THEME: 'knee-rehab-theme',
        DATA: 'knee-rehab-data'
    };

    // State
    let appData = {
        completedDays: {},  // { 'YYYY-MM-DD': { exercises: [...], notes: '', allComplete: bool } }
        currentStreak: 0,
        totalDays: 0
    };

    // Utility functions
    function getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    function getWeekDates() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    function formatDateShort(date) {
        return date.toISOString().split('T')[0];
    }

    // LocalStorage functions
    function loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.DATA);
            if (stored) {
                appData = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(appData));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    // Theme functions
    function loadTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }

    // Exercise tracking functions
    function getTodayData() {
        const today = getTodayString();
        if (!appData.completedDays[today]) {
            appData.completedDays[today] = {
                exercises: [],
                notes: '',
                allComplete: false
            };
        }
        return appData.completedDays[today];
    }

    function isExerciseComplete(exerciseId) {
        const todayData = getTodayData();
        return todayData.exercises.includes(exerciseId);
    }

    function toggleExercise(exerciseId) {
        const todayData = getTodayData();
        const index = todayData.exercises.indexOf(exerciseId);

        if (index > -1) {
            todayData.exercises.splice(index, 1);
        } else {
            todayData.exercises.push(exerciseId);
        }

        // Check if all daily exercises are complete
        todayData.allComplete = DAILY_EXERCISES.every(ex =>
            todayData.exercises.includes(ex)
        );

        calculateStats();
        saveData();
        updateUI();
    }

    function updateNotes(notes) {
        const todayData = getTodayData();
        todayData.notes = notes;
        saveData();
    }

    // Stats calculation
    function calculateStats() {
        // Calculate total completed days
        const completedDaysList = Object.entries(appData.completedDays)
            .filter(([date, data]) => data.allComplete)
            .map(([date]) => date)
            .sort();

        appData.totalDays = completedDaysList.length;

        // Calculate streak
        let streak = 0;
        const today = new Date();
        let checkDate = new Date(today);

        // If today is complete, start counting from today
        // Otherwise, start from yesterday
        const todayString = getTodayString();
        const todayComplete = appData.completedDays[todayString]?.allComplete;

        if (!todayComplete) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateString = formatDateShort(checkDate);
            const dayData = appData.completedDays[dateString];

            if (dayData && dayData.allComplete) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        appData.currentStreak = streak;
    }

    // UI Update functions
    function updateUI() {
        updateCheckboxes();
        updateStats();
        updateWeekView();
        updateCardStates();
    }

    function updateCheckboxes() {
        ALL_EXERCISES.forEach(exerciseId => {
            const checkbox = document.getElementById(`check-${exerciseId}`);
            if (checkbox) {
                checkbox.checked = isExerciseComplete(exerciseId);
            }
        });
    }

    function updateStats() {
        const todayData = getTodayData();
        const dailyComplete = DAILY_EXERCISES.filter(ex =>
            todayData.exercises.includes(ex)
        ).length;

        document.getElementById('streak-count').textContent = appData.currentStreak;
        document.getElementById('total-days').textContent = appData.totalDays;
        document.getElementById('today-progress').textContent = `${dailyComplete}/${DAILY_EXERCISES.length}`;
    }

    function updateWeekView() {
        const weekView = document.getElementById('week-view');
        const weekDates = getWeekDates();
        const today = getTodayString();
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        weekView.innerHTML = weekDates.map((date, index) => {
            const dateString = formatDateShort(date);
            const isToday = dateString === today;
            const dayData = appData.completedDays[dateString];
            const isComplete = dayData && dayData.allComplete;

            let classes = 'day-cell';
            if (isToday) classes += ' today';
            if (isComplete) classes += ' completed';

            const status = isComplete ? '✓' : (isToday ? '•' : '');

            return `
                <div class="${classes}">
                    <span class="day-name">${dayNames[index]}</span>
                    <span class="day-number">${date.getDate()}</span>
                    <span class="day-status">${status}</span>
                </div>
            `;
        }).join('');
    }

    function updateCardStates() {
        document.querySelectorAll('.exercise-card').forEach(card => {
            const exerciseId = card.dataset.exercise;
            const checkbox = card.querySelector('input[type="checkbox"]');

            if (checkbox && checkbox.checked) {
                card.classList.add('completed');
            } else {
                card.classList.remove('completed');
            }
        });
    }

    function loadNotes() {
        const todayData = getTodayData();
        const notesField = document.getElementById('daily-notes');
        if (notesField && todayData.notes) {
            notesField.value = todayData.notes;
        }
    }

    // Event handlers
    function setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Checkbox changes
        ALL_EXERCISES.forEach(exerciseId => {
            const checkbox = document.getElementById(`check-${exerciseId}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    toggleExercise(exerciseId);
                });

                // Prevent card toggle when clicking checkbox
                checkbox.closest('.checkbox-container').addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });

        // Card expansion
        document.querySelectorAll('.exercise-card').forEach(card => {
            const header = card.querySelector('.exercise-header');
            const title = card.querySelector('.exercise-title');

            const toggleExpand = () => {
                card.classList.toggle('expanded');
            };

            // Click on title area (not checkbox)
            title.addEventListener('click', toggleExpand);
            title.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand();
                }
            });
        });

        // Notes autosave
        const notesField = document.getElementById('daily-notes');
        let notesTimeout;
        notesField.addEventListener('input', () => {
            clearTimeout(notesTimeout);
            notesTimeout = setTimeout(() => {
                updateNotes(notesField.value);
            }, 500);
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
                    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Service Worker registration for offline support
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }

    // Initialize app
    function init() {
        loadTheme();
        loadData();
        calculateStats();
        setupEventListeners();
        loadNotes();
        updateUI();
        registerServiceWorker();

        // Check for day change every minute
        setInterval(() => {
            const currentDay = getTodayString();
            const displayedDay = document.querySelector('.day-cell.today');
            if (displayedDay) {
                const displayedDate = parseInt(displayedDay.querySelector('.day-number').textContent);
                const currentDate = new Date().getDate();
                if (displayedDate !== currentDate) {
                    // Day has changed, refresh UI
                    calculateStats();
                    updateUI();
                    loadNotes();
                }
            }
        }, 60000);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
