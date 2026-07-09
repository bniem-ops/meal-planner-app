import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getWeekId } from '../data/recipes';

/**
 * Returns the previous week's ID (the week being reviewed on Sunday).
 * On Sunday, this returns the week that just ended (Mon–Sat + today).
 * We review the *current* week on Sunday, so we use the current weekId.
 */
function isSunday() {
  return new Date().getDay() === 0;
}

export function useWeeklyReview() {
  const weekId = getWeekId();
  const [review, setReview] = useState(null);   // null = not loaded yet
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Real-time listener for this week's review doc
  useEffect(() => {
    const ref = doc(db, 'weeklyReviews', weekId);
    const unsub = onSnapshot(ref, (snap) => {
      setReview(snap.exists() ? snap.data() : {});
    });
    return unsub;
  }, [weekId]);

  // Save the completed review and mark it done
  const saveReview = async ({ ratings, notes }) => {
    setSaving(true);
    try {
      const ref = doc(db, 'weeklyReviews', weekId);
      await setDoc(ref, {
        ratings,           // { [slotKey]: 'up' | 'down' | 'kid' }
        notes,
        completedAt: new Date().toISOString(),
        weekId,
      }, { merge: true });
      setDismissed(true);
    } finally {
      setSaving(false);
    }
  };

  // Dismiss without saving (snooze until next open)
  const dismiss = () => setDismissed(true);

  const showBanner =
    isSunday() &&
    !dismissed &&
    review !== null &&          // loaded
    !review.completedAt;        // not already done this week

  return { showBanner, review, saving, saveReview, dismiss, weekId };
}
