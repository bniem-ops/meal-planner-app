import { useState } from 'react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { planWeek } from '../lib/mealPlanner';
import { recipes as builtInRecipes, DAYS } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useRatings } from '../hooks/useRatings';
import { useRecentMeals } from '../hooks/useRecentMeals';

export default function PlanMyWeek({ onApply, onClose, currentPlan }) {
  const { customRecipes } = useCustomRecipes();
  const { ratings } = useRatings();
  const recentIds = useRecentMeals();

  const [step, setStep] = useState('prefs');
  const [prefs, setPrefs] = useState({
    dinnerCount: 5,
    leftoverFreq: 'some',
    avoidProtein: 'none',
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [keepExisting, setKeepExisting] = useState(false);

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  const generate = () => {
    const plan = planWeek({ customRecipes, ratings, recentIds, ...prefs });
    setGeneratedPlan(plan);
    setStep('preview');
  };

  const regenerate = () => {
    const plan = planWeek({ customRecipes, ratings, recentIds, ...prefs });
    setGeneratedPlan(plan);
  };

  const apply = () => {
    const finalPlan = keepExisting
      ? { ...currentPlan, ...generatedPlan }
      : generatedPlan;
    onApply(finalPlan);
    onClose();
  };

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);
  const hasExisting = Object.keys(currentPlan || {}).length > 0;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker-sheet plan-sheet" onClick={e => e.stopPropagation()}>

        <div className="picker-header">
          <div>
            <h2 className="picker-title">
              {step === 'prefs' ? '✨ Plan my week' : '✨ Here\'s your week'}
            </h2>
            <p className="picker-subtitle">
              {step === 'prefs'
                ? 'Answer 3 questions, we\'ll build the rest'
                : 'Review, regenerate, or apply'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* ── STEP 1: PREFS ── */}
        {step === 'prefs' && (
          <div className="plan-body">

            <div className="plan-question">
              <div className="plan-q-label">How many dinners this week?</div>
              <div className="plan-options">
                {[4, 5, 6, 7].map(n => (
                  <button
                    key={n}
                    className={`plan-option-btn ${prefs.dinnerCount === n ? 'active' : ''}`}
                    onClick={() => set('dinnerCount', n)}
                  >
                    {n} nights
                  </button>
                ))}
              </div>
            </div>

            <div className="plan-question">
              <div className="plan-q-label">Leftovers for lunch?</div>
              <div className="plan-options">
                {[
                  { val: 'none',  label: 'Never',     sub: 'Fresh every day' },
                  { val: 'some',  label: 'Sometimes', sub: 'Every other day' },
                  { val: 'most',  label: 'Most days',  sub: 'Next day always' },
                ].map(o => (
                  <button
                    key={o.val}
                    className={`plan-option-btn plan-option-tall ${prefs.leftoverFreq === o.val ? 'active' : ''}`}
                    onClick={() => set('leftoverFreq', o.val)}
                  >
                    <span className="plan-opt-main">{o.label}</span>
                    <span className="plan-opt-sub">{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="plan-question">
              <div className="plan-q-label">Anything to avoid this week?</div>
              <div className="plan-options">
                {[
                  { val: 'none',    label: '🔀 Mix it up' },
                  { val: 'chicken', label: '🥩 Beef only' },
                  { val: 'beef',    label: '🐔 Chicken only' },
                ].map(o => (
                  <button
                    key={o.val}
                    className={`plan-option-btn ${prefs.avoidProtein === o.val ? 'active' : ''}`}
                    onClick={() => set('avoidProtein', o.val)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="generate-btn" onClick={generate}>
              <Sparkles size={18} /> Build my week
            </button>
          </div>
        )}

        {/* ── STEP 2: PREVIEW ── */}
        {step === 'preview' && generatedPlan && (
          <>
            <div className="preview-list">
              {DAYS.filter(day => generatedPlan[`${day}_dinner`] || generatedPlan[`${day}_lunch`]).map(day => {
                const dinner = generatedPlan[`${day}_dinner`] ? getRecipe(generatedPlan[`${day}_dinner`]) : null;
                const lunch  = generatedPlan[`${day}_lunch`]  ? getRecipe(generatedPlan[`${day}_lunch`])  : null;
                return (
                  <div key={day} className="preview-day">
                    <div className="preview-day-name">{day}</div>
                    <div className="preview-meals">
                      {dinner && (
                        <div className="preview-meal">
                          <span className="preview-slot">🌙</span>
                          <span className="preview-meal-name">{dinner.name}</span>
                          <span className="preview-time">{dinner.time}m</span>
                        </div>
                      )}
                      {lunch && (
                        <div className="preview-meal preview-meal-lunch">
                          <span className="preview-slot">🌞</span>
                          <span className="preview-meal-name">{lunch.name}</span>
                          <span className="preview-leftovers-tag">leftovers</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasExisting && (
              <div className="preview-keep-row" onClick={() => setKeepExisting(k => !k)}>
                <div className={`preview-toggle ${keepExisting ? 'on' : ''}`}>
                  <div className="preview-toggle-knob" />
                </div>
                <span className="preview-keep-label">Keep meals I've already planned</span>
              </div>
            )}

            <div className="preview-actions">
              <button className="regen-btn" onClick={regenerate}>↻ Regenerate</button>
              <button className="apply-btn" onClick={apply}>
                Apply to week <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
