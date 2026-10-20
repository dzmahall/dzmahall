import crypto from 'crypto';
import { 
  CarrierId, 
  CarrierSecureConfig, 
  CarrierConfigPublic, 
  ShippingRateRule, 
  StopDeskOffice, 
  Shipment, 
  DzMahallOrder,
  WebhookLog,
  DeliveryMode
} from '../../src/lib/shipping/types';
import { CARRIERS_METADATA, ALGERIAN_WILAYAS } from '../../src/lib/shipping/algerian-data';
import { Product, AbandonedCart, BlacklistEntry } from '../../src/lib/ecommerce/types';
import { INITIAL_PRODUCTS } from '../../src/lib/ecommerce/products';

// Clé de chiffrement interne au serveur Node.js (inaccessible au navigateur)
const ENCRYPTION_KEY = process.env.SHIPPING_ENCRYPTION_KEY || 'dzmahall_shipping_secret_master_key_2026';
const IV_LENGTH = 16;

function encryptSecret(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(), 
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptSecret(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return '';
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      crypto.createHash('sha256').update(ENCRYPTION_KEY).digest(), 
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return '';
  }
}

function maskSecret(val: string): string {
  if (!val) return '';
  if (val.length <= 4) return '••••';
  const prefix = val.slice(0, 3);
  const suffix = val.slice(-3);
  return `${prefix}••••••${suffix}`;
}

class ShippingStorage {
  // Stockage serveur des configurations sécurisées (chiffrées)
  private secureConfigs: Map<CarrierId, CarrierSecureConfig> = new Map();
  // Table des tarifs wilayas
  private rateRules: ShippingRateRule[] = [];
  // Bureaux / Centres Stop Desk
  private stopDeskOffices: StopDeskOffice[] = [];
  // Expéditions créées
  private shipments: Map<string, Shipment> = new Map();
  // Index d'idempotence pour empêcher la double création d'expéditions
  private orderToShipmentMap: Map<string, string> = new Map();
  // Commandes e-commerce DzMahall (COD)
  private orders: Map<string, DzMahallOrder> = new Map();
  // Journal d'audit des webhooks
  private webhookLogs: WebhookLog[] = [];
  // Catalogue des produits
  private products: Map<string, Product> = new Map();
  // Paniers abandonnés
  private abandonedCarts: AbandonedCart[] = [];
  // Liste noire anti-fraude
  private blacklist: BlacklistEntry[] = [];

  constructor() {
    this.initDefaultCarriers();
    this.initDefaultRates();
    this.initDefaultOffices();
    this.initSampleOrders();
    this.initDefaultProducts();
    this.initDefaultAntiFraud();
  }

  private initDefaultProducts() {
    INITIAL_PRODUCTS.forEach(p => this.products.set(p.id, { ...p }));
  }

  private initDefaultAntiFraud() {
    this.blacklist = [
      {
        id: 'bl_1',
        phone: '0550999999',
        reason: 'Récidive de refus de colis systématique (3 expéditions consécutives)',
        addedAt: '2026-10-15T12:00:00Z',
        orderCountBeforeBlock: 3
      }
    ];

    this.abandonedCarts = [
      {
        id: 'ab_1',
        createdAt: '2026-10-19T10:15:00Z',
        customerName: 'Samir Brahimi',
        phone: '0555 12 34 89',
        wilayaCode: '16',
        wilayaName: 'Alger',
        items: [
          { productId: 'prod_dz_1', productName: 'Machine à Café Espresso Broyeur Automatique Pro Fiamma', quantity: 1, priceDzd: 32500 }
        ],
        totalDzd: 33000,
        recovered: false
      }
    ];
  }

