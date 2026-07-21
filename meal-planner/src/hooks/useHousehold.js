import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EMPTY_PREFS = { chicken: 'neutral', beef: 'neutral', other: 'neutral' };

export function useHousehold() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mealData', 'household'), snap => {
      setMembers(snap.exists() ? (snap.data().members || []) : []);
      setLoading(false);
    });
    return unsub;
  }, []);

  const save = async (updated) => {
    setMembers(updated);
    await setDoc(doc(db, 'mealData', 'household'), { members: updated });
  };

  const addMember = (name) => save([
    ...members,
    { id: Date.now().toString(), name, emoji: '🙂', proteinPrefs: { ...EMPTY_PREFS }, allergies: [] },
  ]);

  const updateMember = (id, patch) =>
    save(members.map(m => m.id === id ? { ...m, ...patch } : m));

  const removeMember = (id) => save(members.filter(m => m.id !== id));

  return { members, loading, addMember, updateMember, removeMember };
}
