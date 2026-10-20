import { 
  CarrierId, 
  ConnectionTestResult, 
  DeliveryMode, 
  Shipment, 
  StopDeskOffice 
} from '../../../src/lib/shipping/types';

export interface CreateShipmentParams {
  orderId: string;
  customerName: string;
  customerPhone: string;
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
  codAmountDzd: number;
  customerShippingFeeDzd: number;
}

export interface CarrierConnector {
  id: CarrierId;
  name: string;

  /**
   * Teste la connexion réelle avec l'API du transporteur
   */
  testConnection(credentials: Record<string, string>, baseUrl: string, environment: 'sandbox' | 'production'): Promise<ConnectionTestResult>;

  /**
   * Crée une nouvelle expédition côté transporteur
   */
  createShipment(
    params: CreateShipmentParams,
    credentials: Record<string, string>,
    baseUrl: string,
    environment: 'sandbox' | 'production'
  ): Promise<{ success: boolean; shipment?: Shipment; error?: string }>;

  /**
   * Récupère la liste officielle des bureaux / points Stop Desk
   */
  fetchOffices?(
    credentials: Record<string, string>,
    baseUrl: string,
    environment: 'sandbox' | 'production'
  ): Promise<{ success: boolean; offices?: StopDeskOffice[]; error?: string }>;

  /**
   * Synchronise le statut et les événements d'un colis
   */
  trackShipment(
    trackingNumber: string,
    credentials: Record<string, string>,
    baseUrl: string,
    environment: 'sandbox' | 'production'
  ): Promise<{ success: boolean; status?: Shipment['status']; statusLabel?: string; events?: any[]; error?: string }>;

  /**
   * Annule une expédition si autorisée par le transporteur
   */
  cancelShipment?(
    trackingNumber: string,
    credentials: Record<string, string>,
    baseUrl: string,
    environment: 'sandbox' | 'production'
  ): Promise<{ success: boolean; message: string }>;
}
