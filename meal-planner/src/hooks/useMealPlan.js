import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getWeekId } from '../data/recipes';

export function useMealPlan() {
  const weekId = getWeekId();
  const [plan, setPlan] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'mealPlans', weekId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setPlan(snap.data().meals || {});
      } else {
        setPlan({});
      }
      setLoading(false);
    });
    return unsub;
  }, [weekId]);

  const assignMeal = async (day, meal) => {
    const ref = doc(db, 'mealPlans', weekId);
    const updated = { ...plan, [day]: meal };
    setPlan(updated);
    await setDoc(ref, { meals: updated, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const clearMeal = async (day) => {
    const ref = doc(db, 'mealPlans', weekId);
    const updated = { ...plan };
    delete updated[day];
    setPlan(updated);
    await setDoc(ref, { meals: updated, updatedAt: new Date().toISOString() }, { merge: true });
  };

  return { plan, loading, assignMeal, clearMeal, weekId };
}