  private initDefaultCarriers() {
    // Initialise chaque transporteur à l'état de départ
    const carrierIds: CarrierId[] = ['yalidine', 'guepex', 'ecotrack', 'zr_express', 'maystro', 'noest', 'anderson', 'dhd'];
    for (const id of carrierIds) {
      const meta = CARRIERS_METADATA[id];
      this.secureConfigs.set(id, {
        id,
        enabled: id === 'yalidine', // Yalidine pré-initialisé pour la démonstration
        environment: 'sandbox',
        baseUrl: meta.defaultBaseUrl,
        credentials: id === 'yalidine' ? {
          api_id: encryptSecret('8493021957'),
          api_token: encryptSecret('yl_sec_99482abcdef10293sandbox_token'),
          default_origin_wilaya: '16'
        } : {},
        lastTestedAt: id === 'yalidine' ? '2026-10-18T14:30:00Z' : undefined,
        lastTestSuccess: id === 'yalidine' ? true : undefined,
        lastTestMessage: id === 'yalidine' ? 'Connexion Yalidine active (Sandbox OK, latence: 128ms)' : undefined,
        lastTestLatencyMs: id === 'yalidine' ? 128 : undefined,
        lastSyncAt: id === 'yalidine' ? '2026-10-18T14:30:00Z' : undefined
      });
    }
  }

  private initDefaultRates() {
    // Remplir une matrice de tarifs pour les 58 wilayas d'Algérie
    // En distinguant strictement:
    // 1. Tarif transporteur
    // 2. Tarif facturé client DzMahall
    // 3. Coût réel supporté par DzMahall
    const baseRates: Record<string, { carrier: number; client: number; cost: number; days: string }> = {
      '16': { carrier: 400, client: 500, cost: 380, days: '24h' },     // Alger
      '09': { carrier: 450, client: 550, cost: 420, days: '24-48h' },  // Blida
      '31': { carrier: 550, client: 650, cost: 520, days: '24-48h' },  // Oran
      '25': { carrier: 550, client: 650, cost: 520, days: '24-48h' },  // Constantine
      '19': { carrier: 500, client: 600, cost: 480, days: '24-48h' },  // Sétif
      '23': { carrier: 600, client: 700, cost: 570, days: '48h' },     // Annaba
      '13': { carrier: 600, client: 700, cost: 570, days: '48h' },     // Tlemcen
      '06': { carrier: 500, client: 600, cost: 480, days: '24-48h' },  // Béjaïa
      '15': { carrier: 450, client: 550, cost: 420, days: '24h' },     // Tizi Ouzou
      '30': { carrier: 850, client: 950, cost: 800, days: '48-72h' },  // Ouargla (Sud)
      '47': { carrier: 800, client: 900, cost: 750, days: '48-72h' },  // Ghardaïa (Sud)
      '11': { carrier: 1200, client: 1400, cost: 1150, days: '3-5j' }, // Tamanrasset (Grand Sud)
      '01': { carrier: 1100, client: 1300, cost: 1050, days: '3-5j' }, // Adrar
    };

    const modes: DeliveryMode[] = ['domicile', 'stop_desk'];
    const carriers: CarrierId[] = ['yalidine', 'guepex', 'zr_express', 'ecotrack'];

    carriers.forEach(cId => {
      const meta = CARRIERS_METADATA[cId];
      ALGERIAN_WILAYAS.forEach(wilaya => {
        modes.forEach(mode => {
          const discount = mode === 'stop_desk' ? 150 : 0;
          const defaultRate = wilaya.zone === 'Grand Sud' 
            ? { carrier: 1200, client: 1400, cost: 1150, days: '3-5j' }
            : wilaya.zone === 'Sud'
            ? { carrier: 850, client: 950, cost: 800, days: '48-72h' }
            : { carrier: 550, client: 650, cost: 520, days: '24-48h' };
          
          const rateData = baseRates[wilaya.code] || defaultRate;

          this.rateRules.push({
            id: `rate_${cId}_${wilaya.code}_${mode}`,
            carrierId: cId,
            carrierName: meta.name,
            wilayaCode: wilaya.code,
            wilayaName: wilaya.name,
            deliveryMode: mode,
            carrierRate: Math.max(250, rateData.carrier - discount),
            customerRate: Math.max(300, rateData.client - discount),
            realCost: Math.max(230, rateData.cost - discount),
            estimatedDays: mode === 'stop_desk' ? `${rateData.days} (Retrait express)` : rateData.days,
            active: true,
            lastSyncAt: new Date().toISOString()
          });
        });
      });
    });
  }

