import { useState, useEffect } from 'react';
import { ShoppingCart, Check, ChevronDown, ChevronUp, Plus, X, Trash2 } from 'lucide-react';
import { recipes as builtInRecipes, DAYS } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const FAMILIES = [
  { key: 'proteins',  label: 'Proteins 🥩' },
  { key: 'produce',   label: 'Produce 🥦' },
  { key: 'dairy',     label: 'Dairy & Cheese 🧀' },
  { key: 'pantry',    label: 'Pantry 🫙' },
  { key: 'snacks',    label: 'Snacks 🍿' },
  { key: 'drinks',    label: 'Drinks 🥤' },
  { key: 'other',     label: 'Other 📦' },
];

const proteinWords = ['chicken', 'beef', 'chuck', 'ground beef', 'thigh', 'breast', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'sausage', 'bacon'];
const produceWords = ['pepper', 'zucchini', 'broccoli', 'spinach', 'lettuce', 'lemon', 'onion', 'garlic', 'ginger', 'carrot', 'tomato', 'avocado', 'lime', 'apple', 'banana', 'celery', 'mushroom', 'potato', 'cucumber', 'corn'];
const dairyWords = ['cheese', 'cream', 'sour cream', 'parmesan', 'butter', 'egg', 'milk', 'yogurt', 'mozzarella', 'cheddar'];
const pantryWords = ['oil', 'sauce', 'seasoning', 'pasta', 'rice', 'tortilla', 'bean', 'salsa', 'soy', 'cornstarch', 'paste', 'broth', 'honey', 'bun', 'bread', 'flour', 'sugar', 'vinegar', 'mustard', 'ketchup', 'mayo'];
const snackWords = ['chip', 'cracker', 'popcorn', 'granola', 'bar', 'nut', 'pretzel', 'cookie', 'fruit snack'];
const drinkWords = ['juice', 'water', 'soda', 'coffee', 'tea', 'milk', 'drink', 'lemonade', 'broth'];

function categorize(itemName) {
  const k = itemName.toLowerCase();
  if (proteinWords.some(w => k.includes(w))) return 'proteins';
  if (produceWords.some(w => k.includes(w))) return 'produce';
  if (dairyWords.some(w => k.includes(w))) return 'dairy';
  if (snackWords.some(w => k.includes(w))) return 'snacks';
  if (drinkWords.some(w => k.includes(w))) return 'drinks';
  if (pantryWords.some(w => k.includes(w))) return 'pantry';
  return 'other';
}

