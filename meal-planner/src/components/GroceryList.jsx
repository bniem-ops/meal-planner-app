import { useState } from 'react';
import { ShoppingCart, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { recipes as builtInRecipes, DAYS } from '../data/recipes';
import { useCustomRecipes } from '../hooks/useCustomRecipes';
import { useMealPlan } from '../hooks/useMealPlan';

export default function GroceryList() {
  const { plan, loading } = useMealPlan();
  const { customRecipes } = useCustomRecipes();
  const [checked, setChecked] = useState({});
  const [collapsed, setCollapsed] = useState({});

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  // Collect all assigned meal IDs across lunch + dinner slots
  const mealIds = new Set();
  DAYS.forEach(day => {
    const lunch = plan[`${day}_lunch`];
    const dinner = plan[`${day}_dinner`] || plan[day];
    if (lunch) mealIds.add(lunch);
    if (dinner) mealIds.add(dinner);
  });

  const plannedRecipes = [...mealIds]
    .map(id => getRecipe(id))
    .filter(Boolean);

  // Build consolidated ingredient map
  const ingredientMap = {};
  plannedRecipes.forEach(recipe => {
    recipe.ingredients?.forEach(ing => {
      const key = ing.item.toLowerCase();
      if (!ingredientMap[key]) {
        ingredientMap[key] = { item: ing.item, amounts: [], shared: ing.shared };
      }
      ingredientMap[key].amounts.push(ing.amount);
    });
  });

  const groups = {
    'Proteins 🥩': [],
    'Produce 🥦': [],
    'Pantry 🫙': [],
    'Dairy & Cheese 🧀': [],
    'Other 📦': [],
  };

  const proteinWords = ['chicken', 'beef', 'chuck', 'ground beef'];
  const produceWords = ['pepper', 'zucchini', 'broccoli', 'spinach', 'lettuce', 'lemon', 'onion', 'garlic', 'ginger', 'carrot'];
  const dairyWords = ['cheese', 'cream', 'sour cream', 'parmesan', 'butter', 'egg'];
  const pantryWords = ['oil', 'sauce', 'seasoning', 'tomato', 'pasta', 'rice', 'tortilla', 'bean', 'salsa', 'soy', 'cornstarch', 'paste', 'broth', 'honey', 'bun'];

  Object.entries(ingredientMap).forEach(([key, val]) => {
    if (proteinWords.some(w => key.includes(w))) groups['Proteins 🥩'].push(val);
    else if (produceWords.some(w => key.includes(w))) groups['Produce 🥦'].push(val);
    else if (dairyWords.some(w => key.includes(w))) groups['Dairy & Cheese 🧀'].push(val);
    else if (pantryWords.some(w => key.includes(w))) groups['Pantry 🫙'].push(val);
    else groups['Other 📦'].push(val);
  });

  const toggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));
  const toggleSection = (g) => setCollapsed(p => ({ ...p, [g]: !p[g] }));

  const totalItems = Object.values(ingredientMap).length;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  if (loading) return null;

  if (plannedRecipes.length === 0) return (
    <div className="grocery-empty">
      <ShoppingCart size={40} className="grocery-empty-icon" />
      <p>Plan your week first — your grocery list will appear here.</p>
    </div>
  );

  return (
    <div className="grocery-wrap">
      <div className="grocery-summary">
        <span className="grocery-count">{checkedCount}/{totalItems} items</span>
        <span className="grocery-week">for {plannedRecipes.length} meals this week</span>
        {checkedCount > 0 && (
          <button className="clear-checks" onClick={() => setChecked({})}>Clear checks</button>
        )}
      </div>

      <div className="grocery-progress">
        <div className="grocery-progress-bar" style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }} />
      </div>

      {Object.entries(groups).map(([group, items]) => {
        if (items.length === 0) return null;
        const isCollapsed = collapsed[group];
        return (
          <div key={group} className="grocery-group">
            <button className="group-header" onClick={() => toggleSection(group)}>
              <span className="group-title">{group}</span>
              <span className="group-count">{items.length}</span>
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            {!isCollapsed && (
              <ul className="grocery-items">
                {items.map((ing, i) => {
                  const key = ing.item.toLowerCase();
                  const done = checked[key];
                  return (
                    <li key={i} className={`grocery-item ${done ? 'done' : ''}`} onClick={() => toggle(key)}>
                      <span className={`check-circle ${done ? 'checked' : ''}`}>
                        {done && <Check size={12} />}
                      </span>
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
    </div>
  );
}
