import { X, Clock, Users } from 'lucide-react';

export default function RecipeModal({ recipe, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="recipe-modal" onClick={e => e.stopPropagation()}>
        <div className="recipe-modal-header" data-protein={recipe.protein}>
          <div className="recipe-modal-emoji">
            {recipe.protein === 'chicken' ? '🐔' : '🥩'}
          </div>
          <div className="recipe-modal-title-block">
            <h2 className="recipe-modal-name">{recipe.name}</h2>
            <p className="recipe-modal-desc">{recipe.description}</p>
            <div className="recipe-modal-meta">
              <span><Clock size={13} /> {recipe.time} min</span>
              <span><Users size={13} /> {recipe.servings} servings</span>
            </div>
          </div>
          <button className="close-btn close-btn-light" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="recipe-modal-body">
          <div className="recipe-section">
            <h3 className="section-heading">Ingredients</h3>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  <span className="ingredient-amount">{ing.amount}</span>
                  <span className="ingredient-name">{ing.item}</span>
                  {ing.shared && <span className="shared-badge">shared</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h3 className="section-heading">Steps</h3>
            <ol className="step-list">
              {recipe.steps.map((step, i) => (
                <li key={i} className="step-item">
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="recipe-tags-wrap">
            {recipe.tags.map(t => (
              <span key={t} className="tag tag-lg">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
