import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { api } from '../services/api';
import { UserProfile, UserRole } from '../types';

export const formatAuthError = (err: any): string => {
  const code = err?.code || '';
  const message = err?.message || '';

  if (
    code === 'auth/user-not-found' ||
    code === 'auth/no-profile' ||
    message.includes('No account found') ||
    message.includes('Please sign up first')
  ) {
    return 'No account found with this email. Please sign up or click Continue with Google.';
  }

  if (
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-login-credentials' ||
    message === 'Email or password is incorrect'
  ) {
    return 'Email or password is incorrect';
  }

  if (code === 'auth/invalid-credential') {
    return 'Invalid email or password. If you do not have an account yet, please sign up or click Continue with Google.';
  }

  if (
    code === 'auth/email-already-in-use' ||
    code === 'auth/email-already-exists' ||
    message === 'User already exists. Please sign in'
  ) {
    return 'User already exists. Please sign in.';
  }

  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }

  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completing.';
  }

  if (code === 'auth/cancelled-popup-request') {
    return 'Google sign-in request was cancelled.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connection.';
  }

  return message || 'Authentication failed. Please try again.';
};

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return lower === 'admin@123' || lower === 'admin@gmail.com';
};

export interface PassengerAuthPayload {
  fullName: string;
  phone: string;
  homeStation?: string;
  primaryCorridor?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isFirebaseActive: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, pass: string, displayName?: string, role?: UserRole) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  authenticatePassenger: (details: PassengerAuthPayload) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'goflow_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session and initialize auth listener
  useEffect(() => {
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY);
      if (cached) {
        const parsed: UserProfile = JSON.parse(cached);
        setUser(parsed);
        if (parsed.role === 'admin') {
          api.setToken('mock-admin-token');
        }
      }
    } catch {
      // ignore
    }

    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          api.setToken(token);

          // Verify profile and role via backend GET /api/auth/me
          const meRes = await api.getMe();
          if (meRes?.profile && meRes.profile.role) {
            setUser(meRes.profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(meRes.profile));
          } else {
            const email = (fbUser.email || '').toLowerCase();
            const fallbackProfile: UserProfile = {
              uid: fbUser.uid,
              email,
              displayName: fbUser.displayName || email.split('@')[0] || 'Commuter',
              role: isAdminEmail(email) ? 'admin' : 'passenger',
              createdAt: new Date().toISOString()
            };
            setUser(fallbackProfile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackProfile));
          }
        } catch (checkErr) {
          console.warn('[AuthContext] Backend profile sync note on state change:', checkErr);
          // Graceful fallback: Keep user logged in using Firebase token & profile
          const email = (fbUser.email || '').toLowerCase();
          const fallbackProfile: UserProfile = {
            uid: fbUser.uid,
            email,
            displayName: fbUser.displayName || email.split('@')[0] || 'Commuter',
            role: isAdminEmail(email) ? 'admin' : 'passenger',
            createdAt: new Date().toISOString()
          };
          setUser(fallbackProfile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackProfile));
        }
      } else {
        const local = localStorage.getItem(AUTH_STORAGE_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.role === 'admin' && (parsed.email === 'admin@123' || parsed.email === 'admin@gmail.com')) {
              setUser(parsed);
              api.setToken('mock-admin-token');
            } else {
              setUser(null);
              localStorage.removeItem(AUTH_STORAGE_KEY);
              api.setToken(null);
            }
          } catch {
            setUser(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            api.setToken(null);
          }
        } else {
          setUser(null);
          api.setToken(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    try {
      const meRes = await api.getMe();
      if (meRes?.profile) {
        setUser(meRes.profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(meRes.profile));
      }
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  // Passenger quick details authentication
  const authenticatePassenger = async (details: PassengerAuthPayload) => {
    setIsLoading(true);
    try {
      const cleanName = details.fullName.trim() || 'Mumbai Commuter';
      const cleanPhone = details.phone.trim();
      const sanitizedPhone = cleanPhone.replace(/\D/g, '');

      const profile: UserProfile = {
        uid: `psg-${sanitizedPhone || Date.now()}`,
        email: `${sanitizedPhone || 'passenger'}@commuter.goflow.in`,
        displayName: cleanName,
        role: 'passenger',
        phone: cleanPhone,
        homeStation: details.homeStation,
        primaryCorridor: details.primaryCorridor,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Sign In with Google (Instant 1-click Authentication)
  const signInWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const token = await fbUser.getIdToken();
      api.setToken(token);

      const email = (fbUser.email || '').toLowerCase();
      const displayName = fbUser.displayName || email.split('@')[0] || 'Commuter';
      const role: UserRole = isAdminEmail(email) ? 'admin' : 'passenger';

      let profile: UserProfile = {
        uid: fbUser.uid,
        email,
        displayName,
        role,
        photoURL: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        savedRoutes: []
      };

      // Sync or retrieve full profile from backend
      try {
        const meRes = await api.getMe();
        if (meRes?.profile && meRes.profile.role) {
          profile = { ...profile, ...meRes.profile };
        }
      } catch {
        // Backend auto-provisions or we set role
        try {
          await api.setRole(fbUser.uid, role);
        } catch {
          // ignore
        }
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setUser(profile);
      setFirebaseUser(fbUser);
      return profile;
    } catch (err: any) {
      console.error('[Google Sign-In Error]:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Sign In with Email and Password
  const signInWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check Secret Admin Credentials
    if (isAdminEmail(trimmedEmail)) {
      if (pass === 'admin#1234' || pass === 'admin#123') {
        const adminProfile: UserProfile = {
          uid: 'admin-goflow-master',
          email: trimmedEmail === 'admin@123' ? 'admin@123' : 'admin@gmail.com',
          displayName: 'Mumbai Transit Control Admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        };

        if (isFirebaseConfigured) {
          try {
            const fbLoginEmail = trimmedEmail.includes('.') ? trimmedEmail : 'admin@gmail.com';
            const cred = await signInWithEmailAndPassword(auth, fbLoginEmail, pass);
            const token = await cred.user.getIdToken();
            api.setToken(token);
          } catch {
            api.setToken('mock-admin-token');
          }
        } else {
          api.setToken('mock-admin-token');
        }

        try {
          const meRes = await api.getMe();
          if (meRes?.profile) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(meRes.profile));
            setUser(meRes.profile);
            return meRes.profile;
          }
        } catch {
          // Fallback to local adminProfile
        }

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminProfile));
        setUser(adminProfile);
        return adminProfile;
      } else {
        const error = new Error('Email or password is incorrect');
        (error as any).code = 'auth/invalid-credential';
        throw error;
      }
    }

    // Normal Passenger / Commuter Sign In
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      const token = await cred.user.getIdToken();
      api.setToken(token);

      let verifiedProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || trimmedEmail,
        displayName: cred.user.displayName || trimmedEmail.split('@')[0] || 'Commuter',
        role: 'passenger',
        createdAt: new Date().toISOString()
      };

      try {
        const meRes = await api.getMe();
        if (meRes?.profile && meRes.profile.role) {
          verifiedProfile = meRes.profile;
        }
      } catch (profileErr: any) {
        console.warn('[AuthContext] Backend profile check warning:', profileErr);
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedProfile));
      setUser(verifiedProfile);
      return verifiedProfile;
    } catch (err: any) {
      const code = err?.code || '';

      // Also try backend store login fallback
      try {
        const loginRes = await api.login(trimmedEmail, pass);
        if (loginRes?.user) {
          api.setToken(loginRes.token || 'mock-passenger-token');
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loginRes.user));
          setUser(loginRes.user);
          return loginRes.user;
        }
      } catch {
        // continue to throw proper error
      }

      if (code === 'auth/user-not-found') {
        const error = new Error('No account found. Please sign up first, or click Continue with Google.');
        (error as any).code = 'auth/user-not-found';
        throw error;
      }

      if (code === 'auth/wrong-password') {
        const error = new Error('Email or password is incorrect');
        (error as any).code = 'auth/invalid-credential';
        throw error;
      }

      if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        const error = new Error('Invalid email or password. If you do not have an account yet, please sign up or click Continue with Google.');
        (error as any).code = 'auth/invalid-credential';
        throw error;
      }

      throw err;
    }
  };

  // 3. Sign Up with Name, Email, and Password (Normal Passenger only)
  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string,
    targetRole: UserRole = 'passenger'
  ): Promise<UserProfile> => {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = displayName?.trim() || trimmedEmail.split('@')[0] || 'Passenger';

    // Prevent signing up with admin secret email
    if (isAdminEmail(trimmedEmail)) {
      const error = new Error(`${trimmedEmail} is reserved for administrator login. Please sign in on the Sign In page.`);
      (error as any).code = 'auth/email-already-in-use';
      throw error;
    }

    let cred;
    try {
      // 1. Create user in Firebase Client
      cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: cleanName }).catch(() => {});
        const token = await cred.user.getIdToken();
        api.setToken(token);
      }
    } catch (fbCreateErr: any) {
      if (fbCreateErr?.code === 'auth/email-already-in-use') {
        const error = new Error('User already exists. Please sign in');
        (error as any).code = 'auth/email-already-in-use';
        throw error;
      }
      // If client creation failed due to network, try backend registration API
      try {
        await api.register({
          email: trimmedEmail,
          password: pass,
          displayName: cleanName,
          role: targetRole
        });
      } catch {
        throw fbCreateErr;
      }
    }

    // 2. Synchronize profile with backend
    const uid = cred?.user?.uid || `usr-${Date.now()}`;
    let profile: UserProfile = {
      uid,
      email: trimmedEmail,
      displayName: cleanName,
      role: targetRole,
      createdAt: new Date().toISOString(),
      savedRoutes: []
    };

    try {
      await api.register({
        email: trimmedEmail,
        password: pass,
        displayName: cleanName,
        role: targetRole
      }).catch(() => {});

      const meRes = await api.getMe();
      if (meRes?.profile) {
        profile = meRes.profile;
      }
    } catch {
      // Use constructed profile
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const loginAsDemo = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const fallback: UserProfile = {
        uid: targetRole === 'admin' ? 'admin-1' : 'passenger-1',
        email: targetRole === 'admin' ? 'admin@123' : 'passenger@goflow.mumbai',
        displayName: targetRole === 'admin' ? 'Mumbai Transit Admin' : 'Daily Mumbai Commuter',
        role: targetRole,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallback));
      api.setToken(targetRole === 'admin' ? 'mock-admin-token' : null);
      setUser(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('goflow_demo_role');
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout issue:', err);
    }
    api.setToken(null);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role: user?.role || null,
        isLoading,
        isFirebaseActive: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        authenticatePassenger,
        resetPassword,
        loginAsDemo,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
