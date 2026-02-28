import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import type { EnquiryService } from '@/api/interfaces';
import type { CreateEnquiryInputDTO, EnquiryDTO } from '@/types';
import { auth, db } from './firebase.config';

export class FirebaseEnquiryService implements EnquiryService {
  async createEnquiry(input: CreateEnquiryInputDTO): Promise<EnquiryDTO> {
    const nowISO = new Date().toISOString();
    const uid = auth.currentUser?.uid ?? '';
    const docRef = await addDoc(collection(db, 'enquiries'), {
      clinicId: input.clinicId,
      fullName: input.fullName,
      mobile: input.mobile,
      email: input.email,
      patientUid: uid,
      createdAtISO: nowISO,
      createdAt: serverTimestamp()
    });

    return {
      id: docRef.id,
      clinicId: input.clinicId,
      fullName: input.fullName,
      mobile: input.mobile,
      email: input.email,
      patientUid: uid,
      createdAt: nowISO
    };
  }

  async listEnquiriesByClinic(clinicId: string): Promise<EnquiryDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'enquiries'), where('clinicId', '==', clinicId)));
    return snapshot.docs.map((docItem) => {
      const data = docItem.data() as {
        clinicId?: string;
        fullName?: string;
        mobile?: string;
        email?: string;
        patientUid?: string;
        createdAtISO?: string;
      };
      return {
        id: docItem.id,
        clinicId: String(data.clinicId ?? clinicId),
        fullName: String(data.fullName ?? ''),
        mobile: String(data.mobile ?? ''),
        email: String(data.email ?? ''),
        patientUid: String(data.patientUid ?? ''),
        createdAt: String(data.createdAtISO ?? new Date(0).toISOString())
      };
    });
  }
}

