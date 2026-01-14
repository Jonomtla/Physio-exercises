const { useState, useEffect, useCallback } = React;
const e = React.createElement;

// Exercise data
const EXERCISES = {
  daily: [
    {
      id: 'tke',
      name: 'Terminal Knee Extensions',
      sets: 3,
      reps: '15-20 reps each leg',
      image: 'images/tke.svg',
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
      image: 'images/glute-bridge.svg',
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
      image: 'images/clamshell.svg',
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
      image: 'images/wall-sit.svg',
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
      image: 'images/knee-drive.svg',
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
      image: 'images/leg-swing.svg',
      instructions: [
        { label: 'Setup', text: 'Stand next to a wall or hold onto something sturdy for balance.' },
        { label: 'Forward/Back', text: 'Swing one leg forward and backward in a controlled pendulum motion. Keep your torso stable.' },
        { label: 'Side-to-Side', text: 'Face the wall and swing your leg across your body and out to the side.' },
        { label: 'Tip', text: 'Start with small swings and gradually increase the range of motion.' }
      ]
    }
  ]
};

const DAILY_EXERCISE_IDS = EXERCISES.daily.map(ex => ex.id);
const ALL_EXERCISES = [...EXERCISES.daily, ...EXERCISES.warmup];

// Utility functions
const getTodayString = () => new Date().toISOString().split('T')[0];

const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
};

// Storage functions
const loadData = () => {
  try {
    const stored = localStorage.getItem('knee-rehab-data');
    return stored ? JSON.parse(stored) : { completedDays: {} };
  } catch (err) {
    return { completedDays: {} };
  }
};

