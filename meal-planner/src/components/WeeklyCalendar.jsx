import { useState } from 'react';
import { X, Plus, ChevronRight, Clock, Copy } from 'lucide-react';
import { DAYS, recipes } from '../data/recipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import RecipePicker from './RecipePicker';
import RecipeModal from './RecipeModal';

export default function WeeklyCalendar() {
  const { plan, loading, assignMeal, clearMeal } = useMealPlan();
  const { customRecipes } = useCustomRecipes();
  const [picking, setPicking] = useState(null); // { day, slot }
  const [viewing, setViewing] = useState(null);

  const allRecipes = [...recipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  const handleSetLeftovers = (day) => {
    const dayIndex = DAYS.indexOf(day);
    if (dayIndex === 0) return;
    const prevDay = DAYS[dayIndex - 1];
    const prevDinner = plan[`${prevDay}_dinner`] || plan[prevDay]; // support old format
    if (prevDinner) assignMeal(`${day}_lunch`, prevDinner);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-pot">🍲</div>
      <p>Setting the table…</p>
    </div>
  );

  return (
    <div className="calendar-wrap">
      <div className="week-grid">
        {DAYS.map((day, dayIndex) => {
          const lunchKey = `${day}_lunch`;
          const dinnerKey = `${day}_dinner`;
          const lunchId = plan[lunchKey];
          const dinnerId = plan[dinnerKey] || plan[day]; // support old format
          const lunchRecipe = lunchId ? getRecipe(lunchId) : null;
          const dinnerRecipe = dinnerId ? getRecipe(dinnerId) : null;
          const prevDay = dayIndex > 0 ? DAYS[dayIndex - 1] : null;
          const prevDinner = prevDay ? (plan[`${prevDay}_dinner`] || plan[prevDay]) : null;

          return (
            <div key={day} className="day-card">
              <div className="day-label">{day}</div>

              {/* Lunch slot */}
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
                    {prevDinner && !lunchId && (
                      <button className="leftovers-btn" onClick={() => handleSetLeftovers(day)}>
                        <Copy size={13} /> Leftovers
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dinner slot */}
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
          onSelect={(recipe) => {
            assignMeal(`${picking.day}_${picking.slot}`, recipe.id);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}

      {viewing && (
        <RecipeModal
          recipe={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

function MealRow({ recipe, onView, onClear }) {
  return (
    <div className="meal-card" onClick={onView}>
      <div className="meal-protein-badge" data-protein={recipe.protein}>
        {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
      </div>
      <div className="meal-info">
        <div className="meal-name">{recipe.name}</div>
        <div className="meal-meta"><Clock size={12} /><span>{recipe.time} min</span></div>
      </div>
      <button className="meal-remove" onClick={e => { e.stopPropagation(); onClear(); }} aria-label="Remove">
        <X size={14} />
      </button>
      <ChevronRight size={14} className="meal-arrow" />
    </div>
  );
}
