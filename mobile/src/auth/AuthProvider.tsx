import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { fetchWithAuth } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  signupWithEmail: (email: string, pass: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          // Sync user credentials directly to Neon PostgreSQL users database table
          await fetchWithAuth('/v1/me/sync', {
            method: 'POST',
            body: JSON.stringify({
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0],
            }),
          });
        } catch (err) {
          console.warn('Neon PostgreSQL user sync notice:', err);
        }
      }
    });
    return unsubscribe;
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(true);
    } catch {
      return null;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      // Immediately trigger Neon PostgreSQL UPSERT sync
      fetchWithAuth('/v1/me/sync', {
        method: 'POST',
        body: JSON.stringify({ email, displayName: email.split('@')[0] }),
      }).catch(() => {});
      return cred.user;
    } catch (err: any) {
      throw new Error(mapAuthError(err.code));
    }
  };

  const signupWithEmail = async (email: string, pass: string): Promise<User> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      // Immediately trigger Neon PostgreSQL UPSERT sync
      fetchWithAuth('/v1/me/sync', {
        method: 'POST',
        body: JSON.stringify({ email, displayName: email.split('@')[0] }),
      }).catch(() => {});
      return cred.user;
    } catch (err: any) {
      throw new Error(mapAuthError(err.code));
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(mapAuthError(err.code));
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        getIdToken,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function mapAuthError(code?: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already uses this email. Try logging in or resetting your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    default:
      return 'Authentication failed. Please check your credentials and try again.';
  }
}
