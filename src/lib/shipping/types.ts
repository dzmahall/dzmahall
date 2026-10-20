/**
 * Types et interfaces pour le module Transporteurs & Logistique Algérienne de DzMahall
 */

export type CarrierId = 
  | 'yalidine' 
  | 'guepex' 
  | 'ecotrack' 
  | 'zr_express' 
  | 'maystro' 
  | 'noest' 
  | 'anderson' 
  | 'dhd'
  | 'custom';

export type CarrierStatus = 
  | 'unconfigured'      // Non configuré
  | 'incomplete'        // Configuration incomplète
  | 'ready_to_test'     // À tester
  | 'connected'         // Connecté (test réel réussi)
  | 'error'             // Erreur de connexion ou API
  | 'disabled';         // Désactivé

export type DeliveryMode = 'domicile' | 'stop_desk';

export interface CarrierFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  isSecret?: boolean;
}

export interface CarrierMeta {
  id: CarrierId;
  name: string;
  brandColor: string;
  logoUrl?: string;
  description: string;
  supportedModes: DeliveryMode[];
  officialWebsite: string;
  apiDocsUrl?: string;
  defaultBaseUrl: string;
  supportsWebhooks: boolean;
  supportsRealtimeRates: boolean;
  supportsStopDesk: boolean;
  fields: CarrierFieldDefinition[];
}

export interface CarrierConfigPublic {
  id: CarrierId;
  name: string;
  status: CarrierStatus;
  enabled: boolean;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  hasCredentials: boolean;
  configuredFields: string[]; // List of field keys that are configured (without returning secret values)
  maskedCredentials: Record<string, string>; // e.g., { apiKey: "yal_••••••••b49" }
  lastTestedAt?: string;
  lastTestSuccess?: boolean;
  lastTestMessage?: string;
  lastTestLatencyMs?: number;
  lastSyncAt?: string;
  shipmentCount: number;
  totalCodCollectedDzd: number;
}

export interface CarrierSecureConfig {
  id: CarrierId;
  enabled: boolean;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  credentials: Record<string, string>;
  webhookSecret?: string;
  lastTestedAt?: string;
  lastTestSuccess?: boolean;
  lastTestMessage?: string;
  lastTestLatencyMs?: number;
  lastSyncAt?: string;
}

export interface AlgerianWilaya {
  code: string; // "01" to "58"
  name: string;
  arabicName: string;
  zone: 'Nord' | 'Centre' | 'Est' | 'Ouest' | 'Sud' | 'Grand Sud';
}

export interface ShippingRateRule {
  id: string;
  carrierId: CarrierId;
  carrierName: string;
  wilayaCode: string;
  wilayaName: string;
  commune?: string;
  deliveryMode: DeliveryMode;
  carrierRate: number;    // 1. Tarif retourné par le transporteur (DZD)
  customerRate: number;   // 2. Tarif facturé au client par DzMahall (DZD)
  realCost: number;       // 3. Coût réellement supporté par DzMahall (DZD)
  estimatedDays: string;  // Délai annoncé ex: "24-48h"
  active: boolean;
  lastSyncAt?: string;
}

export interface StopDeskOffice {
  id: string;
  carrierId: CarrierId;
  carrierName: string;
  code: string;
  name: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  phone: string;
  openingHours: string;
  gpsCoordinates?: { lat: number; lng: number };
  active: boolean;
}

export type ShipmentStatus = 
  | 'created'            // Colis créé
  | 'accepted'           // Colis pris en charge
  | 'in_transit'         // En transit
  | 'out_for_delivery'   // En cours de livraison
  | 'delivered'          // Livré
  | 'failed'             // Échec de livraison
  | 'returning'          // Retour en cours
  | 'returned';          // Retourné à l'expéditeur

export interface ShipmentEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  statusLabel: string;
  location?: string;
  notes?: string;
  source: 'api' | 'webhook' | 'manual';
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  carrierId: CarrierId;
  carrierName: string;
  carrierTrackingUrl?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  destinationWilayaCode: string;
  destinationWilayaName: string;
  destinationCommune: string;
  destinationAddress: string;
  deliveryMode: DeliveryMode;
  stopDeskOfficeId?: string;
  stopDeskOfficeName?: string;
  parcelWeightKg: number;
  parcelCount: number;
  productDescription: string;
  codAmountDzd: number;       // Montant Cash on Delivery à encaisser
  carrierFeeDzd: number;      // Frais du transporteur
  customerShippingFeeDzd: number; // Frais facturés au client
  status: ShipmentStatus;
  statusLabel: string;
  labelGenerated: boolean;
  labelUrl?: string;
  createdAt: string;
  updatedAt: string;
  events: ShipmentEvent[];
}

export interface OrderItem {
  id: string;
  name: string;
  priceDzd: number;
  quantity: number;
}

export interface DzMahallOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryMode: DeliveryMode;
  preferredCarrierId?: CarrierId;
  stopDeskOfficeId?: string;
  items: OrderItem[];
  subtotalDzd: number;
  shippingFeeDzd: number;
  totalDzd: number;
  status: 'pending_confirmation' | 'confirmed' | 'ready_for_shipping' | 'shipped' | 'delivered' | 'cancelled';
  shipmentId?: string;
  paymentMethod: 'COD'; // Cash on Delivery (Paiement à la livraison)
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  latencyMs?: number;
  diagnosticDetails?: {
    endpointTested: string;
    authMethod: string;
    verifiedFeatures?: string[];
    missingFields?: string[];
    rawError?: string;
  };
}

export interface WebhookLog {
  id: string;
  carrierId: CarrierId;
  receivedAt: string;
  headers: Record<string, string>;
  payload: any;
  verified: boolean;
  processed: boolean;
  shipmentTracking?: string;
  resultMessage: string;
}
