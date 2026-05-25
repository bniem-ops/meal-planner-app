import { useState } from 'react';
import { X, Plus, ChevronRight, Clock } from 'lucide-react';
import { DAYS, recipes } from '../data/recipes';
import { useMealPlan } from '../hooks/useMealPlan';
import RecipePicker from './RecipePicker';
import RecipeModal from './RecipeModal';

export default function WeeklyCalendar() {
  const { plan, loading, assignMeal, clearMeal } = useMealPlan();
  const [picking, setPicking] = useState(null); // day being picked for
  const [viewing, setViewing] = useState(null); // recipe being viewed

  const getRecipe = (id) => recipes.find(r => r.id === id);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-pot">🍲</div>
      <p>Setting the table…</p>
    </div>
  );

  return (
    <div className="calendar-wrap">
      <div className="week-grid">
        {DAYS.map(day => {
          const meal = plan[day];
          const recipe = meal ? getRecipe(meal) : null;
          return (
            <div key={day} className={`day-card ${recipe ? 'has-meal' : 'empty'}`}>
              <div className="day-label">{day}</div>
              {recipe ? (
                <div className="meal-card" onClick={() => setViewing(recipe)}>
                  <div className="meal-protein-badge" data-protein={recipe.protein}>
                    {recipe.protein === 'chicken' ? '🐔' : '🥩'}
                  </div>
                  <div className="meal-info">
                    <div className="meal-name">{recipe.name}</div>
                    <div className="meal-meta">
                      <Clock size={12} />
                      <span>{recipe.time} min</span>
                    </div>
                  </div>
                  <button
                    className="meal-remove"
                    onClick={e => { e.stopPropagation(); clearMeal(day); }}
                    aria-label="Remove meal"
                  >
                    <X size={14} />
                  </button>
                  <ChevronRight size={14} className="meal-arrow" />
                </div>
              ) : (
                <button className="add-meal-btn" onClick={() => setPicking(day)}>
                  <Plus size={18} />
                  <span>Add meal</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {picking && (
        <RecipePicker
          day={picking}
          onSelect={(recipe) => { assignMeal(picking, recipe.id); setPicking(null); }}
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
