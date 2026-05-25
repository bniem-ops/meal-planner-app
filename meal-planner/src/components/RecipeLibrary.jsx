import { useState } from 'react';
import { Clock, Users, Search } from 'lucide-react';
import { recipes } from '../data/recipes';
import RecipeModal from './RecipeModal';

export default function RecipeLibrary() {
  const [viewing, setViewing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [quickOnly, setQuickOnly] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = recipes.filter(r => {
    if (filter !== 'all' && r.protein !== filter) return false;
    if (quickOnly && r.time > 30) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
        {filtered.map(recipe => (
          <button key={recipe.id} className="library-card" onClick={() => setViewing(recipe)}>
            <div className="library-card-top" data-protein={recipe.protein}>
              <span className="library-emoji">{recipe.protein === 'chicken' ? '🐔' : '🥩'}</span>
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
                  {recipe.tags.slice(0, 2).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {viewing && <RecipeModal recipe={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
