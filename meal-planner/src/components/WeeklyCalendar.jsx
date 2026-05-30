import { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronRight, Clock, Copy, ChevronDown } from 'lucide-react';
import { DAYS, recipes } from '../data/recipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import RecipePicker from './RecipePicker';
import RecipeModal from './RecipeModal';

export default function WeeklyCalendar() {
  const { plan, loading, assignMeal, clearMeal } = useMealPlan();
  const { customRecipes } = useCustomRecipes();
  const [picking, setPicking] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [leftoverOpen, setLeftoverOpen] = useState(null);

  const allRecipes = [...recipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  const plannedDinners = DAYS
    .map(day => {
      const id = plan[`${day}_dinner`] || plan[day];
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
      <div className="week-grid">
        {DAYS.map((day) => {
          const lunchKey = `${day}_lunch`;
          const dinnerKey = `${day}_dinner`;
          const lunchId = plan[lunchKey];
          const dinnerId = plan[dinnerKey] || plan[day];
          const lunchRecipe = lunchId ? getRecipe(lunchId) : null;
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
                    <button className="add-meal-btn add-meal-btn-sm" onClick={() => setPicking({ day, slot: 'lunch' })}>
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
                  <button className="add-meal-btn add-meal-btn-sm" onClick={() => setPicking({ day, slot: 'dinner' })}>
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
    </div>
  );
}

function MealRow({ recipe, onView, onClear }) {
  return (
    <div className="meal-card">
      <div className="meal-card-content" onClick={onView}>
        <div className="meal-protein-badge" data-protein={recipe.protein}>
          {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
        </div>
        <div className="meal-info">
          <div className="meal-name">{recipe.name}</div>
          <div className="meal-meta"><Clock size={12} /><span>{recipe.time} min</span></div>
        </div>
      </div>
      {/* Large tap target for mobile remove */}
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

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, onClose]);

  return (
    <div className="leftovers-wrap" ref={ref}>
      <button className="leftovers-btn" onClick={onToggle}>
        <Copy size={13} />
        Leftovers
        <ChevronDown size={12} className={`leftovers-chevron ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="leftovers-dropdown">
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