const saveData = (data) => {
  try {
    localStorage.setItem('knee-rehab-data', JSON.stringify(data));
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

// SetCounter Component
function SetCounter({ current, total, onIncrement, onDecrement }) {
  return e('div', { className: 'set-counter', onClick: (ev) => ev.stopPropagation() },
    e('button', {
      className: 'set-btn',
      onClick: onDecrement,
      disabled: current === 0,
      'aria-label': 'Decrease sets'
    }, '−'),
    e('span', { className: 'set-display' },
      e('span', { className: 'set-current' + (current === total ? ' complete' : '') }, current),
      e('span', { className: 'set-separator' }, '/'),
      e('span', { className: 'set-total' }, total)
    ),
    e('button', {
      className: 'set-btn',
      onClick: onIncrement,
      disabled: current === total,
      'aria-label': 'Increase sets'
    }, '+')
  );
}

// ExerciseCard Component
function ExerciseCard({ exercise, completedSets, onSetChange, isExpanded, onToggle }) {
  const isComplete = completedSets >= exercise.sets;

  return e('div', { className: 'exercise-card' + (isComplete ? ' completed' : '') + (isExpanded ? ' expanded' : '') },
    e('div', { className: 'exercise-header', onClick: onToggle },
      e('div', { className: 'completion-indicator' + (isComplete ? ' done' : '') }, isComplete ? '✓' : ''),
      e('div', { className: 'exercise-title' },
        e('h3', null, exercise.name),
        e('span', { className: 'exercise-reps' }, exercise.reps)
      ),
      e(SetCounter, {
        current: completedSets,
        total: exercise.sets,
        onIncrement: () => onSetChange(exercise.id, completedSets + 1),
        onDecrement: () => onSetChange(exercise.id, completedSets - 1)
      }),
      e('span', { className: 'expand-icon' }, '▼')
    ),
    e('div', { className: 'exercise-details' },
      e('div', { className: 'exercise-image' },
        e('img', { src: exercise.image, alt: exercise.name + ' demonstration', loading: 'lazy' })
      ),
      e('div', { className: 'exercise-instructions' },
        exercise.instructions.map((inst, i) =>
          e('p', { key: i },
            e('strong', null, inst.label + ': '),
            inst.text
          )
        )
      )
    )
  );
}

// WeekView Component
function WeekView({ completedDays }) {
  const weekDates = getWeekDates();
  const today = getTodayString();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return e('div', { className: 'week-view' },
    weekDates.map((date, index) => {
      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === today;
      const dayData = completedDays[dateString];
      const isComplete = dayData && dayData.allComplete;

      let classes = 'day-cell';
      if (isToday) classes += ' today';
      if (isComplete) classes += ' completed';

      return e('div', { key: dateString, className: classes },
        e('span', { className: 'day-name' }, dayNames[index]),
        e('span', { className: 'day-number' }, date.getDate()),
        e('span', { className: 'day-status' }, isComplete ? '✓' : (isToday ? '•' : ''))
      );
    })
  );
}

// StatsBar Component
function StatsBar({ streak, totalDays, todayProgress, totalDaily }) {
  return e('div', { className: 'stats-bar' },
    e('div', { className: 'stat' },
      e('span', { className: 'stat-value' }, streak),
      e('span', { className: 'stat-label' }, 'Day Streak')
    ),
    e('div', { className: 'stat' },
      e('span', { className: 'stat-value' }, totalDays),
      e('span', { className: 'stat-label' }, 'Total Days')
    ),
    e('div', { className: 'stat' },
      e('span', { className: 'stat-value' }, todayProgress + '/' + totalDaily),
      e('span', { className: 'stat-label' }, 'Today')
    )
  );
}

// Main App Component
function App() {
  const [data, setData] = useState(() => loadData());
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('knee-rehab-theme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });
  const [expandedCard, setExpandedCard] = useState(null);
  const [notes, setNotes] = useState('');

  const today = getTodayString();
  const todayData = data.completedDays[today] || { sets: {}, notes: '', allComplete: false };

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('knee-rehab-theme', theme);
  }, [theme]);

  // Load notes for today
  useEffect(() => {
    setNotes(todayData.notes || '');
  }, [today]);

  // Calculate stats
  const calculateStats = useCallback(() => {
    const completedDaysList = Object.entries(data.completedDays)
      .filter(([_, d]) => d.allComplete)
      .map(([date]) => date)
      .sort();

    const totalDays = completedDaysList.length;

    let streak = 0;
    let checkDate = new Date();
    const todayComplete = data.completedDays[today] && data.completedDays[today].allComplete;

    if (!todayComplete) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateString = checkDate.toISOString().split('T')[0];
      if (data.completedDays[dateString] && data.completedDays[dateString].allComplete) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, totalDays };
  }, [data, today]);

  const { streak, totalDays } = calculateStats();

  const todayProgress = DAILY_EXERCISE_IDS.filter(id => {
    const exercise = ALL_EXERCISES.find(ex => ex.id === id);
    return (todayData.sets[id] || 0) >= exercise.sets;
  }).length;

  const handleSetChange = (exerciseId, newSets) => {
    setData(prevData => {
      const newData = { ...prevData };
      const todayEntry = newData.completedDays[today] || { sets: {}, notes: '', allComplete: false };

      todayEntry.sets = { ...todayEntry.sets, [exerciseId]: newSets };

      todayEntry.allComplete = DAILY_EXERCISE_IDS.every(id => {
        const exercise = ALL_EXERCISES.find(ex => ex.id === id);
        return (todayEntry.sets[id] || 0) >= exercise.sets;
      });

      newData.completedDays = { ...newData.completedDays, [today]: todayEntry };
      saveData(newData);
      return newData;
    });
  };

  const handleNotesChange = (ev) => {
    const newNotes = ev.target.value;
    setNotes(newNotes);

    setData(prevData => {
      const newData = { ...prevData };
      const todayEntry = newData.completedDays[today] || { sets: {}, notes: '', allComplete: false };
      todayEntry.notes = newNotes;
      newData.completedDays = { ...newData.completedDays, [today]: todayEntry };
      saveData(newData);
      return newData;
    });
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleCard = (id) => setExpandedCard(prev => prev === id ? null : id);

  return e('div', { className: 'app-container' },
    e('header', null,
      e('h1', null, 'Knee Rehab Tracker'),
      e('button', { id: 'theme-toggle', onClick: toggleTheme, 'aria-label': 'Toggle dark mode' },
        e('span', { className: 'sun-icon', style: { display: theme === 'dark' ? 'block' : 'none' } }, '☀️'),
        e('span', { className: 'moon-icon', style: { display: theme === 'light' ? 'block' : 'none' } }, '🌙')
      )
    ),
    e(StatsBar, { streak, totalDays, todayProgress, totalDaily: DAILY_EXERCISE_IDS.length }),
    e('section', { className: 'exercise-section' },
      e('h2', null, 'Daily Exercises'),
      EXERCISES.daily.map(exercise =>
        e(ExerciseCard, {
          key: exercise.id,
          exercise,
          completedSets: todayData.sets[exercise.id] || 0,
          onSetChange: handleSetChange,
          isExpanded: expandedCard === exercise.id,
          onToggle: () => toggleCard(exercise.id)
        })
      )
    ),
    e('section', { className: 'exercise-section warmup-section' },
      e('h2', null, 'Pre-Run Warmup'),
      e('p', { className: 'section-note' }, 'Only do these before running'),
      EXERCISES.warmup.map(exercise =>
        e(ExerciseCard, {
          key: exercise.id,
          exercise,
          completedSets: todayData.sets[exercise.id] || 0,
          onSetChange: handleSetChange,
          isExpanded: expandedCard === exercise.id,
          onToggle: () => toggleCard(exercise.id)
        })
      )
    ),
    e('section', { className: 'notes-section' },
      e('h2', null, 'Daily Notes'),
      e('textarea', {
        id: 'daily-notes',
        value: notes,
        onChange: handleNotesChange,
        placeholder: 'How does your knee feel today? Any pain or discomfort?'
      })
    ),
    e('section', { className: 'calendar-section' },
      e('h2', null, 'This Week'),
      e(WeekView, { completedDays: data.completedDays })
    ),
    e('footer', null,
      e('p', null, 'Stay consistent, recover strong! 💪')
    )
  );
}

// Mount app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('SW registration failed:', err));
}
