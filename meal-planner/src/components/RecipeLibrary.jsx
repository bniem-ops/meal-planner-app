import { useState } from 'react';
import { Clock, Users, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { recipes as builtInRecipes } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import RecipeModal from './RecipeModal';
import RecipeForm from './RecipeForm';

export default function RecipeLibrary() {
  const { customRecipes, addRecipe, updateRecipe, deleteRecipe } = useCustomRecipes();
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);   // null = closed, {} = new, recipe = edit
  const [filter, setFilter] = useState('all');
  const [quickOnly, setQuickOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const allRecipes = [...builtInRecipes, ...customRecipes];

  const filtered = allRecipes.filter(r => {
    if (filter !== 'all' && r.protein !== filter) return false;
    if (quickOnly && r.time > 30) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
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
      </div>

      <div className="library-grid">
        {/* Add new recipe card */}
        <button className="library-card add-recipe-card" onClick={() => setEditing({})}>
          <div className="add-recipe-inner">
            <Plus size={28} className="add-recipe-icon" />
            <span className="add-recipe-label">Add recipe</span>
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
                  </div>
                </div>
              </div>
            </button>

            {/* Edit/delete for custom recipes */}
            {recipe.custom && (
              <div className="recipe-card-actions">
                <button
                  className="card-action-btn edit"
                  onClick={() => setEditing(recipe)}
                  title="Edit"
                >
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
          recipe={editing?.id ? editing : null}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
