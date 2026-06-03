import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_STAPLES = [
  { id: 's1', text: 'Olive oil', checked: false },
  { id: 's2', text: 'Garlic', checked: false },
  { id: 's3', text: 'Salt & pepper', checked: false },
  { id: 's4', text: 'Italian seasoning', checked: false },
  { id: 's5', text: 'Soy sauce', checked: false },
  { id: 's6', text: 'Taco seasoning', checked: false },
  { id: 's7', text: 'Shredded cheese', checked: false },
  { id: 's8', text: 'Diced tomatoes (canned)', checked: false },
  { id: 's9', text: 'White rice', checked: false },
  { id: 's10', text: 'Pasta', checked: false },
];

export function useStaples() {
  const [staples, setStaples] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mealData', 'staples'), snap => {
      setStaples(snap.exists() ? (snap.data().items || []) : DEFAULT_STAPLES);
    });
    return unsub;
  }, []);

  const save = async (updated) => {
    setStaples(updated);
    await setDoc(doc(db, 'mealData', 'staples'), { items: updated });
  };

  const toggleStaple = (id) => save(staples.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  const addStaple = (text) => save([...staples, { id: Date.now().toString(), text, checked: false }]);
  const removeStaple = (id) => save(staples.filter(s => s.id !== id));
  const clearChecked = () => save(staples.map(s => ({ ...s, checked: false })));

  return { staples, toggleStaple, addStaple, removeStaple, clearChecked };
}