  private initDefaultOffices() {
    // Liste de vrais centres et agences Stop Desk en Algérie
    const sampleOffices: Omit<StopDeskOffice, 'id'>[] = [
      {
        carrierId: 'yalidine',
        carrierName: 'Yalidine Fast Logistics',
        code: 'YAL-1601',
        name: 'Centre Yalidine Bab Ezzouar',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Bab Ezzouar',
        address: 'Cité 8 Mai 1945, En face Université USTHB, Bab Ezzouar',
        phone: '0982 40 40 40',
        openingHours: 'Samedi - Jeudi: 08:30 - 18:30',
        active: true
      },
      {
        carrierId: 'yalidine',
        carrierName: 'Yalidine Fast Logistics',
        code: 'YAL-1602',
        name: 'Centre Yalidine Alger Centre (Didouche)',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Alger Centre',
        address: '42 Rue Didouche Mourad, Près de la Grande Poste',
        phone: '0982 40 40 41',
        openingHours: 'Samedi - Jeudi: 08:30 - 19:00',
        active: true
      },
      {
        carrierId: 'yalidine',
        carrierName: 'Yalidine Fast Logistics',
        code: 'YAL-3101',
        name: 'Hub Yalidine Oran Gambetta',
        wilayaCode: '31',
        wilayaName: 'Oran',
        commune: 'Oran',
        address: 'Boulevard Millenium, Rond-point Gambetta',
        phone: '0982 40 40 31',
        openingHours: 'Samedi - Jeudi: 08:30 - 18:30',
        active: true
      },
      {
        carrierId: 'yalidine',
        carrierName: 'Yalidine Fast Logistics',
        code: 'YAL-2501',
        name: 'Agence Yalidine Constantine Ali Mendjeli',
        wilayaCode: '25',
        wilayaName: 'Constantine',
        commune: 'El Khroub',
        address: 'Nouvelle Ville Ali Mendjeli, UV 05',
        phone: '0982 40 40 25',
        openingHours: 'Samedi - Jeudi: 09:00 - 18:00',
        active: true
      },
      {
        carrierId: 'yalidine',
        carrierName: 'Yalidine Fast Logistics',
        code: 'YAL-1901',
        name: 'Agence Yalidine Sétif Centre',
        wilayaCode: '19',
        wilayaName: 'Sétif',
        commune: 'Sétif',
        address: 'Avenue 8 Mai 1945, Sétif',
        phone: '0982 40 40 19',
        openingHours: 'Samedi - Jeudi: 08:30 - 18:00',
        active: true
      },
      {
        carrierId: 'zr_express',
        carrierName: 'ZR Express',
        code: 'ZR-16-KOUBA',
        name: 'Relais ZR Express Kouba',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Kouba',
        address: 'Route de Ben Omar, Kouba',
        phone: '0555 90 12 34',
        openingHours: '09:00 - 17:30',
        active: true
      },
      {
        carrierId: 'ecotrack',
        carrierName: 'EcoTrack Delivery',
        code: 'ECO-16-ROUIBA',
        name: 'EcoPoint Rouïba Zone Industrielle',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Rouïba',
        address: 'Zone Industrielle Rouïba Ouest',
        phone: '0770 45 67 89',
        openingHours: '08:30 - 17:00',
        active: true
      },
      {
        carrierId: 'guepex',
        carrierName: 'Guepex Express',
        code: 'GPX-31-MEDINA',
        name: 'Point Relais Guepex Medina Djedida',
        wilayaCode: '31',
        wilayaName: 'Oran',
        commune: 'Oran',
        address: 'Rue Ben M’hidi, Medina Djedida',
        phone: '0560 12 34 88',
        openingHours: '09:00 - 18:30',
        active: true
      }
    ];

    sampleOffices.forEach((off, idx) => {
      this.stopDeskOffices.push({
        ...off,
        id: `office_${idx + 1}`
      });
    });
  }

