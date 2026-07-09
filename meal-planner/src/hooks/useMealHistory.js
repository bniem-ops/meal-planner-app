import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { recipes as builtInRecipes } from '../data/recipes';

export function useMealHistory(customRecipes = []) {
  const [history, setHistory] = useState([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mealPlans'), (snap) => {
      // Count how many times each recipeId appears across all weeks
      const counts = {};
      const weeksSeen = {};
      const proteinByWeek = {};

      snap.docs.forEach(doc => {
        const meals = doc.data().meals || {};
        const weekCounts = { chicken: 0, beef: 0, other: 0 };
        // Track which recipes appeared in which weeks (for "last cooked" date)
        Object.values(meals).forEach(recipeId => {
          if (!recipeId) return;
          counts[recipeId] = (counts[recipeId] || 0) + 1;
          if (!weeksSeen[recipeId] || doc.id > weeksSeen[recipeId]) {
            weeksSeen[recipeId] = doc.id; // weekId is ISO date string, sorts lexically
          }
          const recipe = getRecipe(recipeId);
          const protein = recipe?.protein || 'other';
          weekCounts[protein] = (weekCounts[protein] || 0) + 1;
        });
        if (weekCounts.chicken + weekCounts.beef + weekCounts.other > 0) {
          proteinByWeek[doc.id] = weekCounts;
        }
      });

      // Build sorted list
      const sorted = Object.entries(counts)
        .map(([id, count]) => ({
          recipe: getRecipe(id),
          count,
          lastWeek: weeksSeen[id],
        }))
        .filter(entry => entry.recipe) // skip deleted custom recipes
        .sort((a, b) => b.count - a.count);

      const breakdown = Object.entries(proteinByWeek)
        .map(([weekId, counts]) => ({ weekId, ...counts }))
        .sort((a, b) => a.weekId.localeCompare(b.weekId))
        .slice(-8);

      setHistory(sorted);
      setWeeklyBreakdown(breakdown);
      setLoading(false);
    });
    return unsub;
  }, [allRecipes.length]);

  return { history, weeklyBreakdown, loading };
}
