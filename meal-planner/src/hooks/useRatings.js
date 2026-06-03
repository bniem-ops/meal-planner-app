import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useRatings() {
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mealData', 'ratings'), snap => {
      setRatings(snap.exists() ? snap.data() : {});
    });
    return unsub;
  }, []);

  const rateRecipe = async (recipeId, data) => {
    const updated = {
      ...ratings,
      [recipeId]: { ...ratings[recipeId], ...data, updatedAt: new Date().toISOString() }
    };
    setRatings(updated);
    await setDoc(doc(db, 'mealData', 'ratings'), updated);
  };

  return { ratings, rateRecipe };
}
