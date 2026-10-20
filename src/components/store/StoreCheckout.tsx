import React, { useState } from 'react';
import { 
  Banknote, 
  MapPin, 
  Home, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { CartItem } from '../../lib/ecommerce/types';
import { ALGERIAN_WILAYAS } from '../../lib/shipping/algerian-data';
import { StopDeskOffice } from '../../lib/shipping/types';

interface StoreCheckoutProps {
  items: CartItem[];
  offices: StopDeskOffice[];
  onBackToShopping: () => void;
  onSubmitOrder: (orderPayload: any) => Promise<any>;
}

export const StoreCheckout: React.FC<StoreCheckoutProps> = ({
  items,
  offices,
  onBackToShopping,
  onSubmitOrder
}) => {
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

  const selectedWilaya = ALGERIAN_WILAYAS.find(w => w.code === wilayaCode);
  const wilayaOffices = offices.filter(o => o.wilayaCode === wilayaCode && o.active);

  const subtotalDzd = items.reduce((sum, item) => sum + (item.unitPriceDzd * item.quantity), 0);

  // Delivery fee estimation
  const baseShippingFee = selectedWilaya?.zone === 'Grand Sud' ? 1200 : selectedWilaya?.zone === 'Sud' ? 850 : 500;
  const shippingFee = deliveryMode === 'stop_desk' ? Math.max(250, baseShippingFee - 150) : baseShippingFee;
  const totalAmountDzd = subtotalDzd + shippingFee;

  const validateAlgerianPhone = (val: string): boolean => {
    const clean = val.replace(/[\s.-]/g, '');
    return /^(0)(5|6|7)[0-9]{8}$/.test(clean);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (val.length >= 10 && !validateAlgerianPhone(val)) {
      setPhoneError('Numéro algérien invalide. Doit commencer par 05, 06 ou 07.');
    } else {
      setPhoneError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setSubmitError('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!validateAlgerianPhone(phone)) {
      setPhoneError('Veuillez entrer un numéro de téléphone algérien valide (ex: 0550 12 34 56).');
      return;
    }

    if (!commune.trim()) {
      setSubmitError('Veuillez préciser votre commune.');
      return;
    }

    if (deliveryMode === 'domicile' && !address.trim()) {
      setSubmitError('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    if (deliveryMode === 'stop_desk' && !selectedOfficeId && wilayaOffices.length > 0) {
      setSubmitError('Veuillez choisir un bureau Stop Desk.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const chosenOffice = offices.find(o => o.id === selectedOfficeId);

    try {
      await onSubmitOrder({
        customerName: customerName.trim(),
        customerPhone: phone.replace(/[\s.-]/g, ''),
        customerAddress: deliveryMode === 'stop_desk' ? `Stop Desk: ${chosenOffice?.name || commune}` : address.trim(),
        wilayaCode: selectedWilaya?.code || '16',
        wilayaName: selectedWilaya?.name || 'Alger',
        commune: commune.trim(),
        deliveryMode,
        stopDeskOfficeId: deliveryMode === 'stop_desk' ? selectedOfficeId : undefined,
        items: items.map(item => ({
          id: item.productId,
          name: `${item.product.name} ${item.selectedVariantName ? `(${item.selectedVariantName})` : ''}`,
          priceDzd: item.unitPriceDzd,
          quantity: item.quantity
        })),
        subtotalDzd,
        shippingFeeDzd: shippingFee,
        totalDzd: totalAmountDzd,
        notes: notes.trim() || undefined
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur lors de la validation.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Votre panier est vide</h2>
        <p className="text-xs text-slate-500">Ajoutez des articles avant de finaliser votre commande.</p>
        <button
          onClick={onBackToShopping}
          className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-xl"
        >
          Retourner aux produits
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        onClick={onBackToShopping}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continuer mes achats</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Formulaire Client (7/12) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Paiement à la Livraison (COD)
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Finaliser ma Commande
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Renseignez vos coordonnées de livraison. Vous paierez en espèces au transporteur.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ex: Yacine Benali"
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Téléphone Algérie *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="05 / 06 / 07 XX XX XX"
                  className={`w-full text-xs font-mono px-3.5 py-3 rounded-xl border ${
                    phoneError ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {phoneError && <p className="text-[11px] text-rose-600 mt-1">{phoneError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Wilaya *</label>
                <select
                  value={wilayaCode}
                  onChange={(e) => {
                    setWilayaCode(e.target.value);
                    setSelectedOfficeId('');
                  }}
                  className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-300 bg-white"
                >
                  {ALGERIAN_WILAYAS.map(w => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Commune *</label>
                <input
                  type="text"
                  required
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="ex: Bab Ezzouar, Kouba..."
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1.5">Mode de Livraison *</label>
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
                    Livré chez vous ({baseShippingFee} DZD)
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
                    Retrait en agence ({Math.max(250, baseShippingFee - 150)} DZD)
                  </span>
                </button>
              </div>
            </div>

            {deliveryMode === 'domicile' ? (
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Adresse Complète *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier, Rue, Bâtiment..."
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300"
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Agence Stop Desk ({selectedWilaya?.name}) *</label>
                {wilayaOffices.length > 0 ? (
                  <select
                    value={selectedOfficeId}
                    onChange={(e) => setSelectedOfficeId(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">Sélectionnez une agence relais...</option>
                    {wilayaOffices.map(off => (
                      <option key={off.id} value={off.id}>
                        {off.carrierName} · {off.name} ({off.commune})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Agence Stop Desk principale de votre commune"
                    className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-300"
                  />
                )}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Instructions (Optionnel)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Appeler avant d'arriver..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Truck className="w-5 h-5 text-amber-300" />
              <span>{isSubmitting ? 'Validation...' : 'CONFIRMER ET COMMANDER (PAIEMENT À LA LIVRAISON)'}</span>
            </button>
          </form>
        </div>

        {/* Récapitulatif Panier (5/12) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Articles de votre commande ({items.length})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex items-center gap-3 text-xs">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                  <div className="text-[11px] text-slate-500">Qté: {item.quantity} {item.selectedVariantName ? `· ${item.selectedVariantName}` : ''}</div>
                </div>
                <div className="font-mono font-bold text-slate-900 tabular-nums">
                  {(item.unitPriceDzd * item.quantity).toLocaleString()} DZD
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Sous-total articles :</span>
              <span className="font-mono font-bold">{subtotalDzd.toLocaleString()} DZD</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Livraison ({selectedWilaya?.name} - {deliveryMode === 'stop_desk' ? 'Stop Desk' : 'Domicile'}) :</span>
              <span className="font-mono font-bold">{shippingFee.toLocaleString()} DZD</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-900">
              <span className="font-extrabold text-sm">TOTAL À PAYER À LA LIVRAISON :</span>
              <span className="font-mono text-xl font-black text-blue-900 tabular-nums">
                {totalAmountDzd.toLocaleString()} DZD
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
