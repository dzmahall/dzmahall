import React, { useState } from 'react';
import { 
  Star, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Home, 
  Banknote, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingBag, 
  Clock, 
  Minus, 
  Plus,
  Share2,
  ChevronLeft,
  PhoneCall
} from 'lucide-react';
import { Product, ProductVariant, BundleOffer } from '../../lib/ecommerce/types';
import { ALGERIAN_WILAYAS } from '../../lib/shipping/algerian-data';
import { StopDeskOffice } from '../../lib/shipping/types';

interface StoreProductDetailProps {
  product: Product;
  offices: StopDeskOffice[];
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariant, bundle?: BundleOffer) => void;
  onSubmitCodOrder: (orderPayload: any) => Promise<any>;
}

export const StoreProductDetail: React.FC<StoreProductDetailProps> = ({
  product,
  offices,
  onBack,
  onAddToCart,
  onSubmitCodOrder
}) => {
  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  
  // Bundle selection
  const [selectedBundle, setSelectedBundle] = useState<BundleOffer | undefined>(
    product.bundleOffers?.[0]
  );

  const [quantity, setQuantity] = useState<number>(selectedBundle?.quantity || 1);

  // COD Form States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('16');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'domicile' | 'stop_desk'>('domicile');
  const [selectedOfficeId, setSelectedOfficeId] = useState('');
  const [notes, setNotes] = useState('');

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  const selectedWilaya = ALGERIAN_WILAYAS.find(w => w.code === wilayaCode);

  // Dynamic Stop Desk offices in the selected wilaya
  const wilayaOffices = offices.filter(o => o.wilayaCode === wilayaCode && o.active);

  // Price calculations
  const unitPrice = selectedVariant?.priceDzd || product.price;
  const currentQuantity = selectedBundle ? selectedBundle.quantity : quantity;
  const discountPercent = selectedBundle ? selectedBundle.discountPercentage : 0;
  
  const rawSubtotal = unitPrice * currentQuantity;
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const subtotalAfterDiscount = rawSubtotal - discountAmount;

  // Delivery fee estimation based on wilaya
  const baseShippingFee = selectedWilaya?.zone === 'Grand Sud' ? 1200 : selectedWilaya?.zone === 'Sud' ? 850 : 500;
  const shippingFee = (selectedBundle?.freeShipping) 
    ? 0 
    : (deliveryMode === 'stop_desk' ? Math.max(250, baseShippingFee - 150) : baseShippingFee);

  const finalTotalToPayDzd = subtotalAfterDiscount + shippingFee;

  // Validation du téléphone algérien (05, 06 ou 07 suivi de 8 chiffres)
  const validateAlgerianPhone = (val: string): boolean => {
    const clean = val.replace(/[\s.-]/g, '');
    const regex = /^(0)(5|6|7)[0-9]{8}$/;
    return regex.test(clean);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (val.length >= 10 && !validateAlgerianPhone(val)) {
      setPhoneError('Numéro algérien invalide. Doit commencer par 05, 06 ou 07 (10 chiffres au total).');
    } else {
      setPhoneError(null);
    }
  };

  const handleSelectBundle = (b: BundleOffer) => {
    setSelectedBundle(b);
    setQuantity(b.quantity);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, currentQuantity, selectedVariant, selectedBundle);
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 3000);
  };

  const handleSubmitFastCod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setSubmitError('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!validateAlgerianPhone(phone)) {
      setPhoneError('Veuillez saisir un numéro de téléphone algérien valide (ex: 0550 12 34 56).');
      return;
    }

    if (!commune.trim()) {
      setSubmitError('Veuillez renseigner votre commune de résidence.');
      return;
    }

    if (deliveryMode === 'domicile' && !address.trim()) {
      setSubmitError('Veuillez préciser votre adresse pour la livraison à domicile.');
      return;
    }

    if (deliveryMode === 'stop_desk' && !selectedOfficeId && wilayaOffices.length > 0) {
      setSubmitError('Veuillez choisir votre agence Stop Desk de retrait.');
      return;
    }

    if (product.stockQuantity < currentQuantity) {
      setSubmitError('Désolé, le stock disponible est insuffisant pour cette quantité.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const chosenOffice = offices.find(o => o.id === selectedOfficeId);

    try {
      await onSubmitCodOrder({
        customerName: customerName.trim(),
        customerPhone: phone.replace(/[\s.-]/g, ''),
        customerAddress: deliveryMode === 'stop_desk' ? `Stop Desk: ${chosenOffice?.name || commune}` : address.trim(),
        wilayaCode: selectedWilaya?.code || '16',
        wilayaName: selectedWilaya?.name || 'Alger',
        commune: commune.trim(),
        deliveryMode,
        stopDeskOfficeId: deliveryMode === 'stop_desk' ? selectedOfficeId : undefined,
        items: [
          {
            id: product.id,
            name: `${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''}`,
            priceDzd: unitPrice,
            quantity: currentQuantity
          }
        ],
        subtotalDzd: subtotalAfterDiscount,
        shippingFeeDzd: shippingFee,
        totalDzd: finalTotalToPayDzd,
        notes: notes.trim() || undefined
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur lors de la confirmation de votre commande.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Retour au catalogue</span>
      </button>

      {/* Main 2-column layout (Gallery Left / Contiguous Purchase Module Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column (5/12): Product Media & Features */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-4/3 rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover" 
            />
            {product.compareAtPrice && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                PROMO COD
              </span>
            )}
            <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garanti 100% Authentique</span>
            </span>
          </div>

          {/* Key Product Guarantees */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
              <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-slate-900">0 Dinar d'avance</strong>
                <span className="text-[11px] text-slate-500">Payez au livreur</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
              <Truck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <strong className="block text-slate-900">58 Wilayas</strong>
                <span className="text-[11px] text-slate-500">Livraison 24/48h</span>
              </div>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Description Détaillée
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {product.features && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Caractéristiques :</span>
                <ul className="space-y-1.5">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7/12): Contiguous Purchase & Embedded COD Order Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header & Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug mt-1">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {product.rating || 4.9} / 5
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">
                  {product.reviewCount || 48} avis clients vérifiés en Algérie
                </span>
              </div>
            </div>

            {/* Price block */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
                  {unitPrice.toLocaleString()} <span className="text-sm font-bold text-slate-600">DZD</span>
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm font-mono text-slate-400 line-through tabular-nums">
                    {product.compareAtPrice.toLocaleString()} DZD
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-700">
                  {product.stockQuantity > 5 ? 'En stock immédiat' : `Stock limité : ${product.stockQuantity} restants`}
                </span>
              </div>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Choisir une variante :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                        selectedVariant?.id === v.id
                          ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{v.name}</div>
                      <div className="text-[11px] text-slate-500">Stock: {v.stockQuantity}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle Offers Selector */}
            {product.bundleOffers && product.bundleOffers.length > 1 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Offres groupées & Packs avantageux :
                </label>
                <div className="space-y-2">
                  {product.bundleOffers.map(b => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBundle(b)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        selectedBundle?.id === b.id
                          ? 'border-blue-700 bg-blue-50/80 shadow-xs ring-1 ring-blue-700'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedBundle?.id === b.id ? 'border-blue-700 bg-blue-700' : 'border-slate-300'
                        }`}>
                          {selectedBundle?.id === b.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{b.title}</div>
                          {b.badge && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              {b.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-slate-900">
                          {(unitPrice * b.quantity * (1 - b.discountPercentage / 100)).toLocaleString()} DZD
                        </div>
                        {b.freeShipping && (
                          <span className="text-[10px] font-semibold text-blue-700">Livraison offerte</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart secondary button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-slate-600" />
                <span>Ajouter au Panier</span>
              </button>
            </div>

            {addedToCartToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Article ajouté au panier d'achat !</span>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* EMBEDDED DIRECT COD CHECKOUT FORM (LE CŒUR DU E-COMMERCE ALGERIEN) */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white rounded-3xl border-2 border-blue-700 shadow-xl p-6 sm:p-8 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold mb-2">
                <Banknote className="w-3.5 h-3.5 text-blue-700" />
                <span>Commande Express en 30 Secondes</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Formulaire de Livraison & Paiement à Réception
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Remplissez vos coordonnées ci-dessous pour confirmer votre colis. Aucun paiement par carte bancaire.
              </p>
            </div>

            <form onSubmit={handleSubmitFastCod} className="space-y-4 text-xs">
              
              {/* Nom & Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex: Karim Benali"
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Numéro de Téléphone Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="05 / 06 / 07 XX XX XX"
                    className={`w-full text-xs font-mono px-3.5 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                      phoneError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                  {phoneError ? (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{phoneError}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">Nécessaire pour le livreur (05, 06 ou 07)</p>
                  )}
                </div>
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Wilaya de Livraison (58 Wilayas) *
                  </label>
                  <select
                    value={wilayaCode}
                    onChange={(e) => {
                      setWilayaCode(e.target.value);
                      setSelectedOfficeId('');
                    }}
                    className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.name} ({w.arabicName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Commune de Livraison *
                  </label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="ex: Bab Ezzouar, Kouba, Es Senia..."
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Mode de livraison: Domicile vs Stop Desk */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Mode de Livraison Souhaité *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('domicile')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      deliveryMode === 'domicile'
                        ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-slate-900">À Domicile</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Livré à votre porte ({baseShippingFee} DZD)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('stop_desk')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      deliveryMode === 'stop_desk'
                        ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-slate-900">Bureau Stop Desk</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      Retrait en agence ({Math.max(250, baseShippingFee - 150)} DZD - Économie)
                    </span>
                  </button>
                </div>
              </div>

              {/* Adresse ou Choix Stop Desk */}
              {deliveryMode === 'domicile' ? (
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Adresse Complète de Résidence *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Quartier, N° rue, Bâtiment, Étage..."
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Sélectionnez votre Centre Relais / Agence Stop Desk ({selectedWilaya?.name}) *
                  </label>
                  {wilayaOffices.length > 0 ? (
                    <select
                      value={selectedOfficeId}
                      onChange={(e) => setSelectedOfficeId(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Sélectionnez l'agence de retrait la plus proche...</option>
                      {wilayaOffices.map(off => (
                        <option key={off.id} value={off.id}>
                          {off.carrierName} · {off.name} ({off.commune}) - {off.address}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      placeholder="Centre Stop Desk principal le plus proche de votre commune"
                      className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white"
                    />
                  )}
                </div>
              )}

              {/* Note facultative */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Instructions de livraison (Optionnel)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Appeler avant d'arriver, livraison après 16h..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              {/* Récapitulatif financier transparent */}
              <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Produit ({currentQuantity}x {product.name}) :</span>
                  <span className="font-mono font-semibold">{rawSubtotal.toLocaleString()} DZD</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>Remise Offre Pack ({discountPercent}%) :</span>
                    <span className="font-mono">-{discountAmount.toLocaleString()} DZD</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600">
                  <span>Frais de livraison ({selectedWilaya?.name} - {deliveryMode === 'stop_desk' ? 'Stop Desk' : 'Domicile'}) :</span>
                  <span className="font-mono font-semibold">
                    {shippingFee === 0 ? <strong className="text-emerald-700">GRATUIT</strong> : `${shippingFee.toLocaleString()} DZD`}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-slate-900">
                  <div>
                    <span className="font-extrabold text-sm block">TOTAL À PAYER AU LIVREUR</span>
                    <span className="text-[10px] text-slate-500 font-medium">En espèces uniquement lors de la réception</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-blue-900 tabular-nums">
                      {finalTotalToPayDzd.toLocaleString()} <span className="text-sm font-bold">DZD</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Error box */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* BIG CTA BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white font-extrabold text-sm shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Truck className="w-5 h-5 text-amber-300" />
                <span>{isSubmitting ? 'Validation de votre colis...' : 'CONFIRMER MA COMMANDE (PAIEMENT À LA LIVRAISON)'}</span>
              </button>

              <div className="text-center text-[11px] text-slate-500 space-y-1">
                <p>🔒 Vos données sont confidentielles et protégées. Aucune avance bancaire requise.</p>
                <p>Un conseiller DzMahall vous appellera pour confirmer l'expédition de votre colis.</p>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
