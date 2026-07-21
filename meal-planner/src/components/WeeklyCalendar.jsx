import { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronRight, ChevronLeft, Clock, Copy, ChevronDown, Sparkles, ChefHat, CalendarDays } from 'lucide-react';
import { DAYS, recipes, getWeekId, shiftWeekId, getWeekRangeLabel } from '../data/recipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useWeeklyReview } from '../hooks/useWeeklyReview';
import { useHousehold } from '../hooks/useHousehold';
import { getAllergenWarnings } from '../lib/allergenUtils';
import RecipePicker from './RecipePicker';
import RecipeModal from './RecipeModal';
import PlanMyWeek from './PlanMyWeek';
import IngredientSearch from './IngredientSearch';
import WeeklyReviewSheet from './WeeklyReviewSheet';
import MonthCalendar from './MonthCalendar';
import AllergyBadge from './AllergyBadge';

export default function WeeklyCalendar() {
  const [activeWeekId, setActiveWeekId] = useState(getWeekId());
  const { plan, loading, assignMeal, clearMeal, applyPlan } = useMealPlan(activeWeekId);
  const { customRecipes } = useCustomRecipes();
  const { showBanner, review, saving, saveReview, dismiss } = useWeeklyReview();

  const [picking, setPicking]       = useState(null);
  const [viewing, setViewing]       = useState(null);
  const [leftoverOpen, setLeftoverOpen] = useState(null);
  const [planning, setPlanning]         = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState(false);
  const [reviewOpen, setReviewOpen]     = useState(false);
  const [monthOpen, setMonthOpen]       = useState(false);

  const isCurrentWeek = activeWeekId === getWeekId();

  const allRecipes = [...recipes, ...customRecipes];
  const getRecipe  = (id) => allRecipes.find(r => r.id === id);

  const plannedDinners = DAYS
    .map(day => {
      const id     = plan[`${day}_dinner`] || plan[day];
      const recipe = id ? getRecipe(id) : null;
      return recipe ? { day, recipe } : null;
    })
    .filter(Boolean);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-pot">🍲</div>
      <p>Setting the table…</p>
    </div>
  );

  return (
    <div className="calendar-wrap">

      {/* ── Sunday review banner ── */}
      {showBanner && (
        <div className="review-banner">
          <div className="review-banner-inner">
            <span className="review-banner-icon">⭐</span>
            <div className="review-banner-text">
              <strong>How was this week?</strong>
              <span>Rate your meals and save notes for next time</span>
            </div>
            <button
              className="review-banner-btn"
              onClick={() => setReviewOpen(true)}
            >
              Review week
            </button>
            <button
              className="review-banner-dismiss"
              onClick={dismiss}
              aria-label="Dismiss review"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div className="week-nav-row">
        <button className="week-nav-btn" onClick={() => setActiveWeekId(w => shiftWeekId(w, -1))} aria-label="Previous week">
          <ChevronLeft size={18} />
        </button>
        <div className="week-nav-center">
          <span className="week-nav-range">Week of {getWeekRangeLabel(activeWeekId)}</span>
          {isCurrentWeek ? (
            <span className="week-nav-badge">This week</span>
          ) : (
            <button className="week-nav-today-btn" onClick={() => setActiveWeekId(getWeekId())}>Jump to today</button>
          )}
        </div>
        <button className="week-nav-btn" onClick={() => setActiveWeekId(w => shiftWeekId(w, 1))} aria-label="Next week">
          <ChevronRight size={18} />
        </button>
        <button className="week-nav-btn" onClick={() => setMonthOpen(true)} aria-label="Open calendar">
          <CalendarDays size={17} />
        </button>
      </div>

      {/* Action buttons row */}
      <div className="planner-action-row">
        <button className="plan-my-week-btn" onClick={() => setPlanning(true)}>
          <Sparkles size={16} />
          Plan my week
        </button>
        <button className="what-can-i-make-btn" onClick={() => setIngredientSearch(true)}>
          <ChefHat size={16} />
          What can I make?
        </button>
      </div>

      <div className="week-grid">
        {DAYS.map((day) => {
          const lunchKey  = `${day}_lunch`;
          const dinnerKey = `${day}_dinner`;
          const lunchId   = plan[lunchKey];
          const dinnerId  = plan[dinnerKey] || plan[day];
          const lunchRecipe  = lunchId  ? getRecipe(lunchId)  : null;
          const dinnerRecipe = dinnerId ? getRecipe(dinnerId) : null;

          return (
            <div key={day} className="day-card">
              <div className="day-label">{day}</div>

              <div className="meal-slot">
                <div className="slot-label">🌞 Lunch</div>
                {lunchRecipe ? (
                  <MealRow
                    recipe={lunchRecipe}
                    onView={() => setViewing(lunchRecipe)}
                    onClear={() => clearMeal(lunchKey)}
                  />
                ) : (
                  <div className="empty-slot-row">
                    <button className="add-meal-btn add-meal-btn-sm"
                      onClick={() => setPicking({ day, slot: 'lunch' })}>
                      <Plus size={14} /> Add
                    </button>
                    {plannedDinners.length > 0 && (
                      <LeftoversDropdown
                        day={day}
                        dinners={plannedDinners}
                        isOpen={leftoverOpen === day}
                        onToggle={() => setLeftoverOpen(leftoverOpen === day ? null : day)}
                        onSelect={(recipeId) => { assignMeal(lunchKey, recipeId); setLeftoverOpen(null); }}
                        onClose={() => setLeftoverOpen(null)}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="meal-slot meal-slot-dinner">
                <div className="slot-label">🌙 Dinner</div>
                {dinnerRecipe ? (
                  <MealRow
                    recipe={dinnerRecipe}
                    onView={() => setViewing(dinnerRecipe)}
                    onClear={() => clearMeal(dinnerKey)}
                  />
                ) : (
                  <button className="add-meal-btn add-meal-btn-sm"
                    onClick={() => setPicking({ day, slot: 'dinner' })}>
                    <Plus size={14} /> Add dinner
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {picking && (
        <RecipePicker
          day={picking.day}
          slot={picking.slot}
          onSelect={(recipe) => { assignMeal(`${picking.day}_${picking.slot}`, recipe.id); setPicking(null); }}
          onClose={() => setPicking(null)}
        />
      )}

      {viewing && <RecipeModal recipe={viewing} onClose={() => setViewing(null)} />}

      {ingredientSearch && (
        <IngredientSearch onClose={() => setIngredientSearch(false)} />
      )}

      {planning && (
        <PlanMyWeek
          currentPlan={plan}
          onApply={applyPlan}
          onClose={() => setPlanning(false)}
        />
      )}

      {reviewOpen && (
        <WeeklyReviewSheet
          plan={plan}
          allRecipes={allRecipes}
          existingReview={review}
          saving={saving}
          onSave={async (data) => { await saveReview(data); setReviewOpen(false); }}
          onClose={() => setReviewOpen(false)}
        />
      )}

      {monthOpen && (
        <MonthCalendar
          initialWeekId={activeWeekId}
          onSelectWeek={(weekId) => { setActiveWeekId(weekId); setMonthOpen(false); }}
          onClose={() => setMonthOpen(false)}
        />
      )}
    </div>
  );
}

function MealRow({ recipe, onView, onClear }) {
  const { members } = useHousehold();
  return (
    <div className="meal-card">
      <div className="meal-card-content" onClick={onView}>
        <div className="meal-protein-badge" data-protein={recipe.protein}>
          {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
        </div>
        <div className="meal-info">
          <div className="meal-name">{recipe.name}</div>
          <div className="meal-meta">
            <Clock size={12} /><span>{recipe.time} min</span>
            <AllergyBadge warnings={getAllergenWarnings(recipe, members)} />
          </div>
        </div>
      </div>
      <button
        className="meal-remove"
        onPointerUp={(e) => { e.stopPropagation(); onClear(); }}
        aria-label="Remove meal"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function LeftoversDropdown({ day, dinners, isOpen, onToggle, onSelect, onClose }) {
  const ref = useRef(null);
  const [opensUp, setOpensUp] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpensUp(spaceBelow < 260 && rect.top > spaceBelow);
  }, [isOpen]);

  return (
    <div className="leftovers-wrap" ref={ref}>
      <button className="leftovers-btn" onClick={onToggle}>
        <Copy size={13} />
        Leftovers
        <ChevronDown size={12} className={`leftovers-chevron ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className={`leftovers-dropdown ${opensUp ? 'opens-up' : ''}`}>
          <div className="leftovers-dropdown-label">Leftovers from…</div>
          {dinners.map(({ day: dinnerDay, recipe }) => (
            <button key={dinnerDay} className="leftovers-option" onClick={() => onSelect(recipe.id)}>
              <div className="leftovers-option-info">
                <div className="leftovers-option-name">{recipe.name}</div>
                <div className="leftovers-option-day">🌙 {dinnerDay}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
