import { recipes as builtInRecipes, DAYS } from '../data/recipes';
import { getCurrentSeason } from './ingredientUtils';

// Score a set of recipes for ingredient overlap (higher = better reuse)
function ingredientOverlapScore(selectedRecipes) {
  const allIngredients = selectedRecipes.flatMap(r =>
    (r.ingredients || []).map(i => i.item.toLowerCase())
  );
  const counts = {};
  allIngredients.forEach(i => { counts[i] = (counts[i] || 0) + 1; });
  // Sum up ingredients that appear more than once
  return Object.values(counts).filter(c => c > 1).reduce((a, b) => a + b, 0);
}

// Produce/perishables that benefit most from reuse across recipes
const PERISHABLES = ['bell pepper', 'zucchini', 'spinach', 'broccoli', 'lettuce',
  'lemon', 'lime', 'onion', 'carrot', 'tomato', 'avocado', 'ginger', 'mushroom'];

function perishableOverlapScore(selectedRecipes) {
  const allIngredients = selectedRecipes.flatMap(r =>
    (r.ingredients || []).map(i => i.item.toLowerCase())
  );
  const counts = {};
  allIngredients.forEach(i => {
    if (PERISHABLES.some(p => i.includes(p))) {
      counts[i] = (counts[i] || 0) + 1;
    }
  });
  // Weight perishables more heavily
  return Object.values(counts).filter(c => c > 1).reduce((a, b) => a + b * 2, 0);
}

