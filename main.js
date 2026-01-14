(function() {
    'use strict';

    // Exercise data
    var EXERCISES = {
        daily: [
            {
                id: 'tke',
                name: 'Terminal Knee Extensions',
                sets: 3,
                reps: '15-20 reps each leg',
                icon: '🦵',
                instructions: [
                    { label: 'Setup', text: 'Loop a resistance band around a sturdy object at knee height. Step into the band so it\'s behind your knee.' },
                    { label: 'Movement', text: 'Stand on the banded leg, slightly bend the knee, then fully straighten it against the band resistance. Focus on squeezing the quad at the top.' },
                    { label: 'Tip', text: 'Keep your hips stable and avoid leaning back.' }
                ]
            },
            {
                id: 'glute-bridge',
                name: 'Single-Leg Glute Bridges',
                sets: 3,
                reps: '12 each side',
                icon: '🍑',
                instructions: [
                    { label: 'Setup', text: 'Lie on your back, knees bent, feet flat on the floor. Extend one leg straight out.' },
                    { label: 'Movement', text: 'Press through the grounded foot to lift your hips until your body forms a straight line from shoulders to knee. Lower with control.' },
                    { label: 'Tip', text: 'Don\'t let your hips drop or rotate. Squeeze your glute at the top.' }
                ]
            },
            {
                id: 'clamshell',
                name: 'Banded Clamshells',
                sets: 3,
                reps: '15 each side',
                icon: '🐚',
                instructions: [
                    { label: 'Setup', text: 'Lie on your side with a band around both thighs just above the knees. Bend knees to 90 degrees, feet together.' },
                    { label: 'Movement', text: 'Keeping feet together, rotate your top knee up toward the ceiling like a clamshell opening. Lower with control.' },
                    { label: 'Tip', text: 'Don\'t let your hips roll backward. Keep your core engaged.' }
                ]
            },
            {
                id: 'wall-sit',
                name: 'Wall Sits',
                sets: 3,
                reps: '30-45 seconds',
                icon: '🧱',
                instructions: [
                    { label: 'Setup', text: 'Stand with your back against a wall, feet shoulder-width apart and about 2 feet from the wall.' },
                    { label: 'Movement', text: 'Slide down until your thighs are parallel to the floor. Hold the position.' },
                    { label: 'Important', text: 'Bias weight to your LEFT leg to strengthen that side more.' },
                    { label: 'Tip', text: 'Keep your back flat against the wall and don\'t let your knees go past your toes.' }
                ]
            },
            {
                id: 'knee-drive',
                name: 'Resisted Knee Drive',
                sets: 3,
                reps: '12-15 each leg',
                icon: '🏃',
                instructions: [
                    { label: 'Setup', text: 'Attach a resistance band to a low anchor point. Loop it around one foot and face away from the anchor.' },
                    { label: 'Movement', text: 'Drive your knee up toward your chest against the band resistance. Control the return. Keep your standing leg slightly bent.' },
                    { label: 'Focus', text: 'Engage your hip flexors and core. Maintain balance on your standing leg.' },
                    { label: 'Tip', text: 'Start with light resistance and increase as you get stronger.' }
                ]
            }
        ],
        warmup: [
            {
                id: 'leg-swing',
                name: 'Leg Swings',
                sets: 1,
                reps: '10 each direction, each leg',
                icon: '🦿',
                instructions: [
                    { label: 'Setup', text: 'Stand next to a wall or hold onto something sturdy for balance.' },
                    { label: 'Forward/Back', text: 'Swing one leg forward and backward in a controlled pendulum motion. Keep your torso stable.' },
                    { label: 'Side-to-Side', text: 'Face the wall and swing your leg across your body and out to the side.' },
                    { label: 'Tip', text: 'Start with small swings and gradually increase the range of motion.' }
                ]
            }
        ]
    };

    var DAILY_IDS = EXERCISES.daily.map(function(e) { return e.id; });
    var ALL_EXERCISES = EXERCISES.daily.concat(EXERCISES.warmup);

    // State
    var appData = { completedDays: {} };

    // Helpers
    function getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    function getWeekDates() {
        var today = new Date();
        var day = today.getDay();
        var monday = new Date(today);
        monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
        var dates = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }

    function loadData() {
        try {
            var stored = localStorage.getItem('knee-rehab-data');
            if (stored) appData = JSON.parse(stored);
        } catch (e) {}
    }

    function saveData() {
        try {
            localStorage.setItem('knee-rehab-data', JSON.stringify(appData));
        } catch (e) {}
    }

    function getTodayData() {
        var today = getTodayString();
        if (!appData.completedDays[today]) {
            appData.completedDays[today] = { sets: {}, notes: '', allComplete: false };
        }
        return appData.completedDays[today];
    }

    function getExercise(id) {
        for (var i = 0; i < ALL_EXERCISES.length; i++) {
            if (ALL_EXERCISES[i].id === id) return ALL_EXERCISES[i];
        }
        return null;
    }

    // Theme
    function loadTheme() {
        var saved = localStorage.getItem('knee-rehab-theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('knee-rehab-theme', next);
    }

    // Render exercise card
    function createExerciseCard(exercise) {
        var todayData = getTodayData();
        var completedSets = todayData.sets[exercise.id] || 0;
        var isComplete = completedSets >= exercise.sets;

        var card = document.createElement('div');
        card.className = 'exercise-card' + (isComplete ? ' completed' : '');
        card.setAttribute('data-id', exercise.id);

        var header = document.createElement('div');
        header.className = 'exercise-header';

        // Completion indicator
        var indicator = document.createElement('div');
        indicator.className = 'completion-indicator' + (isComplete ? ' done' : '');
        indicator.textContent = isComplete ? '✓' : '';

        // Title
        var title = document.createElement('div');
        title.className = 'exercise-title';
        var h3 = document.createElement('h3');
        h3.textContent = exercise.name;
        var reps = document.createElement('span');
        reps.className = 'exercise-reps';
        reps.textContent = exercise.reps;
        title.appendChild(h3);
        title.appendChild(reps);

        // Set counter
        var counter = document.createElement('div');
        counter.className = 'set-counter';

        var minusBtn = document.createElement('button');
        minusBtn.className = 'set-btn';
        minusBtn.textContent = '−';
        minusBtn.disabled = completedSets === 0;
        minusBtn.onclick = function(e) {
            e.stopPropagation();
            updateSets(exercise.id, -1);
        };

        var display = document.createElement('span');
        display.className = 'set-display';
        var currentSpan = document.createElement('span');
        currentSpan.className = 'set-current' + (isComplete ? ' complete' : '');
        currentSpan.textContent = completedSets;
        var sep = document.createElement('span');
        sep.className = 'set-separator';
        sep.textContent = '/';
        var totalSpan = document.createElement('span');
        totalSpan.className = 'set-total';
        totalSpan.textContent = exercise.sets;
        display.appendChild(currentSpan);
        display.appendChild(sep);
        display.appendChild(totalSpan);

        var plusBtn = document.createElement('button');
        plusBtn.className = 'set-btn';
        plusBtn.textContent = '+';
        plusBtn.disabled = completedSets >= exercise.sets;
        plusBtn.onclick = function(e) {
            e.stopPropagation();
            updateSets(exercise.id, 1);
        };

        counter.appendChild(minusBtn);
        counter.appendChild(display);
        counter.appendChild(plusBtn);

        // Expand icon
        var expandIcon = document.createElement('span');
        expandIcon.className = 'expand-icon';
        expandIcon.textContent = '▼';

        header.appendChild(indicator);
        header.appendChild(title);
        header.appendChild(counter);
        header.appendChild(expandIcon);

        // Details
        var details = document.createElement('div');
        details.className = 'exercise-details';

        var iconDiv = document.createElement('div');
        iconDiv.className = 'exercise-icon';
        iconDiv.textContent = exercise.icon;

        var instructions = document.createElement('div');
        instructions.className = 'exercise-instructions';
        exercise.instructions.forEach(function(inst) {
            var p = document.createElement('p');
            var strong = document.createElement('strong');
            strong.textContent = inst.label + ': ';
            p.appendChild(strong);
            p.appendChild(document.createTextNode(inst.text));
            instructions.appendChild(p);
        });

        details.appendChild(iconDiv);
        details.appendChild(instructions);

        card.appendChild(header);
        card.appendChild(details);

        // Toggle expand
        header.onclick = function() {
            card.classList.toggle('expanded');
        };

        return card;
    }

    function updateSets(exerciseId, delta) {
        var todayData = getTodayData();
        var current = todayData.sets[exerciseId] || 0;
        var exercise = getExercise(exerciseId);
        var newVal = Math.max(0, Math.min(exercise.sets, current + delta));
        todayData.sets[exerciseId] = newVal;

        // Check all complete
        todayData.allComplete = DAILY_IDS.every(function(id) {
            var ex = getExercise(id);
            return (todayData.sets[id] || 0) >= ex.sets;
        });

        saveData();
        renderAll();
    }

    function renderExercises() {
        var dailyContainer = document.getElementById('daily-exercises');
        var warmupContainer = document.getElementById('warmup-exercises');
        dailyContainer.innerHTML = '';
        warmupContainer.innerHTML = '';

        EXERCISES.daily.forEach(function(ex) {
            dailyContainer.appendChild(createExerciseCard(ex));
        });
        EXERCISES.warmup.forEach(function(ex) {
            warmupContainer.appendChild(createExerciseCard(ex));
        });
    }

    function renderStats() {
        var todayData = getTodayData();
        var completedCount = DAILY_IDS.filter(function(id) {
            var ex = getExercise(id);
            return (todayData.sets[id] || 0) >= ex.sets;
        }).length;

        // Total days
        var totalDays = 0;
        var dates = [];
        for (var date in appData.completedDays) {
            if (appData.completedDays[date].allComplete) {
                totalDays++;
                dates.push(date);
            }
        }
        dates.sort();

        // Streak
        var streak = 0;
        var checkDate = new Date();
        var today = getTodayString();
        var todayComplete = appData.completedDays[today] && appData.completedDays[today].allComplete;
        if (!todayComplete) checkDate.setDate(checkDate.getDate() - 1);

        while (true) {
            var ds = checkDate.toISOString().split('T')[0];
            if (appData.completedDays[ds] && appData.completedDays[ds].allComplete) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        document.getElementById('streak-count').textContent = streak;
        document.getElementById('total-days').textContent = totalDays;
        document.getElementById('today-progress').textContent = completedCount + '/' + DAILY_IDS.length;
    }

    function renderWeekView() {
        var container = document.getElementById('week-view');
        var weekDates = getWeekDates();
        var today = getTodayString();
        var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        container.innerHTML = '';

        weekDates.forEach(function(date, i) {
            var ds = date.toISOString().split('T')[0];
            var isToday = ds === today;
            var dayData = appData.completedDays[ds];
            var isComplete = dayData && dayData.allComplete;

            var cell = document.createElement('div');
            cell.className = 'day-cell' + (isToday ? ' today' : '') + (isComplete ? ' completed' : '');

            var name = document.createElement('span');
            name.className = 'day-name';
            name.textContent = dayNames[i];

            var num = document.createElement('span');
            num.className = 'day-number';
            num.textContent = date.getDate();

            var status = document.createElement('span');
            status.className = 'day-status';
            status.textContent = isComplete ? '✓' : (isToday ? '•' : '');

            cell.appendChild(name);
            cell.appendChild(num);
            cell.appendChild(status);
            container.appendChild(cell);
        });
    }

    function loadNotes() {
        var todayData = getTodayData();
        document.getElementById('daily-notes').value = todayData.notes || '';
    }

    function renderAll() {
        renderExercises();
        renderStats();
        renderWeekView();
    }

    function init() {
        loadTheme();
        loadData();
        renderAll();
        loadNotes();

        document.getElementById('theme-toggle').onclick = toggleTheme;

        var notesField = document.getElementById('daily-notes');
        var notesTimeout;
        notesField.oninput = function() {
            clearTimeout(notesTimeout);
            notesTimeout = setTimeout(function() {
                var todayData = getTodayData();
                todayData.notes = notesField.value;
                saveData();
            }, 500);
        };

        // Service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(function() {});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
