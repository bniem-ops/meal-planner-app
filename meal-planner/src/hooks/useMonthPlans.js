import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Listens to every mealPlans doc (same pattern as useMealHistory/useRecentMeals)
// and returns them keyed by weekId, for the month calendar to look up any date.
export function useMonthPlans() {
  const [plansByWeek, setPlansByWeek] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'mealPlans'), (snap) => {
      const byWeek = {};
      snap.docs.forEach(doc => { byWeek[doc.id] = doc.data().meals || {}; });
      setPlansByWeek(byWeek);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { plansByWeek, loading };
}
