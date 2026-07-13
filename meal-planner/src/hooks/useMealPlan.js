import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getWeekId } from '../data/recipes';

export function useMealPlan(weekId = getWeekId()) {
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

  const assignMeal = async (key, mealId) => {
    const ref = doc(db, 'mealPlans', weekId);
    const updated = { ...plan, [key]: mealId };
    setPlan(updated);
    await setDoc(ref, { meals: updated, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const clearMeal = async (key) => {
    const ref = doc(db, 'mealPlans', weekId);
    const updated = { ...plan };
    delete updated[key];
    setPlan(updated);
    await updateDoc(ref, {
      [`meals.${key}`]: deleteField(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Replace the entire week plan at once (used by PlanMyWeek)
  const applyPlan = async (newPlan) => {
    const ref = doc(db, 'mealPlans', weekId);
    setPlan(newPlan);
    await setDoc(ref, { meals: newPlan, updatedAt: new Date().toISOString() });
  };

  return { plan, loading, assignMeal, clearMeal, applyPlan, weekId };
}
