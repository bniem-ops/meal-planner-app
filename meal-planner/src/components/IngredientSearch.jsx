import { useState, useMemo } from 'react';
import { X, Search, Plus, ChefHat, Clock, ArrowLeft, CalendarDays } from 'lucide-react';
import { recipes as builtInRecipes, DAYS } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useRatings } from '../hooks/useRatings';
import { useMealPlan } from '../hooks/useMealPlan';
import { ingredientOverlapScore } from '../lib/ingredientUtils';
import RecipeModal from './RecipeModal';

const QUICK_PICK_GROUPS = [
  { label: 'Proteins 🥩', items: ['chicken breast', 'ground beef', 'chicken thighs', 'chuck roast'] },
  { label: 'Produce 🥦', items: ['garlic', 'onion', 'bell pepper', 'zucchini', 'spinach', 'broccoli', 'lemon', 'tomato', 'carrot', 'mushroom'] },
  { label: 'Pantry 🫙', items: ['pasta', 'white rice', 'flour tortillas', 'olive oil', 'soy sauce', 'taco seasoning', 'Italian seasoning', 'diced tomatoes', 'black beans', 'beef broth', 'salsa'] },
  { label: 'Dairy 🧀', items: ['shredded cheese', 'heavy cream', 'parmesan', 'sour cream', 'butter'] },
];