  private initSampleOrders() {
    const orders: DzMahallOrder[] = [
      {
        id: 'ord_dz_1001',
        orderNumber: 'DM-2026-1001',
        createdAt: '2026-10-18T10:15:00Z',
        customerName: 'Karim Benali',
        customerPhone: '0550 12 34 56',
        customerAddress: 'Cité 1000 Logements, Bâtiment B4, Bab Ezzouar',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Bab Ezzouar',
        deliveryMode: 'domicile',
        preferredCarrierId: 'yalidine',
        items: [
          { id: 'item_1', name: 'Machine à Café Espresso Automatique Pro', priceDzd: 18500, quantity: 1 },
          { id: 'item_2', name: 'Pack Grains de Café Robusta / Arabica 1kg', priceDzd: 2200, quantity: 1 }
        ],
        subtotalDzd: 20700,
        shippingFeeDzd: 500,
        totalDzd: 21200,
        status: 'ready_for_shipping',
        paymentMethod: 'COD'
      },
      {
        id: 'ord_dz_1002',
        orderNumber: 'DM-2026-1002',
        createdAt: '2026-10-18T11:40:00Z',
        customerName: 'Amina Mansouri',
        customerPhone: '0771 98 76 54',
        customerAddress: 'Centre Stop Desk Bab Ezzouar',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Bab Ezzouar',
        deliveryMode: 'stop_desk',
        preferredCarrierId: 'yalidine',
        stopDeskOfficeId: 'office_1',
        items: [
          { id: 'item_3', name: 'Robe Traditionnelle Karakou Brodée Or', priceDzd: 34000, quantity: 1 }
        ],
        subtotalDzd: 34000,
        shippingFeeDzd: 350,
        totalDzd: 34350,
        status: 'confirmed',
        paymentMethod: 'COD'
      },
      {
        id: 'ord_dz_1003',
        orderNumber: 'DM-2026-1003',
        createdAt: '2026-10-18T14:20:00Z',
        customerName: 'Yacine Zineddine',
        customerPhone: '0661 45 67 89',
        customerAddress: 'Hai Khemisti, Boulevard de la Soummam',
        wilayaCode: '31',
        wilayaName: 'Oran',
        commune: 'Oran',
        deliveryMode: 'domicile',
        preferredCarrierId: 'yalidine',
        items: [
          { id: 'item_4', name: 'Smartphone 5G 256GB Dual SIM', priceDzd: 49900, quantity: 1 }
        ],
        subtotalDzd: 49900,
        shippingFeeDzd: 650,
        totalDzd: 50550,
        status: 'shipped',
        shipmentId: 'ship_yal_991024',
        paymentMethod: 'COD'
      }
    ];

    orders.forEach(o => this.orders.set(o.id, o));

    // Ajouter l'expédition correspondante à ord_dz_1003
    const sampleShipment: Shipment = {
      id: 'ship_yal_991024',
      trackingNumber: 'yal-alg-7829104',
      orderId: 'ord_dz_1003',
      carrierId: 'yalidine',
      carrierName: 'Yalidine Fast Logistics',
      carrierTrackingUrl: 'https://yalidine.com/tracking/?tracking=yal-alg-7829104',
      customerName: 'Yacine Zineddine',
      customerPhone: '0661 45 67 89',
      destinationWilayaCode: '31',
      destinationWilayaName: 'Oran',
      destinationCommune: 'Oran',
      destinationAddress: 'Hai Khemisti, Boulevard de la Soummam',
      deliveryMode: 'domicile',
      parcelWeightKg: 0.8,
      parcelCount: 1,
      productDescription: 'Smartphone 5G 256GB Dual SIM (Commande DM-2026-1003)',
      codAmountDzd: 50550,
      carrierFeeDzd: 550,
      customerShippingFeeDzd: 650,
      status: 'in_transit',
      statusLabel: 'En transit vers le hub régional',
      labelGenerated: true,
      createdAt: '2026-10-18T15:00:00Z',
      updatedAt: '2026-10-18T18:30:00Z',
      events: [
        {
          id: 'ev_1',
          timestamp: '2026-10-18T15:00:00Z',
          status: 'created',
          statusLabel: 'Expédition enregistrée dans le système Yalidine',
          location: 'Hub Alger - Oued Smar',
          source: 'api'
        },
        {
          id: 'ev_2',
          timestamp: '2026-10-18T16:45:00Z',
          status: 'accepted',
          statusLabel: 'Colis ramassé et pris en charge par le coursier',
          location: 'Alger Dépôt DzMahall',
          source: 'api'
        },
        {
          id: 'ev_3',
          timestamp: '2026-10-18T18:30:00Z',
          status: 'in_transit',
          statusLabel: 'Départ du convoi routier vers le Hub Ouest (Oran)',
          location: 'Centre de tri Alger Ouest',
          source: 'api'
        }
      ]
    };

    this.shipments.set(sampleShipment.id, sampleShipment);
    this.orderToShipmentMap.set(sampleShipment.orderId, sampleShipment.id);
  }

