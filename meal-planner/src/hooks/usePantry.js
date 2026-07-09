import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_PANTRY_ITEMS = [
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

// `checked` means "I have this in stock" — used to hide matching items from the meal-derived grocery list.
export function usePantry() {
  const [pantry, setPantry] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mealData', 'pantry'), snap => {
      setPantry(snap.exists() ? (snap.data().items || []) : DEFAULT_PANTRY_ITEMS);
    });
    return unsub;
  }, []);

  const save = async (updated) => {
    setPantry(updated);
    await setDoc(doc(db, 'mealData', 'pantry'), { items: updated });
  };

  const toggleItem = (id) => save(pantry.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  const addItem = (text) => save([...pantry, { id: Date.now().toString(), text, checked: false }]);
  const removeItem = (id) => save(pantry.filter(p => p.id !== id));
  const clearChecked = () => save(pantry.map(p => ({ ...p, checked: false })));

  return { pantry, toggleItem, addItem, removeItem, clearChecked };
}
