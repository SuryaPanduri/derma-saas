import type {
  AnalyticsService,
  AuthService,
  BookingService,
  EnquiryService,
  OrderService,
  ProductService,
  ProfileService,
  ServiceCatalogService,
  SlotService
} from '@/api/interfaces';
import { ExpressAnalyticsService } from '@/api/implementations/express/ExpressAnalyticsService';
import { ExpressAuthService } from '@/api/implementations/express/ExpressAuthService';
import { ExpressBookingService } from '@/api/implementations/express/ExpressBookingService';
import { ExpressEnquiryService } from '@/api/implementations/express/ExpressEnquiryService';
import { ExpressOrderService } from '@/api/implementations/express/ExpressOrderService';
import { ExpressProductService } from '@/api/implementations/express/ExpressProductService';
import { ExpressProfileService } from '@/api/implementations/express/ExpressProfileService';
import { ExpressServiceCatalogService } from '@/api/implementations/express/ExpressServiceCatalogService';
import { ExpressSlotService } from '@/api/implementations/express/ExpressSlotService';
import { FirebaseAnalyticsService } from '@/api/implementations/firebase/FirebaseAnalyticsService';
import { FirebaseAuthService } from '@/api/implementations/firebase/FirebaseAuthService';
import { FirebaseBookingService } from '@/api/implementations/firebase/FirebaseBookingService';
import { FirebaseEnquiryService } from '@/api/implementations/firebase/FirebaseEnquiryService';
import { FirebaseOrderService } from '@/api/implementations/firebase/FirebaseOrderService';
import { FirebaseProductService } from '@/api/implementations/firebase/FirebaseProductService';
import { FirebaseProfileService } from '@/api/implementations/firebase/FirebaseProfileService';
import { FirebaseServiceCatalogService } from '@/api/implementations/firebase/FirebaseServiceCatalogService';
import { FirebaseSlotService } from '@/api/implementations/firebase/FirebaseSlotService';

type BackendProvider = 'firebase' | 'express';
const backend = (import.meta.env.VITE_BACKEND_PROVIDER as BackendProvider | undefined) ?? 'firebase';

const firebaseAnalyticsService: AnalyticsService = new FirebaseAnalyticsService();
const expressAnalyticsService: AnalyticsService = new ExpressAnalyticsService();

const firebaseServices = {
  authService: new FirebaseAuthService() as AuthService,
  profileService: new FirebaseProfileService() as ProfileService,
  serviceCatalogService: new FirebaseServiceCatalogService() as ServiceCatalogService,
  slotService: new FirebaseSlotService() as SlotService,
  bookingService: new FirebaseBookingService(firebaseAnalyticsService) as BookingService,
  enquiryService: new FirebaseEnquiryService() as EnquiryService,
  productService: new FirebaseProductService() as ProductService,
  orderService: new FirebaseOrderService(firebaseAnalyticsService) as OrderService,
  analyticsService: firebaseAnalyticsService
};

// Migration switch point:
// 1) Change only VITE_BACKEND_PROVIDER or this object mapping.
// 2) UI/hooks/stores stay untouched because they consume `services` interfaces only.
const expressServices = {
  authService: new ExpressAuthService() as AuthService,
  profileService: new ExpressProfileService() as ProfileService,
  serviceCatalogService: new ExpressServiceCatalogService() as ServiceCatalogService,
  slotService: new ExpressSlotService() as SlotService,
  bookingService: new ExpressBookingService() as BookingService,
  enquiryService: new ExpressEnquiryService() as EnquiryService,
  productService: new ExpressProductService() as ProductService,
  orderService: new ExpressOrderService() as OrderService,
  analyticsService: expressAnalyticsService
};

export const services = backend === 'express' ? expressServices : firebaseServices;

export type ServiceContainer = typeof services;
