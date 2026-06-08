import { useState } from 'react';
import { X, Clock, Users, Pencil, ThumbsUp, ThumbsDown, Baby, Minus, Plus, Send, Trash2 } from 'lucide-react';
import { useRatings } from '../hooks/useRatings';
import { useRecipeComments } from '../hooks/useRecipeComments';
import { useAuth } from '../hooks/useAuth';
import { scaleAmount } from '../lib/scaling';

export default function RecipeModal({ recipe, onClose, onEdit }) {
  const { ratings, rateRecipe } = useRatings();
  const { comments, addComment, deleteComment } = useRecipeComments(recipe.id);
  const { user } = useAuth();
  const rating = ratings[recipe.id] || {};

  const baseServings = recipe.servings || 4;
  const [servings, setServings] = useState(baseServings);
  const [commentText, setCommentText] = useState('');

  const multiplier = servings / baseServings;

  const handleThumb = (val) => rateRecipe(recipe.id, { thumbs: rating.thumbs === val ? null : val });
  const handleKid   = ()    => rateRecipe(recipe.id, { kidAte: !rating.kidAte });

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(commentText);
    setCommentText('');
  };

  const changeServings = (delta) => {
    setServings(s => Math.max(1, Math.min(20, s + delta)));
  };

  const formatTime = (mins) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  // Dietary/lifestyle tag icons
  const TAG_ICONS = {
    'vegetarian': '🥗',
    'vegan': '🌱',
    'dairy-free': '🥛',
    'gluten-free': '🌾',
    'freeze-friendly': '❄️',
    'high-protein': '💪',
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="recipe-modal" onClick={e => e.stopPropagation()}>
        <div className="recipe-modal-header" data-protein={recipe.protein}>
          <div className="recipe-modal-emoji">
            {recipe.protein === 'chicken' ? '🐔' : recipe.protein === 'beef' ? '🥩' : '🍽️'}
          </div>
          <div className="recipe-modal-title-block">
            <h2 className="recipe-modal-name">{recipe.name}</h2>
            <p className="recipe-modal-desc">{recipe.description}</p>
            <div className="recipe-modal-meta">
              <span><Clock size={13} /> {formatTime(recipe.time)}</span>
              <span><Users size={13} /> {baseServings} servings</span>
            </div>
          </div>
          <div className="recipe-modal-btns">
            {onEdit && (
              <button className="close-btn close-btn-light" onClick={onEdit}><Pencil size={16} /></button>
            )}
            <button className="close-btn close-btn-light" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="recipe-modal-body">

          {/* Prep note */}
          {recipe.prepNote && (
            <div className="prep-note-banner">
              ⏰ <strong>Prep note:</strong> {recipe.prepNote}
            </div>
          )}

          {/* Ratings */}
          <div className="rating-bar">
            <span className="rating-label">How was it?</span>
            <button className={`rating-btn ${rating.thumbs === 'up' ? 'active-up' : ''}`} onClick={() => handleThumb('up')}>
              <ThumbsUp size={16} /> We liked it
            </button>
            <button className={`rating-btn ${rating.thumbs === 'down' ? 'active-down' : ''}`} onClick={() => handleThumb('down')}>
              <ThumbsDown size={16} /> Meh
            </button>
            <button className={`rating-btn ${rating.kidAte ? 'active-kid' : ''}`} onClick={handleKid}>
              <Baby size={16} /> Kid ate it
            </button>
          </div>

          {/* Serving scaler */}
          <div className="serving-scaler">
            <span className="serving-scaler-label">Adjust servings</span>
            <div className="serving-scaler-controls">
              <button className="serving-btn" onPointerUp={() => changeServings(-1)} disabled={servings <= 1}>
                <Minus size={14} />
              </button>
              <span className="serving-count">{servings}</span>
              <button className="serving-btn" onPointerUp={() => changeServings(1)} disabled={servings >= 20}>
                <Plus size={14} />
              </button>
            </div>
            {multiplier !== 1 && (
              <span className="serving-multiplier">
                {multiplier > 1 ? `${multiplier.toFixed(1)}× recipe` : `${(multiplier * 100).toFixed(0)}% recipe`}
              </span>
            )}
          </div>

          {/* Ingredients */}
          <div className="recipe-section">
            <h3 className="section-heading">Ingredients</h3>
            <ul className="ingredient-list">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  <span className="ingredient-amount">
                    {multiplier !== 1 ? scaleAmount(ing.amount, multiplier) : ing.amount}
                  </span>
                  <span className="ingredient-name">{ing.item}</span>
                  {ing.shared && <span className="shared-badge">shared</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="recipe-section">
            <h3 className="section-heading">Steps</h3>
            <ol className="step-list">
              {recipe.steps?.map((step, i) => (
                <li key={i} className="step-item">
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <div className="recipe-tags-wrap" style={{marginBottom: 16}}>
              {recipe.tags.map(t => (
                <span key={t} className="tag tag-lg">
                  {TAG_ICONS[t] ? `${TAG_ICONS[t]} ` : ''}{t}
                </span>
              ))}
            </div>
          )}

          {/* Comments */}
          <div className="recipe-section">
            <h3 className="section-heading">Notes & comments</h3>

            {comments.length > 0 && (
              <ul className="comment-list">
                {comments.map(c => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{c.authorName}</span>
                      <span className="comment-time">{formatCommentTime(c.createdAt)}</span>
                      {c.authorEmail === user?.email && (
                        <button className="comment-delete" onPointerUp={() => deleteComment(c.id)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </li>
                ))}
              </ul>
            )}

            <div className="comment-input-row">
              <input
                className="comment-input"
                placeholder="Add a note… (e.g. add more garlic next time)"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmitComment(); }}
              />
              <button
                className="comment-send-btn"
                onPointerUp={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                <Send size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function formatCommentTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
