import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { scaleAmount } from '../lib/scaling';

export default function CookMode({ recipe, servings, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);

  const steps = recipe.steps || [];
  const baseServings = recipe.servings || 4;
  const multiplier = servings / baseServings;
  const total = steps.length;

  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let sentinel;
    const acquire = async () => {
      try { sentinel = await navigator.wakeLock.request('screen'); } catch { /* ignore */ }
    };
    acquire();
    const onVisible = () => { if (document.visibilityState === 'visible') acquire(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release();
    };
  }, []);

  const goPrev = () => setStepIndex(i => Math.max(0, i - 1));
  const goNext = () => setStepIndex(i => Math.min(total - 1, i + 1));

  return (
    <div className="cook-mode">
      <div className="cook-mode-header">
        <div className="cook-mode-title">{recipe.name}</div>
        <button className="close-btn close-btn-light" onClick={onClose}><X size={20} /></button>
      </div>

      <button className="cook-mode-ing-toggle" onClick={() => setShowIngredients(s => !s)}>
        <ListChecks size={15} /> Ingredients
      </button>

      {showIngredients && (
        <ul className="cook-mode-ing-list">
          {recipe.ingredients?.map((ing, i) => (
            <li key={i} className="cook-mode-ing-item">
              <span className="ingredient-amount">
                {multiplier !== 1 ? scaleAmount(ing.amount, multiplier) : ing.amount}
              </span>
              <span className="ingredient-name">{ing.item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="cook-mode-body">
        {total === 0 ? (
          <p className="cook-mode-empty">This recipe has no steps to cook from.</p>
        ) : (
          <>
            <div className="cook-mode-count">Step {stepIndex + 1} of {total}</div>
            <p className="cook-mode-step-text">{steps[stepIndex]}</p>
          </>
        )}
      </div>

      {total > 0 && (
        <div className="cook-mode-nav">
          <button className="cook-mode-nav-btn" onClick={goPrev} disabled={stepIndex === 0}>
            <ChevronLeft size={20} /> Back
          </button>
          <button className="cook-mode-nav-btn cook-mode-nav-primary" onClick={goNext} disabled={stepIndex === total - 1}>
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