// Custom grocery items stored in Firestore
function useCustomGrocery() {
  const [items, setItems] = useState([]);
  const ref = doc(db, 'grocery', 'custom');

  useEffect(() => {
    const unsub = onSnapshot(ref, snap => {
      setItems(snap.exists() ? (snap.data().items || []) : []);
    });
    return unsub;
  }, []);

  const save = async (updated) => {
    setItems(updated);
    await setDoc(ref, { items: updated });
  };

  const addItem = (text, family) => {
    const item = { id: Date.now().toString(), text, family: family || categorize(text), checked: false };
    save([...items, item]);
  };

  const toggleItem = (id) => save(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const removeItem = (id) => save(items.filter(i => i.id !== id));
  const clearChecked = () => save(items.filter(i => !i.checked));

  return { items, addItem, toggleItem, removeItem, clearChecked };
}

export default function GroceryList() {
  const { plan, loading } = useMealPlan();
  const { customRecipes } = useCustomRecipes();
  const { items: customItems, addItem, toggleItem, removeItem, clearChecked } = useCustomGrocery();
  const [checked, setChecked] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [addingTo, setAddingTo] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [tab, setTab] = useState('meal'); // 'meal' | 'custom'

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  // Build meal-derived ingredient list
  const mealIds = new Set();
  DAYS.forEach(day => {
    const lunch = plan[`${day}_lunch`];
    const dinner = plan[`${day}_dinner`] || plan[day];
    if (lunch) mealIds.add(lunch);
    if (dinner) mealIds.add(dinner);
  });
  const plannedRecipes = [...mealIds].map(id => getRecipe(id)).filter(Boolean);

  const ingredientMap = {};
  plannedRecipes.forEach(recipe => {
    recipe.ingredients?.forEach(ing => {
      const key = ing.item.toLowerCase();
      if (!ingredientMap[key]) ingredientMap[key] = { item: ing.item, amounts: [] };
      ingredientMap[key].amounts.push(ing.amount);
    });
  });

  // Group meal ingredients by family
  const mealGroups = {};
  FAMILIES.forEach(f => { mealGroups[f.key] = []; });
  Object.entries(ingredientMap).forEach(([, val]) => {
    const cat = categorize(val.item);
    mealGroups[cat].push(val);
  });

  // Group custom items by family
  const customGroups = {};
  FAMILIES.forEach(f => { customGroups[f.key] = []; });
  customItems.forEach(item => { customGroups[item.family]?.push(item); });

  const toggleMeal = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));
  const toggleSection = (g) => setCollapsed(p => ({ ...p, [g]: !p[g] }));

  const totalMeal = Object.values(ingredientMap).length;
  const checkedMeal = Object.values(checked).filter(Boolean).length;
  const totalCustom = customItems.length;
  const checkedCustom = customItems.filter(i => i.checked).length;

  const handleAddItem = (family) => {
    if (!newItemText.trim()) return;
    addItem(newItemText.trim(), family);
    setNewItemText('');
    setAddingTo(null);
  };

  if (loading) return null;

  return (
    <div className="grocery-wrap">
      {/* Tab toggle */}
      <div className="grocery-tabs">
        <button className={`grocery-tab ${tab === 'meal' ? 'active' : ''}`} onClick={() => setTab('meal')}>
          🍽️ From meals
        </button>
        <button className={`grocery-tab ${tab === 'custom' ? 'active' : ''}`} onClick={() => setTab('custom')}>
          ✏️ My list
        </button>
      </div>

      {/* MEAL-DERIVED TAB */}
      {tab === 'meal' && (
        <>
          {plannedRecipes.length === 0 ? (
            <div className="grocery-empty">
              <ShoppingCart size={40} className="grocery-empty-icon" />
              <p>Plan meals first — ingredients will appear here automatically.</p>
            </div>
          ) : (
            <>
              <div className="grocery-summary">
                <span className="grocery-count">{checkedMeal}/{totalMeal} items</span>
                <span className="grocery-week">from {plannedRecipes.length} meals</span>
                {checkedMeal > 0 && (
                  <button className="clear-checks" onClick={() => setChecked({})}>Clear checks</button>
                )}
              </div>
              <div className="grocery-progress">
                <div className="grocery-progress-bar" style={{ width: `${totalMeal ? (checkedMeal / totalMeal) * 100 : 0}%` }} />
              </div>
              {FAMILIES.map(({ key, label }) => {
                const items = mealGroups[key];
                if (!items.length) return null;
                const isCollapsed = collapsed[key];
                return (
                  <div key={key} className="grocery-group">
                    <button className="group-header" onClick={() => toggleSection(key)}>
                      <span className="group-title">{label}</span>
                      <span className="group-count">{items.length}</span>
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    {!isCollapsed && (
                      <ul className="grocery-items">
                        {items.map((ing, i) => {
                          const k = ing.item.toLowerCase();
                          const done = checked[k];
                          return (
                            <li key={i} className={`grocery-item ${done ? 'done' : ''}`} onClick={() => toggleMeal(k)}>
                              <span className={`check-circle ${done ? 'checked' : ''}`}>{done && <Check size={12} />}</span>
                              <span className="grocery-item-name">{ing.item}</span>
                              <span className="grocery-item-amount">{[...new Set(ing.amounts)].join(', ')}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {/* CUSTOM LIST TAB */}
      {tab === 'custom' && (
        <>
          <div className="grocery-summary">
            <span className="grocery-count">{checkedCustom}/{totalCustom} items</span>
            {checkedCustom > 0 && (
              <button className="clear-checks" onClick={clearChecked}>Remove checked</button>
            )}
          </div>
          {totalCustom > 0 && (
            <div className="grocery-progress">
              <div className="grocery-progress-bar" style={{ width: `${totalCustom ? (checkedCustom / totalCustom) * 100 : 0}%` }} />
            </div>
          )}

          {FAMILIES.map(({ key, label }) => {
            const familyItems = customGroups[key];
            const isCollapsed = collapsed[`custom_${key}`];
            return (
              <div key={key} className="grocery-group">
                <button className="group-header" onClick={() => toggleSection(`custom_${key}`)}>
                  <span className="group-title">{label}</span>
                  <span className="group-count">{familyItems.length}</span>
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
                {!isCollapsed && (
                  <>
                    <ul className="grocery-items">
                      {familyItems.map(item => (
                        <li key={item.id} className={`grocery-item ${item.checked ? 'done' : ''}`}>
                          <span className={`check-circle ${item.checked ? 'checked' : ''}`} onClick={() => toggleItem(item.id)}>
                            {item.checked && <Check size={12} />}
                          </span>
                          <span className="grocery-item-name" onClick={() => toggleItem(item.id)}>{item.text}</span>
                          <button className="grocery-remove" onPointerUp={() => removeItem(item.id)}>
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>

                    {addingTo === key ? (
                      <div className="add-grocery-row">
                        <input
                          className="add-grocery-input"
                          placeholder={`Add to ${label.split(' ')[0]}…`}
                          value={newItemText}
                          onChange={e => setNewItemText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddItem(key); if (e.key === 'Escape') setAddingTo(null); }}
                          autoFocus
                        />
                        <button className="add-grocery-confirm" onClick={() => handleAddItem(key)}>Add</button>
                        <button className="add-grocery-cancel" onClick={() => { setAddingTo(null); setNewItemText(''); }}><X size={14} /></button>
                      </div>
                    ) : (
                      <button className="add-to-family-btn" onClick={() => { setAddingTo(key); setNewItemText(''); }}>
                        <Plus size={14} /> Add item
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
