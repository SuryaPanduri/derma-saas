import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';
import type { AnalyticsService, OrderService } from '@/api/interfaces';
import type { AppError, CreateOrderInputDTO, OrderDTO } from '@/types';
import { LOW_STOCK_THRESHOLD } from '@/utils/constants';
import { auth, db } from './firebase.config';
import { mapOrderDoc } from './mappers';

type CouponRule = {
  code: string;
  discountPercent: number;
  maxDiscountCents: number;
};

const COUPON_RULES: CouponRule[] = [
  { code: 'SKINTHEORY25', discountPercent: 25, maxDiscountCents: 50000 },
  { code: 'GLOW10', discountPercent: 10, maxDiscountCents: 25000 }
];

const getCouponDiscount = (subtotalCents: number, couponCode?: string) => {
  const normalizedCode = couponCode?.trim().toUpperCase() ?? '';
  if (!normalizedCode) {
    return { couponCode: null as string | null, discountCents: 0 };
  }
  const rule = COUPON_RULES.find((item) => item.code === normalizedCode);
  if (!rule) {
    return { couponCode: null as string | null, discountCents: 0 };
  }
  const calculated = Math.floor((subtotalCents * rule.discountPercent) / 100);
  return {
    couponCode: normalizedCode,
    discountCents: Math.min(rule.maxDiscountCents, calculated)
  };
};

export class FirebaseOrderService implements OrderService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async createOrder(input: CreateOrderInputDTO): Promise<OrderDTO> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      throw {
        code: 'UNAUTHENTICATED',
        message: 'You must be signed in to create an order.'
      } as AppError;
    }

    const normalizedInput: CreateOrderInputDTO = {
      ...input,
      patientUid: currentUid
    };

    const orderRef = doc(collection(db, 'orders'));
    const nowISO = new Date().toISOString();

    try {
      const result = await runTransaction(db, async (transaction) => {
        // Phase 1: All Reads
        const productSnapshots = await Promise.all(
          normalizedInput.items.map((item) => transaction.get(doc(db, 'products', item.productId)))
        );

        let subtotalCents = 0;
        const updates: Array<{ ref: any; newStock: number }> = [];

        // Phase 2: Validation
        productSnapshots.forEach((productDoc, index) => {
          const item = normalizedInput.items[index];
          if (!productDoc.exists()) {
            throw {
              code: 'PRODUCT_NOT_FOUND',
              message: `Product ${item.productId} does not exist.`
            } as AppError;
          }

          const productData = productDoc.data() as { stock?: number; name?: string; priceCents?: number };
          const currentStock = Number(productData.stock ?? 0);

          if (currentStock < item.quantity) {
            throw {
              code: 'INVENTORY_CONFLICT',
              message: `Insufficient stock for ${productData.name ?? item.name}.`
            } as AppError;
          }

          const newStock = currentStock - item.quantity;
          updates.push({ ref: productDoc.ref, newStock });
          subtotalCents += item.unitPriceCents * item.quantity;
        });

        // Phase 3: All Writes
        for (const update of updates) {
          transaction.set(update.ref, { stock: update.newStock, updatedAt: serverTimestamp() }, { merge: true });
          
          // Stock tracking
          if (update.newStock <= LOW_STOCK_THRESHOLD) {
             const productId = update.ref.id;
             // Fire-and-forget tracking
             this.analyticsService.trackEvent('low_stock_warning', {
              clinicId: normalizedInput.clinicId,
              productId,
              stock: update.newStock
            });
          }
        }

        const coupon = getCouponDiscount(subtotalCents, normalizedInput.couponCode);
        const totalCents = Math.max(0, subtotalCents - coupon.discountCents);

        transaction.set(orderRef, {
          ...normalizedInput,
          subtotalCents,
          discountCents: coupon.discountCents,
          couponCode: coupon.couponCode,
          totalCents,
          status: 'paid',
          createdAtISO: nowISO,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return {
          subtotalCents,
          discountCents: coupon.discountCents,
          couponCode: coupon.couponCode,
          totalCents
        };
      });

      return {
        id: orderRef.id,
        ...normalizedInput,
        subtotalCents: result.subtotalCents,
        discountCents: result.discountCents,
        couponCode: result.couponCode,
        totalCents: result.totalCents,
        status: 'paid',
        createdAt: nowISO,
        updatedAt: nowISO
      };
    } catch (error) {
      const appError: AppError =
        typeof error === 'object' && error !== null && 'code' in error && 'message' in error
          ? (error as AppError)
          : {
              code: 'ORDER_CREATE_FAILED',
              message: 'Order creation failed.'
            };

      await this.analyticsService.trackEvent('checkout_failed', {
        clinicId: normalizedInput.clinicId,
        patientUid: normalizedInput.patientUid,
        code: appError.code,
        message: appError.message
      });

      throw appError;
    }
  }

  async listOrdersByUser(patientUid: string): Promise<OrderDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'orders'), where('patientUid', '==', patientUid)));
    return snapshot.docs.map((item) => mapOrderDoc(item.id, item.data()));
  }

  async listOrdersByClinic(clinicId: string): Promise<OrderDTO[]> {
    const snapshot = await getDocs(query(collection(db, 'orders'), where('clinicId', '==', clinicId)));
    return snapshot.docs.map((item) => mapOrderDoc(item.id, item.data()));
  }
}
