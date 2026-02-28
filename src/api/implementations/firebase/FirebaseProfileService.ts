import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { ProfileService } from '@/api/interfaces';
import type { ProfileDTO } from '@/types';
import { db } from './firebase.config';
import { mapProfileDoc } from './mappers';

export class FirebaseProfileService implements ProfileService {
  async getProfile(uid: string): Promise<ProfileDTO | null> {
    const profileDoc = await getDoc(doc(db, 'profiles', uid));

    if (!profileDoc.exists()) {
      return null;
    }

    return mapProfileDoc(uid, profileDoc.data());
  }

  async upsertProfile(profile: ProfileDTO): Promise<ProfileDTO> {
    await setDoc(
      doc(db, 'profiles', profile.uid),
      {
        ...profile,
        dateOfBirth: profile.dateOfBirth,
        updatedAt: serverTimestamp(),
        createdAt: profile.createdAt ? profile.createdAt : serverTimestamp()
      },
      { merge: true }
    );

    return {
      ...profile,
      updatedAt: new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString()
    };
  }
}
