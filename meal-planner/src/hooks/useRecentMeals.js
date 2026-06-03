import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getWeekId } from '../data/recipes';

// Returns set of recipeIds planned in the last 2 weeks (excluding current)
export function useRecentMeals() {
  const [recentIds, setRecentIds] = useState(new Set());

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mealPlans'), (snap) => {
      const currentWeek = getWeekId();
      const ids = new Set();

      snap.docs.forEach(d => {
        if (d.id === currentWeek) return; // skip current week
        const meals = d.data().meals || {};
        Object.values(meals).forEach(id => { if (id) ids.add(id); });
      });

      setRecentIds(ids);
    });
    return unsub;
  }, []);

  return recentIds;
}
