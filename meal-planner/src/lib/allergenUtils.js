// Closed allergen vocabulary with ingredient-text synonyms, so member allergy
// checkboxes can be fuzzy-matched against recipe.ingredients[].item text —
// same lightweight substring approach as recipeParser.js's detectCourse/detectCuisine.
export const ALLERGENS = {
  peanuts:   { label: 'Peanuts',   match: ['peanut'] },
  treeNuts:  { label: 'Tree nuts', match: ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia'] },
  shellfish: { label: 'Shellfish', match: ['shrimp', 'crab', 'lobster', 'scallop', 'clam', 'mussel', 'oyster'] },
  dairy:     { label: 'Dairy',     match: ['milk', 'cheese', 'butter', 'cream', 'yogurt'] },
  gluten:    { label: 'Gluten',    match: ['flour', 'bread', 'pasta', 'wheat'] },
  egg:       { label: 'Egg',       match: ['egg'] },
  soy:       { label: 'Soy',       match: ['soy', 'tofu', 'edamame'] },
  fish:      { label: 'Fish',      match: ['salmon', 'tuna', 'cod', 'halibut', 'fish'] },
};

// Returns [{ memberName, allergenLabel }] for every member/allergen whose
// synonym list matches a substring of any ingredient name on this recipe.
// A soft flag, not a filter — callers decide what to do with the warnings.
export function getAllergenWarnings(recipe, members = []) {
  const ingredientText = (recipe.ingredients || [])
    .map(i => i.item.toLowerCase())
    .join(' | ');

  const warnings = [];
  members.forEach(member => {
    (member.allergies || []).forEach(key => {
      const allergen = ALLERGENS[key];
      if (!allergen) return;
      const hit = allergen.match.some(term => ingredientText.includes(term));
      if (hit) warnings.push({ memberName: member.name, allergenLabel: allergen.label });
    });
  });
  return warnings;
}
