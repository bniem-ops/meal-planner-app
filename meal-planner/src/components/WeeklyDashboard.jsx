import { ShoppingCart, RotateCcw } from 'lucide-react';
import { recipes as builtInRecipes } from '../data/recipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useMealHistory } from '../hooks/useMealHistory';
import { getAggregatedIngredients, getDueForRerun } from '../lib/ingredientUtils';
import WeeklyCalendar from './WeeklyCalendar';

export default function WeeklyDashboard() {
  const { plan } = useMealPlan();
  const { customRecipes } = useCustomRecipes();
  const { history } = useMealHistory(customRecipes);

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const { ingredientMap } = getAggregatedIngredients(plan, allRecipes);
  const groceryItems = Object.values(ingredientMap);
  const dueForRerun = getDueForRerun(history, 45, 3);

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <WeeklyCalendar />
      </div>

      <aside className="dashboard-side">
        <div className="insight-card dashboard-panel">
          <div className="insight-label"><ShoppingCart size={13} /> Grocery preview</div>
          {groceryItems.length === 0 ? (
            <p className="dashboard-empty">Plan some meals to see your list build here.</p>
          ) : (
            <>
              <ul className="dashboard-grocery-list">
                {groceryItems.slice(0, 8).map(i => (
                  <li key={i.item} className="dashboard-grocery-item">{i.item}</li>
                ))}
              </ul>
              {groceryItems.length > 8 && (
                <p className="dashboard-more">+{groceryItems.length - 8} more</p>
              )}
            </>
          )}
        </div>

        {dueForRerun.length > 0 && (
          <div className="insight-card dashboard-panel">
            <div className="insight-label"><RotateCcw size={13} /> Due for a rerun</div>
            <div className="rerun-list">
              {dueForRerun.map(({ recipe }) => (
                <div key={recipe.id} className="rerun-row">
                  <span className="rerun-emoji">
                    {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
                  </span>
                  <span className="rerun-name">{recipe.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
