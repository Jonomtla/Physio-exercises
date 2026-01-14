const { useState, useEffect, useCallback } = React;

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

const DAILY_EXERCISE_IDS = EXERCISES.daily.map(e => e.id);
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
  } catch {
    return { completedDays: {} };
  }
};

const saveData = (data) => {
  try {
    localStorage.setItem('knee-rehab-data', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

// Components
const SetCounter = ({ current, total, onIncrement, onDecrement }) => (
  <div className="set-counter" onClick={(e) => e.stopPropagation()}>
    <button
      className="set-btn"
      onClick={onDecrement}
      disabled={current === 0}
      aria-label="Decrease sets"
    >
      −
    </button>
    <span className="set-display">
      <span className={`set-current ${current === total ? 'complete' : ''}`}>{current}</span>
      <span className="set-separator">/</span>
      <span className="set-total">{total}</span>
    </span>
    <button
      className="set-btn"
      onClick={onIncrement}
      disabled={current === total}
      aria-label="Increase sets"
    >
      +
    </button>
  </div>
);

const ExerciseCard = ({ exercise, completedSets, onSetChange, isExpanded, onToggle }) => {
  const isComplete = completedSets >= exercise.sets;

  return (
    <div className={`exercise-card ${isComplete ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="exercise-header" onClick={onToggle}>
        <div className={`completion-indicator ${isComplete ? 'done' : ''}`}>
          {isComplete ? '✓' : ''}
        </div>
        <div className="exercise-title">
          <h3>{exercise.name}</h3>
          <span className="exercise-reps">{exercise.reps}</span>
        </div>
        <SetCounter
          current={completedSets}
          total={exercise.sets}
          onIncrement={() => onSetChange(exercise.id, completedSets + 1)}
          onDecrement={() => onSetChange(exercise.id, completedSets - 1)}
        />
        <span className="expand-icon">▼</span>
      </div>
      <div className="exercise-details">
        <div className="exercise-image">
          <img src={exercise.image} alt={`${exercise.name} demonstration`} loading="lazy" />
        </div>
        <div className="exercise-instructions">
          {exercise.instructions.map((inst, i) => (
            <p key={i}><strong>{inst.label}:</strong> {inst.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeekView = ({ completedDays }) => {
  const weekDates = getWeekDates();
  const today = getTodayString();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="week-view">
      {weekDates.map((date, index) => {
        const dateString = date.toISOString().split('T')[0];
        const isToday = dateString === today;
        const dayData = completedDays[dateString];
        const isComplete = dayData?.allComplete;

        let classes = 'day-cell';
        if (isToday) classes += ' today';
        if (isComplete) classes += ' completed';

        return (
          <div key={dateString} className={classes}>
            <span className="day-name">{dayNames[index]}</span>
            <span className="day-number">{date.getDate()}</span>
            <span className="day-status">{isComplete ? '✓' : (isToday ? '•' : '')}</span>
          </div>
        );
      })}
    </div>
  );
};

const StatsBar = ({ streak, totalDays, todayProgress, totalDaily }) => (
  <div className="stats-bar">
    <div className="stat">
      <span className="stat-value">{streak}</span>
      <span className="stat-label">Day Streak</span>
    </div>
    <div className="stat">
      <span className="stat-value">{totalDays}</span>
      <span className="stat-label">Total Days</span>
    </div>
    <div className="stat">
      <span className="stat-value">{todayProgress}/{totalDaily}</span>
      <span className="stat-label">Today</span>
    </div>
  </div>
);

const App = () => {
  const [data, setData] = useState(() => loadData());
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('knee-rehab-theme');
    if (saved) return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
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

    // Calculate streak
    let streak = 0;
    let checkDate = new Date();
    const todayComplete = data.completedDays[today]?.allComplete;

    if (!todayComplete) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateString = checkDate.toISOString().split('T')[0];
      if (data.completedDays[dateString]?.allComplete) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, totalDays };
  }, [data, today]);

  const { streak, totalDays } = calculateStats();

  // Count completed exercises for today
  const todayProgress = DAILY_EXERCISE_IDS.filter(id => {
    const exercise = ALL_EXERCISES.find(e => e.id === id);
    return (todayData.sets[id] || 0) >= exercise.sets;
  }).length;

  // Handle set change
  const handleSetChange = (exerciseId, newSets) => {
    setData(prevData => {
      const newData = { ...prevData };
      const todayEntry = newData.completedDays[today] || { sets: {}, notes: '', allComplete: false };

      todayEntry.sets = { ...todayEntry.sets, [exerciseId]: newSets };

      // Check if all daily exercises are complete
      todayEntry.allComplete = DAILY_EXERCISE_IDS.every(id => {
        const exercise = ALL_EXERCISES.find(e => e.id === id);
        return (todayEntry.sets[id] || 0) >= exercise.sets;
      });

      newData.completedDays = { ...newData.completedDays, [today]: todayEntry };
      saveData(newData);
      return newData;
    });
  };

  // Handle notes change
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
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

  return (
    <div className="app-container">
      <header>
        <h1>Knee Rehab Tracker</h1>
        <button id="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
          <span className="sun-icon" style={{ display: theme === 'dark' ? 'block' : 'none' }}>☀️</span>
          <span className="moon-icon" style={{ display: theme === 'light' ? 'block' : 'none' }}>🌙</span>
        </button>
      </header>

      <StatsBar
        streak={streak}
        totalDays={totalDays}
        todayProgress={todayProgress}
        totalDaily={DAILY_EXERCISE_IDS.length}
      />

      <section className="exercise-section">
        <h2>Daily Exercises</h2>
        {EXERCISES.daily.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completedSets={todayData.sets[exercise.id] || 0}
            onSetChange={handleSetChange}
            isExpanded={expandedCard === exercise.id}
            onToggle={() => toggleCard(exercise.id)}
          />
        ))}
      </section>

      <section className="exercise-section warmup-section">
        <h2>Pre-Run Warmup</h2>
        <p className="section-note">Only do these before running</p>
        {EXERCISES.warmup.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completedSets={todayData.sets[exercise.id] || 0}
            onSetChange={handleSetChange}
            isExpanded={expandedCard === exercise.id}
            onToggle={() => toggleCard(exercise.id)}
          />
        ))}
      </section>

      <section className="notes-section">
        <h2>Daily Notes</h2>
        <textarea
          id="daily-notes"
          value={notes}
          onChange={handleNotesChange}
          placeholder="How does your knee feel today? Any pain or discomfort?"
        />
      </section>

      <section className="calendar-section">
        <h2>This Week</h2>
        <WeekView completedDays={data.completedDays} />
      </section>

      <footer>
        <p>Stay consistent, recover strong! 💪</p>
      </footer>
    </div>
  );
};

// Mount app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('SW registration failed:', err));
}