  // --- Méthodes de lecture / écriture sécurisées ---

  public getPublicCarriers(): CarrierConfigPublic[] {
    const list: CarrierConfigPublic[] = [];
    const carrierIds: CarrierId[] = ['yalidine', 'guepex', 'ecotrack', 'zr_express', 'maystro', 'noest', 'anderson', 'dhd'];

    for (const id of carrierIds) {
      const meta = CARRIERS_METADATA[id];
      const secure = this.secureConfigs.get(id);

      // Calculer les expéditions de ce transporteur
      let count = 0;
      let cod = 0;
      for (const ship of this.shipments.values()) {
        if (ship.carrierId === id) {
          count++;
          if (ship.status === 'delivered') {
            cod += ship.codAmountDzd;
          }
        }
      }

      const configuredFields: string[] = [];
      const maskedCreds: Record<string, string> = {};

      if (secure && secure.credentials) {
        for (const [key, encVal] of Object.entries(secure.credentials)) {
          if (encVal) {
            configuredFields.push(key);
            const decrypted = decryptSecret(encVal);
            maskedCreds[key] = maskSecret(decrypted);
          }
        }
      }

      // Déterminer le statut
      let status: CarrierConfigPublic['status'] = 'unconfigured';
      const requiredFields = meta.fields.filter(f => f.required);
      const allRequiredConfigured = requiredFields.every(f => configuredFields.includes(f.key));

      if (secure && !secure.enabled) {
        status = 'disabled';
      } else if (!allRequiredConfigured) {
        status = configuredFields.length > 0 ? 'incomplete' : 'unconfigured';
      } else if (secure?.lastTestSuccess === true) {
        status = 'connected';
      } else if (secure?.lastTestSuccess === false) {
        status = 'error';
      } else {
        status = 'ready_to_test';
      }

      list.push({
        id,
        name: meta.name,
        status,
        enabled: secure?.enabled ?? false,
        environment: secure?.environment ?? 'sandbox',
        baseUrl: secure?.baseUrl || meta.defaultBaseUrl,
        hasCredentials: configuredFields.length > 0,
        configuredFields,
        maskedCredentials: maskedCreds,
        lastTestedAt: secure?.lastTestedAt,
        lastTestSuccess: secure?.lastTestSuccess,
        lastTestMessage: secure?.lastTestMessage,
        lastTestLatencyMs: secure?.lastTestLatencyMs,
        lastSyncAt: secure?.lastSyncAt,
        shipmentCount: count,
        totalCodCollectedDzd: cod
      });
    }

    return list;
  }