export default function IngredientSearch({ onClose }) {
  const { customRecipes } = useCustomRecipes();
  const { ratings } = useRatings();
  const { plan, assignMeal } = useMealPlan();

  const allRecipes = [...builtInRecipes, ...customRecipes];

  const [selected, setSelected]       = useState(new Set());
  const [input, setInput]             = useState('');
  const [showResults, setShowResults] = useState(false);
  const [viewing, setViewing]         = useState(null);   // recipe being viewed in modal
  const [adding, setAdding]           = useState(null);   // recipe being added to plan
  const [addSuccess, setAddSuccess]   = useState('');     // success message

  const toggle = (item) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
    setShowResults(false);
  };

  const addCustom = () => {
    const val = input.trim().toLowerCase();
    if (!val) return;
    setSelected(prev => new Set([...prev, val]));
    setInput('');
    setShowResults(false);
  };

  // Build ingredient set for scoring
  const ingredientSet = useMemo(() => {
    const set = new Set(selected);
    selected.forEach(item => {
      item.split(/\s+/).forEach(word => { if (word.length > 3) set.add(word); });
    });
    return set;
  }, [selected]);

  // Score and rank recipes
  const results = useMemo(() => {
    if (selected.size === 0) return [];
    return allRecipes
      .map(r => {
        const score = ingredientOverlapScore(r, ingredientSet);
        const matched = (r.ingredients || []).filter(ing => {
          const name = ing.item.toLowerCase();
          if (ingredientSet.has(name)) return true;
          return name.split(/\s+/).some(w => w.length > 3 && ingredientSet.has(w));
        });
        const missing = (r.ingredients || []).filter(ing => {
          const name = ing.item.toLowerCase();
          if (ingredientSet.has(name)) return false;
          return !name.split(/\s+/).some(w => w.length > 3 && ingredientSet.has(w));
        });
        return { ...r, score, matched, missing, total: (r.ingredients || []).length };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => {
        const ratioA = a.matched.length / a.total;
        const ratioB = b.matched.length / b.total;
        if (Math.abs(ratioA - ratioB) > 0.1) return ratioB - ratioA;
        return b.score - a.score;
      });
  }, [ingredientSet, allRecipes.length]);

  const matchPct = (r) => Math.round((r.matched.length / r.total) * 100);

  const handleAddToPlan = async (day, slot) => {
    await assignMeal(`${day}_${slot}`, adding.id);
    setAddSuccess(`Added to ${day} ${slot}`);
    setAdding(null);
    setTimeout(() => setAddSuccess(''), 3000);
  };

  // Slots that are already filled
  const filledSlots = new Set(Object.keys(plan));

  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div className="picker-sheet ing-sheet" onClick={e => e.stopPropagation()}>

          <div className="picker-header">
            <div>
              <h2 className="picker-title">What can I make?</h2>
              <p className="picker-subtitle">Select ingredients you have on hand</p>
            </div>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="ing-body">

            {/* Success toast */}
            {addSuccess && (
              <div className="ing-success-toast">
                <CalendarDays size={14} /> {addSuccess}
              </div>
            )}

            {/* Custom input */}
            <div className="ing-input-row">
              <Search size={15} className="ing-input-icon" />
              <input
                className="search-input ing-input"
                placeholder="Type an ingredient and press Enter…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustom(); }}
              />
              {input && (
                <button className="ing-add-btn" onClick={addCustom}>
                  <Plus size={14} /> Add
                </button>
              )}
            </div>

            {/* Selected chips */}
            {selected.size > 0 && (
              <div className="ing-selected">
                <div className="ing-selected-label">
                  {selected.size} selected
                  <button className="ing-clear-all" onClick={() => { setSelected(new Set()); setShowResults(false); }}>
                    Clear all
                  </button>
                </div>
                <div className="ing-chips">
                  {[...selected].map(item => (
                    <button key={item} className="ing-chip ing-chip-selected" onClick={() => toggle(item)}>
                      {item} <X size={11} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Find button */}
            {selected.size > 0 && !showResults && (
              <button className="ing-find-btn" onClick={() => setShowResults(true)}>
                <ChefHat size={18} />
                Find recipes ({results.length} match{results.length !== 1 ? 'es' : ''})
              </button>
            )}

            {/* Results */}
            {showResults && (
              <div className="ing-results">
                {results.length === 0 ? (
                  <div className="empty-results">No recipes match. Try adding more ingredients.</div>
                ) : (
                  <>
                    <div className="ing-results-label">
                      {results.length} recipe{results.length !== 1 ? 's' : ''} you can make
                    </div>
                    {results.map(r => {
                      const pct = matchPct(r);
                      const rating = ratings[r.id] || {};
                      const canMakeNow = pct === 100;
                      return (
                        <div key={r.id} className={`recipe-row ing-result-row ${canMakeNow ? 'can-make-now' : ''}`}>
                          <div
                            className="ing-result-main"
                            onClick={() => setViewing(r)}
                          >
                            <div className="recipe-row-emoji">
                              {r.protein === 'chicken' ? '🐔' : r.protein === 'beef' ? '🥩' : '🍽️'}
                            </div>
                            <div className="recipe-row-info">
                              <div className="recipe-row-name-row">
                                <div className="recipe-row-name">{r.name}</div>
                                {rating.thumbs === 'up' && <span className="rating-badge">👍</span>}
                                {canMakeNow && <span className="make-now-badge">✓ Ready</span>}
                              </div>
                              <div className="ing-match-row">
                                <div className="ing-match-track">
                                  <div className="ing-match-fill" style={{ width: `${pct}%` }} data-full={canMakeNow} />
                                </div>
                                <span className="ing-match-pct">{pct}%</span>
                              </div>
                              <div className="ing-have-need">
                                {r.matched.length > 0 && (
                                  <span className="ing-have">
                                    ✓ {r.matched.slice(0, 3).map(i => i.item).join(', ')}{r.matched.length > 3 ? ` +${r.matched.length - 3}` : ''}
                                  </span>
                                )}
                                {r.missing.length > 0 && (
                                  <span className="ing-need">
                                    Need: {r.missing.slice(0, 2).map(i => i.item).join(', ')}{r.missing.length > 2 ? ` +${r.missing.length - 2}` : ''}
                                  </span>
                                )}
                              </div>
                              <div className="recipe-row-tags">
                                <span className="tag time-tag"><Clock size={11} /> {r.time} min</span>
                                {r.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                              </div>
                            </div>
                          </div>
                          {/* Add to plan button */}
                          <button
                            className="ing-add-to-plan-btn"
                            onClick={() => setAdding(r)}
                            title="Add to meal plan"
                          >
                            <CalendarDays size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Quick picks */}
            {!showResults && (
              <div className="ing-quick-picks">
                {QUICK_PICK_GROUPS.map(group => (
                  <div key={group.label} className="ing-group">
                    <div className="ing-group-label">{group.label}</div>
                    <div className="ing-chips">
                      {group.items.map(item => (
                        <button
                          key={item}
                          className={`ing-chip ${selected.has(item) ? 'ing-chip-selected' : ''}`}
                          onClick={() => toggle(item)}
                        >
                          {selected.has(item)
                            ? <><X size={11} /> {item}</>
                            : <><Plus size={11} /> {item}</>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Day/slot picker for adding to plan */}
      {adding && (
        <div className="overlay" style={{zIndex: 200}} onClick={() => setAdding(null)}>
          <div className="picker-sheet" style={{maxHeight:'80dvh'}} onClick={e => e.stopPropagation()}>
            <div className="picker-header">
              <div>
                <h2 className="picker-title">Add to plan</h2>
                <p className="picker-subtitle">{adding.name}</p>
              </div>
              <button className="close-btn" onClick={() => setAdding(null)}><X size={20} /></button>
            </div>
            <div className="recipe-list" style={{padding:'10px 12px 24px'}}>
              {DAYS.map(day => (
                <div key={day} className="add-plan-day">
                  <div className="add-plan-day-name">{day}</div>
                  <div className="add-plan-slots">
                    {['lunch', 'dinner'].map(slot => {
                      const key = `${day}_${slot}`;
                      const filled = filledSlots.has(key);
                      return (
                        <button
                          key={slot}
                          className={`add-plan-slot-btn ${filled ? 'filled' : ''}`}
                          onClick={() => handleAddToPlan(day, slot)}
                        >
                          {slot === 'lunch' ? '🌞' : '🌙'} {slot}
                          {filled && <span className="add-plan-filled-tag">replace</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe detail modal */}
      {viewing && (
        <RecipeModal
          recipe={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
