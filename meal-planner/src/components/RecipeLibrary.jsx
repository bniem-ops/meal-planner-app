import { useState } from 'react';
import { Clock, Users, Search, Plus, Pencil, Trash2, Link } from 'lucide-react';
import { getCurrentSeason, SEASON_LABELS } from '../lib/ingredientUtils';
import { recipes as builtInRecipes } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import RecipeModal from './RecipeModal';
import RecipeForm from './RecipeForm';
import RecipeImport from './RecipeImport';

export default function RecipeLibrary() {
  const { customRecipes, addRecipe, updateRecipe, deleteRecipe } = useCustomRecipes();
  const [viewing, setViewing]           = useState(null);
  const [editing, setEditing]           = useState(null);
  const [importing, setImporting]       = useState(false);
  const [filter, setFilter]             = useState('all');
  const [quickOnly, setQuickOnly]       = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const currentSeason = getCurrentSeason();
  const [search, setSearch]             = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const allRecipes = [...builtInRecipes, ...customRecipes];

  const filtered = allRecipes.filter(r => {
    if (filter !== 'all' && r.protein !== filter) return false;
    if (quickOnly && r.time > 30) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (seasonFilter !== 'all' && r.season && r.season !== seasonFilter) return false;
    // TODO: onboarding will capture allergies per person — filter allergy-flagged recipes here
    if (dietaryFilter !== 'all' && !r.tags?.includes(dietaryFilter)) return false;
    return true;
  });

  const handleSave = async (data) => {
    if (editing?.id && editing.custom) {
      await updateRecipe(editing.id, data);
    } else {
      await addRecipe(data);
    }
  };

  const handleDelete = async (recipe) => {
    if (confirmDelete === recipe.id) {
      await deleteRecipe(recipe.id);
      setConfirmDelete(null);
      if (viewing?.id === recipe.id) setViewing(null);
    } else {
      setConfirmDelete(recipe.id);
    }
  };

  // When import succeeds, pre-fill the recipe form with extracted data
  const handleImported = (importedData) => {
    // Convert to form-compatible shape — RecipeForm will pre-fill from this
    setEditing({
      name:           importedData.name,
      protein:        importedData.protein,
      time:           importedData.time,
      servings:       importedData.servings,
      description:    importedData.description,
      prepNote:       '',
      ingredientText: importedData.ingredientText,
      stepText:       importedData.stepText,
      tags:           [],
      // Flag so RecipeForm treats it as a new recipe (no id = new)
    });
  };

  return (
    <div className="library-wrap">
      <div className="library-controls">
        <div className="search-row">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-row">
          {['all', 'chicken', 'beef'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'chicken' ? '🐔 Chicken' : '🥩 Beef'}
            </button>
          ))}
          <button
            className={`filter-btn ${quickOnly ? 'active' : ''}`}
            onClick={() => setQuickOnly(!quickOnly)}
          >
            ⚡ Quick
          </button>
        </div>
        <div className="filter-row" style={{marginTop: 6}}>
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
        <div className="filter-row" style={{marginTop: 6}}>
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
      </div>

      <div className="library-grid">
        {/* Add manually */}
        <button className="library-card add-recipe-card" onClick={() => setEditing({})}>
          <div className="add-recipe-inner">
            <Plus size={26} className="add-recipe-icon" />
            <span className="add-recipe-label">Add recipe</span>
          </div>
        </button>

        {/* Import from URL */}
        <button className="library-card add-recipe-card import-card" onClick={() => setImporting(true)}>
          <div className="add-recipe-inner">
            <Link size={26} className="add-recipe-icon" />
            <span className="add-recipe-label">Import URL</span>
          </div>
        </button>


        {filtered.map(recipe => (
          <div key={recipe.id} className="library-card-wrap">
            <button className="library-card" onClick={() => setViewing(recipe)}>
              <div className="library-card-top" data-protein={recipe.protein}>
                <span className="library-emoji">
                  {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
                </span>
                <div className="library-time">
                  <Clock size={12} />
                  {recipe.time} min
                </div>
              </div>
              <div className="library-card-body">
                <div className="library-name">{recipe.name}</div>
                <div className="library-desc">{recipe.description}</div>
                <div className="library-footer">
                  <span className="library-servings"><Users size={12} /> {recipe.servings}</span>
                  <div className="library-tags">
                    {recipe.tags?.slice(0, 2).map(t => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                    {recipe.custom && <span className="tag custom-tag">custom</span>}
                  {recipe.season && recipe.season === currentSeason && (
                    <span className="tag season-badge-sm">{SEASON_LABELS[recipe.season]}</span>
                  )}
                  </div>
                </div>
              </div>
            </button>

            {recipe.custom && (
              <div className="recipe-card-actions">
                <button className="card-action-btn edit" onClick={() => setEditing(recipe)} title="Edit">
                  <Pencil size={13} />
                </button>
                <button
                  className={`card-action-btn delete ${confirmDelete === recipe.id ? 'confirm' : ''}`}
                  onClick={() => handleDelete(recipe)}
                  title={confirmDelete === recipe.id ? 'Tap again to confirm' : 'Delete'}
                >
                  <Trash2 size={13} />
                  {confirmDelete === recipe.id && <span>confirm?</span>}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {viewing && (
        <RecipeModal
          recipe={viewing}
          onClose={() => setViewing(null)}
          onEdit={viewing.custom ? () => { setEditing(viewing); setViewing(null); } : null}
        />
      )}

      {editing !== null && (
        <RecipeForm
          recipe={editing?.id ? editing : (Object.keys(editing).length ? editing : null)}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {importing && (
        <RecipeImport
          onImported={handleImported}
          onClose={() => setImporting(false)}
        />
      )}
    </div>
  );
}
