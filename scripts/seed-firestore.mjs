import { config as loadEnv } from 'dotenv';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID) in environment.');
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

const db = getFirestore(app);

const clinicId = process.env.SEED_CLINIC_ID || 'clinic-001';
const timezone = process.env.SEED_TIMEZONE || 'America/Los_Angeles';

const services = [
  {
    id: 'svc-acne-consult',
    clinicId,
    name: 'Acne Specialist Consultation',
    description: 'Comprehensive acne assessment and treatment planning with dermatoscopic review.',
    category: 'Medical Dermatology',
    durationMinutes: 30,
    priceCents: 12000,
    isActive: true
  },
  {
    id: 'svc-pigmentation-plan',
    clinicId,
    name: 'Pigmentation Correction Session',
    description: 'Targeted care plan for melasma and hyperpigmentation with follow-up protocol.',
    category: 'Skin Therapy',
    durationMinutes: 45,
    priceCents: 18000,
    isActive: true
  },
  {
    id: 'svc-antiaging-review',
    clinicId,
    name: 'Anti-Aging Skin Review',
    description: 'Clinical review focused on texture, elasticity, and collagen support treatments.',
    category: 'Aesthetic Dermatology',
    durationMinutes: 40,
    priceCents: 22000,
    isActive: true
  },
  {
    id: 'svc-eczema-followup',
    clinicId,
    name: 'Eczema Follow-up Visit',
    description: 'Progress review for atopic dermatitis and medication response optimization.',
    category: 'Medical Dermatology',
    durationMinutes: 25,
    priceCents: 9500,
    isActive: true
  },
  {
    id: 'svc-hairloss-consult',
    clinicId,
    name: 'Hair Loss Diagnostic Consult',
    description: 'Scalp and follicular analysis with structured treatment recommendations.',
    category: 'Trichology',
    durationMinutes: 35,
    priceCents: 16000,
    isActive: true
  }
];

const products = [
  {
    id: 'prd-gentle-cleanser',
    clinicId,
    name: 'Dermacalm Gentle Cleanser',
    description: 'Soap-free low-irritant cleanser for sensitive and acne-prone skin.',
    sku: 'DRM-CLN-001',
    stock: 42,
    priceCents: 3200,
    isActive: true,
    imageUrl: ''
  },
  {
    id: 'prd-niacinamide-serum',
    clinicId,
    name: 'Niacinamide Balance Serum',
    description: 'Oil-control and barrier-support serum with 5% niacinamide.',
    sku: 'DRM-SRM-002',
    stock: 28,
    priceCents: 5400,
    isActive: true,
    imageUrl: ''
  },
  {
    id: 'prd-retinol-night',
    clinicId,
    name: 'Retinol Night Renewal',
    description: 'Step-up retinoid night formula for texture and tone improvement.',
    sku: 'DRM-NGT-003',
    stock: 19,
    priceCents: 6800,
    isActive: true,
    imageUrl: ''
  },
  {
    id: 'prd-spf50-mineral',
    clinicId,
    name: 'Mineral Shield SPF 50',
    description: 'Broad-spectrum mineral sunscreen with non-comedogenic finish.',
    sku: 'DRM-SPF-004',
    stock: 61,
    priceCents: 3900,
    isActive: true,
    imageUrl: ''
  },
  {
    id: 'prd-ceramide-moisturizer',
    clinicId,
    name: 'Ceramide Repair Moisturizer',
    description: 'Barrier-repair cream for dry, reactive, and post-procedure skin.',
    sku: 'DRM-MST-005',
    stock: 35,
    priceCents: 4600,
    isActive: true,
    imageUrl: ''
  },
  {
    id: 'prd-azelaic-gel',
    clinicId,
    name: 'Azelaic Clarity Gel',
    description: 'Daily support gel for redness, blemishes, and uneven skin tone.',
    sku: 'DRM-GEL-006',
    stock: 24,
    priceCents: 5100,
    isActive: true,
    imageUrl: ''
  }
];

const slotTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const toDateISO = (date) => date.toISOString().split('T')[0];

const nextDates = (days = 14) => {
  const today = new Date();
  const list = [];

  for (let i = 0; i < days; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    list.push(toDateISO(d));
  }

  return list;
};

const setDocWithAudit = (ref, payload) => ({
  ...payload,
  createdAt: payload.createdAt || FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
});

const seedServices = async () => {
  const writes = services.map((item) => {
    const ref = db.collection('services').doc(item.id);
    return ref.set(setDocWithAudit(ref, item), { merge: true });
  });

  await Promise.all(writes);
  console.log(`Seeded ${services.length} services.`);
};

const seedProducts = async () => {
  const writes = products.map((item) => {
    const ref = db.collection('products').doc(item.id);
    return ref.set(setDocWithAudit(ref, item), { merge: true });
  });

  await Promise.all(writes);
  console.log(`Seeded ${products.length} products.`);
};

const seedSlots = async () => {
  const dates = nextDates(Number(process.env.SEED_SLOT_DAYS || 14));
  const writes = [];

  for (const dateISO of dates) {
    for (const timeSlot of slotTimes) {
      const ref = db.collection('slots').doc(dateISO).collection('times').doc(timeSlot);
      writes.push(
        ref.set(
          {
            isBooked: false,
            appointmentId: null,
            timezone,
            updatedAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        )
      );
    }
  }

  await Promise.all(writes);
  console.log(`Seeded ${dates.length * slotTimes.length} slot docs for ${dates.length} days.`);
};

const seedDemoProfile = async () => {
  const demoUid = process.env.SEED_DEMO_UID || 'demo-user';
  const profileRef = db.collection('profiles').doc(demoUid);

  await profileRef.set(
    {
      uid: demoUid,
      clinicId,
      fullName: 'Demo Patient',
      phone: '+1-555-0101',
      dateOfBirth: '1992-05-18T00:00:00.000Z',
      gender: 'unspecified',
      skinType: 'combination',
      allergies: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  console.log('Seeded demo profile.');
};

const run = async () => {
  console.log(`Seeding Firestore for project=${projectId}, clinic=${clinicId}`);
  await seedServices();
  await seedProducts();
  await seedSlots();
  await seedDemoProfile();
  console.log('Firestore seed completed successfully.');
};

run().catch((error) => {
  console.error('Firestore seed failed:', error?.message || error);
  process.exit(1);
});