  public getPublicCarrier(id: CarrierId): CarrierConfigPublic | null {
    const list = this.getPublicCarriers();
    return list.find(c => c.id === id) || null;
  }

  public getDecryptedCredentials(id: CarrierId): Record<string, string> {
    const secure = this.secureConfigs.get(id);
    if (!secure || !secure.credentials) return {};
    const decrypted: Record<string, string> = {};
    for (const [k, enc] of Object.entries(secure.credentials)) {
      decrypted[k] = decryptSecret(enc);
    }
    return decrypted;
  }

  public saveCarrierConfig(id: CarrierId, data: {
    enabled?: boolean;
    environment?: 'sandbox' | 'production';
    baseUrl?: string;
    credentials?: Record<string, string>;
    webhookSecret?: string;
  }) {
    let existing = this.secureConfigs.get(id);
    if (!existing) {
      existing = {
        id,
        enabled: false,
        environment: 'sandbox',
        baseUrl: CARRIERS_METADATA[id]?.defaultBaseUrl || '',
        credentials: {}
      };
      this.secureConfigs.set(id, existing);
    }

    if (data.enabled !== undefined) existing.enabled = data.enabled;
    if (data.environment) existing.environment = data.environment;
    if (data.baseUrl) existing.baseUrl = data.baseUrl;
    if (data.webhookSecret !== undefined) {
      existing.webhookSecret = encryptSecret(data.webhookSecret);
    }

    if (data.credentials) {
      for (const [key, val] of Object.entries(data.credentials)) {
        // Si l'utilisateur envoie une chaîne vide ou supprime, supprimer
        if (!val || val.trim() === '') {
          delete existing.credentials[key];
        } else if (!val.includes('••••')) {
          // Si ce n'est pas le masque transmis, chiffrer la nouvelle valeur
          existing.credentials[key] = encryptSecret(val.trim());
        }
      }
    }

    // Réinitialiser le statut si les clés changent
    return this.getPublicCarrier(id);
  }

  public updateCarrierTestResult(
    id: CarrierId, 
    success: boolean, 
    message: string, 
    latencyMs?: number
  ) {
    const existing = this.secureConfigs.get(id);
    if (existing) {
      existing.lastTestedAt = new Date().toISOString();
      existing.lastTestSuccess = success;
      existing.lastTestMessage = message;
      existing.lastTestLatencyMs = latencyMs;
    }
  }

  public updateCarrierSyncTime(id: CarrierId) {
    const existing = this.secureConfigs.get(id);
    if (existing) {
      existing.lastSyncAt = new Date().toISOString();
    }
  }

  // --- Gestion des Tarifs ---
  public getRates(filters?: { carrierId?: CarrierId; wilayaCode?: string; deliveryMode?: DeliveryMode }): ShippingRateRule[] {
    let list = this.rateRules;
    if (filters?.carrierId) list = list.filter(r => r.carrierId === filters.carrierId);
    if (filters?.wilayaCode) list = list.filter(r => r.wilayaCode === filters.wilayaCode);
    if (filters?.deliveryMode) list = list.filter(r => r.deliveryMode === filters.deliveryMode);
    return list;
  }

  public updateRate(id: string, updates: Partial<ShippingRateRule>): ShippingRateRule | null {
    const idx = this.rateRules.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.rateRules[idx] = { ...this.rateRules[idx], ...updates };
    return this.rateRules[idx];
  }

  public bulkUpdateRates(updates: { id: string; customerRate?: number; carrierRate?: number; realCost?: number }[]) {
    updates.forEach(u => {
      this.updateRate(u.id, u);
    });
    return true;
  }

