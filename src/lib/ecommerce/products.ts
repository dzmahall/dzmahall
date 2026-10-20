import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_dz_1',
    name: 'Machine à Café Espresso Broyeur Automatique Pro Fiamma',
    slug: 'machine-cafe-espresso-broyeur-automatique-pro-fiamma',
    category: 'Maison & Électroménager',
    price: 32500,
    compareAtPrice: 38900,
    costPrice: 22000, // Coût d'achat confidentiel
    imageUrl: '/src/assets/images/dzmahall_espresso_machine_1792449781597.jpg',
    images: [
      '/src/assets/images/dzmahall_espresso_machine_1792449781597.jpg',
    ],
    shortDescription: 'Pression 19 bars professionnelle, buse vapeur inox et contrôle thermique précis pour un espresso à l’italienne chez vous.',
    description: `Découvrez l'excellence du café italien avec la Fiamma Pro Edition. Conçue pour les passionnés de café en Algérie qui refusent les compromis, cette machine combine une pompe haute pression de 19 bars d'origine italienne, un système de chauffe instantané Thermoblock et une buse vapeur semi-professionnelle en acier inoxydable pour texturer un lait parfait pour vos cappuccinos et latte art.

Points forts :
- Pression d'extraction optimale de 19 bars.
- Buse vapeur à 360° pour mousser le lait à la perfection.
- Réservoir d'eau grande capacité 1.8L amovible.
- Plateau chauffe-tasses en aluminium massif brossé.
- Garantie DzMahall 1 an avec pièces de rechange disponibles.`,
    stockQuantity: 14,
    rating: 4.9,
    reviewCount: 42,
    variants: [
      { id: 'v1_inox', name: 'Inox & Noir Mat', sku: 'ESP-FIAMMA-SS', stockQuantity: 9, options: { 'Finition': 'Inox & Noir Mat' } },
      { id: 'v1_wood', name: 'Édition Bois Noyer', sku: 'ESP-FIAMMA-WD', priceDzd: 34900, stockQuantity: 5, options: { 'Finition': 'Édition Bois Noyer (+2,400 DZD)' } }
    ],
    bundleOffers: [
      { id: 'b_1', quantity: 1, title: '1x Machine Fiamma Seule', discountPercentage: 0 },
      { id: 'b_2', quantity: 2, title: '2x Machines (Offre Famille / Cadeau)', discountPercentage: 12, badge: 'Économisez 12%', freeShipping: true }
    ],
    features: [
      'Pression 19 Bars Haute Précision',
      'Chauffe Rapide Thermoblock 35s',
      'Paiement à la livraison 58 Wilayas',
      'Garantie 1 An Remplacement'
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-18T14:00:00Z'
  },
  {
    id: 'prod_dz_2',
    name: 'Casque Audio Sans Fil ANC Studio Master Hi-Res',
    slug: 'casque-audio-sans-fil-anc-studio-master-hi-res',
    category: 'Audio & High-Tech',
    price: 16800,
    compareAtPrice: 21500,
    costPrice: 9500,
    imageUrl: '/src/assets/images/dzmahall_anc_headphones_1792449781962.jpg',
    images: [
      '/src/assets/images/dzmahall_anc_headphones_1792449781962.jpg',
    ],
    shortDescription: 'Réduction active du bruit hybride -42dB, transducteurs 40mm titane et autonomie record de 60 heures.',
    description: `Plongez dans un silence absolu et redécouvrez vos musiques préférées avec une clarté cristalline. Le casque Studio Master intègre une puce DSP de dernière génération et 6 microphones environnementaux capables d'isoler les bruits de transports urbains, de bureaux ou d'extérieurs.

Arceau en aluminium brossé et coussinets à mémoire de forme en similicuir respirant offrant un confort irréprochable pendant de longues sessions d'écoute.`,
    stockQuantity: 28,
    rating: 4.8,
    reviewCount: 78,
    variants: [
      { id: 'v2_slate', name: 'Gris Ardoise Fumé', sku: 'HEAD-SM-SLATE', stockQuantity: 18, options: { 'Couleur': 'Gris Ardoise' } },
      { id: 'v2_black', name: 'Noir Carbone Mat', sku: 'HEAD-SM-BLACK', stockQuantity: 10, options: { 'Couleur': 'Noir Carbone' } }
    ],
    bundleOffers: [
      { id: 'b_hd1', quantity: 1, title: '1x Casque Studio Master', discountPercentage: 0 },
      { id: 'b_hd2', quantity: 2, title: 'Pack Duo (Offre Partage)', discountPercentage: 15, badge: 'Super Économie -15%', freeShipping: true }
    ],
    features: [
      'Réduction Active Hybride -42dB',
      '60 Heures d’Autonomie en Lecture',
      'Bluetooth 5.3 Multipoint & Câble Inclus',
      'Microphones IA pour Appels Clairs'
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z'
  },
  {
    id: 'prod_dz_3',
    name: 'Sérum d’Huile de Pépins de Figue de Barbarie Pure 100% Bio',
    slug: 'serum-huile-pepins-figue-de-barbarie-pure-bio-algerie',
    category: 'Beauté & Soins Naturels',
    price: 4900,
    compareAtPrice: 6500,
    costPrice: 2100,
    imageUrl: '/src/assets/images/dzmahall_prickly_pear_serum_1792449781709.jpg',
    images: [
      '/src/assets/images/dzmahall_prickly_pear_serum_1792449781709.jpg',
    ],
    shortDescription: 'L’élixir anti-âge le plus précieux au monde, pressé à froid dans les oasis algériennes. Riche en Vitamine E et Stérols.',
    description: `Considérée comme l'or liquide de la cosmétique naturelle, l'huile de pépins de figue de barbarie est exceptionnellement riche en acides gras essentiels (Oméga 6 & 9) et possède un taux de vitamine E inégalé.

Elle tonifie la peau, atténue les ridules, estompe les cernes et raffermit le contour des yeux sans laisser de film gras. Convient à tous les types de peaux, y compris les plus sensibles. Flacon en verre ambré anti-UV avec pipette compte-gouttes en verre véritable.`,
    stockQuantity: 65,
    rating: 5.0,
    reviewCount: 114,
    variants: [
      { id: 'v3_30ml', name: 'Flacon 30ml avec Pipette', sku: 'BIO-SERUM-30ML', stockQuantity: 45, options: { 'Contenance': '30 ml' } },
      { id: 'v3_50ml', name: 'Grand Format 50ml Économique', sku: 'BIO-SERUM-50ML', priceDzd: 7400, stockQuantity: 20, options: { 'Contenance': '50 ml (+2,500 DZD)' } }
    ],
    bundleOffers: [
      { id: 'b_sr1', quantity: 1, title: '1x Flacon 30ml', discountPercentage: 0 },
      { id: 'b_sr2', quantity: 2, title: 'Pack Cure 2 Mois (2 Flacons)', discountPercentage: 15, badge: '-15% de Réduction', freeShipping: false },
      { id: 'b_sr3', quantity: 3, title: 'Pack Intégral 3 Flacons', discountPercentage: 25, badge: 'Coup de Cœur -25%', freeShipping: true }
    ],
    features: [
      '100% Pure, Vierge & Pressée à Froid',
      'Origine Algérie Contrôlée & Certifiée',
      'Riche en Vitamine E Naturelle (1000mg/kg)',
      'Texture Sèche Pénétration Immédiate'
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-10-14T11:00:00Z',
    updatedAt: '2026-10-18T12:00:00Z'
  },
  {
    id: 'prod_dz_4',
    name: 'Montre Chronographe Automatique Royale Saphir Bleu Nuit',
    slug: 'montre-chronographe-automatique-royale-saphir-bleu-nuit',
    category: 'Horlogerie & Accessoires',
    price: 24500,
    compareAtPrice: 32000,
    costPrice: 14500,
    imageUrl: '/src/assets/images/dzmahall_luxury_chronograph_1792449782580.jpg',
    images: [
      '/src/assets/images/dzmahall_luxury_chronograph_1792449782580.jpg',
    ],
    shortDescription: 'Verre saphir inrayable, mouvement mécanique automatique, cadran soleillé bleu nuit et étanchéité 10 ATM.',
    description: `Une pièce horlogère prestigieuse qui allie rigueur mécanique et design intemporel. Son cadran bleu nuit guilloché capte la lumière avec élégance, rehaussé d'index appliqués luminescents et de sous-compteurs chronographes fonctionnels.

Le boîtier de 41mm en acier 316L chirurgical abrite un mouvement automatique fiable à 21 rubis visible à travers le fond transparent en verre saphir. Livrée dans son écrin de luxe DzMahall avec certificat d'authenticité.`,
    stockQuantity: 11,
    rating: 4.9,
    reviewCount: 36,
    variants: [
      { id: 'v4_steel', name: 'Bracelet Acier Inox 316L', sku: 'WAT-ROYAL-STL', stockQuantity: 7, options: { 'Bracelet': 'Acier Inoxydable' } },
      { id: 'v4_leather', name: 'Bracelet Cuir Véritable Surpiqué', sku: 'WAT-ROYAL-LTH', stockQuantity: 4, options: { 'Bracelet': 'Cuir Surpiqué' } }
    ],
    bundleOffers: [
      { id: 'b_w1', quantity: 1, title: '1x Montre Royale dans son Écrin', discountPercentage: 0 },
      { id: 'b_w2', quantity: 2, title: 'Pack 2 Montres (Offre Spéciale)', discountPercentage: 10, badge: 'Livraison Express Offerte', freeShipping: true }
    ],
    features: [
      'Verre Saphir Anti-Reflets Inrayable',
      'Mouvement Automatique 21 Rubis',
      'Étanchéité 100 Mètres (10 ATM)',
      'Écrin Bois Noble & Outil d’Ajustement'
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-10-17T08:00:00Z',
    updatedAt: '2026-10-18T15:00:00Z'
  },
  {
    id: 'prod_dz_5',
    name: 'Pack Confort Maison & Salon Algérien Contemporain',
    slug: 'pack-confort-maison-salon-algerien-contemporain',
    category: 'Maison & Décoration',
    price: 18900,
    compareAtPrice: 24000,
    costPrice: 11500,
    imageUrl: '/src/assets/images/dzmahall_hero_banner_1792449782875.jpg',
    images: [
      '/src/assets/images/dzmahall_hero_banner_1792449782875.jpg',
    ],
    shortDescription: 'Tapis berbère géométrique doux, coussins brodés et service à thé traditionnel martelé à la main.',
    description: `Sublimez votre intérieur avec ce pack harmonieux qui marie artisanat traditionnel algérien et design scandinave épuré. Idéal pour créer un espace chaleureux et accueillant dans votre salon.

Inclus dans le pack :
- 1 Grand tapis berbère épais lavable 160x230cm.
- 4 Housses de coussins brodées aux motifs géométriques berbères.
- 1 Plateau artisanal en laiton doré martelé à la main par des artisans de Constantine.
- 6 Verres à thé traditionnels avec arabesques dorées.`,
    stockQuantity: 18,
    rating: 4.9,
    reviewCount: 52,
    variants: [
      { id: 'v5_beige', name: 'Teinte Crème Naturelle & Ocre', sku: 'DEC-PACK-BEIGE', stockQuantity: 12, options: { 'Teinte': 'Crème & Ocre' } },
      { id: 'v5_terracotta', name: 'Teinte Terracotta & Blanc Cassé', sku: 'DEC-PACK-TERRA', stockQuantity: 6, options: { 'Teinte': 'Terracotta' } }
    ],
    bundleOffers: [
      { id: 'b_d1', quantity: 1, title: '1x Pack Décoration Intégral', discountPercentage: 0 },
      { id: 'b_d2', quantity: 2, title: '2x Packs (Salon + Séjour)', discountPercentage: 15, badge: 'Remise -15%', freeShipping: true }
    ],
    features: [
      'Artisanat Algérien Fait Main',
      'Fibres Naturelles Traitées Anti-Taches',
      'Paiement Uniquement à la Réception',
      'Livraison Sécurisée Carton Renforcé'
    ],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-10-18T09:00:00Z',
    updatedAt: '2026-10-18T18:00:00Z'
  }
];
