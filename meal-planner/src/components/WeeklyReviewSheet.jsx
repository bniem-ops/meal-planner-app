import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Baby, ClipboardList } from 'lucide-react';
import { DAYS, recipes } from '../data/recipes';

/**
 * WeeklyReviewSheet
 *
 * Props:
 *   plan        – { [slotKey]: recipeId }  (from useMealPlan)
 *   allRecipes  – combined built-in + custom recipes array
 *   existingReview – review doc data (may have partial ratings already)
 *   saving      – boolean
 *   onSave      – ({ ratings, notes }) => void
 *   onClose     – () => void
 */
export default function WeeklyReviewSheet({
  plan,
  allRecipes,
  existingReview,
  saving,
  onSave,
  onClose,
}) {
  const [ratings, setRatings] = useState(existingReview?.ratings || {});
  const [notes, setNotes]     = useState(existingReview?.notes   || '');

  const getRecipe = (id) => allRecipes.find((r) => r.id === id);

  // Build the list of planned slots for this week (lunch + dinner, in day order)
  const slots = [];
  DAYS.forEach((day) => {
    ['lunch', 'dinner'].forEach((slot) => {
      const key = `${day}_${slot}`;
      const id  = slot === 'dinner'
        ? (plan[key] || plan[day])   // legacy key support
        : plan[key];
      if (id) {
        const recipe = getRecipe(id);
        if (recipe) slots.push({ key, day, slot, recipe });
      }
    });
  });

  const rate = (key, value) => {
    setRatings((prev) => {
      // Toggle off if already selected
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleDone = () => onSave({ ratings, notes });

  return (
    <div className="review-overlay" role="dialog" aria-modal="true" aria-label="Weekly review">
      <div className="review-sheet">
        {/* Header */}
        <div className="review-header">
          <div className="review-header-left">
            <ClipboardList size={20} />
            <div>
              <div className="review-title">How was this week?</div>
              <div className="review-subtitle">Rate your meals &amp; jot any notes</div>
            </div>
          </div>
          <button className="review-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="review-body">
          {slots.length === 0 ? (
            <p className="review-empty">No meals were planned this week.</p>
          ) : (
            <ul className="review-meal-list">
              {slots.map(({ key, day, slot, recipe }) => {
                const current = ratings[key];
                return (
                  <li key={key} className="review-meal-row">
                    <div className="review-meal-info">
                      <span className="review-meal-day">
                        {day} · {slot === 'lunch' ? '🌞 Lunch' : '🌙 Dinner'}
                      </span>
                      <span className="review-meal-name">{recipe.name}</span>
                    </div>
                    <div className="review-rating-btns" role="group" aria-label={`Rate ${recipe.name}`}>
                      <button
                        className={`review-rate-btn ${current === 'up' ? 'active active-up' : ''}`}
                        onClick={() => rate(key, 'up')}
                        aria-pressed={current === 'up'}
                        title="Thumbs up"
                      >
                        <ThumbsUp size={18} />
                      </button>
                      <button
                        className={`review-rate-btn ${current === 'down' ? 'active active-down' : ''}`}
                        onClick={() => rate(key, 'down')}
                        aria-pressed={current === 'down'}
                        title="Thumbs down"
                      >
                        <ThumbsDown size={18} />
                      </button>
                      <button
                        className={`review-rate-btn ${current === 'kid' ? 'active active-kid' : ''}`}
                        onClick={() => rate(key, 'kid')}
                        aria-pressed={current === 'kid'}
                        title="Kid ate it!"
                      >
                        <Baby size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Free-text notes */}
          <div className="review-notes-section">
            <label className="review-notes-label" htmlFor="review-notes">
              Week notes
            </label>
            <textarea
              id="review-notes"
              className="review-notes-textarea"
              placeholder="e.g. Kids loved the tacos, skip the stir fry next time…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="review-footer">
          <button className="review-skip-btn" onClick={onClose} disabled={saving}>
            Maybe later
          </button>
          <button className="review-done-btn" onClick={handleDone} disabled={saving}>
            {saving ? 'Saving…' : '✓ Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