  // --- Gestion des Bureaux Stop Desk ---
  public getOffices(filters?: { carrierId?: CarrierId; wilayaCode?: string; search?: string }): StopDeskOffice[] {
    let list = this.stopDeskOffices;
    if (filters?.carrierId) list = list.filter(o => o.carrierId === filters.carrierId);
    if (filters?.wilayaCode) list = list.filter(o => o.wilayaCode === filters.wilayaCode);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o => 
        o.name.toLowerCase().includes(q) || 
        o.commune.toLowerCase().includes(q) || 
        o.address.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public addOffice(office: Omit<StopDeskOffice, 'id'>): StopDeskOffice {
    const id = `office_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOffice: StopDeskOffice = { ...office, id };
    this.stopDeskOffices.push(newOffice);
    return newOffice;
  }

  // --- Gestion des Expéditions ---
  public getShipments(): Shipment[] {
    return Array.from(this.shipments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getShipmentById(id: string): Shipment | null {
    return this.shipments.get(id) || null;
  }

  public getShipmentByOrder(orderId: string): Shipment | null {
    const shipmentId = this.orderToShipmentMap.get(orderId);
    if (!shipmentId) return null;
    return this.shipments.get(shipmentId) || null;
  }

  public createShipment(shipment: Shipment): { success: boolean; shipment?: Shipment; error?: string } {
    // Règle 8 du prompt: Éviter les créations d'expédition en double
    if (this.orderToShipmentMap.has(shipment.orderId)) {
      const existingId = this.orderToShipmentMap.get(shipment.orderId);
      return {
        success: false,
        error: `Une expédition existe déjà pour la commande ${shipment.orderId} (N° de suivi: ${this.shipments.get(existingId!)?.trackingNumber}). Les créations en double sont interdites.`
      };
    }

    this.shipments.set(shipment.id, shipment);
    this.orderToShipmentMap.set(shipment.orderId, shipment.id);

    // Mettre à jour le statut de la commande associée
    const order = this.orders.get(shipment.orderId);
    if (order) {
      order.status = 'shipped';
      order.shipmentId = shipment.id;
    }

    return { success: true, shipment };
  }

  public updateShipmentStatus(
    trackingNumber: string, 
    newStatus: Shipment['status'], 
    label: string, 
    location?: string,
    source: 'api' | 'webhook' | 'manual' = 'api'
  ): Shipment | null {
    for (const ship of this.shipments.values()) {
      if (ship.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()) {
        ship.status = newStatus;
        ship.statusLabel = label;
        ship.updatedAt = new Date().toISOString();
        ship.events.push({
          id: `ev_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: newStatus,
          statusLabel: label,
          location: location || 'Algérie',
          source
        });

        // Si livré, mettre à jour la commande
        if (newStatus === 'delivered') {
          const ord = this.orders.get(ship.orderId);
          if (ord) ord.status = 'delivered';
        }

