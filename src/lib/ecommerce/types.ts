/**
 * Modèles de données pour la boutique publique DzMahall et l'e-commerce algérien
 */

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceDzd?: number; // Surcharge facultative
  stockQuantity: number;
  options: Record<string, string>; // ex: { "Couleur": "Gris Sidéral", "Taille": "M" }
}

export interface BundleOffer {
  id: string;
  quantity: number;
  title: string;
  discountPercentage: number;
  badge?: string;
  freeShipping?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;              // Prix de vente public (DZD)
  compareAtPrice?: number;    // Prix barré avant réduction (DZD)
  costPrice?: number;         // Coût d'achat (CONFIDENTIEL - Administrateur uniquement)
  imageUrl: string;
  images: string[];
  category: string;
  stockQuantity: number;
  variants: ProductVariant[];
  bundleOffers: BundleOffer[];
  features?: string[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  selectedVariantName?: string;
  bundleId?: string;
  unitPriceDzd: number;
}

export interface CustomerProfile {
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
  defaultWilayaCode?: string;
  defaultCommune?: string;
  defaultAddress?: string;
  role: 'customer' | 'operator' | 'admin';
  createdAt: string;
}

export interface AbandonedCart {
  id: string;
  createdAt: string;
  customerName?: string;
  phone?: string;
  wilayaCode?: string;
  wilayaName?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceDzd: number;
  }[];
  totalDzd: number;
  recovered: boolean;
  lastContactedAt?: string;
}

export interface BlacklistEntry {
  id: string;
  phone?: string;
  ipAddress?: string;
  reason: string;
  addedAt: string;
  orderCountBeforeBlock?: number;
}

export interface ProfitabilitySimulation {
  productCostDzd: number;
  sellingPriceDzd: number;
  adCostPerOrderDzd: number;
  packagingCostDzd: number;
  otherChargesDzd: number;
  shippingFeeOutboundDzd: number;
  returnFeeFailedDzd: number;
  deliverySuccessRatePercent: number; // ex: 80%
  batchQuantity: number;             // ex: 100 unités
  targetProfitDzd: number;
}
