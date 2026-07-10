import { useState, useMemo } from 'react';
import { X, Clock, Search, AlertTriangle, Leaf } from 'lucide-react';
import { recipes as builtInRecipes, COURSES, CUISINES, COURSE_LABELS, CUISINE_LABELS } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useRecentMeals } from '../hooks/useRecentMeals';
import { useRatings } from '../hooks/useRatings';
import { useMealPlan } from '../hooks/useMealPlan';
import {
  getPlannedIngredients,
  ingredientOverlapScore,
  getSharedPerishables,
  getCurrentSeason,
  SEASON_LABELS,
} from '../lib/ingredientUtils';

export default function RecipePicker({ day, slot, onSelect, onClose }) {
  const { customRecipes } = useCustomRecipes();
  const recentIds = useRecentMeals();
  const { ratings } = useRatings();
  const { plan } = useMealPlan();

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const currentSeason = getCurrentSeason();

  // Ingredients already in this week's plan
  const plannedIngredients = useMemo(
    () => getPlannedIngredients(plan, allRecipes),
    [plan, allRecipes.length]
  );

  const hasPlan = Object.keys(plan).length > 0;

  const [filter, setFilter]       = useState('all');
  const [quickOnly, setQuickOnly] = useState(false);
  const [search, setSearch]       = useState('');
  const [hideRecent, setHideRecent] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [view, setView]           = useState(hasPlan ? 'overlap' : 'all'); // overlap | all

  // Score all recipes for ingredient overlap
  const scoredRecipes = useMemo(() =>
    allRecipes.map(r => ({
      ...r,
      overlapScore: ingredientOverlapScore(r, plannedIngredients),
      sharedPerishables: getSharedPerishables(r, plannedIngredients),
    })),
    [allRecipes.length, plannedIngredients]
  );

  const overlapRecipes = scoredRecipes
    .filter(r => r.overlapScore > 0)
    .sort((a, b) => b.overlapScore - a.overlapScore);

  const filtered = (view === 'overlap' ? overlapRecipes : scoredRecipes).filter(r => {
    if (filter !== 'all' && r.protein !== filter) return false;
    if (quickOnly && r.time > 30) return false;
    if (hideRecent && recentIds.has(r.id)) return false;
    if (slot === 'lunch' && r.tags?.includes('dinner-only')) return false;
    if (slot === 'dinner' && r.tags?.includes('lunch-only')) return false;
    if (seasonFilter !== 'all' && r.season && r.season !== seasonFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    // TODO: onboarding will capture allergies per person — filter allergy-flagged recipes here
    if (dietaryFilter !== 'all' && !r.tags?.includes(dietaryFilter)) return false;
    if (courseFilter !== 'all' && (r.course || 'main') !== courseFilter) return false;
    if (cuisineFilter !== 'all' && (r.cuisine || 'other') !== cuisineFilter) return false;
    return true;
  });

  const hiddenCount = scoredRecipes.filter(r => recentIds.has(r.id)).length;

  const getRatingBadge = (id) => {
    const r = ratings[id] || {};
    if (r.thumbs === 'up') return '👍';
    if (r.thumbs === 'down') return '👎';
    return null;
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div>
            <h2 className="picker-title">Pick a meal</h2>
            <p className="picker-subtitle">
              {slot === 'lunch' ? '🌞 Lunch' : '🌙 Dinner'} · {day}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="picker-controls">
          {/* View toggle — overlap vs all */}
          {hasPlan && overlapRecipes.length > 0 && (
            <div className="picker-view-toggle">
              <button
                className={`view-toggle-btn ${view === 'overlap' ? 'active' : ''}`}
                onClick={() => setView('overlap')}
              >
                <Leaf size={13} /> Use what you have ({overlapRecipes.length})
              </button>
              <button
                className={`view-toggle-btn ${view === 'all' ? 'active' : ''}`}
                onClick={() => setView('all')}
              >
                All recipes
              </button>
            </div>
          )}

          <div className="search-row">
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search recipes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="filter-row">
            {['all', 'chicken', 'beef'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All proteins' : f === 'chicken' ? '🐔 Chicken' : '🥩 Beef'}
              </button>
            ))}
            <button
              className={`filter-btn ${quickOnly ? 'active' : ''}`}
              onClick={() => setQuickOnly(!quickOnly)}
            >
              ⚡ Under 30 min
            </button>
          </div>

          {/* Season filter */}
          <div className="filter-row">
            <button
              className={`filter-btn filter-btn-sm ${seasonFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSeasonFilter('all')}
            >
              All seasons
            </button>
            {Object.entries(SEASON_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`filter-btn filter-btn-sm ${seasonFilter === key ? 'active' : ''} ${key === currentSeason ? 'season-current' : ''}`}
                onClick={() => setSeasonFilter(seasonFilter === key ? 'all' : key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dietary filter */}
          <div className="filter-row">
            {[
              { val: 'all',            label: 'All' },
              { val: 'vegetarian',     label: '🥗 Veg' },
              { val: 'vegan',          label: '🌱 Vegan' },
              { val: 'dairy-free',     label: '🥛 Dairy-free' },
              { val: 'gluten-free',    label: '🌾 GF' },
              { val: 'freeze-friendly',label: '❄️ Freezable' },
              { val: 'high-protein',   label: '💪 High protein' },
            ].map(o => (
              <button
                key={o.val}
                className={`filter-btn filter-btn-sm ${dietaryFilter === o.val ? 'active' : ''}`}
                onClick={() => setDietaryFilter(o.val)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Course filter */}
          <div className="filter-row">
            <button
              className={`filter-btn filter-btn-sm ${courseFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCourseFilter('all')}
            >
              All courses
            </button>
            {COURSES.map(c => (
              <button
                key={c}
                className={`filter-btn filter-btn-sm ${courseFilter === c ? 'active' : ''}`}
                onClick={() => setCourseFilter(courseFilter === c ? 'all' : c)}
              >
                {COURSE_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Cuisine filter */}
          <div className="filter-row">
            <button
              className={`filter-btn filter-btn-sm ${cuisineFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCuisineFilter('all')}
            >
              All cuisines
            </button>
            {CUISINES.map(c => (
              <button
                key={c}
                className={`filter-btn filter-btn-sm ${cuisineFilter === c ? 'active' : ''}`}
                onClick={() => setCuisineFilter(cuisineFilter === c ? 'all' : c)}
              >
                {CUISINE_LABELS[c]}
              </button>
            ))}
          </div>

          {hiddenCount > 0 && (
            <button className="repeat-toggle" onClick={() => setHideRecent(!hideRecent)}>
              <AlertTriangle size={13} />
              {hideRecent
                ? `${hiddenCount} recently made meal${hiddenCount > 1 ? 's' : ''} hidden — show anyway`
                : `Hide ${hiddenCount} recently made meal${hiddenCount > 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        <div className="recipe-list">
          {view === 'overlap' && filtered.length === 0 && (
            <div className="empty-results">
              No ingredient matches with current filters.
              <button className="switch-view-link" onClick={() => setView('all')}>
                Browse all recipes →
              </button>
            </div>
          )}
          {view === 'all' && filtered.length === 0 && (
            <div className="empty-results">
              {hideRecent && hiddenCount > 0
                ? 'All matching recipes were made recently. Tap above to show them.'
                : 'No recipes match those filters.'}
            </div>
          )}

          {filtered.map(recipe => {
            const badge = getRatingBadge(recipe.id);
            const isRecent = recentIds.has(recipe.id);
            const perish = recipe.sharedPerishables || [];

            return (
              <button
                key={recipe.id}
                className={`recipe-row ${isRecent ? 'recipe-row-recent' : ''}`}
                onClick={() => onSelect(recipe)}
              >
                <div className="recipe-row-emoji">
                  {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
                </div>
                <div className="recipe-row-info">
                  <div className="recipe-row-name-row">
                    <div className="recipe-row-name">{recipe.name}</div>
                    {badge && <span className="rating-badge">{badge}</span>}
                    {isRecent && <span className="recent-badge">recent</span>}
                    {recipe.season && recipe.season === currentSeason && (
                      <span className="season-badge">{SEASON_LABELS[recipe.season]}</span>
                    )}
                  </div>
                  <div className="recipe-row-desc">{recipe.description}</div>

                  {/* Shared perishables callout */}
                  {perish.length > 0 && (
                    <div className="shared-ingredients-row">
                      <Leaf size={11} />
                      Uses: {perish.slice(0, 3).join(', ')}
                    </div>
                  )}

                  <div className="recipe-row-tags">
                    <span className="tag time-tag"><Clock size={11} /> {recipe.time} min</span>
                    {recipe.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                    {recipe.custom && <span className="tag custom-tag">custom</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
