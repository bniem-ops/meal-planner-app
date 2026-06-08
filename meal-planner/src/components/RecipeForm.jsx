import { useState } from 'react';
import { X } from 'lucide-react';
import { isHighProtein } from '../lib/scaling';

const EMPTY_FORM = {
  name: '',
  protein: 'chicken',
  time: '',
  servings: 4,
  description: '',
  prepNote: '',
  season: '',
  ingredientText: '',
  stepText: '',
  tags: [],
};

const TAG_GROUPS = [
  {
    label: 'Cooking style',
    tags: ['quick', 'kid-friendly', 'one-pan', 'crowd-pleaser'],
  },
  {
    label: 'Dietary',
    tags: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'],
  },
  {
    label: 'Storage & nutrition',
    tags: ['freeze-friendly', 'high-protein'],
  },
];

const SEASON_OPTIONS = [
  { val: '',       label: 'Any season' },
  { val: 'spring', label: '🌸 Spring' },
  { val: 'summer', label: '☀️ Summer' },
  { val: 'fall',   label: '🍂 Fall' },
  { val: 'winter', label: '❄️ Winter' },
];

const TAG_ICONS = {
  'vegetarian': '🥗',
  'vegan': '🌱',
  'dairy-free': '🥛',
  'gluten-free': '🌾',
  'freeze-friendly': '❄️',
  'high-protein': '💪',
};

function parseIngredients(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^([\d½¼¾⅓⅔\s/]+(?:cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l|can|cans|cloves?|medium|large|small|bunch|pinch|packet|strip|strips)?s?\b[^a-zA-Z]*)/i);
      if (match) return { amount: match[1].trim(), item: line.slice(match[1].length).trim() };
      return { amount: '', item: line };
    });
}

function parseSteps(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/^\d+[\.\)]\s*/, ''));
}

export default function RecipeForm({ recipe, onSave, onClose }) {
  const isEdit = !!(recipe?.id);
  const [form, setForm] = useState(recipe ? {
    ...EMPTY_FORM,
    ...recipe,
    prepNote: recipe.prepNote || '',
    season: recipe.season || '',
    ingredientText: recipe.ingredientText ||
      (recipe.ingredients?.map(i => `${i.amount} ${i.item}`.trim()).join('\n') || ''),
    stepText: recipe.stepText ||
      (recipe.steps?.join('\n') || ''),
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleTag = (tag) => {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Recipe name is required.');
    if (!form.ingredientText.trim()) return setError('Add at least one ingredient.');
    if (!form.stepText.trim()) return setError('Add at least one step.');
    setError('');
    setSaving(true);

    const ingredients = parseIngredients(form.ingredientText);
    const steps = parseSteps(form.stepText);

    // Auto-detect high-protein if not manually set
    let tags = [...form.tags];
    if (!tags.includes('high-protein') && isHighProtein(ingredients)) {
      tags = [...tags, 'high-protein'];
    }

    await onSave({
      name: form.name.trim(),
      protein: form.protein,
      time: parseInt(form.time) || 30,
      servings: parseInt(form.servings) || 4,
      description: form.description.trim(),
      prepNote: form.prepNote.trim(),
      season: form.season || '',
      ingredients,
      steps,
      tags,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker-sheet recipe-form-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <div>
            <h2 className="picker-title">{isEdit ? 'Edit recipe' : 'New recipe'}</h2>
            <p className="picker-subtitle">Fill in what you know — you can always edit later</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="recipe-form-body">
          {error && <div className="login-error" style={{marginBottom: 12}}>{error}</div>}

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Recipe name *</label>
            <input
              className="form-input"
              placeholder="e.g. Garlic Butter Chicken"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Protein + Time + Servings */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Protein</label>
              <select className="form-input" value={form.protein} onChange={e => set('protein', e.target.value)}>
                <option value="chicken">🐔 Chicken</option>
                <option value="beef">🥩 Beef</option>
                <option value="other">🍽️ Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cook time (min)</label>
              <input className="form-input" type="number" placeholder="30" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Servings</label>
              <input className="form-input" type="number" placeholder="4" value={form.servings} onChange={e => set('servings', e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Short description</label>
            <input
              className="form-input"
              placeholder="e.g. A quick weeknight winner the whole family loves"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Prep note */}
          <div className="form-group">
            <label className="form-label">Prep note</label>
            <input
              className="form-input"
              placeholder="e.g. Marinate chicken the night before"
              value={form.prepNote}
              onChange={e => set('prepNote', e.target.value)}
            />
          </div>

          {/* Tags grouped */}
          {TAG_GROUPS.map(group => (
            <div key={group.label} className="form-group">
              <label className="form-label">{group.label}</label>
              <div className="filter-row">
                {group.tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-btn filter-btn-sm ${form.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {TAG_ICONS[tag] || ''} {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Auto high-protein hint */}
          {!form.tags.includes('high-protein') && form.ingredientText && (
            (() => {
              const ings = form.ingredientText.split('\n').map(l => ({ item: l }));
              return isHighProtein(ings) ? (
                <p className="form-hint" style={{color: 'var(--sage)', marginTop: -8}}>
                  💪 This looks high-protein — it'll be auto-tagged when saved
                </p>
              ) : null;
            })()
          )}

          {/* Season */}
          <div className="form-group">
            <label className="form-label">Season (optional)</label>
            <div className="filter-row">
              {SEASON_OPTIONS.map(o => (
                <button
                  key={o.val}
                  type="button"
                  className={`filter-btn filter-btn-sm ${form.season === o.val ? 'active' : ''}`}
                  onClick={() => set('season', o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="form-group">
            <label className="form-label">Ingredients *</label>
            <p className="form-hint">One per line — amount first<br/>e.g. <em>1 lb chicken breast</em></p>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder={`1.5 lbs chicken breast\n3 cloves garlic\n2 tbsp olive oil\n1 tsp Italian seasoning`}
              value={form.ingredientText}
              onChange={e => set('ingredientText', e.target.value)}
            />
          </div>

          {/* Steps */}
          <div className="form-group">
            <label className="form-label">Steps *</label>
            <p className="form-hint">One step per line — numbers optional</p>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder={`Preheat oven to 400°F.\nSeason chicken with garlic, oil, and seasoning.\nBake 25 minutes until cooked through.`}
              value={form.stepText}
              onChange={e => set('stepText', e.target.value)}
            />
          </div>

          <button className="save-recipe-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
