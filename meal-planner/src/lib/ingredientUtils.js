import { DAYS } from '../data/recipes';

// Aggregate this week's planned recipes into a deduped ingredient map: { [lowercaseName]: {item, amounts: []} }
export function getAggregatedIngredients(plan, allRecipes) {
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

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

  return { ingredientMap, plannedRecipes };
}

// Recipes that have been cooked before but not in `minDays` — good candidates to put back on the plan
export function getDueForRerun(history, minDays = 45, limit = 5) {
  const now = new Date();
  return history
    .filter(h => h.lastWeek)
    .map(h => ({ ...h, daysSince: Math.floor((now - new Date(h.lastWeek)) / 86400000) }))
    .filter(h => h.daysSince >= minDays)
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, limit);
}

// Extract ingredient names from a meal plan + recipe list
export function getPlannedIngredients(plan, allRecipes) {
  const ingredientSet = new Set();
  Object.values(plan).forEach(recipeId => {
    if (!recipeId) return;
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    (recipe.ingredients || []).forEach(ing => {
      // Normalize: lowercase, strip amounts, keep core item name
      const name = ing.item.toLowerCase().trim();
      ingredientSet.add(name);
      // Also add individual words for partial matching
      name.split(/\s+/).forEach(word => {
        if (word.length > 3) ingredientSet.add(word);
      });
    });
  });
  return ingredientSet;
}

// Score a recipe by how many of its ingredients overlap with planned ones
export function ingredientOverlapScore(recipe, plannedIngredients) {
  if (!plannedIngredients.size) return 0;
  const recipeIngredients = (recipe.ingredients || []).map(i => i.item.toLowerCase());
  let matches = 0;
  recipeIngredients.forEach(ing => {
    if (plannedIngredients.has(ing)) { matches += 2; return; }
    // Partial match — any word in the ingredient matches
    const words = ing.split(/\s+/);
    if (words.some(w => w.length > 3 && plannedIngredients.has(w))) matches += 1;
  });
  return matches;
}

// Is this grocery ingredient already covered by an in-stock pantry item?
export function isIngredientInPantry(itemName, pantryItems = []) {
  const name = itemName.toLowerCase();
  return pantryItems.some(p => {
    if (!p.checked) return false;
    const pantryName = p.text.toLowerCase();
    return name.includes(pantryName) || pantryName.includes(name);
  });
}

// Perishables worth highlighting for reuse
export const PERISHABLES = [
  'bell pepper', 'zucchini', 'spinach', 'broccoli', 'lettuce', 'lemon',
  'lime', 'onion', 'carrot', 'ginger', 'mushroom', 'avocado', 'tomato',
  'cilantro', 'parsley', 'basil', 'cucumber', 'corn', 'celery',
];

export function getSharedPerishables(recipe, plannedIngredients) {
  return (recipe.ingredients || [])
    .map(i => i.item.toLowerCase())
    .filter(ing => PERISHABLES.some(p => ing.includes(p)) && plannedIngredients.has(ing));
}

// Season detection
export function getCurrentSeason() {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export const SEASON_LABELS = {
  spring: '🌸 Spring',
  summer: '☀️ Summer',
  fall:   '🍂 Fall',
  winter: '❄️ Winter',
};
