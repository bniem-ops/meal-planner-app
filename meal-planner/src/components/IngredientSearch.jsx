import { useState, useMemo } from 'react';
import { X, Search, Plus, ChefHat, Clock, Users } from 'lucide-react';
import { recipes as builtInRecipes } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useRatings } from '../hooks/useRatings';
import { ingredientOverlapScore, getSharedPerishables, PERISHABLES } from '../lib/ingredientUtils';

// Common pantry items for quick-select chips
const QUICK_PICKS = [
  'chicken breast', 'ground beef', 'chicken thighs', 'chuck roast',
  'garlic', 'onion', 'bell pepper', 'zucchini', 'spinach', 'broccoli',
  'lemon', 'tomato', 'carrot', 'mushroom',
  'pasta', 'white rice', 'flour tortillas', 'burger buns',
  'olive oil', 'soy sauce', 'taco seasoning', 'Italian seasoning',
  'shredded cheese', 'heavy cream', 'parmesan', 'sour cream', 'butter',
  'diced tomatoes', 'black beans', 'beef broth', 'salsa',
];

// Group quick picks by category
const QUICK_PICK_GROUPS = [
  { label: 'Proteins', items: ['chicken breast', 'ground beef', 'chicken thighs', 'chuck roast'] },
  { label: 'Produce', items: ['garlic', 'onion', 'bell pepper', 'zucchini', 'spinach', 'broccoli', 'lemon', 'tomato', 'carrot', 'mushroom'] },
  { label: 'Pantry', items: ['pasta', 'white rice', 'flour tortillas', 'olive oil', 'soy sauce', 'taco seasoning', 'Italian seasoning', 'diced tomatoes', 'black beans', 'beef broth', 'salsa'] },
  { label: 'Dairy', items: ['shredded cheese', 'heavy cream', 'parmesan', 'sour cream', 'butter'] },
];

export default function IngredientSearch({ onSelectRecipe, onClose }) {
  const { customRecipes } = useCustomRecipes();
  const { ratings } = useRatings();
  const allRecipes = [...builtInRecipes, ...customRecipes];

  const [selected, setSelected] = useState(new Set());
  const [input, setInput] = useState('');
  const [showResults, setShowResults] = useState(false);

  const toggle = (item) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const addCustom = () => {
    const val = input.trim().toLowerCase();
    if (!val) return;
    setSelected(prev => new Set([...prev, val]));
    setInput('');
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
        const total = (r.ingredients || []).length;
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
        return { ...r, score, matched, missing, total };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => {
        // Primary: match ratio; secondary: raw score
        const ratioA = a.matched.length / a.total;
        const ratioB = b.matched.length / b.total;
        if (Math.abs(ratioA - ratioB) > 0.1) return ratioB - ratioA;
        return b.score - a.score;
      });
  }, [ingredientSet, allRecipes.length]);

  const matchPercent = (r) => Math.round((r.matched.length / r.total) * 100);

  return (
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

          {/* Custom ingredient input */}
          <div className="ing-input-row">
            <Search size={15} className="search-icon" style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-soft)'}} />
            <input
              className="search-input"
              style={{paddingLeft: 34}}
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
                {selected.size} ingredient{selected.size > 1 ? 's' : ''} selected
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

          {/* Find recipes button */}
          {selected.size > 0 && !showResults && (
            <button className="ing-find-btn" onClick={() => setShowResults(true)}>
              <ChefHat size={18} />
              Find recipes ({results.length} match{results.length !== 1 ? 'es' : ''})
            </button>
          )}

          {/* Results */}
          {showResults && selected.size > 0 && (
            <div className="ing-results">
              {results.length === 0 ? (
                <div className="empty-results">
                  No recipes match those ingredients yet.
                  Try adding more or browse the recipe library.
                </div>
              ) : (
                <>
                  <div className="ing-results-label">
                    {results.length} recipe{results.length !== 1 ? 's' : ''} you can make
                  </div>
                  {results.map(r => {
                    const pct = matchPercent(r);
                    const rating = ratings[r.id] || {};
                    const canMakeNow = pct === 100;
                    return (
                      <button
                        key={r.id}
                        className={`recipe-row ing-result-row ${canMakeNow ? 'can-make-now' : ''}`}
                        onClick={() => { onSelectRecipe(r); onClose(); }}
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

                          {/* Match bar */}
                          <div className="ing-match-row">
                            <div className="ing-match-track">
                              <div
                                className="ing-match-fill"
                                style={{ width: `${pct}%` }}
                                data-full={canMakeNow}
                              />
                            </div>
                            <span className="ing-match-pct">{pct}%</span>
                          </div>

                          {/* Have / need */}
                          <div className="ing-have-need">
                            {r.matched.length > 0 && (
                              <span className="ing-have">
                                ✓ {r.matched.slice(0, 3).map(i => i.item).join(', ')}
                                {r.matched.length > 3 ? ` +${r.matched.length - 3}` : ''}
                              </span>
                            )}
                            {r.missing.length > 0 && (
                              <span className="ing-need">
                                Need: {r.missing.slice(0, 2).map(i => i.item).join(', ')}
                                {r.missing.length > 2 ? ` +${r.missing.length - 2}` : ''}
                              </span>
                            )}
                          </div>

                          <div className="recipe-row-tags">
                            <span className="tag time-tag"><Clock size={11} /> {r.time} min</span>
                            {r.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Quick picks — show when no results visible */}
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
                        {selected.has(item) ? <><X size={11} /> {item}</> : <><Plus size={11} /> {item}</>}
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
  );
}
