import { useState } from 'react';
import { X, Clock, Search, AlertTriangle } from 'lucide-react';
import { recipes as builtInRecipes } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useRecentMeals } from '../hooks/useRecentMeals';
import { useRatings } from '../hooks/useRatings';

export default function RecipePicker({ day, slot, onSelect, onClose }) {
  const { customRecipes } = useCustomRecipes();
  const recentIds = useRecentMeals();
  const { ratings } = useRatings();
  const allRecipes = [...builtInRecipes, ...customRecipes];

  const [filter, setFilter] = useState('all');
  const [quickOnly, setQuickOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [hideRecent, setHideRecent] = useState(true);

  const filtered = allRecipes.filter(r => {
    if (filter !== 'all' && r.protein !== filter) return false;
    if (quickOnly && r.time > 30) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (slot === 'lunch' && r.tags?.includes('dinner-only')) return false;
    if (slot === 'dinner' && r.tags?.includes('lunch-only')) return false;
    if (hideRecent && recentIds.has(r.id)) return false;
    return true;
  });

  const hiddenCount = allRecipes.filter(r => recentIds.has(r.id)).length;

  const getRatingBadge = (id) => {
    const r = ratings[id];
    if (!r) return null;
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
            <p className="picker-subtitle">{slot === 'lunch' ? '🌞 Lunch' : '🌙 Dinner'} · {day}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="picker-controls">
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
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All proteins' : f === 'chicken' ? '🐔 Chicken' : '🥩 Beef'}
              </button>
            ))}
            <button className={`filter-btn ${quickOnly ? 'active' : ''}`} onClick={() => setQuickOnly(!quickOnly)}>
              ⚡ Under 30 min
            </button>
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
          {filtered.length === 0 && (
            <div className="empty-results">
              {hideRecent && hiddenCount > 0
                ? 'All matching recipes were made recently. Tap above to show them.'
                : 'No recipes match those filters.'}
            </div>
          )}
          {filtered.map(recipe => {
            const badge = getRatingBadge(recipe.id);
            const isRecent = recentIds.has(recipe.id);
            return (
              <button key={recipe.id} className={`recipe-row ${isRecent ? 'recipe-row-recent' : ''}`} onClick={() => onSelect(recipe)}>
                <div className="recipe-row-emoji">
                  {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
                </div>
                <div className="recipe-row-info">
                  <div className="recipe-row-name-row">
                    <div className="recipe-row-name">{recipe.name}</div>
                    {badge && <span className="rating-badge">{badge}</span>}
                    {isRecent && <span className="recent-badge">recent</span>}
                  </div>
                  <div className="recipe-row-desc">{recipe.description}</div>
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
