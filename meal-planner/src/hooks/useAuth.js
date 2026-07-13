import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

// 🔒 REPLACE THESE WITH YOUR TWO GOOGLE ACCOUNT EMAILS
const ALLOWED_EMAILS = [
  'brentcniemerski@gmail.com',
  'ebniemerski@gmail.com',
  'elizabethniemerski@gmail.com',
];

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && ALLOWED_EMAILS.includes(firebaseUser.email)) {
        setUser(firebaseUser);
        setError(null);
      } else if (firebaseUser) {
        // Signed in but not on the allowed list
        signOut(auth);
        setError('This account is not authorized to access this app.');
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    }
  };

  const logOut = () => signOut(auth);

  return { user, loading, error, signIn, logOut };
}
