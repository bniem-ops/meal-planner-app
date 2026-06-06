import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { recipes as builtInRecipes } from '../data/recipes';

export function useMealHistory(customRecipes = []) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const allRecipes = [...builtInRecipes, ...customRecipes];
  const getRecipe = (id) => allRecipes.find(r => r.id === id);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mealPlans'), (snap) => {
      // Count how many times each recipeId appears across all weeks
      const counts = {};
      const weeksSeen = {};

      snap.docs.forEach(doc => {
        const meals = doc.data().meals || {};
        // Track which recipes appeared in which weeks (for "last cooked" date)
        Object.values(meals).forEach(recipeId => {
          if (!recipeId) return;
          counts[recipeId] = (counts[recipeId] || 0) + 1;
          if (!weeksSeen[recipeId] || doc.id > weeksSeen[recipeId]) {
            weeksSeen[recipeId] = doc.id; // weekId is ISO date string, sorts lexically
          }
        });
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

      setHistory(sorted);
      setLoading(false);
    });
    return unsub;
  }, [allRecipes.length]);

  return { history, loading };
}