        return ship;
      }
    }
    return null;
  }

  // --- Gestion des Commandes Store DzMahall ---
  public getOrders(): DzMahallOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrder(id: string): DzMahallOrder | null {
    return this.orders.get(id) || null;
  }

  public createOrder(order: DzMahallOrder): DzMahallOrder {
    this.orders.set(order.id, order);
    return order;
  }

  // --- Journal des Webhooks ---
  public logWebhook(entry: WebhookLog) {
    this.webhookLogs.unshift(entry);
    if (this.webhookLogs.length > 100) this.webhookLogs.pop();
  }

  public getWebhookLogs(): WebhookLog[] {
    return this.webhookLogs;
  }

  // --- Gestion du Catalogue Produits (DzMahall Store) ---
  public getProducts(includePrivateCost = false): Product[] {
    const list = Array.from(this.products.values());
    if (includePrivateCost) return list;
    // Règle 6: Le coût d'achat (costPrice) ne doit jamais être visible par les clients
    return list.map(p => {
      const copy = { ...p };
      delete copy.costPrice;
      return copy;
    });
  }

  public getProduct(id: string, includePrivateCost = false): Product | null {
    const p = this.products.get(id);
    if (!p) return null;
    if (includePrivateCost) return { ...p };
    const copy = { ...p };
    delete copy.costPrice;
    return copy;
  }

  public saveProduct(productData: Partial<Product>): Product {
    const id = productData.id || `prod_dz_${Date.now()}`;
    const existing = this.products.get(id);
    const now = new Date().toISOString();

    const saved: Product = {
      id,
      name: productData.name || 'Nouveau Produit DzMahall',
      slug: productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id),
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      price: Number(productData.price) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : undefined,
      costPrice: productData.costPrice ? Number(productData.costPrice) : undefined,
      imageUrl: productData.imageUrl || '/src/assets/images/dzmahall_espresso_machine_1792449781597.jpg',
      images: productData.images || [productData.imageUrl || '/src/assets/images/dzmahall_espresso_machine_1792449781597.jpg'],
      category: productData.category || 'Général',
      stockQuantity: Number(productData.stockQuantity ?? 10),
      variants: productData.variants || [],
      bundleOffers: productData.bundleOffers || [],
      features: productData.features || [],
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
      isFeatured: productData.isFeatured !== undefined ? Boolean(productData.isFeatured) : false,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    this.products.set(id, saved);
    return saved;
  }

  public deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // Règle 6: Gestion atomique du stock côté serveur
  public decrementStockAtomically(items: { id: string; quantity: number }[]): { success: boolean; error?: string } {
    // 1. Vérification préalable de la disponibilité pour tous les articles
    for (const item of items) {
      const prod = this.products.get(item.id);
      if (!prod) {
        return { success: false, error: `Le produit ${item.id} n'existe plus dans le catalogue.` };
      }
      if (prod.stockQuantity < item.quantity) {
        return { 
          success: false, 
          error: `Stock insuffisant pour "${prod.name}" (Disponible: ${prod.stockQuantity}, Demandé: ${item.quantity}). Vente concurrente bloquée.` 
        };
      }
    }

    // 2. Décrémentation atomique
    for (const item of items) {
      const prod = this.products.get(item.id)!;
      prod.stockQuantity -= item.quantity;
      prod.updatedAt = new Date().toISOString();
    }

    return { success: true };
  }

  // --- Gestion des Paniers Abandonnés ---
  public getAbandonedCarts(): AbandonedCart[] {
    return this.abandonedCarts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public logAbandonedCart(cart: AbandonedCart): AbandonedCart {
    // Vérifier si un panier récent existe déjà pour ce téléphone
    if (cart.phone) {
      const cleanPhone = cart.phone.replace(/[\s.-]/g, '');
      const existingIdx = this.abandonedCarts.findIndex(c => c.phone?.replace(/[\s.-]/g, '') === cleanPhone && !c.recovered);
      if (existingIdx !== -1) {
        this.abandonedCarts[existingIdx] = { ...this.abandonedCarts[existingIdx], ...cart, createdAt: new Date().toISOString() };
        return this.abandonedCarts[existingIdx];
      }
    }
    this.abandonedCarts.unshift(cart);
    if (this.abandonedCarts.length > 200) this.abandonedCarts.pop();
    return cart;
  }

  public markCartRecovered(cartId: string): boolean {
    const cart = this.abandonedCarts.find(c => c.id === cartId);
    if (cart) {
      cart.recovered = true;
      return true;
    }
    return false;
  }

  // --- Anti-Fraude & Liste Noire Algérie ---
  public getBlacklist(): BlacklistEntry[] {
    return this.blacklist;
  }

  public addBlacklist(entry: Omit<BlacklistEntry, 'id' | 'addedAt'>): BlacklistEntry {
    const newEntry: BlacklistEntry = {
      ...entry,
      id: `bl_${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    this.blacklist.unshift(newEntry);
    return newEntry;
  }

  public removeBlacklist(id: string): boolean {
    const idx = this.blacklist.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.blacklist.splice(idx, 1);
      return true;
    }
    return false;
  }

  public isBlacklisted(phone?: string): boolean {
    if (!phone) return false;
    const clean = phone.replace(/[\s.-]/g, '');
    return this.blacklist.some(b => b.phone && b.phone.replace(/[\s.-]/g, '') === clean);
  }
}

export const shippingStorage = new ShippingStorage();
