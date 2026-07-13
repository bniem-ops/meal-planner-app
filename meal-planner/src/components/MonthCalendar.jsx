import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { recipes as builtInRecipes, getWeekId, getDayNameForDate } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useMonthPlans } from '../hooks/useMonthPlans';

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthGridDates(viewMonth) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // days back to the nearest Monday
  const gridStart = new Date(year, month, 1 - startOffset);
  const dates = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function MonthCalendar({ initialWeekId, onSelectWeek, onClose }) {
  const { customRecipes } = useCustomRecipes();
  const { plansByWeek } = useMonthPlans();
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  const today = new Date();
  const dates = getMonthGridDates(viewMonth);

  const goPrevMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToday = () => setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker-sheet month-cal-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div>
            <h2 className="picker-title">📅 Calendar</h2>
            <p className="picker-subtitle">Tap a day to jump to its week</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="month-cal-nav">
          <button className="month-cal-nav-btn" onClick={goPrevMonth}><ChevronLeft size={18} /></button>
          <div className="month-cal-title">
            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button className="month-cal-nav-btn" onClick={goNextMonth}><ChevronRight size={18} /></button>
        </div>
        <button className="month-cal-today-btn" onClick={goToday}>Today</button>

        <div className="month-cal-weekdays">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
            <div key={d} className="month-cal-weekday">{d}</div>
          ))}
        </div>

        <div className="month-cal-grid">
          {dates.map(date => {
            const weekId = getWeekId(date);
            const dayName = getDayNameForDate(date);
            const meals = plansByWeek[weekId] || {};
            const dinner = getRecipe(meals[`${dayName}_dinner`] || meals[dayName]);
            const lunch = getRecipe(meals[`${dayName}_lunch`]);
            const isCurrentMonth = date.getMonth() === viewMonth.getMonth();
            const isToday = isSameDate(date, today);
            const isInitialWeek = weekId === initialWeekId;

            return (
              <button
                key={date.toISOString()}
                className={[
                  'month-cal-cell',
                  !isCurrentMonth && 'month-cal-cell-dim',
                  isToday && 'month-cal-cell-today',
                  isInitialWeek && 'month-cal-cell-active-week',
                ].filter(Boolean).join(' ')}
                onClick={() => onSelectWeek(weekId)}
              >
                <span className="month-cal-daynum">{date.getDate()}</span>
                <span className="month-cal-dots">
                  {dinner && <span className="month-cal-dot" data-protein={dinner.protein} />}
                  {lunch && <span className="month-cal-dot month-cal-dot-lunch" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
