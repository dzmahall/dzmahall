import { AlgerianWilaya, CarrierMeta, CarrierId } from './types';

export const ALGERIAN_WILAYAS: AlgerianWilaya[] = [
  { code: '01', name: 'Adrar', arabicName: 'أدرار', zone: 'Grand Sud' },
  { code: '02', name: 'Chlef', arabicName: 'الشلف', zone: 'Centre' },
  { code: '03', name: 'Laghouat', arabicName: 'الأغواط', zone: 'Sud' },
  { code: '04', name: 'Oum El Bouaghi', arabicName: 'أم البواقي', zone: 'Est' },
  { code: '05', name: 'Batna', arabicName: 'باتنة', zone: 'Est' },
  { code: '06', name: 'Béjaïa', arabicName: 'بجاية', zone: 'Centre' },
  { code: '07', name: 'Biskra', arabicName: 'بسكرة', zone: 'Sud' },
  { code: '08', name: 'Béchar', arabicName: 'بشار', zone: 'Sud' },
  { code: '09', name: 'Blida', arabicName: 'البليدة', zone: 'Centre' },
  { code: '10', name: 'Bouira', arabicName: 'البويرة', zone: 'Centre' },
  { code: '11', name: 'Tamanrasset', arabicName: 'تمنراست', zone: 'Grand Sud' },
  { code: '12', name: 'Tébessa', arabicName: 'تبسة', zone: 'Est' },
  { code: '13', name: 'Tlemcen', arabicName: 'تلمسان', zone: 'Ouest' },
  { code: '14', name: 'Tiaret', arabicName: 'تيارت', zone: 'Ouest' },
  { code: '15', name: 'Tizi Ouzou', arabicName: 'تيزي وزو', zone: 'Centre' },
  { code: '16', name: 'Alger', arabicName: 'الجزائر العاصمة', zone: 'Centre' },
  { code: '17', name: 'Djelfa', arabicName: 'الجلفة', zone: 'Sud' },
  { code: '18', name: 'Jijel', arabicName: 'جيجل', zone: 'Est' },
  { code: '19', name: 'Sétif', arabicName: 'سطيف', zone: 'Est' },
  { code: '20', name: 'Saïda', arabicName: 'سعيدة', zone: 'Ouest' },
  { code: '21', name: 'Skikda', arabicName: 'سكيكدة', zone: 'Est' },
  { code: '22', name: 'Sidi Bel Abbès', arabicName: 'سيدي بلعباس', zone: 'Ouest' },
  { code: '23', name: 'Annaba', arabicName: 'عنابة', zone: 'Est' },
  { code: '24', name: 'Guelma', arabicName: 'قالمة', zone: 'Est' },
  { code: '25', name: 'Constantine', arabicName: 'قسنطينة', zone: 'Est' },
  { code: '26', name: 'Médéa', arabicName: 'المدية', zone: 'Centre' },
  { code: '27', name: 'Mostaganem', arabicName: 'مستغانم', zone: 'Ouest' },
  { code: '28', name: "M'Sila", arabicName: 'المسيلة', zone: 'Centre' },
  { code: '29', name: 'Mascara', arabicName: 'معسكر', zone: 'Ouest' },
  { code: '30', name: 'Ouargla', arabicName: 'ورقلة', zone: 'Sud' },
  { code: '31', name: 'Oran', arabicName: 'وهران', zone: 'Ouest' },
  { code: '32', name: 'El Bayadh', arabicName: 'البيض', zone: 'Sud' },
  { code: '33', name: 'Illizi', arabicName: 'إليزي', zone: 'Grand Sud' },
  { code: '34', name: 'Bordj Bou Arreridj', arabicName: 'برج بوعريريج', zone: 'Est' },
  { code: '35', name: 'Boumerdès', arabicName: 'بومرداس', zone: 'Centre' },
  { code: '36', name: 'El Tarf', arabicName: 'الطارف', zone: 'Est' },
  { code: '37', name: 'Tindouf', arabicName: 'تندوف', zone: 'Grand Sud' },
  { code: '38', name: 'Tissemsilt', arabicName: 'تيسمسيلت', zone: 'Ouest' },
  { code: '39', name: 'El Oued', arabicName: 'الوادي', zone: 'Sud' },
  { code: '40', name: 'Khenchela', arabicName: 'خنشلة', zone: 'Est' },
  { code: '41', name: 'Souk Ahras', arabicName: 'سوق أهراس', zone: 'Est' },
  { code: '42', name: 'Tipaza', arabicName: 'تيبازة', zone: 'Centre' },
  { code: '43', name: 'Mila', arabicName: 'ميلة', zone: 'Est' },
  { code: '44', name: 'Aïn Defla', arabicName: 'عين الدفلى', zone: 'Centre' },
  { code: '45', name: 'Naâma', arabicName: 'النعامة', zone: 'Sud' },
  { code: '46', name: 'Aïn Témouchent', arabicName: 'عين تموشنت', zone: 'Ouest' },
  { code: '47', name: 'Ghardaïa', arabicName: 'غرداية', zone: 'Sud' },
  { code: '48', name: 'Relizane', arabicName: 'غليزان', zone: 'Ouest' },
  { code: '49', name: 'Timimoun', arabicName: 'تيميمون', zone: 'Grand Sud' },
  { code: '50', name: 'Bordj Badji Mokhtar', arabicName: 'برج باجي مختار', zone: 'Grand Sud' },
  { code: '51', name: 'Ouled Djellal', arabicName: 'أولاد جلال', zone: 'Sud' },
  { code: '52', name: 'Béni Abbès', arabicName: 'بني عباس', zone: 'Sud' },
  { code: '53', name: 'In Salah', arabicName: 'عين صالح', zone: 'Grand Sud' },
  { code: '54', name: 'In Guezzam', arabicName: 'عين قزام', zone: 'Grand Sud' },
  { code: '55', name: 'Touggourt', arabicName: 'تقرت', zone: 'Sud' },
  { code: '56', name: 'Djanet', arabicName: 'جانت', zone: 'Grand Sud' },
  { code: '57', name: "El M'Ghair", arabicName: 'المغير', zone: 'Sud' },
  { code: '58', name: 'El Meniaa', arabicName: 'المنيعة', zone: 'Sud' },
];

