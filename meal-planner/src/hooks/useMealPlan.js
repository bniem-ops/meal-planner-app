import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
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

  const assignMeal = async (key, mealId) => {
    const ref = doc(db, 'mealPlans', weekId);
    const updated = { ...plan, [key]: mealId };
    setPlan(updated);
    await setDoc(ref, { meals: updated, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const clearMeal = async (key) => {
    const ref = doc(db, 'mealPlans', weekId);
    // Update local state immediately
    const updated = { ...plan };
    delete updated[key];
    setPlan(updated);
    // Use updateDoc with deleteField to actually remove the field in Firestore
    await updateDoc(ref, {
      [`meals.${key}`]: deleteField(),
      updatedAt: new Date().toISOString(),
    });
  };

  return { plan, loading, assignMeal, clearMeal, weekId };
}