// Household-wide sentiment per protein: +1 per "like", -1 per "dislike", ignoring
// members with no opinion set. A soft scoring signal, not a filter.
function proteinSentiment(members) {
  const sentiment = { chicken: 0, beef: 0, other: 0 };
  members.forEach(m => {
    Object.entries(m.proteinPrefs || {}).forEach(([protein, pref]) => {
      if (pref === 'like') sentiment[protein] = (sentiment[protein] || 0) + 1;
      if (pref === 'dislike') sentiment[protein] = (sentiment[protein] || 0) - 1;
    });
  });
  return sentiment;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Break up 3+ consecutive same-protein dinner days by swapping a later day in
function breakProteinStreaks(dinnerDays, plan, allRecipes) {
  const getProtein = (day) => allRecipes.find(r => r.id === plan[`${day}_dinner`])?.protein;

  for (let i = 2; i < dinnerDays.length; i++) {
    const [d0, d1, d2] = [dinnerDays[i - 2], dinnerDays[i - 1], dinnerDays[i]];
    const p0 = getProtein(d0), p1 = getProtein(d1), p2 = getProtein(d2);
    if (!p0 || p0 !== p1 || p1 !== p2) continue;

    for (let j = i + 1; j < dinnerDays.length; j++) {
      const dj = dinnerDays[j];
      if (getProtein(dj) && getProtein(dj) !== p2) {
        const tmp = plan[`${d2}_dinner`];
        plan[`${d2}_dinner`] = plan[`${dj}_dinner`];
        plan[`${dj}_dinner`] = tmp;
        break;
      }
    }
  }
  return plan;
}

// Assign leftover lunches the day after a dinner, per leftoverFreq. Exported so the
// preview UI can re-derive lunches after a manual dinner edit/swap without regenerating.
export function assignLeftoverLunches(dinnerPlan, leftoverFreq = 'some') {
  const plan = { ...dinnerPlan };
  if (leftoverFreq === 'none') return plan;

  Object.entries(dinnerPlan).forEach(([key, recipeId]) => {
    if (!key.endsWith('_dinner') || !recipeId) return;
    const day = key.replace('_dinner', '');
    const dayIndex = DAYS.indexOf(day);
    if (dayIndex === -1) return;

    let makeLeftover = false;
    if (leftoverFreq === 'most') makeLeftover = true;
    if (leftoverFreq === 'some') makeLeftover = dayIndex % 2 === 0;

    if (makeLeftover) {
      const nextDay = DAYS[dayIndex + 1];
      if (nextDay && !plan[`${nextDay}_lunch`]) {
        plan[`${nextDay}_lunch`] = recipeId;
      }
    }
  });

  return plan;
}

/*
  planWeek({
    customRecipes,   // from Firestore
    ratings,         // { recipeId: { thumbs, kidAte } }
    recentIds,       // Set of recently used recipeIds
    dinnerCount,     // 5 | 6 | 7
    leftoverFreq,    // 'none' | 'some' | 'most'
    avoidProtein,    // 'none' | 'chicken' | 'beef' — manual one-week override, still a hard filter
    members,         // household members, for soft protein-sentiment scoring
  })
  Returns: { Monday_dinner, Tuesday_dinner, ... Monday_lunch, ... }
*/
export function planWeek({ customRecipes = [], ratings = {}, recentIds = new Set(),
  dinnerCount = 5, leftoverFreq = 'some', avoidProtein = 'none', members = [] }) {

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const sentiment = proteinSentiment(members);

  // Step 1 — Score every recipe
  const scored = allRecipes
    .filter(r => {
      if (avoidProtein !== 'none' && r.protein === avoidProtein) return false;
      const rating = ratings[r.id] || {};
      if (rating.thumbs === 'down') return false; // hard exclude 👎
      return true;
    })
    .map(r => {
      const rating = ratings[r.id] || {};
      const currentSeason = getCurrentSeason();
      let score = 0;
      if (rating.thumbs === 'up') score += 3;
      if (rating.kidAte) score += 2;
      if (recentIds.has(r.id)) score -= 5;
      if (r.season && r.season === currentSeason) score += 1; // soft boost for in-season // soft penalize recent
      score += (sentiment[r.protein] || 0); // household protein-preference nudge
      score += Math.random() * 0.5; // tiny randomness so same-score recipes vary
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score);

  // Step 2 — Separate by protein for alternating
  const chicken = scored.filter(r => r.protein === 'chicken');
  const beef = scored.filter(r => r.protein === 'beef');
  const other = scored.filter(r => r.protein !== 'chicken' && r.protein !== 'beef');

  // Step 3 — Pick dinners alternating proteins, weighted toward higher scores
  // Try multiple combinations and pick the one with best ingredient overlap
  const pickDinners = () => {
    const selected = [];
    const chickenPool = [...chicken];
    const beefPool = [...beef];
    const otherPool = shuffle(other);
    let useChicken = true; // start with chicken

    for (let i = 0; i < dinnerCount; i++) {
      let pool = useChicken ? chickenPool : beefPool;
      // If one protein runs out, fall back to the other or other proteins
      if (pool.length === 0) pool = useChicken ? beefPool : chickenPool;
      if (pool.length === 0) pool = otherPool;
      if (pool.length === 0) break;

      selected.push(pool.shift());
      useChicken = !useChicken;
    }
    return selected;
  };

  // Try 8 combinations, pick best ingredient overlap
  let bestDinners = pickDinners();
  let bestScore = perishableOverlapScore(bestDinners) + ingredientOverlapScore(bestDinners);

  for (let i = 0; i < 7; i++) {
    // Re-sort with fresh randomness
    scored.forEach(r => { r.score += Math.random() * 0.5; });
    chicken.sort((a, b) => b.score - a.score);
    beef.sort((a, b) => b.score - a.score);

    const candidate = pickDinners();
    const candidateScore = perishableOverlapScore(candidate) + ingredientOverlapScore(candidate);
    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestDinners = candidate;
    }
  }

  // Step 4 — Assign dinners to days (weekdays first for quick meals, weekends for longer)
  const quickDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slowDays = ['Saturday', 'Sunday'];

  const sortedDinners = [...bestDinners].sort((a, b) => a.time - b.time); // quickest first
  const plan = {};

  // Fill weekday slots with quicker meals
  const dinnerDays = dinnerCount <= 5
    ? quickDays.slice(0, dinnerCount)
    : [...quickDays, ...slowDays].slice(0, dinnerCount);

  dinnerDays.forEach((day, i) => {
    if (sortedDinners[i]) {
      plan[`${day}_dinner`] = sortedDinners[i].id;
    }
  });

  // Step 5 — Break up any 3+ night same-protein streaks left over from the time-sort above
  breakProteinStreaks(dinnerDays, plan, allRecipes);

  // Step 6 — Assign leftover lunches
  return assignLeftoverLunches(plan, leftoverFreq);
}
