import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import type { ServiceCatalogService } from '@/api/interfaces';
import type { ServiceDTO } from '@/types';
import { db } from './firebase.config';
import { mapServiceDoc } from './mappers';

export class FirebaseServiceCatalogService implements ServiceCatalogService {
  async listServices(clinicId: string): Promise<ServiceDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'services'), where('clinicId', '==', clinicId)));

    return snapshot.docs
      .map((item) => mapServiceDoc(item.id, item.data()))
      .filter((service) => service.isActive);
  }

  async getServiceById(serviceId: string): Promise<ServiceDTO | null> {
    const snapshot = await getDoc(doc(db, 'services', serviceId));

    if (!snapshot.exists()) {
      return null;
    }

    return mapServiceDoc(snapshot.id, snapshot.data());
  }

  async upsertService(service: ServiceDTO): Promise<ServiceDTO> {
    await setDoc(
      doc(db, 'services', service.id),
      {
        ...service,
        createdAt: service.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return {
      ...service,
      createdAt: service.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
