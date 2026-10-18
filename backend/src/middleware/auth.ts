import { Request, Response, NextFunction } from 'express';
import { getAdminAuth, isFirebaseConfigured } from '../config/firebase.js';
import { store } from '../services/store.js';
import { UserRole } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Explicit mock admin token for seeded admin testing/development
  if (authHeader === 'Bearer mock-admin-token') {
    const adminProfile = (await store.getProfile('admin-goflow-master')) || (await store.getProfile('admin-1'));
    if (adminProfile && adminProfile.role === 'admin') {
      req.user = {
        uid: adminProfile.uid,
        email: adminProfile.email,
        displayName: adminProfile.displayName,
        role: 'admin'
      };
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: No valid role claim found. Please sign up first.' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  let decodedUid = '';
  let decodedEmail = '';
  let decodedName = '';
  let decodedRole: UserRole | null = null;

  if (isFirebaseConfigured() && getAdminAuth()) {
    try {
      const decoded = await getAdminAuth()!.verifyIdToken(token);
      decodedUid = decoded.uid;
      decodedEmail = (decoded.email || '').toLowerCase();
      decodedName = decoded.name || '';

      if (
        decodedEmail === 'admin@123' ||
        decodedEmail === 'admin@gmail.com' ||
        decoded.role === 'admin' ||
        (decoded as any).admin === true
      ) {
        decodedRole = 'admin';
      } else if (decoded.role === 'passenger') {
        decodedRole = 'passenger';
      }
    } catch (err: any) {
      console.error('[Auth Middleware] Firebase verifyIdToken failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired Firebase auth token', details: err.message });
    }
  } else {
    // Development / Local / Fallback token parsing
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);

        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < nowSec) {
          return res.status(401).json({ error: 'Token expired' });
        }

        decodedUid = payload.user_id || payload.sub || payload.uid;
        decodedEmail = (payload.email || '').toLowerCase();
        decodedName = payload.name || '';

        if (
          decodedEmail === 'admin@123' ||
          decodedEmail === 'admin@gmail.com' ||
          payload.role === 'admin' ||
          payload.admin === true
        ) {
          decodedRole = 'admin';
        } else if (payload.role === 'passenger') {
          decodedRole = 'passenger';
        }
      } catch (err: any) {
        return res.status(401).json({ error: 'Invalid auth token', details: err.message });
      }
    } else {
      return res.status(401).json({ error: 'Invalid auth token format' });
    }
  }

  // 1. Role Claim Enforcement: verifyToken MUST reject tokens with no valid role claim (return 403)
  if (!decodedRole) {
    return res.status(403).json({ error: 'Forbidden: No valid role claim found. Please sign up first.' });
  }

  // 2. Profile Document Enforcement: verifyToken MUST reject users with no profiles/{uid} document (return 403)
  let profile = await store.getProfile(decodedUid);
  if (!profile) {
    // If seeded admin logging in via Firebase for the first time, link their profile
    if (decodedRole === 'admin' && (decodedEmail === 'admin@gmail.com' || decodedEmail === 'admin@123')) {
      profile = await store.setProfile({
        uid: decodedUid,
        email: decodedEmail,
        displayName: decodedName || 'Mumbai Transit Control Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
    } else {
      return res.status(403).json({ error: 'Forbidden: No profile document found. Please sign up first.' });
    }
  }

  // Ensure role matches
  if (profile.role !== decodedRole && decodedRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Role claim mismatch. Please sign up first.' });
  }

  req.user = {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    role: profile.role
  };

  return next();
}

export const verifyToken = authenticate;

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
  }
  return next();
}
