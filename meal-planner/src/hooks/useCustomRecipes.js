import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCustomRecipes() {
  const [customRecipes, setCustomRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customRecipes'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data(), custom: true }));
      setCustomRecipes(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addRecipe = async (recipe) => {
    await addDoc(collection(db, 'customRecipes'), {
      ...recipe,
      createdAt: new Date().toISOString(),
    });
  };

  const updateRecipe = async (id, recipe) => {
    await updateDoc(doc(db, 'customRecipes', id), recipe);
  };

  const deleteRecipe = async (id) => {
    await deleteDoc(doc(db, 'customRecipes', id));
  };

  return { customRecipes, loading, addRecipe, updateRecipe, deleteRecipe };
}
