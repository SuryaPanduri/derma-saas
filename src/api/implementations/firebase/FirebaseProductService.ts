import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import type { ProductService } from '@/api/interfaces';
import type { ProductDTO } from '@/types';
import { db } from './firebase.config';
import { mapProductDoc } from './mappers';

export class FirebaseProductService implements ProductService {
  async listProducts(clinicId: string): Promise<ProductDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'products'), where('clinicId', '==', clinicId)));
    return snapshot.docs
      .map((item) => mapProductDoc(item.id, item.data()))
      .filter((product) => product.isActive);
  }

  async getProductById(productId: string): Promise<ProductDTO | null> {
    const productDoc = await getDoc(doc(db, 'products', productId));

    if (!productDoc.exists()) {
      return null;
    }

    return mapProductDoc(productDoc.id, productDoc.data());
  }

  async upsertProduct(product: ProductDTO): Promise<ProductDTO> {
    await setDoc(
      doc(db, 'products', product.id),
      {
        ...product,
        createdAt: product.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return {
      ...product,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
