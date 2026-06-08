import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export function useRecipeComments(recipeId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!recipeId) return;
    const q = query(
      collection(db, 'recipeComments', recipeId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [recipeId]);

  const addComment = async (text) => {
    if (!text.trim() || !user) return;
    await addDoc(collection(db, 'recipeComments', recipeId, 'comments'), {
      text: text.trim(),
      authorEmail: user.email,
      authorName: user.displayName || user.email.split('@')[0],
      createdAt: new Date().toISOString(),
    });
  };

  const deleteComment = async (commentId) => {
    await deleteDoc(doc(db, 'recipeComments', recipeId, 'comments', commentId));
  };

  return { comments, loading, addComment, deleteComment };
}
