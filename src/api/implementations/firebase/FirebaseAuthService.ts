import {
  createUserWithEmailAndPassword,
  getIdTokenResult,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AuthService } from '@/api/interfaces';
import type { UserDTO } from '@/types';
import { auth, db } from './firebase.config';
import { mapUserDoc } from './mappers';

export class FirebaseAuthService implements AuthService {
  private readonly persistenceReady = setPersistence(auth, inMemoryPersistence).catch(() => undefined);

  private async buildUserFromAuth(
    uid: string,
    email: string,
    fallbackCreatedAt: string
  ): Promise<UserDTO> {
    const token = await getIdTokenResult(auth.currentUser!, true);
    const claimRole = token.claims.role;

    return {
      id: uid,
      email,
      role: claimRole === 'admin' ? 'admin' : 'customer',
      createdAt: fallbackCreatedAt,
      lastLoginAt: new Date().toISOString()
    };
  }

  private async applyClaimRole(user: UserDTO): Promise<UserDTO> {
    const token = await getIdTokenResult(auth.currentUser!, true);
    return {
      ...user,
      role: token.claims.role === 'admin' ? 'admin' : 'customer'
    };
  }

  async signIn(email: string, password: string): Promise<UserDTO> {
    await this.persistenceReady;
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', credential.user.uid);
    const userEmail = credential.user.email ?? email;
    const now = new Date().toISOString();

    try {
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const fallbackUser = await this.buildUserFromAuth(credential.user.uid, userEmail, now);
        await setDoc(userDocRef, {
          ...fallbackUser,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });

        return fallbackUser;
      }

      await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });

      const mapped = mapUserDoc(credential.user.uid, {
        ...userDoc.data(),
        email: userEmail,
        lastLoginAt: new Date().toISOString()
      });
      return this.applyClaimRole(mapped);
    } catch {
      // If Firestore access is denied/misconfigured, still allow auth-based session.
      return this.buildUserFromAuth(credential.user.uid, userEmail, now);
    }
  }

  async signUp(email: string, password: string, role: 'admin' | 'customer'): Promise<UserDTO> {
    await this.persistenceReady;
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const now = new Date().toISOString();

    await updateProfile(credential.user, { displayName: role });

    const user: UserDTO = {
      id: credential.user.uid,
      email,
      role,
      createdAt: now,
      lastLoginAt: now
    };

    await setDoc(doc(db, 'users', user.id), {
      ...user,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    return user;
  }

  async signOut(): Promise<void> {
    await this.persistenceReady;
    await firebaseSignOut(auth);
  }

  async getCurrentUser(): Promise<UserDTO | null> {
    await this.persistenceReady;
    const current = auth.currentUser;
    if (!current) {
      return null;
    }

    const fallback = await this.buildUserFromAuth(
      current.uid,
      current.email ?? `guest-${current.uid.slice(0, 8)}@local`,
      new Date().toISOString()
    );

    try {
      const userDoc = await getDoc(doc(db, 'users', current.uid));

      if (!userDoc.exists()) {
        await setDoc(
          doc(db, 'users', current.uid),
          {
            ...fallback,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          },
          { merge: true }
        );
        return fallback;
      }

      const mapped = mapUserDoc(current.uid, {
        ...userDoc.data(),
        email: current.email ?? userDoc.data().email
      });
      return this.applyClaimRole(mapped);
    } catch {
      return fallback;
    }
  }
}
