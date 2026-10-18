import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
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
    return 'No account found. Please sign up first.';
  }

  if (
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials' ||
    message === 'Email or password is incorrect'
  ) {
    return 'Email or password is incorrect';
  }

  if (
    code === 'auth/email-already-in-use' ||
    code === 'auth/email-already-exists' ||
    message === 'User already exists. Please sign in'
  ) {
    return 'User already exists. Please sign in';
  }

  if (code === 'auth/invalid-email') {
    return 'Email or password is incorrect';
  }

  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in popup was cancelled.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connectivity.';
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

  // Sync auth token with API client
  const updateApiCredentials = async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      try {
        const token = await fbUser.getIdToken();
        api.setToken(token);
      } catch {
        api.setToken(null);
      }
    } else {
      api.setToken(null);
    }
  };

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

          // Requirement 3 & 5: Verify profile and role via backend GET /api/auth/me
          const meRes = await api.getMe();
          if (!meRes?.profile || !meRes.profile.role) {
            throw new Error('No profile or role claim found');
          }

          setUser(meRes.profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(meRes.profile));
        } catch (checkErr) {
          console.warn('[AuthContext] Verification failed for user, signing out:', checkErr);
          // Block and immediately sign out user with no profile or role
          await firebaseSignOut(auth).catch(() => {});
          localStorage.removeItem(AUTH_STORAGE_KEY);
          api.setToken(null);
          setUser(null);
          setFirebaseUser(null);
        }
      } else {
        const local = localStorage.getItem(AUTH_STORAGE_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            // Allow seeded admin session if authenticated
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

  // Sign In with Email and Password
  // Rules:
  // - Admin credentials: Email: admin@123 or admin@gmail.com, Password: admin#1234 or admin#123
  // - Auto-account creation is REMOVED: Sign In calls ONLY signInWithEmailAndPassword
  // - Calls GET /api/auth/me after login: if no profile or no role claim, immediately signs out
  //   and rejects with "No account found. Please sign up first."
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

    // Normal Passenger / Commuter Sign In:
    // Check if account was registered in GoFlow
    let isRegistered = false;
    try {
      const check = await api.checkRegistered(trimmedEmail);
      isRegistered = !!check.registered;
    } catch {
      // If check fails, allow signInWithEmailAndPassword to proceed
    }

    // Sign In must call ONLY signInWithEmailAndPassword (no auto-creation fallback)
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      const token = await cred.user.getIdToken();
      api.setToken(token);

      // Requirement 3: Profile check on every login.
      // After sign in, call GET /api/auth/me. If no profiles/{uid} document or no role claim exists,
      // immediately sign the user out and show “No account found. Please sign up first.”
      try {
        const meRes = await api.getMe();
        if (!meRes?.profile || !meRes.profile.role) {
          throw new Error('No account found. Please sign up first.');
        }

        const verifiedProfile = meRes.profile;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedProfile));
        setUser(verifiedProfile);
        return verifiedProfile;
      } catch (profileErr: any) {
        console.warn('[AuthContext] Profile verification rejected:', profileErr);
        await firebaseSignOut(auth).catch(() => {});
        localStorage.removeItem(AUTH_STORAGE_KEY);
        api.setToken(null);
        setUser(null);
        setFirebaseUser(null);
        const error = new Error('No account found. Please sign up first.');
        (error as any).code = 'auth/no-profile';
        throw error;
      }
    } catch (err: any) {
      // Unregistered user rejected with "No account found. Please sign up first."
      if (!isRegistered || err?.code === 'auth/user-not-found' || err?.code === 'auth/no-profile') {
        const error = new Error('No account found. Please sign up first.');
        (error as any).code = 'auth/user-not-found';
        throw error;
      }

      // Existing user entered incorrect password
      if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/invalid-login-credentials'
      ) {
        const error = new Error('Email or password is incorrect');
        (error as any).code = 'auth/invalid-credential';
        throw error;
      }

      throw err;
    }
  };

  // Sign Up with Name, Email, and Password (Normal Passenger only)
  // Requirement 2: Sign-up only through the backend via POST /api/auth/register,
  // which creates the Firebase user, sets the role claim, and creates profiles/{uid}.
  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string,
    _targetRole: UserRole = 'passenger'
  ): Promise<UserProfile> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Prevent signing up with admin secret email
    if (isAdminEmail(trimmedEmail)) {
      const error = new Error(`${trimmedEmail} is reserved for administrator login. Please sign in on the Sign In page.`);
      (error as any).code = 'auth/email-already-in-use';
      throw error;
    }

    try {
      // 1. Create account via backend POST /api/auth/register
      const res = await api.register({
        email: trimmedEmail,
        password: pass,
        displayName: displayName || trimmedEmail.split('@')[0],
        role: 'passenger'
      });

      // 2. Sign in with Email and Password
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const token = await cred.user.getIdToken();
        api.setToken(token);
      } catch (fbLoginErr) {
        console.warn('[SignUp] Firebase client sign-in fallback:', fbLoginErr);
      }

      // 3. Verify profile via GET /api/auth/me
      let profile = res.user;
      try {
        const meRes = await api.getMe();
        if (meRes?.profile) {
          profile = meRes.profile;
        }
      } catch {
        // use response profile
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';
      if (code === 'auth/email-already-in-use' || message.includes('already exists')) {
        const error = new Error('User already exists. Please sign in');
        (error as any).code = 'auth/email-already-in-use';
        throw error;
      }
      throw err;
    }
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
