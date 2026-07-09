import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Returns the last N completed weekly reviews, oldest first, with a thumbs-up rate per week.
export function useWeeklyReviewHistory(weeks = 8) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'weeklyReviews'), (snap) => {
      const rows = snap.docs
        .map(d => ({ weekId: d.id, ...d.data() }))
        .filter(r => r.completedAt && r.ratings)
        .map(r => {
          const values = Object.values(r.ratings || {});
          const up = values.filter(v => v === 'up').length;
          const down = values.filter(v => v === 'down').length;
          const rated = up + down;
          return { weekId: r.weekId, upPct: rated ? Math.round((up / rated) * 100) : null, rated };
        })
        .sort((a, b) => a.weekId.localeCompare(b.weekId))
        .slice(-weeks);

      setHistory(rows);
      setLoading(false);
    });
    return unsub;
  }, [weeks]);

  return { history, loading };
}
