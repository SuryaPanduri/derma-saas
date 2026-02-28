import { config as loadEnv } from 'dotenv';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const uid = process.env.ADMIN_UID;

if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID).');
  process.exit(1);
}

if (!uid) {
  console.error('Missing ADMIN_UID. Example: ADMIN_UID=abc123 npm run set:admin');
  process.exit(1);
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const app = serviceAccountPath && fs.existsSync(serviceAccountPath)
  ? initializeApp({
      credential: cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
      projectId
    })
  : initializeApp({
      credential: applicationDefault(),
      projectId
    });

const auth = getAuth(app);
const db = getFirestore(app);

const run = async () => {
  await auth.setCustomUserClaims(uid, { role: 'admin' });
  await db.collection('users').doc(uid).set(
    {
      role: 'admin',
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
  console.log(`Set admin claim and users/${uid}.role=admin`);
};

run().catch((error) => {
  console.error('Failed setting admin claim:', error?.message || error);
  process.exit(1);
});