export const CARRIERS_METADATA: Record<CarrierId, CarrierMeta> = {
  yalidine: {
    id: 'yalidine',
    name: 'Yalidine Fast Logistics',
    brandColor: '#1E3A8A', // Deep Blue
    description: "Réseau national leader en Algérie, couvrant les 58 wilayas avec des centaines de centres Stop Desk et livraison à domicile.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://yalidine.com',
    apiDocsUrl: 'https://yalidine.app/docs',
    defaultBaseUrl: 'https://api.yalidine.app/v1',
    supportsWebhooks: true,
    supportsRealtimeRates: true,
    supportsStopDesk: true,
    fields: [
      {
        key: 'api_id',
        label: 'X-API-ID',
        type: 'text',
        placeholder: 'ex: 8493021957',
        description: 'Votre identifiant client Yalidine fourni sur votre espace compte.',
        required: true,
      },
      {
        key: 'api_token',
        label: 'X-API-TOKEN (Clé secrète)',
        type: 'password',
        placeholder: 'ex: yl_sec_99482abcdef10293...',
        description: 'Jeton de sécurité confidentiel Yalidine pour authentifier vos requêtes.',
        required: true,
        isSecret: true,
      },
      {
        key: 'webhook_secret',
        label: 'Clé secrète Webhook (Optionnel)',
        type: 'password',
        placeholder: 'ex: whsec_yalidine_...',
        description: 'Utilisée pour vérifier la signature des événements de statut reçus.',
        required: false,
        isSecret: true,
      },
      {
        key: 'default_origin_wilaya',
        label: 'Wilaya d’expédition par défaut',
        type: 'select',
        options: ALGERIAN_WILAYAS.map(w => ({ label: `${w.code} - ${w.name}`, value: w.code })),
        defaultValue: '16',
        description: 'Wilaya de départ de votre stock DzMahall (par défaut: 16 - Alger).',
        required: true,
      }
    ]
  },
  guepex: {
    id: 'guepex',
    name: 'Guepex Express',
    brandColor: '#B91C1C', // Red
    description: "Service de messagerie et de colis express desservant les particuliers et entreprises avec suivi en temps réel.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://guepex.com',
    defaultBaseUrl: 'https://api.guepex.com/v1',
    supportsWebhooks: true,
    supportsRealtimeRates: true,
    supportsStopDesk: true,
    fields: [
      {
        key: 'api_key',
        label: 'Clé API Guepex',
        type: 'password',
        placeholder: 'ex: gpx_live_738210...',
        description: 'Clé API d’authentification pour le compte marchand.',
        required: true,
        isSecret: true,
      },
      {
        key: 'account_id',
        label: 'Identifiant Compte Guepex',
        type: 'text',
        placeholder: 'ex: GPX-ACC-4029',
        description: 'Numéro de compte client professionnel.',
        required: true,
      }
    ]
  },
  ecotrack: {
    id: 'ecotrack',
    name: 'EcoTrack Delivery',
    brandColor: '#059669', // Emerald Green
    description: "Solution logistique éco-responsable et connectée dédiée au e-commerce avec couverture nationale et API REST moderne.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://ecotrack.dz',
    defaultBaseUrl: 'https://api.ecotrack.dz/api/v1',
    supportsWebhooks: true,
    supportsRealtimeRates: true,
    supportsStopDesk: true,
    fields: [
      {
        key: 'bearer_token',
        label: 'Bearer Token API',
        type: 'password',
        placeholder: 'ex: eyJhbGciOiJIUzI1NiIsInR5cCI6...',
        description: 'Token JWT d’accès fourni par la plateforme EcoTrack.',
        required: true,
        isSecret: true,
      },
      {
        key: 'shop_code',
        label: 'Code Boutique (Shop Code)',
        type: 'text',
        placeholder: 'ex: SHOP-DZ-991',
        description: 'Identifiant unique de votre boutique DzMahall chez EcoTrack.',
        required: true,
      }
    ]
  },
  zr_express: {
    id: 'zr_express',
    name: 'ZR Express',
    brandColor: '#D97706', // Amber / Gold
    description: "Acteur historique de la livraison e-commerce en Algérie avec encaissement COD garanti et réseaux d'agences.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://zrexpress.com',
    defaultBaseUrl: 'https://api.zrexpress.com/v1',
    supportsWebhooks: true,
    supportsRealtimeRates: true,
    supportsStopDesk: true,
    fields: [
      {
        key: 'client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'ex: ZR-CL-3847',
        description: 'Identifiant compte marchand ZR Express.',
        required: true,
      },
      {
        key: 'api_secret',
        label: 'API Secret Key',
        type: 'password',
        placeholder: 'ex: zr_sec_key_...',
        description: 'Clé secrète pour signature des bordereaux et expéditions.',
        required: true,
        isSecret: true,
      }
    ]
  },
  maystro: {
    id: 'maystro',
    name: 'Maystro Delivery',
    brandColor: '#7C3AED', // Violet
    description: "Plateforme technologique de livraison rapide avec optimisation d'itinéraires et suivi WhatsApp/SMS.",
    supportedModes: ['domicile'],
    officialWebsite: 'https://maystro-delivery.com',
    defaultBaseUrl: 'https://api.maystro-delivery.com/v2',
    supportsWebhooks: true,
    supportsRealtimeRates: false,
    supportsStopDesk: false,
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'ex: mstr_prod_...',
        description: 'Clé d’accès API Maystro.',
        required: true,
        isSecret: true,
      },
      {
        key: 'store_id',
        label: 'Store ID',
        type: 'text',
        placeholder: 'ex: store_88412',
        description: 'Identifiant de point de collecte.',
        required: true,
      }
    ]
  },
  noest: {
    id: 'noest',
    name: 'Noest Express',
    brandColor: '#0284C7', // Sky Blue
    description: "Spécialiste de la livraison urbaine et inter-wilayas avec confirmation d'adresse client.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://noest-express.dz',
    defaultBaseUrl: 'https://api.noest-express.com/v1',
    supportsWebhooks: false,
    supportsRealtimeRates: false,
    supportsStopDesk: true,
    fields: [
      {
        key: 'username',
        label: 'Nom d’utilisateur API',
        type: 'text',
        placeholder: 'ex: dzmahall_admin',
        description: 'Identifiant de connexion au portail Noest.',
        required: true,
      },
      {
        key: 'api_password',
        label: 'Mot de passe API',
        type: 'password',
        placeholder: '••••••••••••',
        description: 'Mot de passe sécurisé.',
        required: true,
        isSecret: true,
      }
    ]
  },
  anderson: {
    id: 'anderson',
    name: 'Anderson Logistics',
    brandColor: '#4F46E5', // Indigo
    description: "Réseau logistique B2C et B2B offrant des solutions de transport express et entreposage.",
    supportedModes: ['domicile'],
    officialWebsite: 'https://anderson-logistics.dz',
    defaultBaseUrl: 'https://api.anderson-logistics.dz/api',
    supportsWebhooks: false,
    supportsRealtimeRates: false,
    supportsStopDesk: false,
    fields: [
      {
        key: 'client_token',
        label: 'Client Token',
        type: 'password',
        placeholder: 'ex: and_tok_...',
        description: 'Token fourni par votre gestionnaire de compte Anderson.',
        required: true,
        isSecret: true,
      }
    ]
  },
  dhd: {
    id: 'dhd',
    name: 'DHD Delivery',
    brandColor: '#0D9488', // Teal
    description: "Compagnie de livraison régionale et nationale axée sur la rapidité des retours de fonds COD.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://dhd-delivery.dz',
    defaultBaseUrl: 'https://api.dhd-delivery.dz/v1',
    supportsWebhooks: false,
    supportsRealtimeRates: false,
    supportsStopDesk: true,
    fields: [
      {
        key: 'partner_code',
        label: 'Code Partenaire',
        type: 'text',
        placeholder: 'ex: DHD-P-502',
        description: 'Code marchand DzMahall.',
        required: true,
      },
      {
        key: 'auth_key',
        label: 'Clé d’autorisation API',
        type: 'password',
        placeholder: 'ex: dhd_auth_...',
        description: 'Clé d’accès sécurisée.',
        required: true,
        isSecret: true,
      }
    ]
  },
  custom: {
    id: 'custom',
    name: 'Transporteur Personnalisé / Flotte Propre',
    brandColor: '#475569',
    description: "Ajoutez un transporteur local ou gérez les expéditions réalisées par votre propre équipe de livreurs internes DzMahall.",
    supportedModes: ['domicile', 'stop_desk'],
    officialWebsite: 'https://dzmahall.com',
    defaultBaseUrl: '',
    supportsWebhooks: false,
    supportsRealtimeRates: false,
    supportsStopDesk: true,
    fields: [
      {
        key: 'custom_name',
        label: 'Nom du service de livraison',
        type: 'text',
        placeholder: 'ex: Coursiers Express Alger',
        description: 'Nom affiché aux clients et dans le suivi.',
        required: true,
      },
      {
        key: 'contact_phone',
        label: 'Numéro de contact du livreur / dispatcheur',
        type: 'text',
        placeholder: 'ex: 0550 12 34 56',
        description: 'Pour la coordination des expéditions.',
        required: true,
      }
    ]
  }
};
